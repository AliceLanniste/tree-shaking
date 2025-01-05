import { Statement } from './node/Statement';
import { moduleImport,moduleExport, ResolveResult } from "./types";
import {  
		parse, 
	    Program as AcornProgram
} from "acorn";
import { Comment } from "./node/shared/Comment";
import { ERR_CODE, error } from "./error";
import MagicString from "magic-string";
import { ModuleLoader } from './ModuleLoader';
import ExternalModule from './ExternalModule';
import { basename, extname } from "path";
import { ExportAllDeclaration  } from './node/ExportAllDeclaration';
import { isExportDefaultDeclaration, ExportDefaultDeclaration } from './node/ExportDefaultDeclaration';
import { ExportNamedDeclaration} from './node/ExportNamedDeclaration';
import { ImportDeclaration, nodeConstructor } from './node';
import { NODETYPE } from './node/shared/NodeType';
import FunctionDeclaration from './node/FunctionDeclaration';
import Identifier from './node/Identifier';
import ImportSpecifier from './node/ImportSpecifier';
import { ASTContext } from './node/utils';
import Program from './node/Program';
import ModuleScope from './scopes/ModuleScope';
import Variable from './variables/Variable';
export class Module {
	type: 'Module';
	id: string;
	source: string;
	comments: Comment[] = [];
	statements: Statement[] = [];
	originAST: AcornProgram;
	ast: Program;
	magicCode: MagicString;
	astContext: ASTContext;
	//import xxx from './path` ,collect `./path`
	dependencies:string[] =[];
	imports: Record<string,moduleImport> = {};
	exports: Record<string, any> = {};
	exportAllSources: string[] = [];
	reexports: Record<string, any> = {};

	isEntry: boolean;
	isExternal: boolean;

    definitions:Record<string,Statement> = {};
	modifications: Record<string, Statement> = {};
	replacements: Record<string, string> = {};
	//collect module depnencies (importee path: absolute path)
	resolvedIds: Record<string,string> = {};
	marked: Record<string, boolean> = {};
	suggestNames: Record<string, string> = {};
 	defaultImports: boolean = false;
	importRecord: Record<string, ResolveResult> = {};
	namespaceImports: string[] = [];
	scope: ModuleScope;
	private loader: ModuleLoader;
	constructor(
	 id: string,
	 isEntry: boolean,
	moduleLoader: ModuleLoader,
		code: string,
		ast: Program | undefined
	) {
		this.id = id
		this.isEntry = isEntry
		this.loader = moduleLoader
		this.setSource({ code, ast })	
    }

	setSource({code ,ast}) {
		this.source = code

		this.magicCode = new MagicString(code, { filename: this.id });
		this.originAST = this.parse2(code)

	    
		this.astContext = {
			addExport: this.addExport.bind(this),
			addImport: this.addImport.bind(this),
			code: code,
			magicString: this.magicCode,
			filename: this.id,
			nodeConstructor,
			imports: this.imports,
			exports: this.exports,
			getExports: this.getExports.bind(this),
			getModuleName: this.baseName.bind(this),
			traceVariable: this.traceVariable.bind(this),
		}

		this.scope = new ModuleScope(this.loader.scope, this.astContext);
		this.ast = new Program(
			this.originAST,
			{ type: 'Module', context: this.astContext },
			this.scope
		);
	}
     
	parse2(code: string) {
   		return this._parseAST(code)
	}


	addImport(node: ImportDeclaration) {
		const source = <string>node.source.value
		if (!this.dependencies.includes(source))  this.dependencies.push(source)
		const specifiers = node.specifiers
	    for (const specifier of specifiers) {
			const localName = specifier.local.name;
			if (this.imports[localName]) {
				throw Error(" duplicate import")
			}

			const isDefault = specifier.type === NODETYPE.IMPORT_DEFAULT_SPECIFIER ;
			const isNamespace = specifier.type === NODETYPE.IMPORT_NAMESPACE_SPECIFIER;

			const name = isDefault
				? 'default'
				: isNamespace
					? '*'
					: (<ImportSpecifier>specifier).imported.name;


			this.imports[localName] = {
				source, specifier, name, module: null
			}
		}	
		
	}

	addExport(node: ExportAllDeclaration | ExportDefaultDeclaration | ExportNamedDeclaration) {
		const source = (<ExportAllDeclaration>node).source && (<ExportAllDeclaration>node).source.value
		//export * from 'xxxx'
		//export {xxx} from 'xxxx'
		if (source) {
			if (this.dependencies.includes(source)) this.dependencies.push(source)
			
			if (node.type === NODETYPE.EXPORT_ALL) {
				this.exportAllSources.push(source)
			} else {
				for (const specifier of (<ExportNamedDeclaration>node).specifiers) {
					const name = specifier.exported.name;
					if (this.exports[name] || this.reexports[name]) {
						throw Error('Duplicate export')
					}
					this.reexports[name] = {
						start: specifier.span.start,
						source,
						local: specifier.local.name,
						module: null,
						moduleId: null,
					}
				}
			}
		}else if (isExportDefaultDeclaration(node)) {
			// export default function foo () {}
			// export default foo;
			// export default 42;
		const identifier =
				((<FunctionDeclaration>node.declaration).id &&
					(<FunctionDeclaration>node.declaration).id.name) ||
				(<Identifier>node.declaration).name
			if (this.exports.default) {
				throw Error("duplicate export default")
			}
			this.exports.default = {
				localName: 'default',
				identifier
			}
		} else if ((<ExportNamedDeclaration>node).declaration) {
			// export var { foo, bar } = ...
			// export var foo = 42;
			// export var a = 1, b = 2, c = 3;
			// export function foo () {}
			const declaration = (<ExportNamedDeclaration>node).declaration
			if (declaration.type === NODETYPE.VARIABLE_DECLARATION) {

				for (const decl of declaration.declarations) {
					const localName = decl.id.name;
					this.exports[localName] = {localName}
				}
			} else {
				// export function foo () {}
				const localName = declaration.id.name;
				this.exports[localName] = {localName}
	
			}
		} else {
			//export {a, b, c}
			for (const specifier of (<ExportNamedDeclaration>node).specifiers) {
				const localName = specifier.local.name;
				const exportedName = specifier.exported.name;

			   if (this.exports[exportedName] || this.reexports[exportedName]) {
				throw Error("Duplicate export")
			  }
			  this.exports[exportedName] = {localName}
			}

		}
	}

	private _parseAST(code: string) {
		try {
			return parse(code, {
				ecmaVersion:6,
				sourceType:"module",
				onComment: ( block, text, start, end ) => this.comments.push({ block, text, start, end })
			})
		} catch(err: any) {
			error({
			  code:ERR_CODE.PARSE_ERROR,
			  message: `${err.message}`
			})
		}

	}

	linkDependencies() {
		const resolveSpecifier = (specifiers: {
			[name: string]: moduleImport
		}) => {
			for (const key of Object.keys(specifiers)) {
				const specifier = specifiers[key];
				const id = this.resolvedIds[specifier.source];
				specifier.module = this.loader.modulesById[id];
			}
		}
		resolveSpecifier(this.imports)
	}

	bindReferences() {
		this.ast.bind()
	}

	traceExport(name:string) {
		const exportDeclaration = this.exports[name];
		if (exportDeclaration) {
			const name = exportDeclaration.localName;
			const declaration = this.traceVariable(name);
			return declaration || this.loader.scope.findVariable(name);
		}

	}
   //!renamin-b _two应该联系在two上，现在联系上
	traceVariable(name: string): Variable {		
		if (name in this.scope.variables) {
			return this.scope.variables[name]
		}

		if (name in this.imports) {
			const importDeclaration = this.imports[name]
			const otherModule = importDeclaration.module
			const declaration = otherModule.traceExport(importDeclaration.name);
			return declaration;
		} 
		
		return null;
	}

	baseName() {
		const base = basename(this.id);
		const ext = extname(this.id);

		return ext ? base.slice(0, -ext.length) : base

	}
	
	getExports() {
		return Object.keys(this.exports);
	}

	MarkExports() {
		for (const exportedName of this.getExports()) {
			const variable = this.traceVariable(exportedName)
			variable.exportName = exportedName
			variable.include()
		}
	}
     
	include() {
		if (this.ast.shouldBeIncluded()) this.ast.include()
	}

	rename(name: string, newName: string) {
		this.replacements[name] = newName
	}
    
	render(options: any): MagicString {
		const magicString = this.magicCode.clone();
		this.ast.render(magicString, options);
		return magicString;
	}


	suggestName(name: string, suggestion:string) {
		
		this.suggestNames[name] = suggestion
	} 

	getModule(importee: string):Module | ExternalModule{
		const id = this.resolvedIds[ importee];
		const module = this.loader.modulesById[id];
		  return module
	}

	getDefaultName():string | null {
		const exportDefault = this.exports['Default']
		if (!exportDefault) return ''
		let name = exportDefault.identifier && !exportDefault.isModified 
				? exportDefault.identifier
			: this.replacements['Default'];
		if (!name && exportDefault.isLiteral) {
			name = basename(this.id).replace(/.js/, '')
			this.exports['Default'].exportedName = name
		}
			if (!name && this.isEntry) {
				name = '_main'
				this.exports['Default'].exportedName = name
			}
	   return this.replacements[name] || name
	}
	markExternal(importee: string) {
		const ExternalModuleNames = this.loader.externalModules.map(module => module.id)
		return ExternalModuleNames.includes(importee)
	}
	//return entryModule export {exportMode, export}
	resolveEntryExport() {
		for (const key of Object.keys(this.exports)) {
			const variable = this.traceExport(key)

			if (key !== 'default') {

				return {
					 exportMode: 'named',
					 exported: key,
					 localed: variable.getName()
				 }

			 } 
			 if (key === 'default') {
				 return {
					 exportMode: 'default',
					 exported: key,
					 localed:variable.getName()
				}
			 }
			
		}

		return {}

	}
}
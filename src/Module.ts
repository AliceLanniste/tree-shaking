import { Graph } from "./Graph";
import { Statement } from './node/Statement';
import { moduleImport, rainbowOptions } from "./types";
import { ExportDefaultDeclaration, 
		ExportNamedDeclaration, 
		FunctionDeclaration, 
		Identifier,
		ImportDeclaration, 
		parse, 
		Program } from "acorn";
import { Comment } from "./node/Comment";
import { ErrCode, error } from "./error";
import MagicString from "magic-string";
import { ModuleLoader } from "./ModuleLoader";
import ExternalModule from "./ExternalModule";
import { basename } from "path";

export class Module {
	source: string;
    statements:Statement[] =[];
    comments:Comment[] =[];
	magicCode:MagicString;
    ast:Program;
	dependencies:string[] =[];
	imports: Record<string,moduleImport> = {};
	exports: Record<string, any> ={};
    definitions:Record<string,Statement> = {};
	modifications: Record<string, Statement> = {};
	replacements: Record<string, string> = {};
	//collect module depnencies (importee path: absolute path)
	resolvedIds: Record<string,string> = {};
	marked: Record<string, boolean> = {};
	suggestNames: Record<string, string> = {};
	needsDefault: boolean = false
	namespaceImports: string[] = []
	constructor(
        private readonly graph: Graph,
		public readonly id: string,
		public readonly path: string,
		private readonly options: rainbowOptions,
		public readonly isEntry: boolean,
		public moduleLoader: ModuleLoader,
		code: string,
		ast: string | null
		) {
		this.setSource({ code, ast })	
    }

	setSource({code, ast}) {
		this.source = code

		this.magicCode = new MagicString(code, { filename: this.id });
		this.statements = this.parse(ast)
		this.analyse()
	}

	parse(ast:Program):Statement[] {
     if(!ast) {
		try {
			this.ast = parse(this.source, {
				ecmaVersion:6,
				sourceType:"module",
				onComment: ( block, text, start, end ) => this.comments.push({ block, text, start, end })
			})
		} catch(err: any) {
			error({
			  code:ErrCode.PARSE_ERROR,
			  message: `${err.message}`
			})
		}
	 }
	 let statements:Statement[] = [];
	 statements = this.ast.body.map( ( node, index ) => {
		return new Statement( node,  this, node.start,node.end);
	});
	statements.forEach((statement, index) =>
	 statement.next = statement[index+1]? statement[index+1].start : statement.end)
	 return statements;
	}	



	analyse() {
		if(!this.statements) return;
         this.statements.forEach(statement => {
			if (statement.isImportDeclartion()) this.addImport(statement)
			else if (statement.isExportDeclartion()) this.addExport(statement)
			 statement.analyse()
			 Object.keys(statement.defines).forEach(name => {
				 this.definitions[name] =statement
			 })
			  Object.keys(statement.modifies).forEach(name => {
				 this.modifications[name] =statement
			 })
			 
		 }); 

		if (this.isEntry) {
			this.exportToImport(this.exports)
		}

	}

	addImport(statement: Statement) {
	
		const node = statement.node as ImportDeclaration;
		const importee = node.source.value as string;
		const isExternal = this.markExternal(importee)
		if (!this.dependencies.includes(importee)) { this.dependencies.push(importee) }
		// check type of importDeclaration:ImportDefaultSpecifer,ImportSpecifer,ImportNamespaceSpecifer
		node.specifiers.forEach(specifer => {
			const isDefault = specifer.type == "ImportDefaultSpecifier";
			const isNamespace = specifer.type == "ImportNamespaceSpecifier";

			const localName = specifer.local.name;
			const name = isDefault ? 'Default': isNamespace ? '*' : (specifer.imported as Identifier).name;
			
			// check this.imports duplicated localname
				if (this.imports.hasOwnProperty(localName)) {
					return error({
						code:ErrCode.DUPLCATE_ERROR,
						message:  `Duplicated import '${localName}'`
					}) 
				}
		
			this.imports[localName] = {
				importee,
				name,
				isNamespace,
				localName,
				isExternal
			}
			if (isNamespace) {
				this.namespaceImports.push(localName)
			}
		})
	}

	addExport(statement: Statement) {		
		//export default function foo() {}  declaration: FunctionDeclaration
		//export default foo;    declaration: Identifier
		//export default 42; declaration: Literal
		if (statement.node.type == 'ExportDefaultDeclaration') {
			let exportDefaultDecl = statement.node as ExportDefaultDeclaration;
			const isDeclaration = /Declaration$/.test(exportDefaultDecl.declaration.type);
			const identifier = isDeclaration ?
				//@ts-ignore
				exportDefaultDecl.declaration.id.name
				:exportDefaultDecl.declaration.type === 'Identifier' ?
					exportDefaultDecl.declaration.name :
					 null;
			
			const isLiteral = exportDefaultDecl.declaration.type === 'Literal' 

			this.exports['Default'] = {
				statement,
				localName: identifier || 'Default',
				isDeclaration: isDeclaration,
				identifier,
				isLiteral,
			    isExternal:false,
				exportMode:'default'
			}
		}
			// export { foo, bar, baz }
		// export var foo = 42;
		// export function foo () {}
		else if (statement.node.type == 'ExportNamedDeclaration') {
			const exporNamedDecl = statement.node as ExportNamedDeclaration;
			const exportName = exporNamedDecl.source? exporNamedDecl.source.value as string: ''
			       
					const isExternal = this.markExternal(exportName)
					
				   

			if (exporNamedDecl.specifiers.length) {
				exporNamedDecl.specifiers.forEach(specifier => {
					const localName = (specifier.local as Identifier).name;
					const exportedName = (specifier.exported as Identifier).name;

					this.exports[exportedName] = {
						statement,
						localName,
						exportSouce:exportName,
						exportedName,
						isExternal,
						exportMode:'named'
					}
					if (this.isEntry && !this.imports[localName]) {

						this.imports[localName] = {
							importee:exportName,
								name:localName,
								isNamespace:false,
								localName,
				                isExternal
						}
						// if (!this.dependencies.includes(exportName)) {
						// 	this.dependencies.push(exportName)
						// }
					}
				})
			} else {
				const declaration = exporNamedDecl.declaration
				let name: string =''
				if (declaration && declaration.type === 'VariableDeclaration') {
					//export var foo = 1
					let identifier = declaration.declarations[0].id as Identifier;
					name = identifier.name;
				} else {

					//export function foo() {}
					name = (declaration as FunctionDeclaration).id.name;
				}

				this.exports[ name ] = {
					statement,
					localName: name,
					isExternal:false,
					expression: declaration,
					exportMode:'named'
				};


			}
		 }

	}
    
	exportToImport(exports: Record<string, any>) {
		Object.keys(exports).forEach(key => {
			if (key === 'Default') {
				
			} else {
				const defineKeys = Object.keys(this.definitions)
				if (!defineKeys.includes(key)) {
					const { exportSouce,isExternal } = this.exports[key]
					
					if (!this.dependencies.includes(exportSouce)) {
							this.dependencies.push(exportSouce)
						}
				}
			}
		})
	}
	
	
    
	markAllStatement(isEntryModule: boolean) {
		this.statements.forEach(statement => {
			if (statement.isImportDeclartion()) {
				 let module = this.getModule(statement.node.source.value)
					 
						
					 
				if (module instanceof Module)  module.markAllStatement(false)
			} else {
				statement.mark()
			}
		})		
	}


	mark(name: string) {
		if (this.marked[name]) return
		this.marked[name] = true	
		if (this.imports[name]) {
			const importDeclaration = this.imports[name];
			const module = this.getModule(importDeclaration.importee!)

			if (importDeclaration.name === 'Default' && module instanceof Module) {
			
				module.needsDefault = true
				module.suggestName(importDeclaration.name, importDeclaration.localName!)
			} 
			if (module instanceof Module) module.markExport(importDeclaration.name, name)
		} 
		else {
			const statement = name === 'default' ? this.exports['Default'].statement : this.definitions[name]
			if (statement) {
				statement.mark()
			}
		}

	}

	markExport(name:string, suggestedName:string) {
		const exportDecl = module.exports[name]
		if (exportDecl) {
			if ( name === 'default' ) {
				this.needsDefault = true
				this.suggestName( 'default', suggestedName );
				return exportDecl.statement.mark();
			}

			this.mark( exportDecl.localName );
		}
	}
	//strongDependencies,分为specifier和strongDependsOn

	//weakdependencies 来自statement.dependencies
	collectDependencies() {
		let strongDependencies: Record<string, Module> = {};
		let weakDependencies: Record<string, Module> = {};
		this.statements.forEach((statement) => {
			const isImportDecl = statement.isImportDeclartion()
			const specLength = isImportDecl ? (statement.node as ImportDeclaration).specifiers.length : 0
			if (isImportDecl && !specLength) {
				//@ts-ignore
				const id = this.resolvedIds[ statement.node.source.value ];
				const module = this.moduleLoader.modulesById[ id ];
				if(module instanceof Module) strongDependencies[module.id] = module;
			} else {

				Object.keys(statement.strongDependsOn).forEach(name => {
					if (statement.defines[name] || !this.imports[name]) return;
					//@ts-ignore

					let id = this.resolvedIds[this.imports[name].importee]
					const module = this.moduleLoader.modulesById[id]
					if(module instanceof Module) strongDependencies[module.id] = module
				});
			}
		})

		this.statements.forEach(statement => {
			Object.keys(statement.dependsOn).forEach(name => {

				if (statement.defines[name] || !this.imports[name]) return;
				//@ts-ignore
				let id = this.resolvedIds[this.imports[name].importee]
				const module = this.moduleLoader.modulesById[id]
				if(module instanceof Module) weakDependencies[module.id] = module
			});
		})
		return { strongDependencies,weakDependencies };
	}

	rename(name: string, newName: string) {
		this.replacements[name] = newName
	}
    
	render(replacements:Record<string, string>) {

		let magicString = this.magicCode
		this.statements.forEach(statement => {

			if (statement.node.type === 'ExportNamedDeclaration') {
				let exportNamedDeclNode = statement.node as ExportNamedDeclaration;
				if ( exportNamedDeclNode.specifiers.length ) {
					magicString.remove( statement.start, statement.next );
					return;
				}
			} 
			
			if (statement.node.type === 'ImportDeclaration') {
				const importSouce = (statement.node as ImportDeclaration).source.value
			
				let specifiers = (statement.node as ImportDeclaration).specifiers
					.map(specifier => specifier.local.name)
				if (this.markExternal(importSouce as string)) {
					let isNamespace = specifiers.length == 1 && this.namespaceImports.includes(specifiers[0])
					let isNamed =!this.namespaceImports.includes(specifiers[0])
					const externalModule = this.getModule(importSouce as string) as ExternalModule
					if (isNamed) {
						externalModule.add_export_name(specifiers)
						externalModule.setNeedsName(true)
					}
					if (isNamespace) {
						externalModule.setIsNamespace(isNamespace)
						externalModule.addNamespaceName(specifiers[0])
					}

				} 
				magicString.remove(statement.start, statement.end)
				return;
			}
			
			statement.replaceIdentifiers( magicString, replacements );

			if (statement.isExportDeclartion()) {
				// remove `export` from `export var foo = 42`
				//@ts-ignore
				
				if (statement.node.type === 'ExportNamedDeclaration' && statement.node.declaration.type === 'VariableDeclaration') {
					//@ts-ignore
					magicString.remove(statement.node.start, statement.node.declaration.start);
				}
				//@ts-ignore
			   else if (statement.node.declaration.id) {
					   //@ts-ignore
			        magicString.remove(statement.node.start, statement.node.declaration.start);
				} 
				else if (statement.node.type === 'ExportDefaultDeclaration') {
					//export default 40;
					//import bar from './bar'
					// var bar = 40;
					//要把 default =bar
					const canonicalName = this.getDefaultName();
					let exporDefaulDecl = (statement.node as ExportDefaultDeclaration).declaration
						if (exporDefaulDecl.type === 'FunctionDeclaration') {
						//@ts-ignore
						magicString.overwrite(statement.start, statement.node.declaration.start + 8, `function ${canonicalName}`);
					}
					else {
							//@ts-ignore
					magicString.overwrite(statement.start,statement.node.declaration.start, `var ${canonicalName} = `)
					}
				}
			}
		})
		magicString.prepend(`//# ${this.id}\n`)
		return magicString.trim()
	}

	suggestName(name: string, suggestion:string) {
		
		this.suggestNames[name] = suggestion
	} 

	getModule(importee: string):Module | ExternalModule{
		const id = this.resolvedIds[ importee];
		const module = this.moduleLoader.modulesById[id];
		  return module
	}

	getDefaultName():string | null {
		const exportDefault = this.exports['Default']
		if (!exportDefault) return ''
		let name = exportDefault.identifier  
				? exportDefault.identifier
			:this.replacements['Default'];
		if (!name && exportDefault.isLiteral) {
			name = basename(this.id).replace(/.js/, '')
			this.exports['Default'].exportedName = name
		}
	   return this.replacements[name] || name
	}
	markExternal(importee: string) {
		return importee[0] !== '.'
	}
}
import { Graph } from "./Graph";
import { Statement } from './node/Statement';
import { moduleImport, rainbowOptions } from "./types";
import { ExportDefaultDeclaration, 
		ExportNamedDeclaration, 
		Identifier,
		ImportDeclaration, 
		parse, 
		Program } from "acorn";
import { Comment } from "./node/Comment";
import { ErrCode, error } from "./error";
import MagicString from "magic-string";
import { ModuleLoader } from "./ModuleLoader";

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
	resolvedIds: Record<string,string> = {};
	
	constructor(
        private readonly graph: Graph,
		public readonly id: string,
		public readonly path: string,
		private readonly options: rainbowOptions,
		isEntry: boolean,
		public moduleLoader: ModuleLoader,
		code: string,
		ast: string | null
		) {
		this.setSource({ code, ast })	
    }

	setSource({code, ast}) {
		this.source = code

		this.magicCode = new MagicString(code, { filename: this.id });
		// console.log("setSource",this.source,this.magicCode.toString())
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
		// const magicString = this.magicCode.snip( node.start, node.end );
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
		
	}

	addImport(statement: Statement) {
	
		const node = statement.node as ImportDeclaration;
		const importee = node.source.value as string;
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
		
			this.imports[name] = {
				importee,
				name,
				localName,
			}
		})
	}

	addExport(statement: Statement) {
		const exportDecl = statement.scopeNode.node as any;
		const source = exportDecl.source && exportDecl.source.value;
		const exportDefaultDecl = exportDecl as ExportDefaultDeclaration;
		const exportNameDecl = exportDecl as ExportNamedDeclaration;

		if (exportDefaultDecl.type == 'ExportDefaultDeclaration') {
			// const isDeclaration = /Declaration$/.test(exportDefaultDecl.declaration.type);

			 this.exports['Default'] = {
				node:statement.scopeNode.node,
				localName: 'Default',
				isDeclaration: false,
			 }
		} else if(exportNameDecl.type == 'ExportNamedDeclaration') {
				if (exportNameDecl.specifiers.length) {
					exportNameDecl.specifiers.forEach(specifier => {
						const localName = (specifier.local as Identifier).name;
						const exportedName = (specifier.exported as Identifier).name;

						this.exports[ exportedName ] = {
							localName,
							exportedName
						};

						// export { foo } from './foo';
						if ( source ) {
							this.imports[ localName ] = {
								source,
								localName,
								name: localName
							};
						}
					})
				} else {
					let declaration = exportDecl.declaration;

					let name:string;

					if ( declaration.type === 'VariableDeclaration' ) {
						// export var foo = 42
						name = declaration.declarations[0].id.name;
					} else {
						// export function foo () {}
						name = declaration.id.name;
					}

					this.exports[ name ] = {
						statement,
						localName: name,
						expression: declaration
					};
				}
		}

	}
    
	
	bindingImportSpecifier() {

	}
	// expandStatement( name: string):Statement {
	// 	let statement:Statement;
	// 	if(name ==='Default') {
	// 		const exportDeclaration = this.exports['Default']
	// 		if (exportDeclaration.isDeclaration) {
	// 			// TODO
	// 			// return this.expandStatement()
	// 		}
	
	// 		const name = this.graph.getName(this, 'Default');
	// 		let exportDefaultNode = exportDeclaration.node
	// 		let statementMagicString = this.magicCode.overwrite(
	// 			exportDefaultNode.start, exportDefaultNode.declaration.start,
	// 		`var ${name} = `)
	// 	   statement = new Statement(exportDefaultNode,statementMagicString)
	// 	} 
	// 	else {
	// 		statement = this.definitions[name]
	// 		// console.log("statement,", name, statement.source.toString());
	// 		let replacements = this.graph.getReplacements(this);
	// 		statement.replacedIdentifier(replacements);
	// 		if (statement.isExportDeclartion()) {
	// 			statement.source.remove(statement.scopeNode.node.start, statement.scopeNode.node.declaration.start);
	// 		}
			
	// 	 }

	//   return statement;
	// }

	collectDependencies() {
		let strongDependencies:Record<string, Module> = {};
		this.statements.forEach((statement) => {
			// console.log("collcectDependencies--before", statement.node);
			const isImportDecl = statement.isImportDeclartion()
			const specLength = isImportDecl ? (statement.node as ImportDeclaration).specifiers.length: 0
			if (isImportDecl && !specLength) {
					const id = this.resolvedIds[ statement.node.source.value ];
				const module = this.moduleLoader.modulesById[ id ];
				strongDependencies[ module.id ] = module;
			} else {
				console.log("module-collect", statement.strongDependsOn,statement.dependsOn)
				Object.keys( statement.strongDependsOn ).forEach( name => {
					if (statement.defines[name] || !this.imports[name]) return;
					console.log("imports[name]", this.imports[name]);
					let id = this.resolvedIds[this.imports[name].importee]
					const module = this.moduleLoader.modulesById[id]
					strongDependencies[module.id] = module
				});
			}
		})

		return strongDependencies;
	}

	
    
	render() {

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
				magicString.remove(statement.start, statement.end)
				return;
			}
		})

		return magicString.trim()
	}
}
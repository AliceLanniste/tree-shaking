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
	marked: Record<string, boolean> = {};
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
		
			this.imports[localName] = {
				importee,
				name,
				localName,
			}
		})
	}

	addExport(statement: Statement) {
		// const exportDecl = statement.node as any;
		// const source = exportDecl.source && exportDecl.source.value;
		// const exportDefaultDecl = exportDecl as ExportDefaultDeclaration;
		// const exportNameDecl = exportDecl as ExportNamedDeclaration;
		
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


			this.exports['Default'] = {
				statement,
				localName: identifier || 'Default',
				isDeclaration: isDeclaration,
				identifier,
			 }
		}
			// export { foo, bar, baz }
		// export var foo = 42;
		// export function foo () {}
		else if (statement.node.type == 'ExportNamedDeclaration') {
			const exporNamedDecl = statement.node as ExportNamedDeclaration;
			if (exporNamedDecl.specifiers.length) {
				exporNamedDecl.specifiers.forEach(specifier => {
					const localName = (specifier.local as Identifier).name;
					const exportedName = (specifier.exported as Identifier).name;

					this.exports[exportedName] = {
						statement,
						localName,
						exportedName,
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
					expression: declaration
				};
			}
		 }
		// else if (exportNameDecl.type == 'ExportNamedDeclaration') {
		// 		if (exportNameDecl.specifiers.length) {
		// 			exportNameDecl.specifiers.forEach(specifier => {
		// 				const localName = (specifier.local as Identifier).name;
		// 				const exportedName = (specifier.exported as Identifier).name;

		// 				this.exports[ exportedName ] = {
		// 					localName,
		// 					exportedName
		// 				};

		// 				// export { foo } from './foo';
		// 				if ( source ) {
		// 					this.imports[ localName ] = {
		// 						source,
		// 						localName,
		// 						name: localName
		// 					};
		// 				}
		// 			})
		// 		} else {
		// 			let declaration = exportDecl.declaration;

		// 			let name:string;

		// 			if ( declaration.type === 'VariableDeclaration' ) {
		// 				// export var foo = 42
		// 				name = declaration.declarations[0].id.name;
		// 			} else {
		// 				// export function foo () {}
		// 				name = declaration.id.name;
		// 			}

		// 			this.exports[ name ] = {
		// 				statement,
		// 				localName: name,
		// 				expression: declaration
		// 			};
		// 		}
		// }

	}
    
	
	bindingImportSpecifier() {

	}
    
	markAllStatement(isEntryModule: boolean) {
		this.statements.forEach(statement => {
			//@ts-ignore
			if (statement.node.type === 'ExportNamedDeclaration' && statement.node.specifiers.length) {
				 if (isEntryModule)  statement.mark()
			} else {
				statement.mark()
		}
		})
	}

	mark(name: string) {
		if (this.marked[name]) return
		this.marked[name] = true
		
			console.log("module mark name", name,this.imports);
		
		if (this.imports[name]) {
			const importDeclaration = this.imports[name];
			if (importDeclaration.name === 'Default') {
				const module = this.getModule(importDeclaration.importee!)
				module.suggestName(importDeclaration.name, importDeclaration.localName!)
				console.log("importDefault",importDeclaration.name,importDeclaration.localName)
			}
		} 
		else {

			const statement = name === 'default' ? this.exports['Default'].statement : this.definitions[name]
			if (statement) {
				statement.mark()
			}
		}

	}

	markExport() {

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
			const isImportDecl = statement.isImportDeclartion()
			const specLength = isImportDecl ? (statement.node as ImportDeclaration).specifiers.length: 0
			if (isImportDecl && !specLength) {
				//@ts-ignore
					const id = this.resolvedIds[ statement.node.source.value ];
				const module = this.moduleLoader.modulesById[ id ];
				strongDependencies[ module.id ] = module;
			} else {
				Object.keys(statement.strongDependsOn).forEach(name => {

					if (statement.defines[name] || !this.imports[name]) return;
					//@ts-ignore
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
				
					const canonicalName = this.getDefaultName();
					let exporDefaulDecl = (statement.node as ExportDefaultDeclaration).declaration
						if (exporDefaulDecl.type === 'FunctionDeclaration') {
						//@ts-ignore
						magicString.overwrite(statement.start, statement.node.declaration.start + 8, `function ${canonicalName}`);
					}
					else {
						//@ts-ignore
					magicString.overwrite(statement.start,statement.node.declaration.start, `var ${canonicalName} =`)

					}
				}
				
				// else if (statement.node.type === 'ExportDefaultDeclaration') {
			

				// 	const canonicalName = this.getDefaultName();
				// 	let exporDefaulDecl = (statement.node as ExportDefaultDeclaration).declaration
				// 	if (exporDefaulDecl.type === 'FunctionDeclaration') {
						
				// 		// magicString.overwrite()
				// 	} else {
				// 	console.log("exportDefault",statement.source(),canonicalName)
				// 	magicString.overwrite(statement.start,statement.node.declaration.start, `var ${canonicalName} =`)

				// 	}
				// }

			}
		})

		return magicString.trim()
	}

	suggestName(name: string, replacement: string) {
		let targetName = name ==="Default"? this.exports[name].localName : name 
		// console.log()
		if (this.replacements[targetName]) {
			while (this.replacements[targetName]) {
				let replace = `_${this.replacements[targetName]}`
				this.replacements[targetName] = replace
			}
		} else {
			this.replacements[targetName] = replacement

		}
		console.log("suggestName", this.replacements);
	} 

	getModule(importee: string):Module {
		const id = this.resolvedIds[ importee];
		const module = this.moduleLoader.modulesById[id];
		return module
	}

	getDefaultName() {
		const exportDefault = this.exports['Default']
		if (!exportDefault) return ''
		
		const name = exportDefault.identifier  ?
			exportDefault.identifier :
			exportDefault.localName;

	   return this.replacements[name]
   }
}
import { Graph } from "./Graph";
import { Statement } from './node/Statement';
import { moduleImport, rainbowOptions } from "./types";
import { ExportDefaultDeclaration, 
		ExportNamedDeclaration, 
		FunctionDeclaration, 
		Identifier,
		ImportDeclaration, 
		parse, 
		Node,
		Program } from "acorn";
import { Comment } from "./node/Comment";
import { ErrCode, error } from "./error";
import MagicString from "magic-string";
import { analyseAST } from "./utils/helper";
import { relative } from "path";

export class Module {
	code: string;
     statements:Statement[] =[];
      comments:Comment[] =[];
	 magicCode:MagicString;
    ast:Program;
	dependencies:string[] =[];
	imports: Record<string,moduleImport> = {};
	exports: Record<string, any> ={};
    definitions:Record<string,Statement> = {};
	modifications: Record<string, Statement> = {};
	path: string;

    constructor(
        private readonly graph: Graph,
		public readonly id: string,
		// public readonly path: string,
		private readonly options: rainbowOptions,
		isEntry: boolean,
	) {
		let base = this.graph.base;
		this.path = relative(base,id)
	}

	setSource({code, ast}) {
		this.code = code
		this.magicCode = new MagicString(this.code, {filename: this.id});
		this.statements = this.parse(ast)
		this.analyse()
	}

	parse(ast:Program):Statement[] {
     if(!ast) {
		try {
			this.ast = parse(this.code, {
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
		const magicString = this.magicCode.snip( node.start, node.end );
		return new Statement( node,  magicString);
	});

	 return statements;
	}	

	analyse() {
		if(!this.statements) return;
         this.statements.forEach(statement => {
			if (statement.isImportDeclartion()) this.addImport(statement)
			if (statement.isExportDeclartion()) this.addExport(statement)
		 }); 
		const {ast,scope ,topLevelStatements}= analyseAST(this.ast,this.magicCode)

		topLevelStatements.forEach(statement =>{
			Object.keys(statement.defines).forEach(name =>
				this.definitions[name] =statement
			)

			Object.keys(statement.modifies).forEach(name =>
				this.modifications[name] = statement
			)
		}
			
		)
	}

	addImport(statement: Statement) {
		const node = statement.node as ImportDeclaration;
		const importee = node.source.value as string;
		if (!this.dependencies.indexOf(importee)) this.dependencies.push(importee)
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
		const exportDecl = statement.node as any;
		const source = exportDecl.source && exportDecl.source.value;
		const exportDefaultDecl = exportDecl as ExportDefaultDeclaration;
		const exportNameDecl = exportDecl as ExportNamedDeclaration;

		if (exportDefaultDecl.type == 'ExportDefaultDeclaration') {
			// const isDeclaration = /Declaration$/.test(exportDefaultDecl.declaration.type);

			 this.exports['Default'] = {
				node:statement.node,
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
    

	expandStatement( name: string):Statement[] {
		let statement:Statement;
		if(name ==='Default') {
			const exportDeclaration = this.exports['Default']
			if (exportDeclaration.isDeclaration) {
				// TODO
				// return this.expandStatement()
			}
	
			const name = this.graph.getName(this, 'Default');
			let exportDefaultNode = exportDeclaration.node
			let statementMagicString = this.magicCode.overwrite(
				exportDefaultNode.start, exportDefaultNode.declaration.start,
			`var ${name} = `)
		   statement = new Statement(exportDefaultNode,statementMagicString)
		} 
		else {
			statement = this.definitions[name]
		 }

		let nodes: Statement[] = []

		if (statement) {	
		  
		nodes.push(statement)
	  }
	  return nodes;
	}

}
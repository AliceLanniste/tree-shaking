import { Graph } from "./Graph";
import { Statement } from './node/Statement';
import { rainbowOptions } from "./types";
import { Identifier, ImportDeclaration, parse, Program } from "acorn";
import { Comment } from "./node/Comment";
import { ErrCode, error } from "./error";
import MagicString from "magic-string";
export class Module {
	private code: string;
    private statements:Statement[] | null = null;
	private comments:Comment[] =[];
	private magicString:MagicString;
	imports: Record<string,unknown> = {};
	exports: Record<string,unknown>;

    constructor(
        private readonly graph: Graph,
		public readonly id: string,
		private readonly options: rainbowOptions,
		isEntry: boolean,
		) {
		
    }

	setSource({code, ast}) {
		this.code = code
		this.magicString = new MagicString(this.code, {filename: this.id});
		this.statements = this.parse(ast)
	}

	parse(ast:Program):Statement[] {
     if(!ast) {
		try {
			ast = parse(this.code, {
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
	 statements = ast.body.map( ( node, i ) => {
		const magicString = this.magicString.snip( node.start, node.end );
		return new Statement( node, this, i, magicString );
	});


	 return statements;
	}	

	analyse() {
		if(!this.statements) return;
         this.statements.forEach(statement => {
			if (statement.isImportDeclartion()) this.addImport(statement)
			if (statement.isExportDeclartion()) this.addExport(statement)
		 }); 
	}

	addImport(statement: Statement) {
		const node = statement.node as ImportDeclaration;
		const importee = node.source.value;
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

	addExport(Statement: Statement) {

	}
}
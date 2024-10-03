import { Graph } from "./Graph";
import { Statement } from "./node/Statement";
import { rainbowOptions } from "./types";
import { parse, Program } from "acorn";
import { Comment } from "./node/Comment";
import { ErrCode, error } from "./error";
export class Module {
	private code: string;
    private statements:Statement[] | null = null;
	private comments:Comment[] =[];
	imports: Record<string,unknown>;
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
     ast.body.forEach(node =>{
		 if(node.type === 'EmptyStatement') return

		 
	 })

	 return statements;
	}	

	addImport() {

	}

	addExport() {

	}
}
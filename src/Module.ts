import { ExportDefaultDeclaration, 
		ExportNamedDeclaration, 
		FunctionDeclaration, 
		Identifier,
		ImportDeclaration, 
		parse, 
		Node,
		Program } from "acorn";
import { moduleImport } from "./types";
import MagicString from "magic-string";

export class Module {
    private code: string;
    private comments:Comment[] =[];
    private magicString: MagicString;
    ast: Program;
    dependencies: string[] =[];
    imports:Record<string, moduleImport> = {};
    constructor(
       
    ) {
       
    }

    setSource({code, ast}) {
        this.code = code;
        this.magicString = new MagicString(this.code, {});
    }

    parse(ast: Program) {}

    anlayse() {
        
    }
}
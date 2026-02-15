import { parse,
		Program as AcornProgram } from "acorn";
import { moduleImport } from "./types";
import MagicString from "magic-string";
import {  Program  }from "./node";
import { ERR_CODE, error } from "./error";

export class Module {
    id:string;
    source: string;
    comments:Comment[] =[];
    magicString: MagicString;
    originalAst: AcornProgram;
    ast: Program;
    dependencies: string[] =[];
    imports:Record<string, moduleImport> = {};
    constructor(
       id: string,
       code:string,
    ) {
       this.id = id;
       this.setSource(code)
    }

    setSource(code:string) {
        this.source = code;
        this.magicString = new MagicString(this.source, {filename: this.id});
        this.originalAst = this.parse(this.source)
        this.ast = new Program(this.originalAst, )
    }

    parse(code:string): AcornProgram {
        return this._parseAST(code)
    }



   _parseAST(code:string): AcornProgram {
       try {
           return  parse(code, {
             ecmaVersion: 6,
             sourceType: "module",
           })
       } catch(err:any) {
         error({
             code: ERR_CODE.PARSE_ERROR,
             message: err.message
         })
       }
   }
}
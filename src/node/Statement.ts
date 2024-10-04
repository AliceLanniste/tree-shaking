import { ModuleDeclaration, Statement as Acorn_Statement } from "acorn";
import {Module} from "../Module";
import MagicString from "magic-string";

export class Statement {
    node:Acorn_Statement | ModuleDeclaration;
    
    constructor(node:Acorn_Statement | ModuleDeclaration,
        private readonly module: Module,
        private readonly index: number,
        private readonly magicString:MagicString,
    ){
       this.node = node;
    }

    isImportDeclartion(): boolean {
      return  this.node.type ==='ImportDeclaration'
    }

    isExportDeclartion(): boolean {
        return  /^Export/.test( this.node.type )
      }
}

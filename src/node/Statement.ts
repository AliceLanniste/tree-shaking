import {  Node } from "acorn";
import {Module} from "../Module";
import MagicString from "magic-string";
import Scope from "../utils/scope";

export class Statement {
    node: Node;
   defines: Record<string,any>;
   modifies:  Record<string,any>;
   dependOn: Record<string,any>;
   type: string;
   scope: Scope;
   source: MagicString;

    constructor(node:Node,
        // private readonly module: Module,
        // private readonly index: number,
        magicString:MagicString,
        defines: Record<string,any> ={},
        modifies:  Record<string,any> ={},
        dependOn: Record<string,any> = {},
      

    ){
       this.node = node;
       this.defines = defines;
       this.modifies = modifies;
       this.dependOn = dependOn;
       this.type = this.node.type;
       this.source = magicString;
    }

    isImportDeclartion(): boolean {
      return  this.node.type ==='ImportDeclaration'
    }

    isExportDeclartion(): boolean {
        return  /^Export/.test( this.node.type )
      }
}

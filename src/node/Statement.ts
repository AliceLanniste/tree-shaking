import {  CatchClause, ClassDeclaration, ClassExpression, Function, FunctionDeclaration, Identifier, Node, VariableDeclaration } from "acorn";
import {Module} from "../Module";
import MagicString from "magic-string";
import Scope from "../utils/scope";
import { analyseAST, walk } from '../utils/helper';
import { waitForDebugger } from "inspector";
import { getName } from "../utils/utils";

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
      this.scope = new Scope();
    }
  
   analyse() {
     let scope = this.scope

     walk(this.node, {
       enter(node) {
         let newScope:Scope |null =null;
           switch (node.type) {
             case 'FunctionDeclaration':
             case 'ArrowFunctionExpression':
             case 'FunctionExpression':
               let functionNode = node as Function;
               let names = (functionNode.params as Identifier[]).map(getName);
               if (functionNode.type === 'FunctionDeclaration') {
                //TODO:   addToScope(functionNode as FunctionDeclaration);
               } 
               newScope = new Scope({
                 parent: scope,
                 params: names,
                 isBlockScope:false
               })
               
              // named function expressions - the name is considered
						// part of the function's scope
						// if ( node.type === 'FunctionExpression' && node.id ) {
						// 	newScope.addDeclaration( node.id.name, node, false );
						// } 
              break;
             
             case 'BlockStatement':
               newScope = new Scope({
                 parent: scope,
                 isBlockScope: true
               })
               break;
             
             case 'CatchClause':
               let catchNode = node as CatchClause;
						newScope = new Scope({
							parent: scope,
							params: [getName((catchNode.param as Identifier)) ],
							isBlockScope: true
						});

						break;

             
             case 'VariableDeclaration':
               let variableDeclNode = node as VariableDeclaration;
                // variableDeclNode.declarations.forEach(
                //            variableDeclNode.kind =="let" ? addToBlockScope : addToScope)

               break
             
             case 'classDeclaration':
               let clasDeclNode = node as ClassDeclaration;
               //TODO: addToScope
               break;
             
             case 'classExpression':
               let classExpressNode = node as ClassExpression;
               //TODO: addToScope
               break
           }
         if (newScope) {
           this.scope = newScope;
           scope = newScope;
           }
       },
       leave(node) {
         
       },
     })
     
  }

    isImportDeclartion(): boolean {
      return  this.node.type ==='ImportDeclaration'
    }

    isExportDeclartion(): boolean {
        return  /^Export/.test( this.node.type )
      }
}

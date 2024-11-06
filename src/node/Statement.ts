import {  CatchClause, ClassDeclaration, ClassExpression, Function, FunctionDeclaration, Identifier, Node, VariableDeclaration } from "acorn";
import {Module} from "../Module";
import MagicString from "magic-string";
import Scope, { NULLScope } from '../utils/scope';
import { walk } from '../utils/helper';
import { getName } from "../utils/utils";
import { ScopeNode } from "../types";

export class Statement {
    scopeNode: ScopeNode;
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
      this.scopeNode = { node: node,scope:null, type:node.type };
       this.defines = defines;
       this.modifies = modifies;
       this.dependOn = dependOn;
       this.type = this.scopeNode.type;
      this.source = magicString;
      this.scope = new Scope();
    }
  
  analyse() {
     if ( this.isImportDeclartion() ) return; 
    let scope = this.scope
    let newScope: Scope | null = null;
     walk(this.scopeNode, {
       enter(scopeNode) { 
         const node = scopeNode.node;
         switch (node.type) {
             case 'FunctionDeclaration':
             case 'ArrowFunctionExpression':
             case 'FunctionExpression':
               let functionNode = node as Function;
               let params = (functionNode.params as Identifier[]).map(getName);
                
               if (functionNode.type === 'FunctionDeclaration') {
                 scope.addDeclaration(functionNode.id!.name, functionNode, false);

               } 
               newScope = new Scope({
                 parent: scope,
                 params: params,
                 isBlockScope:false
               })
              // named function expressions - the name is considered
             // part of the function's scope
             //@ts-ignore
						if ( node.type === 'FunctionExpression' && node.id ) {
						  //@ts-ignore
                newScope.addDeclaration(node.id.name, node, false);
               } 
             
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
               variableDeclNode.declarations.forEach( declarator => {
							scope.addDeclaration( (declarator.id as Identifier).name!, node, true );
						});
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
           scopeNode.scope = newScope;
           scope = newScope;
           }
       },
       leave(scopeNode) {
         if (scopeNode.scope) {
           scope = scope.parent || NULLScope
         }
         
       },
     })
     Object.keys( scope.declarations ).forEach( name => {
			this.defines[ name ] = true;
		});
  }
  replacedIdentifier(names: Record<string, string>) {
    const replacementStack = [names];
    let keys = Object.keys(names)
    if (keys.length === 0) {
      return;
    }
    let that = this
    walk(that.scopeNode, {
      enter(scopeNode,parent) {
        let newNames: Record<string, string> = {}
        let scope = that.scope;
        let hasReplacement = false;
        keys.forEach((key) => {
            if (scope.declarations[key]) {
              newNames[key] = names[key]
              hasReplacement = true
            }
        })
        replacementStack.push(newNames);
         if (!hasReplacement) {
          this.skip();
        }
       
        if (scopeNode.type === 'Identifier' && parent.type !== "MemberExpression") {
          let name = (scopeNode.node as Identifier).name;
          
          if (Object.hasOwn(names, name) && name !== names[name]) {
              name = names[name]
          }
          that.source.overwrite(scopeNode.node.start, scopeNode.node.end, name);
        }
      },

      leave(node) {
        if ( that.scope ) {
				replacementStack.pop();
				names = replacementStack[ replacementStack.length - 1 ];
			}
      },
    })
  }
  

    isImportDeclartion(): boolean {
      return  this.scopeNode.node.type ==='ImportDeclaration'
    }

    isExportDeclartion(): boolean {
        return  /^Export/.test( this.scopeNode.node.type )
      }
}

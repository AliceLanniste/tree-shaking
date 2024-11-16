import {  CatchClause, ClassDeclaration, ClassExpression, Function, FunctionDeclaration, FunctionExpression, Identifier, Node, VariableDeclaration } from "acorn";
import {Module} from "../Module";
import MagicString from "magic-string";
import Scope, { NULLScope } from '../utils/scope';
import { walk } from '../utils/helper';
import { getName } from "../utils/utils";
import { ScopeNode } from "../types";
import walkAST from "../utils/walk";
import nodePath from 'node:path';

export class Statement {
  node: Node;
  scopeNode: ScopeNode;
  start: number;
  end: number;
  defines: Record<string, any>;
  modifies: Record<string, any>;
  dependsOn: Record<string, boolean>;
  strongDependsOn: Record<string, boolean> = {};
  type: string;
  scope: Scope;
  module: Module;
   
  constructor(node: Node,
    // private readonly module: Module,
    // private readonly index: number,
    module: Module,
    defines: Record<string, any> = {},
    modifies: Record<string, any> = {},
    dependOn: Record<string, boolean> = {},
      

  ) {
    this.node = node
    this.scopeNode = { node: node, scope: null, type: node.type };
    this.defines = defines;
    this.modifies = modifies;
    this.dependsOn = dependOn;
    this.type = this.scopeNode.type;
    this.scope = new Scope();
    this.module = module;
  }
  
    
  
  // analyse() {
  //    if ( this.isImportDeclartion() ) return;
  //   let scope = this.scope
  //   let newScope: Scope | null = null;
  //    walk(this.scopeNode, {
  //      enter(scopeNode) {
  //        const node = scopeNode.node;
  //        switch (node.type) {
  //            case 'FunctionDeclaration':
  //            case 'ArrowFunctionExpression':
  //            case 'FunctionExpression':
  //              let functionNode = node as Function;
  //              let params = (functionNode.params as Identifier[]).map(getName);
                
  //              if (functionNode.type === 'FunctionDeclaration') {
  //                scope.addDeclaration(functionNode.id!.name, functionNode, false);

  //              }
  //              newScope = new Scope({
  //                parent: scope,
  //                params: params,
  //                isBlockScope:false
  //              })
  //             // named function expressions - the name is considered
  //            // part of the function's scope
  //            //@ts-ignore
  // 					if ( node.type === 'FunctionExpression' && node.id ) {
  // 					  //@ts-ignore
  //               newScope.addDeclaration(node.id.name, node, false);
  //              }
             
  //             break;
             
  //            case 'BlockStatement':
  //              newScope = new Scope({
  //                parent: scope,
  //                isBlockScope: true
  //              })
  //              break;
             
  //            case 'CatchClause':
  //              let catchNode = node as CatchClause;
  // 					  newScope = new Scope({
  // 						  parent: scope,
  // 						  params: [getName((catchNode.param as Identifier)) ],
  // 						  isBlockScope: true
  // 					});

  // 					break;

             
  //            case 'VariableDeclaration':
  //              let variableDeclNode = node as VariableDeclaration;
  //              variableDeclNode.declarations.forEach( declarator => {
  // 						scope.addDeclaration( (declarator.id as Identifier).name!, node, true );
  // 					});
  //              break
             
  //            case 'classDeclaration':
  //              let clasDeclNode = node as ClassDeclaration;
  //              //TODO: addToScope
  //              break;
             
  //            case 'classExpression':
  //              let classExpressNode = node as ClassExpression;
  //              //TODO: addToScope
  //              break
  //        }
  //        if (newScope) {
  //          scopeNode.scope = newScope;
  //          scope = newScope;
  //          }
  //      },
  //      leave(scopeNode) {
  //        if (scopeNode.scope) {
  //          scope = scope.parent || NULLScope
  //        }
         
  //      },
  //    })
  //    Object.keys( scope.declarations ).forEach( name => {
  // 		this.defines[ name ] = true;
  // 	});
  // }
  // replacedIdentifier(names: Record<string, string>) {
  //   const replacementStack = [names]
  //   let keys = Object.keys(names)
  //   if (keys.length === 0) {
  //     return;
  //   }
  //   let that = this
  //   walk(that.scopeNode, {
  //     enter(scopeNode,parent) {
  //       let newNames: Record<string, string> = {}
  //       let scope = that.scope;
  //       let hasReplacement = false;
  //       keys.forEach((key) => {
  //           if (scope.declarations[key]) {
  //             newNames[key] = names[key]
  //             hasReplacement = true
  //           }
  //       })
  //       replacementStack.push(newNames);
  //        if (!hasReplacement) {
  //         this.skip();
  //       }
       
  //       if (scopeNode.type === 'Identifier' && parent.type !== "MemberExpression") {
  //         let name = (scopeNode.node as Identifier).name;
          
  //         if (Object.hasOwn(names, name) && name !== names[name]) {
  //           name = names[name]
            
  //         }
        
  //         that.source.overwrite(scopeNode.node.start, scopeNode.node.end, name);
  //       }
  //     },

  //     leave(node) {
  //       if ( that.scope ) {
  // 			replacementStack.pop();
  // 			names = replacementStack[ replacementStack.length - 1 ];
  // 		}
  //     },
  //   })
  // }
  
  analyse() {
    if (this.isImportDeclartion()) return
   
    let scope = this.scope;
    walkAST(this.node, {
      enter(node, parent) {
        let newScope: Scope | null = null
        switch (node.type) {
          case "FunctionDeclaration":
            let functNode = node as FunctionDeclaration;
            scope.addDeclaration(functNode.id.name, node, false);

          case "BlockStatement":
            if (parent && /Function/.test(parent.type)) {
              let funParent = parent as Function;
              newScope = new Scope({
                parent: scope,
                isBlockScope: false,
                params: funParent.params as Identifier[]
              })
                   
              if (parent.type === 'FunctionExpression') {
                let funExp = parent as FunctionExpression;
                if (funExp.id) {
                  newScope.addDeclaration(funExp.id.name, parent, false);
                }
              }

            } else {
              newScope = new Scope({
                parent: scope,
                isBlockScope: true
              });
            }
            break
              
          case 'VariableDeclaration':
            let varDeclar = node as VariableDeclaration;
            varDeclar.declarations.forEach(declarator => {
              scope.addDeclaration((declarator.id as Identifier).name, node, true);
            });
            break;

          case 'ClassDeclaration':
            let classNode = node as ClassDeclaration;
            scope.addDeclaration(classNode.id.name, node, false);
            break;
        }
        if (newScope) {
          Object.defineProperty(node, '_scope', {
            value: newScope,
            configurable: true
          })
          scope = newScope
        }
      },

      leave(node, parent) {
        if (node._scope) {
          scope = scope.parent || NULLScope;
        }
      }

      
    }
    
    
    
    )

    let readDepth = 0;
		if ( !this.isImportDeclartion() ) {
			walkAST( this.node, {
				enter: ( node, parent ) => {
					
					if ( node._scope ) scope = node._scope;

					this.checkForReads( scope, node, parent!, !readDepth );
				},
				leave: ( node, parent ) => {

					if ( node._scope ) scope = scope.parent || NULLScope;
				}
			});
		}

		Object.keys( scope.declarations ).forEach( name => {
			this.defines[ name ] = true;
		});

    
  }

  checkForReads(scope: Scope, node: Node, parent: Node , strong:boolean ) {
    if (node.type === 'Identifier') {
      let identifierName = (node as Identifier).name;
          const definingScope = scope.findDefineScope( (node as Identifier).name );

			if ( !definingScope || definingScope.depth === 0 ) {
				this.dependsOn[ identifierName ] = true;
				if ( strong ) this.strongDependsOn[ identifierName ] = true;
			}
        }
  }

    isImportDeclartion(): boolean {
      return  this.scopeNode.node.type ==='ImportDeclaration'
    }

    isExportDeclartion(): boolean {
        return  /^Export/.test( this.scopeNode.node.type )
    }
  
  source () {
		return this.module.source.slice( this.start, this.end );
	}

	toString () {
		return this.module.magicCode.slice( this.start, this.end );
	}
}

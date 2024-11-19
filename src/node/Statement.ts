import {  CatchClause, ClassDeclaration, ClassExpression, Function, FunctionDeclaration, FunctionExpression, Identifier, Node, VariableDeclaration } from "acorn";
import {Module} from "../Module";
import Scope, { NULLScope } from '../utils/scope';
import { ScopeNode } from "../types";
import walkAST from "../utils/walk";
import MagicString from "magic-string";

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
  next: number;
  
  constructor(node: Node,
    module: Module,
    start: number,
    end: number,
    defines: Record<string, any> = {},
    modifies: Record<string, any> = {},
    dependOn: Record<string, boolean> = {},
    

  ) {
    this.node = node
    this.start = start
    this.end = end
    this.scopeNode = { node: node, scope: null, type: node.type };
    this.defines = defines;
    this.modifies = modifies;
    this.dependsOn = dependOn;
    this.type = this.scopeNode.type;
    this.scope = new Scope();
    this.module = module;
  }
  
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
    replacedIdentifiers(magiString: MagicString,names: Record<string, string>) {
    const replacementStack = [names]
    let keys = Object.keys(names)
    if (keys.length === 0) {
      return;
    }
      let that = this
      let depth = 0

    walkAST(that.node, {
      enter(node, parent) {
        
        
        if (/^Function/.test(node.type)) depth += 1;
        
        let scope = node._scope
        if (scope) {
          let newNames:Record<string,string> = {}

          Object.keys(names).forEach(name => {
            if (!scope.declarations[name]) {
               newNames[name] = names[name]
            }
          })

          names = newNames
          replacementStack.push(newNames);
        }
        if ( node.type !== 'Identifier' ) return;
        const name = names[ node.name ];
				if ( !name || name === node.name ) return;

        // let newNames: Record<string, string> = {}
        // let scope = node._scope;
        // let hasReplacement = false;
        // keys.forEach((key) => {
        //     if (scope.declarations[key]) {
        //       newNames[key] = names[key]
        //       hasReplacement = true
        //     }
        // })
         
        // replacementStack.push(newNames);
        //  if (!hasReplacement) {
        //    this.skip();
        // }
       
        // if (node.type === 'Identifier' &&parent&& parent.type !== "MemberExpression") {
        //   let name = (node as Identifier).name;
          
        //   if (Object.hasOwn(names, name) && name !== names[name]) {
        //     name = names[name]
            
        //   }
        
         magiString.overwrite(node.start, node.end, name);
        // }
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
      return  this.node.type ==='ImportDeclaration'
    }

    isExportDeclartion(): boolean {
        return  /^Export/.test( this.node.type )
    }
  
  mark() {
    
    Object.keys(this.dependsOn).forEach(depend => {
        if (this.defines[depend])  return
          
         this.module.mark(depend)
      })
    }
  
  source () {
		return this.module.source.slice( this.start, this.end );
	}

	toString () {
		return this.module.magicCode.slice( this.start, this.end );
	}
}

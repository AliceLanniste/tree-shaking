import {  AssignmentExpression, CallExpression, CatchClause, ClassDeclaration, ClassExpression, Function, FunctionDeclaration, FunctionExpression, Identifier, MemberExpression, Node, UpdateExpression, VariableDeclaration } from "acorn";
import {Module} from "../Module";
import Scope, { NULLScope } from '../utils/scope';
import { ScopeNode } from "../types";
import walkAST from "../utils/walk";
import MagicString from "magic-string";
import { ErrCode, error } from "../error";


function isFunctionDeclaration ( node:Node, parent:Node | null ) {
	// `function foo () {}` 
	if ( node.type === 'FunctionDeclaration' ) return true;

	// `var foo = function () {}` - same thing for present purposes
	if ( node.type === 'FunctionExpression' && parent && parent.type === 'VariableDeclarator' ) return true;
}
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
    let writeDepth = 0;
		if ( !this.isImportDeclartion() ) {
			walkAST( this.node, {
				enter: ( node, parent ) => {
					if (isFunctionDeclaration(node,parent))  writeDepth += 1
					if ( node._scope ) scope = node._scope;
          

          this.checkForReads(scope, node, parent!, !readDepth);
          this.checkForWrites(scope,node,writeDepth)
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

      if (!definingScope || definingScope.depth === 0) {
				this.dependsOn[ identifierName ] = true;
				if ( strong ) this.strongDependsOn[ identifierName ] = true;
			}
        }
  }

  
  checkForWrites(scope: Scope, node: Node, writeDepth: number) {
   
		const addNode = ( node:Node, isAssignment:boolean ) => {
			let depth = 0; // determine whether we're illegally modifying a binding or namespace

			while ( node.type === 'MemberExpression' ) {
				node = (node as MemberExpression).object;
				depth += 1;
			}

			// disallow assignments/updates to imported bindings and namespaces
      if (isAssignment) {
        let idNode = node as Identifier
               
        const importSpecifier = this.module.imports[idNode.name];
        console.log("isAssignment", importSpecifier, scope);

				if ( importSpecifier && !scope.contains( idNode.name ) ) {
					const minDepth = importSpecifier.name === '*' ?
						2 : // cannot do e.g. `namespace.foo = bar`
						1;  // cannot do e.g. `foo = bar`, but `foo.bar = bar` is fine

          if (depth < minDepth) {
            throw error(
              {
                code: ErrCode.ILLEGEAL_REASSIGN,
                message: `Illegal reassignment to import '${idNode.name}'`
              })
					}
				}		
			}

			// we only care about writes that happen a) at the top level,
			// or b) inside a function that could be immediately invoked.
			// Writes inside named functions are only relevant if the
			// function is called, in which case we don't need to do
			// anything (but we still need to call checkForWrites to
			// catch illegal reassignments to imported bindings)
			if ( writeDepth === 0 && node.type === 'Identifier' ) {
				this.modifies[ (node as Identifier).name ] = true;
			}
		};

    if (node.type === 'AssignmentExpression') {
       console.log("checkForWrites", node,node.type)
			addNode( (node as AssignmentExpression).left, true );
		}
	}
	replaceIdentifiers ( magicString:MagicString, names:Record<string,string> ) {
		const replacementStack = [ names ];
		
		let that = this;
		let topLevel = true;
		let depth = 0;

		walkAST( this.node, {
			enter ( node, parent ) {
			
				if ( /^Function/.test( node.type ) ) depth += 1;

				const scope = node._scope;

				if (scope) {
					topLevel = false;
					let newNames:Record<string,string> ={}
					let hasReplacements:boolean = false;

				Object.keys( names ).forEach( name => {
						if ( !scope.declarations[ name ] ) {
							newNames[ name ] = names[ name ];
							hasReplacements = true;
						}
					});


					if ( !hasReplacements && depth > 0 ) {
						return this.skip();
					}

					names = newNames;
					replacementStack.push( newNames );
				}

				if ( node.type !== 'Identifier' ) return;
			 
				const name = names[ (node as Identifier).name ];
				if ( !name || name === (node as Identifier).name ) return;
        
          
        //@ts-ignore
			  if (parent&& parent.type === 'MemberExpression' && !parent.computed && node !== parent.object)  return
          
        if ( parent &&parent.type === 'Property' && node !== parent.value ) return;

        
				magicString.overwrite( node.start, node.end, name, true );
			},

			leave ( node ) {
				if ( /^Function/.test( node.type ) ) depth -= 1;
				if ( node._scope ) {
					replacementStack.pop();
					names = replacementStack[ replacementStack.length - 1 ];
				}
			}
		});

		return magicString;
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

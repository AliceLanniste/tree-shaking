import {CatchClause, ClassDeclaration, ClassExpression, Function, FunctionDeclaration, Identifier, MemberExpression, Node, VariableDeclaration, VariableDeclarator, type Program} from 'acorn';
import Scope from './scope';
import { getName } from './utils';
import MagicString from 'magic-string';
import { Statement } from '../node/Statement';
import { walk } from './walk';



interface analysedAST {
    ast: Program,
    scope:Scope,
    topLevelStatements: enhancedNode[],
}


interface  enhancedNode {
    node:Node,
    type: string,
    defines?:any,
    modifies?:any,
    dependOn?:any,
    scope:Scope | null,
}



export function analyseAST(ast: Program, code: MagicString) {
   let scope:Scope | null  =new Scope();
   let currentTopStatement:Statement | null;
   let topLevelStatements: Statement[] =[];

   function addToScope(node: FunctionDeclaration | VariableDeclarator | ClassDeclaration | ClassExpression) {
        const name = (node.id as Identifier).name;
        scope!!.add(name,false);

        if(!scope!!.parent && currentTopStatement) {
            currentTopStatement.defines[name] = true;
        }
   }

   
   function addToBlockScope(node: VariableDeclarator) {
        const name = (node.id as Identifier).name;
        scope!!.add(name,true);

        if(!scope!!.parent && currentTopStatement) {
            currentTopStatement.defines[name] = true;
        }
   }

   walk(ast, {
        enter(node) {
            let sourceString =code.snip(node.start,node.end);
            let statement = new Statement(node,sourceString)
            currentTopStatement = statement;
            topLevelStatements.push(statement);
            const {type} = statement;
           let newScope: Scope| null =null;
            switch(type) {
				case 'FunctionDeclaration':
				case 'ArrowFunctionExpression':
                case 'FunctionExpression':
                    let functionNode = node as Function;
                    let names = (functionNode.params as Identifier[]).map( getName );
                    if (functionNode.type == "FunctionDeclaration") {
						addToScope(functionNode as FunctionDeclaration);

					} else if(functionNode.type =="FunctionExpression" && functionNode.id) {

                        names.push(functionNode.id.name)
                    }
                   newScope = new Scope({
                        parent: scope,
						names: names, 
						isBlockScope: false
                    })
                    break

                case 'BlockStatement':
                   newScope = new Scope({
                        parent:scope,
                        isBlockScope:true
                    })     
                
                    break;
                case 'CatchClause':
                    let catchNode = node as CatchClause;
						newScope = new Scope({
							parent: scope,
							names: [ catchNode.param.name ],
							isBlockScope: true
						});

						break;

                case 'VariableDeclaration':
                    let variableDeclNode = statement.node as VariableDeclaration;
                     variableDeclNode.declarations.forEach(
                           variableDeclNode.kind =="let" ? addToBlockScope : addToScope)
                    break
                
                case 'classDeclaration':
                    let classDeclNode = statement.node as ClassDeclaration;
                    addToScope(classDeclNode);    
                    break

                case 'classExpression':
                    let classExprNode = statement.node as ClassExpression;
                    addToScope(classExprNode);
                    break;
            }
           
           if (newScope) {
               statement.scope = newScope
               scope = newScope
             }
        },

        leave(node) {
            if (node === currentTopStatement?.node) {
                currentTopStatement = null
            }

            switch ( node.type ) {
				case 'FunctionExpression':
				case 'FunctionDeclaration':
				case 'ArrowFunctionExpression':
				case 'BlockStatement':
					scope = scope? scope.parent : null;
					break;
			}


      }
   })
    
    
    topLevelStatements.forEach(statement => {
        let node = statement.node
        function checkForReads(node:Node,parent:Node) {
            if (node.type === 'Identifier') {
                if (parent && parent.type === 'MemberExpression' && node !== (parent as MemberExpression).object) {
                     return
                }
                let identifier=  node as Identifier
                const definingScope = scope!.findDefiningScope(identifier.name)

                if ( ( !definingScope || definingScope.depth === 0 ) && !statement.defines[ identifier.name ] ) {
					statement.dependsOn[ identifier.name ] = true;
				}
                
             }
        }

        function checkForWrites(node: Node, parent: Node) {
            
        }

        walk(node, {
            enter(node,parent) {
                       // skip imports
				if ( /^Import/.test( node.type ) ) return this.skip();

				if ( statement.scope ) scope = statement.scope;

				checkForReads( node, parent );
				checkForWrites( node, parent );


                    },

                    leave(node) {
                        if (statement.scope) scope = scope!.parent;
                    },
        })
    })
    
 
   return {
    ast,
    scope,
   topLevelStatements
   }
}



function isStatement(node:Node):boolean {
    return node.type === 'ExpressionStatement' ||
    node.type === 'FunctionDeclaration'; 
}
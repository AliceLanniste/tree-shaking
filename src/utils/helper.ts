import {ClassDeclaration, ClassExpression, Function, FunctionDeclaration, Identifier, Node, VariableDeclaration, VariableDeclarator, type Program} from 'acorn';
import Scope from './scope';
import { getName } from './utils';
import MagicString from 'magic-string';
import { Statement } from '../node/Statement';
import { ScopeNode } from '../types';

type walkFunc = { enter: ((node:ScopeNode,parent:ScopeNode) => void) | null,leave:((node:ScopeNode)=>void) | null};
let shouldSkip:boolean =false;
let shouldAbort: boolean = false;

let context = {
	skip: () => shouldSkip = true,
	abort: () => shouldAbort = true
};
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



// export function analyseAST(ast: Program, code: MagicString) {
//    let scope:Scope | null  =new Scope();
//    let currentTopStatement:Statement | null;
//    let topLevelStatements: Statement[] =[];

//    function addToScope(node: FunctionDeclaration | VariableDeclarator | ClassDeclaration | ClassExpression) {
//         const name = (node.id as Identifier).name;
//         scope!!.add(name,false);

//         if(!scope!!.parent && currentTopStatement) {
//             currentTopStatement.defines[name] = true;
//         }
//    }

   
//    function addToBlockScope(node: VariableDeclarator) {
//         const name = (node.id as Identifier).name;
//         scope!!.add(name,true);

//         if(!scope!!.parent && currentTopStatement) {
//             currentTopStatement.defines[name] = true;
//         }
//    }

//    walk(ast, {
//         enter(node) {
//             let sourceString =code.snip(node.start,node.end);
//             let statement = new Statement(node,sourceString)
//             currentTopStatement = statement;
//             topLevelStatements.push(statement);
//             const {type} = statement;
            
//             switch(type) {
// 				case 'FunctionDeclaration':
// 				case 'ArrowFunctionExpression':
//                 case 'FunctionExpression':
//                     let functionNode = node as Function;
//                     let names = (functionNode.params as Identifier[]).map( getName );
//                     if (functionNode.type == "FunctionDeclaration") {
// 						addToScope(functionNode as FunctionDeclaration);

// 					} else if(functionNode.type =="FunctionExpression" && functionNode.id) {

//                         names.push(functionNode.id.name)
//                     }
//                     scope = statement.scope = new Scope({
//                         parent: scope,
// 						params: names, 
// 						isBlockScope: false
//                     })
//                     break

//                 case 'BlockStatement':
//                     scope = statement.scope = new Scope({
//                         parent:scope,
//                         isBlockScope:true
//                     })     
                
//                 break;

//                 case 'VariableDeclaration':
//                     let variableDeclNode = statement.node as VariableDeclaration;
//                      variableDeclNode.declarations.forEach(
//                            variableDeclNode.kind =="let" ? addToBlockScope : addToScope)
//                     break
                
//                 case 'classDeclaration':
//                     let classDeclNode = statement.node as ClassDeclaration;
//                     addToScope(classDeclNode);    
//                     break

//                 case 'classExpression':
//                     let classExprNode = statement.node as ClassExpression;
//                     addToScope(classExprNode);
//                     break;
//             }
//         },

//         leave(node) {
//             if (node === currentTopStatement?.node) {
//                 currentTopStatement = null
//             }

//             switch ( node.type ) {
// 				case 'FunctionExpression':
// 				case 'FunctionDeclaration':
// 				case 'ArrowFunctionExpression':
// 				case 'BlockStatement':
// 					scope = scope? scope.parent : null;
// 					break;
// 			}


//       }
//    })
 
//    return {
//     ast,
//    scope,
//    topLevelStatements
//    }
// }


//iterate vist AST Node
export function walk(ast:ScopeNode,walkFunc:walkFunc) {
    shouldSkip = false;
    visit(ast,null,  walkFunc);

}

function visit(ast: ScopeNode, parent: ScopeNode | null, walkFunc: walkFunc) {
       let innerAst = ast.node;
    if(!ast || shouldAbort) return;

    if(walkFunc.enter) {
        shouldSkip = false
        walkFunc.enter.call(context,ast,parent);
		if ( shouldSkip || shouldAbort ) return;
        
    }

    let keys = Object.keys(innerAst).filter(key => typeof innerAst[key] === 'object');
    let i = keys.length;
    let j:number = -1;
    while (i--) {
        let key = keys[i];
        let node = innerAst[key];
        if(Array.isArray(node)) {
            j= node.length;
            while (j--) {
                let scopeNode = {
                    node: node[j],
                    scope: null,
                    type: node[j].type,
                }
                visit(scopeNode,ast,walkFunc);
            }
        } else if (node && node.type) {
            let scopeNode = {
                    node: node,
                    scope: null,
                    type: node.type,
                }
            visit(scopeNode,ast,walkFunc);
        }
    }


    if (walkFunc.leave && !shouldAbort) {
         walkFunc.leave(ast);
    }
}


function isStatement(node:Node):boolean {
    return node.type === 'ExpressionStatement' ||
    node.type === 'FunctionDeclaration'; 
}
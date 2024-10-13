import {ClassDeclaration, ClassExpression, Function, FunctionDeclaration, Identifier, Node, VariableDeclaration, VariableDeclarator, type Program} from 'acorn';
import Scope from './scope';
import { getName } from './utils';

type walkFunc = { enter: ((node:Node) => void) | null,leave:((node:Node)=>void) | null};
let shouldSkip:boolean =false;
let shouldAbort: boolean = false;

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



export function analyseAST(ast: Program) {
   let scope:Scope | null  =new Scope();
   let currentTopStatement: enhancedNode | null;
   let topLevelStatements: enhancedNode[] =[];

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
            let enNode:enhancedNode = {
                node,
                type:node.type,
                scope:null,
            }
            if(!currentTopStatement && isStatement(node)){
                 enNode.defines = {};
                 enNode.modifies = {}
                 enNode.dependOn = {}
                currentTopStatement = enNode;

                topLevelStatements.push(enNode);
            }
            const {type} = enNode;
            
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
                    scope = enNode.scope = new Scope({
                        parent: scope,
						params: names, 
						isBlockScope: false
                    })
                    break

                case 'BlockStatement':
                    scope = enNode.scope = new Scope({
                        parent:scope,
                        isBlockScope:true
                    })     
                
                break;

                case 'VariableDeclaration':
                    let variableDeclNode = enNode.node as VariableDeclaration;
                     variableDeclNode.declarations.forEach(
                           variableDeclNode.kind =="let" ? addToBlockScope : addToScope)
                    break
                
                case 'classDeclaration':
                    let classDeclNode = enNode.node as ClassDeclaration;
                    addToScope(classDeclNode);    
                    break

                case 'classExpression':
                    let classExprNode = enNode.node as ClassExpression;
                    addToScope(classExprNode);
                    break;
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

   return {
    ast,
   scope,
   topLevelStatements
   }
}


//iterate vist AST Node
export function walk(ast:Node,walkFunc:walkFunc) {
    shouldSkip = false;
    visit(ast,null,  walkFunc);

}

function visit(ast:Node,parent:Node |null, walkFunc: walkFunc) {
    if(!ast || shouldAbort) return;

    if(walkFunc.enter) {
        shouldSkip = false
       walkFunc.enter(ast);
    }

    let keys = Object.keys(ast).filter(key => typeof ast[key] === 'object');

    let i = keys.length;
    let j:number = -1;
    while (i--) {
        let key = keys[i];
        let node = ast[i];
        if(Array.isArray(node)) {
            j= node.length;
            while (j--) {
                visit(node[j],ast,walkFunc);
            }
        } else if(node && node.type) {
            visit(node,ast,walkFunc);
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
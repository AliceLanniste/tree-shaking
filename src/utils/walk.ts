import { Node } from "acorn";
import Scope from "./scope";
import { walk } from './helper';

let shouldSkip = false;
let shouldAbort = false
let context = {
	skip: () => shouldSkip = true,
	abort: () => shouldAbort = true
};
let childKeys:Record<string,any> ={} ;


interface ScopeNode extends Node {
    _scope?: Scope
}

type enterFun = (node: ScopeNode, parent: ScopeNode | null) =>void
type leaveFun = (node: ScopeNode, parent: ScopeNode | null) => void

type walkFunc = { enter: enterFun, leave: leaveFun };

export default function walkAST(ast: ScopeNode, {enter,leave}:walkFunc) {
    shouldSkip = false;
    visit(ast,null,enter,leave)
}


function visit(ast: ScopeNode, parent:ScopeNode | null, enter:enterFun, leave:leaveFun) {
    if (!ast || shouldAbort) return
    
    if (enter) {
        shouldSkip = false
        enter.call(context, ast, parent);
        if (shouldSkip || shouldAbort) return;
    }

    let keys = childKeys[ast.type] ||(
            childKeys[ast.type] = Object.keys(ast).filter(key => typeof ast[ key ] === 'object'))
    
    let key:string ='', value:ScopeNode|null=null, i:number=keys.length, j=0;

    while (i--) {
        key = keys[i];
        value = ast[key];

        if (isArray(value)) {
            j = value.length;
            while (j--) {
                visit(value[j], ast, enter, leave)
            }
        } else if (value && value.type) {
            visit(value,ast,enter,leave)
        }
    }

    if (leave && !shouldAbort) {
        leave(ast, parent);
    }
}


function isArray(value: any) {
   return Array.isArray(value) 
}
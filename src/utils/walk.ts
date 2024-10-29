import {  Node  } from "acorn";


type walkFunc = { enter: ((node:Node,parent:any) => void) | null,leave:((node:Node)=>void) | null};
let shouldSkip:boolean =false;
let shouldAbort: boolean = false;

let context = {
	skip: () => shouldSkip = true,
	abort: () => shouldAbort = true
};

//iterate vist AST Node
export function walk(ast:Node,walkFunc:walkFunc) {
    shouldSkip = false;
    visit(ast,null,  walkFunc);

}

function visit(ast:Node,parent:Node |null, walkFunc: walkFunc) {
    if(!ast || shouldAbort) return;

    if (walkFunc.enter) {
        shouldSkip = false
        walkFunc.enter.call(context, ast, parent);
        if (shouldSkip || shouldAbort) return
    }

    let keys = Object.keys(ast).filter(key => typeof ast[key] === 'object');

    let i = keys.length;
    let j:number = -1;
    while (i--) {
        let key = keys[i];
        let node = ast[key];
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


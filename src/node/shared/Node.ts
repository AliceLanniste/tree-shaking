import MagicString from "magic-string";
import Variable from "../../variables/Variable";
import { ASTContext } from "../utils/ASTContext";
import { getNodeKeys, STORED_KEYS } from "../utils";
import { Scope } from "../../scopes";

interface Span {
    start: number;
    end: number;
}
export interface GenericNode { 
    type: string;
    [key: string]: any;
}

export interface StatementNode extends Node {}
export interface ExpressionNode extends Node {}

export interface Node {
    span: Span;
    type: string;
    parent: Node | {type?: string};
    included: boolean;
    variable?:Variable;
    context: ASTContext;
    include(): void;
    shouldBeIncluded(): boolean;

    render(code: MagicString, options: any): void;
}

export class NodeBase implements Node { 
     type: string;
     span: Span;
     scope: Scope;
     keys: string[];
     context: ASTContext;
     parent: Node | { type?: string; };
     included: boolean;
     

    constructor(astNode:GenericNode,parent: Node | {type: string, context: ASTContext}, parentScope: Scope){
        this.keys = STORED_KEYS[astNode.type] || getNodeKeys(astNode);
        this.parent = parent;
        this.context = parent.context;
        this.span = Object.create(null);
        this.createScope(parentScope);
        this.parseNodes(astNode);
        this.initialise();
        this.included = false;
    }
    
    parseNodes(astNode: GenericNode) { 
       for (const key of Object.keys(astNode)) {
        if (this.hasOwnProperty(key)) continue;
        const value = astNode[key];
        if(typeof value !== 'object' || value === null){
            (<GenericNode>this)[key] = value;
        } else if(Array.isArray(value)) {
            (<GenericNode>this)[key] = [];
            for (const child of value) {
                (<GenericNode>this).push(
                    child === null ? null : new (this.context.nodeConstructor[child.type])(child, this, this.scope)
                )
            }

        } else {
            new(this.context.nodeConstructor[value.type])(value, this, this.scope)
        }
       }
    }
    
    createScope(parentScope: Scope) {
        this.scope = parentScope;
    }
    initialise() {
        this.included =false
    }

    include() {
        this.included = true;
    }
     shouldBeIncluded(): boolean {
        return this.included;
     }

     render(code: MagicString, options: any): void {
        for(const key of this.keys) {
            const value = (<GenericNode>this)[key];
            if (value == null) continue;
            if (Array.isArray(value)) {
                for (const child of value) {
                    if (child) child.render(code, options);
                }
            } else {
                value.render(code, options);
            }
        }   
     }
}


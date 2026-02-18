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
     keys: string[];
     context: ASTContext;
     parent: Node | { type?: string; };
     included: boolean;
     

    constructor(astNode:GenericNode,parent: Node | {type: string, context: ASTContext}, parentScope: Scope){
        this.keys = STORED_KEYS[astNode.type] || getNodeKeys(astNode);
        this.parent = parent;
        this.context = parent.context;
        this.span = Object.create(null);
        this.included = false;
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
         
     }
}


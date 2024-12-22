import Scope from "../scopes/Scope";
import Variable from "../variables/Variable";
import MagicString from 'magic-string';
import { getNodeKeys, STORED_KEYS } from "./utils";

interface Span {
    start: number,
    end: number
}

export interface GenericNode {
    type: string,
    [key: string]: any;
}

export interface Node {
    span: Span,
    type: string,
    variable?: Variable,

    include(): void;

    shouldBeIncluded(): boolean;

    render(code: MagicString, options: any): void;
}

export class NodeBase implements Node {
    type: string;
    keys: string[];
    span: Span;
    scope: Scope;
    included: boolean;

    constructor(astNode: GenericNode,parentScope:Scope) { 
        this.keys = STORED_KEYS[astNode.type] || getNodeKeys(astNode);
        this.createScope(parentScope)
    }

    createScope(scope: Scope) {
        this.scope = scope
    }
    
    initialise() {

    }
    include() { 
        this.included = true;
    }
    
    shouldBeIncluded(): boolean {
        return this.included;
    }

    render(code: MagicString, options: any) {
        for (const key of this.keys) {
            const value = (<GenericNode>this)[key];
            if (Array.isArray(value)) {
                for (const child of value) {
                  if (child)   child.render(code,options)
                }
            } else {
                value.render(code,options)
            }
        }
    }
}
import Scope from "../../scopes/Scope";
import Variable from "../../variables/Variable";
import MagicString from 'magic-string';
import { ASTContext, getNodeKeys, STORED_KEYS } from "../utils";

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
    parent: Node | { type?: string };
    included: boolean;
    variable?: Variable,
    context: ASTContext,
    include(): void;

    shouldBeIncluded(): boolean;

    render(code: MagicString, options: any): void;
}

export interface StatementNode extends Node {}
export  interface ExpressionNode  extends Node {}
export class NodeBase implements Node {
    type: string;
    keys: string[];
    context: ASTContext;
    parent: Node | { type: string, context: ASTContext };
    span: Span;
    scope: Scope;
    included: boolean;

    constructor(astNode: GenericNode,parent:Node | { type: string, context: ASTContext },  parentScope:Scope) { 
        this.keys = STORED_KEYS[astNode.type] || getNodeKeys(astNode);
        this.parent = parent
        this.context = parent.context;
        this.span = Object.create(null);
        this.createScope(parentScope)
        this.parseNode(astNode)
        this.initialise()
    }

    createScope(scope: Scope) {
        this.scope = scope
    }

    parseNode(node: GenericNode) {

        for (const key of Object.keys(node)) {
            if (this.hasOwnProperty(key)) continue
            const value = node[key]
            if (typeof value !== 'object' || value === null) {
                if (key === 'start' || key === 'end') {
                    this.span[key] = value
                }
                (<GenericNode>this)[key] = value
            } else if (Array.isArray(value)) {
                (<GenericNode>this)[key] = [];
                for (const child of value) {
                    (<GenericNode>this)[key].push(
                        child === null
                            ? null
                            : new (this.context.nodeConstructor[child.type]
                              || this.context.nodeConstructor.UnknownNode)(child, this, this.scope)
                    )
                }
            } else {

             (<GenericNode>this)[key]  = new (this.context.nodeConstructor[value.type]
                              || this.context.nodeConstructor.UnknownNode)(value, this, this.scope)
            }
            
        }
    }
    
    initialise() {
        this.included =false
    }
    include() { 
        this.included = true;
        for (const key of this.keys) {
            const value = (<GenericNode>this)[key]
            if (value == null)  continue
            if (Array.isArray(value)) {
                for (const child of value) {
                    if (child)  child.include()
                }
            } else {
                value.include()
            }    
            
        }
    }
    
    shouldBeIncluded(): boolean {
        console.log("shouldb included", this.included, this.type);
        return this.included;
    }

    bind() {
       		for (const key of this.keys) {
			const value = (<GenericNode>this)[key];
			if (value === null) continue;


			if (Array.isArray(value)) {
				for (const child of value) {
					if (child !== null) child.bind();
				}
			} else {
				value.bind();

			}
		}

    }

    render(code: MagicString, options: any) {
        for (const key of this.keys) {
            const value = (<GenericNode>this)[key];
            if (value === null) {
                continue;
            }
            if (Array.isArray(value)) {
                for (const child of value) {
                  if (child)  child.render(code,options)
                }
            } else {
                value.render(code, options)
            }
        }
    }

    toString() {
		return this.context.code.slice(this.span.start, this.span.end);
	}

}

export { NodeBase as StatementBase };
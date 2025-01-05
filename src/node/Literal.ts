import MagicString from "magic-string";
import { NodeBase } from "./shared/Node";
import { NODETYPE } from "./shared/NodeType";

type LiteralValueType = string | number | boolean | null;

export default class Literal<T = LiteralValueType> extends NodeBase {
    type: NODETYPE.LITERAL;
    value: T;

    render(code: MagicString, options: any): void {
        
    }
}
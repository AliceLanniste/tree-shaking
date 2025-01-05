import Identifier from "./Identifier";
import { NodeBase } from "./shared/Node";
import { NODETYPE } from "./shared/NodeType";

export default class VariableDeclarator extends NodeBase {
    type: NODETYPE.VARIABLE_DECLARATOR;
    id: Identifier;
    
    include(): void {
        this.included = true
    }
    declareDeclarator(kind: string) {
        this.id.declare(kind)
    }
}
import Identifier from "./Identifier";
import { NodeBase, NODETYPE } from "./shared";

export default class VariableDeclarator extends NodeBase {
    type: NODETYPE.VARIABLE_DECLARATOR;
    id: Identifier;

    include() {
        this.included = true
    }
}
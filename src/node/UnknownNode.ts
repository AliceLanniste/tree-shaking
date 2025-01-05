import { NodeBase } from "./shared/Node";
import { NODETYPE } from "./shared/NodeType";

export default class UnknownNode extends NodeBase {
    type: NODETYPE.UNKNOWN_NODE;
}
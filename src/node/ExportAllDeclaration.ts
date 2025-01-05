import Literal from "./Literal";
import { NodeBase } from "./shared/Node";
import { NODETYPE } from "./shared/NodeType";

export  class ExportAllDeclaration extends NodeBase {
    type: NODETYPE.EXPORT_ALL;
    source: Literal<string>;
}
import Literal from "./Literal";
import { NodeBase } from "./Node";
import { NODETYPE } from "./NodeType";

export  class ExportAllDeclaration extends NodeBase {
    type: NODETYPE.EXPORT_ALL;
    source: Literal<string>;
}
import Identifier from "./Identifier";
import { NodeBase } from "./shared/Node";
import { NODETYPE } from "./shared/NodeType";

export default class ExportSpecifier extends NodeBase {
    type: NODETYPE.EXPORT_SPECIFIER;
    local: Identifier;
    exported: Identifier;
    
    
}
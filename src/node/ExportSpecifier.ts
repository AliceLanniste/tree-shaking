import Identifier from "./Identifier";
import { NodeBase } from "./Node";
import { NODETYPE } from "./NodeType";

export default class ExportSpecifier extends NodeBase {
    type: NODETYPE.EXPORT_SPECIFIER;
    local: Identifier;
    exported: Identifier;
    
}
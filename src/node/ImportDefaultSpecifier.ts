import Identifier from "./Identifier";
import { NodeBase } from "./shared/Node";
import { NODETYPE } from "./shared/NodeType";

export default class ImportDefaultSpecifier extends NodeBase {
    type: NODETYPE.IMPORT_DEFAULT_SPECIFIER;
    local: Identifier;
}
import Identifier from "./Identifier";
import { NodeBase } from "./shared/Node";
import { NODETYPE } from "./shared/NodeType";

export default class ImportSpecifier extends NodeBase {
    type: NODETYPE.IMPORT_SPECIFIER;
    local: Identifier;
    imported: Identifier;
}
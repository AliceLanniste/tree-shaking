import MagicString from "magic-string";
import Identifier from "./Identifier";
import { NodeBase } from "./shared/Node";
import { NODETYPE } from "./shared/NodeType";

export default class ImportNamespaceSpecifier extends NodeBase {
    type: NODETYPE.IMPORT_NAMESPACE_SPECIFIER;
    local: Identifier;

    render(code: MagicString, options: any): void {
    }
}
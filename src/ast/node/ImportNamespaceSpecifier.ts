import Identifier from "./Identifier";
import { NodeBase, NODETYPE } from "../shared";

export default class ImportNamespaceSpecifier extends NodeBase {
  type: NODETYPE.IMPORT_NAMESPACE_SPECIFIER;
  local: Identifier;
}
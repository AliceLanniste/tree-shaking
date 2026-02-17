import Identifier from "./Identifier";
import { NodeBase, NODETYPE } from "./shared";

export default class ImportDefaultSpecifier extends NodeBase {
  type: NODETYPE.IMPORT_DEFAULT_SPECIFIER;
  local: Identifier;
}
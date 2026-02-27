import Identifier from "./Identifier";
import { NodeBase, NODETYPE } from "../shared";

export default class ExportSpecifier extends NodeBase {
  type: NODETYPE.EXPORT_SPECIFIER;
  local:Identifier;
  exported: Identifier;

}
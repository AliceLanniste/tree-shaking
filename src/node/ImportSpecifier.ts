import { NodeBase, NODETYPE } from "./shared";

export default class ImportSpecifier extends NodeBase { 
  type: NODETYPE.IMPORT_SPECIFIER;
}
import ExportSpecifier from "./ExportSpecifier";
import FunctionDeclaration from "./FunctionDeclaration";
import { NodeBase, NODETYPE } from "./shared";
import VariableDeclaration from "./VariableDeclaration";

export default class ExportNamedDeclaration extends NodeBase { 
    type: NODETYPE.EXPORT_NAMED_DECLARATION;
    declaration: FunctionDeclaration | VariableDeclaration | null;
    specifiers: ExportSpecifier[];
}
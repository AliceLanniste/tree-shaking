import FunctionDeclaration from "./FunctionDeclaration";
import { NodeBase, NODETYPE, Node, ExpressionNode } from "../shared";
import ClassDeclaration from "./ClassDeclaration";
import { ExportDefaultVariable } from "../variables/ExportDefaultVariable";


export function isExportDefaultDeclaration(node: Node): node is ExportDefaultDeclaration {
	return node.type === NODETYPE.EXPORT_DEFAULT_DECLARATION;
}
export default class ExportDefaultDeclaration extends NodeBase { 
    type: NODETYPE.EXPORT_DEFAULT_DECLARATION;
    declaration: FunctionDeclaration | ClassDeclaration | ExpressionNode;

    variable: ExportDefaultVariable;
}
import { NodeBase, NODETYPE, Node } from "./shared";


export function isExportDefaultDeclaration(node: Node): node is ExportDefaultDeclaration {
	return node.type === NODETYPE.EXPORT_DEFAULT_DECLARATION;
}
export default class ExportDefaultDeclaration extends NodeBase { 
    type: NODETYPE.EXPORT_DEFAULT_DECLARATION;
}
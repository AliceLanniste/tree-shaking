import MagicString from "magic-string";
import FunctionDeclaration from "./FunctionDeclaration";
import { ExpressionNode, Node, NodeBase } from "./Node";
import { NODETYPE } from "./NodeType";

export function  isExportDefaultDeclaration(node:Node): node is ExportDefaultDeclaration {
    return node.type === NODETYPE.ExPORT_DEFAULT;
}
export  class ExportDefaultDeclaration extends NodeBase {
    type: NODETYPE.ExPORT_DEFAULT;
    declaration: FunctionDeclaration | ExpressionNode;



    include(): void {
        
    }

    initialise(): void {
        
    }

    render(code: MagicString, options: any): void {
        
    }
}
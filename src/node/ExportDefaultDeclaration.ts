import MagicString from "magic-string";
import FunctionDeclaration from "./FunctionDeclaration";
import { ExpressionNode, Node, NodeBase } from "./shared/Node";
import { NODETYPE } from "./shared/NodeType";
import ExportDefaultVariable from "../variables/ExportDefaultVariable";
import Identifier from "./Identifier";
import { findCodeOutsideComment } from "../utils/utils";
import { isFunctionDeclaration, isIdentifier } from "./utils";

export function  isExportDefaultDeclaration(node:Node): node is ExportDefaultDeclaration {
    return node.type === NODETYPE.ExPORT_DEFAULT;
}
export  class ExportDefaultDeclaration extends NodeBase {
    type: NODETYPE.ExPORT_DEFAULT;
    declaration: FunctionDeclaration | ExpressionNode;
    variable: ExportDefaultVariable;

    private declarationName: string;


    include(): void {
        
    }

    bind(): void {
        super.bind();
		if (
			this.declarationName &&
			// Do not set it for Class and FunctionExpressions otherwise they get treeshaken away
			(isFunctionDeclaration(this.declaration) ||
			isIdentifier(this.declaration))
        ) {

			this.variable.setOriginalVariable(this.scope.findVariable(this.declarationName));
        }

    }

    initialise(): void {
        this.included = true
        this.declarationName =
			((<FunctionDeclaration >this.declaration).id &&
				(<FunctionDeclaration>this.declaration).id.name) ||
			(<Identifier>this.declaration).name;
        this.variable = this.scope.addExportDefaultDeclaration(this.declarationName || this.context.getModuleName(),
            this)
        
        this.context.addExport(this)
    }

    render(code: MagicString, options: any): void {
        const declarationPos = getDeclarationPos(code.original);
        if (isFunctionDeclaration(this.declaration)) {
            this.renderNamedDeclaration(code,declarationPos)
        } else if (this.variable.refernceOrignal()) {
            code.remove(this.span.start,this.span.end);
        }
        else if (this.variable.included) {
            this.renderVariableDeclaration(code, declarationPos);
            
        }
        
        super.render(code, options);
        
    }

    renderNamedDeclaration(code: MagicString,declarationStart: number) {
        code.remove(this.span.start, declarationStart);
    }

    renderVariableDeclaration(code: MagicString, start:number) {
        code.overwrite(
            this.span.start,
            start,
            `var ${this.variable.getName()} = `
        )
    }
}

const WHITESPACE = /\s/;

function getDeclarationPos(code: string, start = 0) {
    start = findCodeOutsideComment(code, 'default', start) + 7;
    while (WHITESPACE.test(code[start])) start++
    return start;
}


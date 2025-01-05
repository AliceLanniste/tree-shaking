import MagicString from "magic-string";
import ExportSpecifier from "./ExportSpecifier";
import FunctionDeclaration from "./FunctionDeclaration";
import Literal from "./Literal";
import { NodeBase, Node } from "./shared/Node";
import { NODETYPE } from "./shared/NodeType";
import VariableDeclaration from "./VariableDeclaration";

export  class ExportNamedDeclaration extends NodeBase {
    type: NODETYPE.EXPORT_NAME;
    declaration: FunctionDeclaration | VariableDeclaration | null;
    specifiers: ExportSpecifier[];
    source: Literal<string> | null;

    include(): void {
        this.included = true;
        
    }

    initialise(): void {
        this.included = true;
		this.context.addExport(this);

    }

    bind() {
        if (this.declaration !== null) {
            this.declaration.bind()
        } 
    }

    render(code: MagicString, options: any): void {
        if (!this.declaration) {
            code.remove(this.span.start,this.span.end)
            
        } else {
            code.remove(this.span.start, this.declaration.span.start);
            (<Node>this.declaration).render(code, options);

        }
    }
}
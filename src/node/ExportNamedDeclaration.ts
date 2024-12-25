import MagicString from "magic-string";
import ExportSpecifier from "./ExportSpecifier";
import FunctionDeclaration from "./FunctionDeclaration";
import Literal from "./Literal";
import { NodeBase } from "./Node";
import { NODETYPE } from "./NodeType";
import VariableDeclaration from "./VariableDeclaration";

export  class ExportNamedDeclaration extends NodeBase {
    type: NODETYPE.EXPORT_NAME;
    declaration: FunctionDeclaration | VariableDeclaration | null;
    specifiers: ExportSpecifier[];
    source: Literal<string> | null;

    include(): void {
        
    }

    initialise(): void {
        
    }

    render(code: MagicString, options: any): void {
        
    }
}
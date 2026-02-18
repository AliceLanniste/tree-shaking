import MagicString from "magic-string";
import { NodeBase } from "../shared";
import ImportDeclaration from "../ImportDeclaration";
import ExportAllDeclaration from "../ExportAllDeclaration";
import ExportNamedDeclaration from "../ExportNamedDeclaration";
import ExportDefaultDeclaration from "../ExportDefaultDeclaration";

export interface ASTContext {
    code: string;
    magicString: MagicString;
    filename: string;
    nodeConstructor: { [name: string]: typeof NodeBase};
    imports:Record<string, any>;
    exports:Record<string, any>;
    addImport(node: ImportDeclaration):void;
    addExport(node: ExportAllDeclaration | ExportNamedDeclaration | ExportDefaultDeclaration):void;
}
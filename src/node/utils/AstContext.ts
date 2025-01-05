import MagicString from "magic-string";
import Variable from "../../variables/Variable";
import { NodeBase } from "../shared/Node";
import { ExportAllDeclaration } from "../ExportAllDeclaration";
import { ExportNamedDeclaration } from "../ExportNamedDeclaration";
import { ExportDefaultDeclaration } from "../ExportDefaultDeclaration";
import ImportDeclaration from "../ImportDeclaration";

export interface ASTContext {
    	addExport: (
		node: ExportAllDeclaration | ExportNamedDeclaration | ExportDefaultDeclaration
	) => void;
	addImport: (node: ImportDeclaration) => void;

    code: string;
    magicString: MagicString;
    filename: string;
    traceVariable: (name: string) => Variable;
    nodeConstructor: { [name: string]: typeof NodeBase };
    imports: Record<string,any>;
    exports: Record<string, any>;
    getExports: () => string[];
    getModuleName: () => string;

}
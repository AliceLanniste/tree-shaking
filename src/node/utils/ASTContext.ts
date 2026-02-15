import MagicString from "magic-string";
import { NodeBase } from "../shared";

export interface ASTContext {
    code: string;
    magicString: MagicString;
    filename: string;
    nodeConstructor: { [name: string]: typeof NodeBase};
    imports:Record<string, any>;
    exports:Record<string, any>;
}
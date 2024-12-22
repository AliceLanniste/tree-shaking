import MagicString from "magic-string";

export interface ASTContext {
    code: string;
    magicString: MagicString;
    filename: string;
    
}
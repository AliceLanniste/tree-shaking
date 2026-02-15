import Variable from "./Variable";

export default class LocalVariable extends Variable { 
    declarators: Set<Identifier | ExportDefaultDeclaration>;
}
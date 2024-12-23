import Identifier from "../node/Identifier";
import Variable from "./Variable";

export default class LocalVariable extends Variable {
    declarators: Set<Identifier>;
    constructor(name:string,idenatifier:Identifier) {
        super(name);
        this.declarators = new Set([idenatifier]);
    }

    addDeclaration(declarator: Identifier) {
        this.declarators.add(declarator)
    }
}
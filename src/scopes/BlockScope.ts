import Identifier from "../node/Identifier";
import LocalVariable from "../variables/LocalVariable";
import Variable from "../variables/Variable";
import Scope from "./Scope";

export default class BlockScope extends Scope {
    parent: Scope;


    addDeclaration(identifier: Identifier): Variable {
       return super.addDeclaration(identifier) as LocalVariable;
    }
}
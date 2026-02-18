import { ASTContext } from "../node/utils";
import Variable from "../variables/Variable";
import Scope from "./Scope";

export default class ModuleScope extends Scope {
    context: ASTContext;

    constructor(parentScope:Scope, context:ASTContext) {
        super({
            parent:parentScope,
            isModuleScope: true
        })
        this.context = context
    }

    findVariable(name: string): Variable {
        if(this.variables[name]) {
            return this.variables[name];
        }

        this.parent.findVariable(name);
    }
}
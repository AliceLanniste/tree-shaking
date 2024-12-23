import Variable from "../variables/Variable";
import Scope from "./Scope";

export default class ModuleScope extends Scope {

    constructor(parentScope: Scope) {
        super({
            parent: parentScope,
            isModuleScope:true
        })
    }

    findVariable(name: string): Variable {
            
        return this.variables[name] || this.parent.findVariable(name)
    }
}
import GlobalVariable from "../variables/GlobalVariable";
import Variable from "../variables/Variable";
import Scope from "./Scope";

export default class GlobalScope extends Scope {

    findVariable(name: string): Variable {
        if (!this.variables[name]) {
            this.variables[name] = new GlobalVariable(name);
        }
        return this.variables[name] as GlobalVariable;
        
    }
}
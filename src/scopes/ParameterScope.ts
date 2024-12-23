import Identifier from "../node/Identifier";
import ParameterVariable from "../variables/ParameterVariable";
import Scope from "./Scope";

export default class ParameterScope extends Scope {
    parent: Scope;
    parmeters: ParameterVariable[];

    constructor(options ={}) {
        super(options);
        this.parmeters= []
    }

    getAddParameter(identifier: Identifier):ParameterVariable {
        const variable = new ParameterVariable(identifier)
        this.variables[identifier.name] = variable;
        this.parmeters.push(variable)
        return variable;
    }

    getParameters(): ParameterVariable[] {
        return this.parmeters;
    }
}
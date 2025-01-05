import ArgumentVariable from "../variables/ArgumentVariable";
import ExportDefaultVariable from "../variables/ExportDefaultVariable";
import GlobalVariable from "../variables/GlobalVariable";
import LocalVariable from "../variables/LocalVariable";
import ParameterScope from "./ParameterScope";

export default class FunctionScope extends ParameterScope {
    variables: {
		default: ExportDefaultVariable;
		arguments: ArgumentVariable;
        [name: string]: LocalVariable | GlobalVariable;
        
    };

    constructor(options = {}) {
        super(options);
        this.variables.arguments = new ArgumentVariable(super.getParameters())
    }   
}
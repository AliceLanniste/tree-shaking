import LocalVariable from "./LocalVariable";
import ParameterVariable from "./ParameterVariable";

export default class ArgumentVariable extends LocalVariable {
    parameters: ParameterVariable[];
    constructor(variables: ParameterVariable[]) {
        super('Arguments', null);
        this.parameters = variables
    }
}
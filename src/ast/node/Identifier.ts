import Variable from "../variables/Variable";
import { NodeBase, NODETYPE } from "../shared";

export default class Identifier extends NodeBase { 
    type: NODETYPE.IDENTIFIER;
    name: string;
    variable: Variable;

    initialise(): void {
        this.included = false
    }

    include(): void {
        this.included = true
    }
}
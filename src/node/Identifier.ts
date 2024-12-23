import MagicString from "magic-string";
import { NodeBase } from "./Node";
import Variable from "../variables/Variable";

export default class Identifier extends NodeBase {
    name: string;
    variable: Variable;
    
    declare(kind: string) {
        switch (kind) {
            case 'var':
            case 'function':
                this.variable = this.scope.addDeclaration(this)
                
                break;
        
            default:
                break;
        }
    }

    initialise() {
        this.included = true
    }

    include() {
        this.included = true
    }

    render(code: MagicString, options: any): void {
        
    }

}
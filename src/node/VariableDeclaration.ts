import MagicString from "magic-string";
import { NodeBase } from "./shared/Node";
import VariableDeclarator from "./VariableDeclarator";
import { NODETYPE } from "./shared/NodeType";

export default class VariableDeclaration extends NodeBase {
    type: NODETYPE.VARIABLE_DECLARATION;
    declarations: VariableDeclarator[]
    kind: 'var' | 'let' | 'const';

    initialise() {
		this.included = false;
		for (const declarator of this.declarations) {
			declarator.declareDeclarator(this.kind);
		}
	}


    include(): void {
        this.included = true
        for (const declarator of this.declarations) {
            if (declarator.shouldBeIncluded()) {
                declarator.include()
            }
        }
    }

    render(code: MagicString, options: any): void {
        if (this.declarations) {
            for (const declarator of this.declarations) {
				declarator.render(code, options);
			}
            
        }
    }
}
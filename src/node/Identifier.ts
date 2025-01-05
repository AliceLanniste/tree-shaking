import MagicString from "magic-string";
import { NodeBase } from "./shared/Node";
import Variable from "../variables/Variable";
import FunctionScope from "../scopes/FunctionScope";
import { NODETYPE } from "./shared/NodeType";
import isReference from 'is-reference';

export default class Identifier extends NodeBase {
    type: NODETYPE.IDENTIFIER;
    name: string;
    variable: Variable;
    
    private bound: boolean;
    declare(kind: string) {
        switch (kind) {
            case 'const':
            case 'var':
            case 'function':
                //! 无论是var还是function，scope都是ModuleScope
                this.variable = this.scope.addDeclaration(this)
                break;
            case 'parameter':
                this.variable = (<FunctionScope>this.scope).getAddParameter(this)
            default:
                throw new Error(`Unexpected identifier kind ${kind}.`);
        }
    }

    initialise() {
        this.included = false
    }

    include() {
        this.included = true
        this.variable.include()
        
    }

    bind() {
        if (this.bound) {
            return
        }
        this.bound = true
        if (this.variable == null && isReference(this, this.parent)) {
            this.variable = this.scope.findVariable(this.name);
			this.variable.addReference(this);
		}
	}
/**
* -three 通过 import {three as _three} from './foo'
* 连接到three，现在问题是连接到的three是GlobalVariable，而不是LocALVariable,
* export var two = _three - _one;
* 转换成
* var three = 2
* var onee = 1
* 在解析上面的时候，首先是Module(ModuleScope)->Program-> exportNamedDeclaration->
* variableDeclaration
* var two = three - one;
* 在module.traceExport中，因为one没有自己的scope，导致 this.loader.scope.findVariable()(GlobalScope)
* 问题出在解析export var three = 2的时候，没有解析为three
*/
    

    render(code: MagicString, options: any): void {
        // !_two没有this.variable
        //! _two()来自 { return _two()} 也就是callExpression，returnStatement,BlockStatement, FunctionDeclartion
        //! 接第一条，this.variable = undefinde,是因为callExporesion，this.callee没有_two

        if (this.variable) {
            const name = this.variable.getName()

            if (name !== this.name) {

                code.overwrite(this.span.start, this.span.end, name, {
					storeName: true,
					contentOnly: true
				});

            }
        }
    }

}
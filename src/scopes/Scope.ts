import { ExportDefaultDeclaration } from "../node/ExportDefaultDeclaration";
import Identifier from "../node/Identifier";
import { ExpressionNode } from "../node/shared/Node";
import ArgumentVariable from "../variables/ArgumentVariable";
import ExportDefaultVariable from "../variables/ExportDefaultVariable";
import GlobalVariable from "../variables/GlobalVariable";
import LocalVariable from "../variables/LocalVariable";
import Variable from "../variables/Variable";

export default class Scope {
    parent: Scope | undefined;
    variables: {
        [name: string]: LocalVariable | GlobalVariable;
        default: ExportDefaultVariable;
        arguments: ArgumentVariable;
        
    };
    isModuleScope: boolean;
    children: Scope[];

    constructor(options: {parent?: Scope, isModuleScope?: boolean} = {}) {
        this.parent = options.parent
        this.isModuleScope = options.isModuleScope
        this.children = []
        this.variables = Object.create(null)
        if (this.parent) {
            this.parent.children.push(this)
        }
    }

    addDeclaration(identifier: Identifier):Variable {
        const name = identifier.name;
        if (this.variables[name]) {
            const variable = <LocalVariable>this.variables[name];
            variable.addDeclaration(identifier)
        } else {
            this.variables[name] = new LocalVariable(name,identifier);
        }
        return this.variables[name];
    }
    addExportDefaultDeclaration(name: string,
		exportDefaultDeclaration: ExportDefaultDeclaration
        ):ExportDefaultVariable {
        this.variables.default = new ExportDefaultVariable(name, exportDefaultDeclaration);
        return this.variables.default;
    }

    addReturnExpression(expression: ExpressionNode) {
		this.parent && this.parent.addReturnExpression(expression);
	}


    contians(name: string):boolean {
        return name in this.variables || (this.parent ? this.parent.contians(name) : false);
    }

    findVariable(name: string): Variable {
        return this.variables[name] || this.parent.findVariable(name);
    }
}
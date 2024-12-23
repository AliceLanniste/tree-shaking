import Identifier from "../node/Identifier";
import GlobalVariable from "../variables/GlobalVariable";
import LocalVariable from "../variables/LocalVariable";
import Variable from "../variables/Variable";

export default class Scope {
    parent: Scope | undefined;
    variables: {
        [name: string]: LocalVariable | GlobalVariable;
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

    addDeclaration(identifier: Identifier) {
        const name = identifier.name;
        if (this.variables[name]) {
            const variable = <LocalVariable>this.variables[name];
            variable.addDeclaration(identifier)
        } else {
            this.variables[name] = new LocalVariable(name,identifier);
        }
        return this.variables[name];
    }

    contians(name: string):boolean {
        return name in this.variables || (this.parent ? this.parent.contians(name) : false);
    }

    findVariable(name: string): Variable {
        return this.variables[name] || this.parent.findVariable(name);
    }
}
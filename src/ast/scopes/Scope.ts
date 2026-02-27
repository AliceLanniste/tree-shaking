import GlobalVariable from "../variables/GlobalVariable";
import LocalVariable from "../variables/LocalVariable";
import Variable from "../variables/Variable";

export default class Scope {
   parent: Scope | undefined;
   variables: {
    [name: string] : LocalVariable | GlobalVariable;
    
   };
   isModuleScope: boolean;
   children: Scope[];


   constructor(options: { parent?: Scope, isModuleScope?:boolean} = {}) {
        this.parent = options.parent;
        this.isModuleScope = options.isModuleScope;
        this.children = [];
        if (this.parent) {
            this.parent.children.push(this)
        }
        this.variables = Object.create(null);
   }

   contains( name: string): boolean {
    return  name in this.variables || (this.parent ? this.parent.contains(name): false);
   }
   findVariable(name: string): Variable {
        return this.variables[name] || this.parent.findVariable(name);
   }
}
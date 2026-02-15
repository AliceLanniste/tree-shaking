import LocalVariable from "../variables/LocalVariable";

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

   addExportDefaultDeclaration(name: string,
    exportDefaultDeclaration: ExportDefaultDeclaration
   ): ExportDefaultVariable {
    this.variables.default = new ExportDefaultVariable(name, exportDefaultDeclaration);
    return this.variables.default;
   }


   addReturnExpression(expression: ExpressionNode) {
    this.parent && this.parent.addReturnExpression(expression);
   }

   addDeclaration(identifier: Identifier): Variable {
     const name = identifier.name;
     if (this.variables[name]) {
        const variable = <LocalVariable>this.variables[name];
        variable.addDeclaration(identifier)
     } else {
        this.variables[name] = new LocalVariable(name,identifier);

     }

     return this.variables[name];
   }

   contains( name: string): boolean {
    return  name in this.variables || (this.parent ? this.parent.contains(name): false);
   }
   findVariable(name: string): Variable {
        return this.variables[name] || this.parent.findVariable(name);
   }
}
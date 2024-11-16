import { Identifier, VariableDeclaration, VariableDeclarator,Node } from 'acorn';
type scopeOptionType = {
    parent:Scope |null,
    params?:Identifier[],
    isBlockScope?:boolean,
}

const isBlockType = {
    'let': true,
     'const': true
}

export default class Scope {
    parent: Scope | null;
    isBlockScope:boolean ;
    options:scopeOptionType;
    varDeclarations: string[] = [];
    declarations: Record<string, Node> = {};
    depth: number;

    constructor(options:scopeOptionType = {parent:null}) {
        this.options =options;
        this.parent = this.options.parent;
        this.isBlockScope = this.options.isBlockScope || false;
        this.depth = this.parent ? this.parent.depth + 1 : 0
        
        if (options.params) {
            options.params.forEach(param => this.declarations[param.name] = param)
        }
     
    }

    addDeclaration(name:string,declaration:any, isVar:boolean) {
        const isBlockScope = declaration.type === 'VariableDeclaration' && isBlockType[name]
        if (isBlockScope) {
          this.parent &&  this.parent.addDeclaration( name, declaration, isVar );
        } else {
            if (isVar) {
                this.declarations[ name ] = declaration;
                this.varDeclarations.push(name);
            } else {
                this.declarations[ name ] = declaration;
            }
        }
    }

    contains(name:string):boolean {
        return !!this.getDeclaration(name)
    }

    findDefineScope(name: string): Scope | null {
        if (this.declarations[name]) return this;
        if (this.parent) {
            return this.parent.findDefineScope(name)
        }
        return null;
    }

    getDeclaration(name: string): Node | null {
        if (this.declarations[name]) return this.declarations[name]
        if (this.parent) {
            return this.parent.declarations[name]
        }
        return null
    }
}

export const NULLScope = new Scope();
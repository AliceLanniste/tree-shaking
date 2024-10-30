import { VariableDeclaration, VariableDeclarator } from 'acorn';
type scopeOptionType = {
    parent:Scope |null,
    params?:string[],
    isBlockScope?:boolean,
}

const isBlockType = {
    'let': true,
     'const': true
}

export default class Scope {
    params: string[];
    parent: Scope | null;
    isBlockScope:boolean ;
    options:scopeOptionType;
    varDeclarations: string[] = [];
    declarations: Record<string, string[]>;

    constructor(options:scopeOptionType = {parent:null}) {
        this.options =options;
        this.parent = this.options.parent;
        this.params = this.options.params || [];
        this.isBlockScope = this.options.isBlockScope || false;
        //TODO:
        // if (options.params) {
            
        // }
    
    }

    addDeclaration(name:string,declaration:VariableDeclaration, isVar) {
        const isBlockScope = declaration.type === 'VariableDeclaration' && isBlockType[name]
        if (isBlockScope) {
            //TODO
        } else {
              if ( isVar ) this.varDeclarations.push( name )
        }
    }

    add(name:string, isBlockDeclaration:boolean) {
        if(this.isBlockScope && !isBlockDeclaration && this.parent) {
            this.parent.add(name,isBlockDeclaration);
        } else {
            this.params.push(name);
        }
    }

    contains(name:string):boolean {
        if(this.params.includes(name)) return true;

        if (this.parent) return this.parent.contains(name);

        return false;
    }
}
type scopeOptionType = {
    parent:Scope |null,
    names?:string[],
    isBlockScope?: boolean,
    
}

export default class Scope {
    names: string[];
    parent: Scope | null;
    isBlockScope:boolean ;
    options: scopeOptionType;
    depth: number;

    constructor(options:scopeOptionType = {parent:null}) {
        this.options =options;
        this.parent = this.options.parent;
        this.depth = this.parent ?  this.depth + 1 : 0;
        this.names = this.options.names || [];
        this.isBlockScope = this.options.isBlockScope || false;
    }

    add(name:string, isBlockDeclaration:boolean) {
        if(this.isBlockScope && !isBlockDeclaration && this.parent) {
            this.parent.add(name,isBlockDeclaration);
        } else {
            this.names.push(name);
        }
    }

    contains(name:string):boolean {
        if(this.names.includes(name)) return true;

        if (this.parent) return this.parent.contains(name);

        return false;
    }

    findDefiningScope(name: string): Scope | null {
        if (this.names.includes(name)) return this

        if(this.parent) return this.parent.findDefiningScope(name)
        
        return null
    }
}
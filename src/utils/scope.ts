type scopeOptionType = {
    parent?:Scope,
    params?:string[],
    isBlockScope?:boolean,
}

export default class Scope {
    params: string[];
    parent: Scope | undefined;
    isBlockScope:boolean ;
    options:scopeOptionType;

    constructor(options:scopeOptionType ={}) {
        this.options =options || {};
        this.parent = this.options.parent;
        this.params = this.options.params || [];
        this.isBlockScope = this.options.isBlockScope || false;
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
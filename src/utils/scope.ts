export default class Scope {
    name: string[];
    parent: Scope;
    isBlockScope:boolean =false;

    constructor() {

    }

    add(name:string, isBlockDeclaration:boolean) {
        if(this.isBlockScope && !isBlockDeclaration) {
            this.parent.add(name,isBlockDeclaration);
        } else {
            this.name.push(name);
        }
    }

    contains(name:string):boolean {
        if(this.name.includes(name)) return true;

        if (this.parent) return this.parent.contains(name);

        return false;
    }
}
export default class Variable { 
    name: string;
    exportName: string | null = null;

    isExternal?: boolean;
    isDefault?: boolean;
    isId?: boolean;
    included: boolean = false;
    isReassigned: boolean = false;

    constructor(name: string) {
        this.name = name;
    }

    addReference() { 
    }

    setReassigned(isReassigned: boolean) { 
        this.isReassigned = isReassigned;
    }

    getName() {
        return this.name;
    }

    include() {
        this.included = true    
    }
}
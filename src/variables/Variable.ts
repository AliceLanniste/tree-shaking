import Identifier from "../node/Identifier";

export default class Variable {
    name: string;
    safeName: string | null;
    exportName: string | null = null; 
   
    isExternal?: boolean;
    isDefault?: boolean;
    isId: boolean = false;
    included: boolean = false;
    isReassigned: boolean = false;


    constructor(name: string, safeName?: string) {
        this.name = name
        this.safeName = safeName || null;
    }

    addReference(_identifier: Identifier) {}

    setReassigned(isReassigned: boolean) {
        this.isReassigned = isReassigned;
    }
    getName() {
        return this.safeName || this.name
    }

    setSafeName(safeName: string) {
        this.safeName = safeName
    }
    include() {
        this.included = true
    }
}
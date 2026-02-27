import Identifier from "../node/Identifier";
import { Entity } from "../shared/Entity";

export default class Variable  implements Entity{ 
    name: string;
    exportName: string | null = null;

    isExternal?: boolean;
    isDefault?: boolean;
    isId?: boolean;
    included: boolean = false;
    reexported: boolean = false;
    isReassigned: boolean = false;

    constructor(name: string) {
        this.name = name;
    }

    addReference(_identifier: Identifier) { 
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

    toString() {    
        return this.name;
    }
}
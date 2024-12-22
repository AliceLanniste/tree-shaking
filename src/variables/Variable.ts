export default class Variable {
    name: string;
    safeName: string | null;

    isExternal: boolean;
    isDefault: string;
    isReexport: boolean;

    included: boolean = false
    constructor(name: string, safeName?: string) {
        this.name = name
        this.safeName = safeName || null;
    }

    getName() {
        return this.safeName || this.name
    }

    setSafeName(safeName: string) {
        this.safeName = safeName
    }
}
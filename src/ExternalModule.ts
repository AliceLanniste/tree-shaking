
export default class ExternalModule {
    public id: string;
    public name:string = ''
    public isExternal: boolean = true

    public canonicalNames: Record<string, string> = {}
    public defaultExportName: string | null = null
    public needsDefault: boolean = false
    public exportNames: string[] = []
    public isNamespace: boolean
    constructor(id:string) {
        this.id = id
     }

    getCanonicalName(name: string) : string {
     if (name === 'default') {
        return `${this.name}__default`
     } else {
          return `${this.name}.${name}` 
    } 
        
    }
    rename(name: string, replacement: string) {
        this.canonicalNames[name] = replacement
    }

    suggestDefaultName(name: string) {
        if (!this.defaultExportName) {
            this.defaultExportName = name
        }
    }

    add_export_name(names: string[]) {
        this.exportNames = names
    }

    setIsNamespace(isNamespace: boolean) {
        this.isNamespace = isNamespace
    }

}
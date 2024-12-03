
export default class ExternalModule {
    public id: string;
    public isExternal: boolean = true

    public canonicalNames: Record<string, string> = {}
    public defaultExportName: string | null = null
    constructor(id:string) {
        this.id = id
     }

    getCanonicalName(name: string) : string {
     if (name === 'default') {
        return `${this.id}__default`
     } else {
          return `${this.id}.${name}` 
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
}
import ExternalVariable from "./variables/ExternalVariable";

export default class ExternalModule {
    public id: string;
    public name:string = ''
    public isExternal: boolean = true
    public needIntrop:boolean = false
    public canonicalNames: Record<string, string> = {}
    public defaultExportName: string | null = null
    public namespaceImport: string[] = []
    public defaultImports: boolean = false
    public exportNames: string[] = []
    public exportedNamed:boolean = false
    public exportedNamespace: boolean = false
    public needsNamed: boolean = false
	declarations: { [name: string]: ExternalVariable };

    constructor(id:string) {
        this.id = id
        this.declarations = Object.create(null)
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

    setDefault(isDefault: boolean) {
        this.defaultImports = isDefault
    }


    addNamespaceName(name: string) {
        this.namespaceImport.push(name)
    }
    
    setNeedsName(needsName: boolean) {
        this.needsNamed = needsName
    }

    traceExport(name: string) {
        if (name !== 'default' && name !== '*') this.exportedNamed =true;
		if (name === '*') this.exportedNamespace = true;
        return this.declarations[name] ||((this.declarations[name] = new ExternalVariable(this, name)))
    }
}
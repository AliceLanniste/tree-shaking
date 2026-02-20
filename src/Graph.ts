import { error } from "console";
import ExternalModule from "./ExternalModule";
import Module from "./Module";
import { GlobalScope } from "./scopes";
import { ERR_CODE } from "./error";
import { load, resolveId } from "./utils/util";

export default class Graph {
    moduleById = new Map<string, Module | ExternalModule>();
    modules: Module[] = [];
    externalModules: ExternalModule[] = [];
    scope:GlobalScope;
    
    constructor(options: any) {
        this.scope = new GlobalScope();
        if(!options.input)  error({code: ERR_CODE.NO_INPUT_OPTIONS, message:'You must supply options.input to rollup'})
    }
    build(entryModules: string | string[] | Record<string, string>) {
     // phase 1: load entry modules
    }

    private loadEntryModules(entryModules: string | string[] | Record<string, string>) {
        let entryModuleIds: string[];
        if(typeof entryModules === 'string')  entryModules = [entryModules];
        if(Array.isArray(entryModules))  {
            entryModuleIds = entryModules;
        } else{
            entryModuleIds = Object.keys(entryModules).map(key => entryModules[key]);
        }    
    
        Promise.all(entryModuleIds.map(entryPath => this.loadModule(entryPath))

    ).then()
    }

    private async loadModule(entryPath: string) {
        let resolveIdPromise =Promise.resolve( resolveId(entryPath, undefined));
        let id = await resolveIdPromise;
        if(id == null) {
            error({
            code: ERR_CODE.UNRESOLVE_MODULE,
            message:`Could not resolve module (${entryPath})`
            })
        }
        return this.fetchModule(entryPath,undefined);
    }

    private fetchModule(id: string,importer?:string):Promise<Module> {
        //detect circular module
        const existingModule = this.moduleById.get(id);

        if(existingModule){
            if(existingModule.isExternal) throw new Error(`Cannot fetch external module ${id}`);
            return Promise.resolve(<Module>existingModule);
        }

        const module = new Module(id,this);
        this.moduleById.set(id, module);
        //phase2: load module ->source ->transform->ModuleJson->
        let source = load(id);
        
          
    }

    private fetchAllDependencies() {}
}
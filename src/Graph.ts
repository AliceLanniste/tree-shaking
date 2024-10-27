import { Module } from "./Module";
import { ModuleLoader } from "./ModuleLoader";
import { Statement } from "./node/Statement";
import { type rainbowOptions } from "./types";
import { normalizeModules } from "./utils/utils";
export class Graph {
    readonly moduleLoader:ModuleLoader;
    readonly modulesById = new Map<string, Module>();
    names: Record<string, any> = {};
    constructor(
        private readonly options: rainbowOptions,
    ) {
        this.moduleLoader = new ModuleLoader(this,this.modulesById,options);        

    } 

    async createModuleGraph():Promise<Statement[]> {
       return await this.generateModuleGraph()
    }

    async generateModuleGraph():Promise<Statement[]> {
        let moduleLoader = await this.moduleLoader.addEntryModule(normalizeModules(this.options), true);
        return moduleLoader.bodyStatement;
    }
    
    storeNames(module:Module,name:string, localName:string) {
        if (!(module.id in this.names)) {
            this.names[module.id] = {}
        }
        const moudleNames = this.names[module.id] 
        

        moudleNames[name] = localName
    }

    getName(module:Module,name: string) {
        if (!(module.id in this.names)) {
            this.names[module.id] = {}
        }

        const moudleNames = this.names[module.id]
        if (!moudleNames) {
            throw new Error( `Could not get name for ${module.id}:${name}` );
        }
        
        return moudleNames[name];
    }    
}
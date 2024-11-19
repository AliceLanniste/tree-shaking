import  * as MagicString from "magic-string";
import { Module } from "./Module";
import { ModuleLoader } from "./ModuleLoader";
import { type rainbowOptions } from "./types";
import { normalizeModules } from "./utils/utils";
export class Graph {
    readonly moduleLoader:ModuleLoader;
    modulesById:Record<string, Module> = {};
    names: Record<string, any> = {};
    constructor(
        private readonly options: rainbowOptions,
    ) {
        this.moduleLoader = new ModuleLoader(this,options);        

    } 

     createModuleGraph(){ 
       return this.generateModuleGraph()
    }

    generateModuleGraph() {
        return this.moduleLoader.addEntryModule(normalizeModules(this.options), true);
        
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

    getReplacements(module: Module) {
         if (!(module.id in this.names)) {
            this.names[module.id] = {}
        }

        const moudleNames = this.names[module.id]
         if (!moudleNames) {
            throw new Error( `Could not get name for ${module.id}:${name}` );
         }
        
        return moudleNames
        
    }

   async render() {
       let moduleGraph = await this.createModuleGraph()
       let result = moduleGraph.render()
       return result
    }
}
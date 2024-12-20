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

   async render( format:string) {
       let moduleGraph = await this.createModuleGraph()
       let result = moduleGraph.render(format)
       return result
    }
}
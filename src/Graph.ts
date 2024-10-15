import { Module } from "./Module";
import { ModuleLoader } from "./ModuleLoader";
import { type rainbowOptions } from "./types";
import { normalizeModules } from "./utils/utils";
import { Node } from "acorn";
export class Graph {
    readonly moduleLoader:ModuleLoader;
    readonly modulesById = new Map<string, Module>();
    constructor(
        private readonly options: rainbowOptions,
    ) {
        this.moduleLoader = new ModuleLoader(this,this.modulesById,options);        

    } 

    async createModuleGraph():Promise<Node[]> {
       return await this.generateModuleGraph()
    }

    async generateModuleGraph():Promise<Node[]> {
       let moduleLoader = await this.moduleLoader.addEntryModule(normalizeModules(this.options), true);
        return moduleLoader.bodyStatement;
    }

}
import { Module } from "./Module";
import { ModuleLoader } from "./ModuleLoader";
import { type rainbowOptions } from "./types";
import { normalizeModules } from "./utils/utils";

export class Graph {
    readonly moduleLoader:ModuleLoader;
    readonly modulesById = new Map<string, Module>();
    constructor(
        private readonly options: rainbowOptions,
    ) {
        this.moduleLoader = new ModuleLoader(this,this.modulesById,options);        

    } 

    async createModuleGraph() {
       await this.generateModuleGraph()
    }

    async generateModuleGraph() {
        await this.moduleLoader.addEntryModule(normalizeModules(this.options), true);
        return this.moduleLoader.bodyStatement;
    }

}
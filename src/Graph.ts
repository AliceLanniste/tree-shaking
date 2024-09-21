import { Module } from "./Module";
import { ModuleLoader } from "./ModuleLoader";
import { type rainbowOptions } from "./types";
import { normalizeModules } from "./utils";

export class Graph {
    readonly moduleLoader:ModuleLoader;
    readonly modulesById = new Map<string, Module>();
    constructor(
        private readonly options: rainbowOptions,
    ) {
        this.moduleLoader = new ModuleLoader(this,this.modulesById,options);        

    } 

    createModuleGraph() {
        this.generateModuleGraph()
    }

    generateModuleGraph() {
        this.moduleLoader.addEntryModule(normalizeModules(this.options.input!), true);
    }
}
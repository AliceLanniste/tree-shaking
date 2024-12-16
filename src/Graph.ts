import  * as MagicString from "magic-string";
import { Module } from "./Module";
import { ModuleLoader } from "./ModuleLoader";
import { type rainbowOptions , type Plugin, SourceDescription, WarningHandler} from "./types";
import { normalizeModules, sequence ,load} from "./utils/utils";
export class Graph {
    readonly moduleLoader:ModuleLoader;
    modulesById:Record<string, Module> = {};
    names: Record<string, any> = {};
    plugins: Plugin[];
    onwarn: WarningHandler;
    load: (id: string) => Promise<SourceDescription | string | void>;
    constructor(
        private readonly options: rainbowOptions,
    ) {
        // this.plugins = options.plugins || [];
        this.initPlugin(options)
        this.moduleLoader = new ModuleLoader(this, options);
            
        

    } 

    initPlugin(options: rainbowOptions) {
        this.plugins = options.plugins || [];
        const loaders = this.plugins.map(plugin => plugin.load).filter(Boolean)
        this.load = sequence(loaders.concat(load))

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
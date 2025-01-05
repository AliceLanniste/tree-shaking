import  * as MagicString from "magic-string";
import { Module } from "./Module";
import { ModuleLoader } from "./ModuleLoader";
import { type rainbowOptions , type Plugin, SourceDescription, WarningHandler, ResolveResult, Warning} from "./types";
import { normalizeModules, sequence ,load, resolveId} from "./utils/utils";
export class Graph {
    readonly moduleLoader:ModuleLoader;
    modulesById:Record<string, Module> = {};
    names: Record<string, any> = {};
    plugins: Plugin[];
    onwarn: WarningHandler;
    load: (id: string) => Promise<SourceDescription | string>;
    resolveId: (id: string, importer: string | undefined) => Promise<string | boolean | void>;
    constructor(
        private readonly options: rainbowOptions,
    ) {
        this.initPlugin(options)
        this.initWarn(options)
        this.moduleLoader = new ModuleLoader(this, options);
    } 

    initPlugin(options: rainbowOptions) {
        this.plugins = options.plugins || [];
        const resolveIds = this.plugins.map(plugin => plugin.resolveId).filter(Boolean)
        this.resolveId = sequence(resolveIds.concat(resolveId))
        const loaders = this.plugins.map(plugin => plugin.load).filter(Boolean)
        this.load = sequence(loaders.concat(load))

    }
    initWarn(options: rainbowOptions) {
        if (options.onWarn) {
          this.onwarn =  options.onWarn;
        }
    }

     createModuleGraph(){ 
       return this.generateModuleGraph()
    }

    generateModuleGraph() {
        return this.moduleLoader.addEntryModule(normalizeModules(this.options), true);
        
    }

    warn (warning: Warning) {
		warning.toString = () => {
			let str = '';

			if (warning.plugin) str += `(${warning.plugin} plugin) `;
			if (warning.loc)
				str += `${warning.loc.file} (${warning.loc.line}:${
					warning.loc.column
					}) `;
			str += warning.message;

			return str;
		};

		this.onwarn(warning);
	}


   async render( format:string) {
       let moduleGraph = await this.createModuleGraph()
       let result = moduleGraph.render(format)
       return result
    }
}
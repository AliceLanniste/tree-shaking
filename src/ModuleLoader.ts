import { ResolveResult, type rainbowOptions } from "./types/options";
import { Module } from "./Module";
import { type UnresolvedModule } from "./types/modules";
import {relativeId, load, resolveId, transform } from "./utils/utils";
import { Graph } from "./Graph";
import { error } from "console";
import { ErrCode } from "./error";
export class ModuleLoader {
    
     constructor(
        private readonly graph: Graph,
        private readonly modulesById: Map<string, Module>,
        private readonly options: rainbowOptions,
     ) {

     }

    async addEntryModule(unresolveModules:UnresolvedModule[], isUserDefined: boolean) {
        const newEntryModules = await Promise.all(unresolveModules.map(({id, importer}) => 
                               this.loadModule(id,true,importer)))
        if (newEntryModules.length === 0) {
			throw new Error('You must supply options.input to rollup');
		}
    }

	private async loadModule(
		unresolvedId: string,
		isEntry: boolean,
		importer: string | undefined,
	): Promise<Module> {
      const resolveResult = await resolveId(unresolvedId,importer)
        if (resolveResult === null) {
             error()
        }

        return this.fetchModule(
                resolveResult,
                undefined,
                true
                )

    }
  
    private async fetchModule(id: ResolveResult,
		importer: string | undefined,
        isEntry: boolean =false
		):Promise<Module> {
        id = id as string;
         const existingModule = this.modulesById.get(id);
         if(existingModule) {
            return existingModule;
         }
        
		const module = new Module(
			this.graph,
			id,
			this.options,
			isEntry,
		
		);
		this.modulesById.set(id, module);

       const sourceObject = await this.loadModuleSource(id,importer)
       if (sourceObject) {
        module.setSource(sourceObject);
        this.fetchAllDependencies(module);
       }
        return module;
    }


    private fetchAllDependencies(module:Module) {
        module.dependencies.forEach(path => this.loadModule(path,false,module.id));
    }

    private async loadModuleSource(id: string, importer: string|undefined): Promise<{code:string, ast: string | null} | undefined>  {
           return load(id)
                .catch(err => {
                    let message = `Could not load ${id}`;
                    if (importer) message += ` (imported by ${relativeId(importer)})`; 
                    error({
                        code:ErrCode.LODE_MODULE,
                        message: message
                    }) 
                }).then((source => {
                    if ( typeof source === 'string' ) return transform(source);
                }))
    }
}
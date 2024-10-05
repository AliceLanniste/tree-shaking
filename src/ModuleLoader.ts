import { NomlaizedResolveIdWithoutDefaults, ResolvedId, ResolveResult, type rainbowOptions } from "./types/options";
import { Module } from "./Module";
import { type UnresolvedModule } from "./types/modules";
import {relativeId, load, resolveId } from "./utils/utils";
import { Graph } from "./Graph";
import { error } from "console";
import { ErrCode } from "./error";
import path from "path";
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

    //unresolveId是什么,importer是什么
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
         //isEntry=true,entryModule else import module
		const module = new Module(
			this.graph,
			id,
			this.options,
			isEntry,
		
		);
		this.modulesById.set(id, module);

       await this.loadModuleSource(id,importer)
        this.fetchAllDependencies(module);
        return module;
    }


    private fetchAllDependencies(module:Module) {
        module.dependencies.forEach(path => this.loadModule(path,false,module.id));
    }

    private async loadModuleSource(id: string, importer: string|undefined): Promise<string> {
        let source: string;
        try {
            source = await load(id);
            return source;
           
        } catch (_error:unknown) {
            let message = `Could not load ${id}`;
			if (importer) message += ` (imported by ${relativeId(importer)})`; 
            error({
                code:ErrCode.LODE_MODULE,
                message: message
            }) 
        }
        //
    }

    private getResolveIdWithResult(resolvedId: NomlaizedResolveIdWithoutDefaults | null, 
                                    attributes:Record<string,string>): ResolvedId | null {
        if (!resolvedId) {
            return null;
        }
        const external = resolvedId.external || false;
        return {
            attributes:resolvedId.attributes || attributes,
            external,
            id:resolvedId.id,
			resolvedBy: resolvedId.resolveBy ?? 'rollup',
			syntheticNamedExports: resolvedId.syntheticNamedExports ?? false
        }
    }
}
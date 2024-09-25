import { NomlaizedResolveIdWithoutDefaults, ResolvedId, ResolveResult, type rainbowOptions } from "./types/options";
import { Module } from "./Module";
import { type UnresolvedModule } from "./types/modules";
import { resolveId } from "./utils";
import { Graph } from "./Graph";
export class ModuleLoader {
    
     constructor(
        private readonly graph: Graph,
        private readonly modulesById: Map<string, Module>,
        private readonly options: rainbowOptions,
     ) {

     }

    async addEntryModule(unresolveModules:UnresolvedModule[], isUserDefined: boolean) {
        const newEntryModules = await Promise.all(unresolveModules.map(({id, importer}) => 
                               this.loadEntryModule(id,true,importer)))
        if (newEntryModules.length === 0) {
			throw new Error('You must supply options.input to rollup');
		}
    }

	private async loadEntryModule(
		unresolvedId: string,
		isEntry: boolean,
		importer: string | undefined,
	): Promise<Module> {
      const resolveResult = await resolveId(unresolvedId,importer)
        if (resolveResult === null) {
        //    return;
        }

        return this.fetchModule(
         resolveResult,
         undefined
        )

    }
  
    private async fetchModule(id: ResolveResult,
		importer: string | undefined,
		):Promise<Module> {
         const existingModule = this.modulesById.get(id as string);
         if(existingModule) {
            return existingModule;
         }
		// const module = new Module(
		// 	this.graph,
		// 	id,
		// 	this.options,
		// 	isEntry,
		// 	syntheticNamedExports,
		// 	attributes
		// );
		// this.modulesById.set(id, module);
        // return module;
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
import { NomlaizedResolveIdWithoutDefaults, ResolvedId, type rainbowOptions } from "./types/options";
import { Module } from "./Module";
import { type UnresolvedModule } from "./types/modules";
import { EMPTY_OBJECT, resolveId } from "./utils";
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
    }

	private async loadEntryModule(
		unresolvedId: string,
		isEntry: boolean,
		importer: string | undefined,
	): Promise<Module> {
      const resolveResult = resolveId(unresolvedId,importer)
        if (resolveResult === null) {
        //    return;
        }

        return this.fetchModule(
           this.getResolveIdWithResult({id: resolveResult!}, EMPTY_OBJECT)!,
               undefined,
               isEntry,
        )

    }
  
    private async fetchModule({ attributes, id, syntheticNamedExports }: ResolvedId,
		importer: string | undefined,
		isEntry: boolean):Promise<Module> {
         const existingModule = this.modulesById.get(id);
         if(existingModule) {
            return existingModule;
         }
		const module = new Module(
			this.graph,
			id,
			this.options,
			isEntry,
			syntheticNamedExports,
			attributes
		);
		this.modulesById.set(id, module);
        return module;
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
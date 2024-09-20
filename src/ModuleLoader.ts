import { type rainbowOptions } from "./types/options";
import { Module } from "./Module";
import { type UnresolvedModule } from "./types/modules";
export class ModuleLoader {
    
     constructor(private readonly modulesById: Map<string, Module>,
        private readonly options: rainbowOptions,
     ) {

     }

    addEntryModule(unresolveModules:UnresolvedModule[], isUserDefined: boolean) {
       
    }

  
     
	private async loadEntryModule(
		unresolvedId: string,
		isEntry: boolean,
		importer: string | undefined,
	): Promise<Module> {


    }
  
    private fetchModule() {

    }

    private getResolveIdWithResult(resolvedId:any, attributes:Record<string,string>) {
        if (!resolvedId) {
            return null;
        }

        return {
            attributes:resolvedId.attributes || attributes,
            id:resolvedId.id,
            meta:  {},
			resolvedBy: resolvedId.resolvedBy ?? 'rollup',
			syntheticNamedExports: resolvedId.syntheticNamedExports ?? false
        }
    }
}
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


    private fetchModule() {

    }
}
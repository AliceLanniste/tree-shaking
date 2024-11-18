import { ResolveResult, type rainbowOptions } from './types/options';
import { Module } from "./Module";
import { type UnresolvedModule } from "./types/modules";
import {relativeId, load, resolveId, transform, sequence } from "./utils/utils";
import { Graph } from "./Graph";
import { ErrCode } from "./error";
import { Statement } from "./node/Statement";

export class ModuleLoader {
    bodyStatement: Statement[] = [];
    bodyString: string[] = [];
    modules: Module[] = [];
    ordered: Module[] = [];
    modulesById:Record<string,Module> = {}
     constructor(
        private readonly graph: Graph,
        private readonly options: rainbowOptions,
     ) {
    
     }

    async addEntryModule(unresolveModules:UnresolvedModule[], isUserDefined: boolean) {
        const entryModules = await Promise.all(unresolveModules.map(({id, importer}) => 
            this.loadModule(id, true, importer)))
                
        if (entryModules.length === 0) {
			throw new Error('You must supply options.input to rollup');
        }
        entryModules.forEach(entryModule => entryModule.markAllStatement(true))
        this.sorModule()
        return this;
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
                isEntry
                )

    }
  
    private async fetchModule(resolvedResult: ResolveResult,
		importer: string | undefined,
        isEntry: boolean =false
    ): Promise<Module> {
        if (!resolvedResult) { throw error() } 
        const { resolvedId: id, path } = resolvedResult;
         const existingModule = this.modulesById[id];
         if(existingModule) {
            return existingModule;
         }
        const sourceObject = await this.loadModuleSource(id,importer)
		const module = new Module(
			this.graph,
            id,
            path,
			this.options,
			isEntry,
            this,
            sourceObject!.code,
            sourceObject!.ast,
		);
		this.modulesById[id] = module;
        this.modules.push(module);

        await this.fetchAllDependencies(module);       
        return module;
    }
     

    private async fetchAllDependencies(entryModule: Module) {     
        const dependPromises = entryModule.dependencies.map(async (depend: string) => {
            let  resolvedResult = await resolveId(depend, entryModule.id);
             entryModule.resolvedIds[depend] = resolvedResult?.resolvedId ?? ''
            return await this.loadModule(depend, false, entryModule.id)
       }
        ) 
           return  Promise.all(dependPromises)

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

    sorModule() {
        this.visit(this.modules[0])
        console.log("sortModule",this.ordered.length)
    }
    visit(module: Module) {
        const strongDependencies = module.collectDependencies()
        Object.values(strongDependencies).forEach(depend =>
            this.visit(depend)
        )
        this.ordered.push(module)

    }
    render() {
        return this.ordered;
    }
}
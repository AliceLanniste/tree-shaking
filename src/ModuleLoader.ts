import { ResolveResult, type rainbowOptions } from "./types/options";
import { Module } from "./Module";
import { type UnresolvedModule } from "./types/modules";
import {relativeId, load, resolveId, transform, sequence } from "./utils/utils";
import { Graph } from "./Graph";
import { error } from "console";
import { ErrCode } from "./error";
import {  Node } from "acorn";

export class ModuleLoader {
     bodyStatement:Node[] = [];
     constructor(
        private readonly graph: Graph,
        private readonly modulesById: Map<string, Module>,
        private readonly options: rainbowOptions,
     ) {

     }

    async addEntryModule(unresolveModules:UnresolvedModule[], isUserDefined: boolean) {
        const entryModules = await Promise.all(unresolveModules.map(({id, importer}) => 
                               this.loadModule(id,true,importer)))
        if (entryModules.length === 0) {
			throw new Error('You must supply options.input to rollup');
		}

        let entryModuleAST = entryModules.map(module => module.ast);
        entryModuleAST.map((ast) => {
            ast.body.forEach(node => {
                 // exclude imports and exports, include everything else
            if ( !/^(?:Im|Ex)port/.test( node.type ) ) {
                this.bodyStatement.push( node );
            }
            })
        })
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
        await this.fetchAllDependencies(module);
       }
        return module;
    }


    private  async fetchAllDependencies(entryModule:Module) {
     return await sequence(Object.entries(entryModule.imports), ([name, importObj])=> {
                this.loadModule(importObj.importee!,false,module.id)
                    .then(module => {
                        let statement = module.expandStatement(name) || [];
                        this.bodyStatement = this.bodyStatement.concat(statement)
                        console.log("sequence",this.bodyStatement)
                    })
                }
            )  
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
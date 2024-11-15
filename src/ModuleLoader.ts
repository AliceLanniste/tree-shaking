import { ResolveResult, type rainbowOptions } from './types/options';
import { Module } from "./Module";
import { type UnresolvedModule } from "./types/modules";
import {relativeId, load, resolveId, transform, sequence } from "./utils/utils";
import { Graph } from "./Graph";
import { Console, error } from "console";
import { ErrCode } from "./error";
import { Statement } from "./node/Statement";

export class ModuleLoader {
    bodyStatement: Statement[] = [];
    bodyString: string[] = [];
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
        const { resolvedId:id, path } = resolvedResult;
         const existingModule = this.modulesById.get(id);
         if(existingModule) {
            return existingModule;
         }
        
		const module = new Module(
			this.graph,
            id,
            path,
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
     
    //name from  importerModule.imports
    //  importeeModule.expandStatement(name)
    // it may be defined in importeeModule or differenet Module
    //so it
    private async fetchAllDependencies(entryModule: Module) {
        await sequence(Object.entries(entryModule.imports), ([name, importObj]) => {
            return this.loadModule(importObj.importee!, false, entryModule.id)
                .then(module => {
                    const importDeclaration = entryModule.imports[name];
                    const exportDeclaration = module.exports[name];
                    module.replacements[exportDeclaration.localName] = importDeclaration.localName!!;
                      
                    this.graph.storeNames(module, exportDeclaration.localName, importDeclaration.localName!!);
                     
                    let statements = module.expandStatement(name) || '';
                    
                    return statements;
                }).then((stmt) => {
                  
                    this.bodyStatement.push(stmt)
                    this.bodyString.push(stmt.source.toString())
                })
        })  
            .then(() => {
  
            entryModule.statements.forEach((statement) => {
                if (!/^(?:Im|Ex)port/.test(statement.scopeNode.node.type)) {
                    this.bodyStatement.push(statement)
                    this.bodyString.push(statement.source.toString())
                }
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
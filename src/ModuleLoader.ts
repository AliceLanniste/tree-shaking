import { ResolveResult, type rainbowOptions, ResolvedId, SourceDescription } from './types/options';
import { Module } from "./Module";
import { type unresolveId,} from "./types/modules";
import makeLegalIdentifier, {isExternalFile, isRelative, relativeId, resolveId, transform } from "./utils/utils";
import { Graph } from "./Graph";
import { ERR_CODE, error } from "./error";
import * as MagicString from 'magic-string';
import ExternalModule from './ExternalModule';
import finalise from './finalisers';
import { basename, resolve } from 'path';
import GlobalScope from './scopes/GlobalScope';
import { isExportDefaultVariable } from './node/utils';
//! 增加externalModule的支持，主要是在module.traceVariable中调用module.traceExport()
//!之前是只有Moudle才有这个方法，现在是ExternalModule中增加
export class ModuleLoader {
    modules: Module[] = [];
    ordered: Module[] = [];
    modulesById: Record<string, Module | ExternalModule> = {}
    externalModules: ExternalModule[] = []
    scope: GlobalScope;
     constructor(
        private readonly graph: Graph,
        private readonly options: rainbowOptions,
     ) {
        this.scope = new GlobalScope({isModuleScope:false});

     }

    async addEntryModule(unresolveIds:unresolveId[], isUserDefined: boolean) {
        const entryModules = await Promise.all(unresolveIds.map(({id, importer}) => 
            this.loadModule(id, true, importer)))
                
        if (entryModules.length === 0) {
            return error({
                code: ERR_CODE.NOT_OPTION,
                message:'You must supply options.input to rollup'
            })
        }
        this.sortModule()
        return this;
    }

    private async loadModule(
        unresolvedId: string,
        isEntry: boolean,
        importer: string | undefined,
    ): Promise<Module> {
        const resolveResult = await this.graph.resolveId(unresolvedId, importer)
        if (!resolveResult) {
            error({
                code: ERR_CODE.UNRESOLVE_MODULE,
                message:`Could not resolve module (${unresolvedId})`
            })
        }
        return this.fetchModule(
                <string>resolveResult,
                undefined,
                isEntry
                )
    }
  
    private async fetchModule(id:string,
		importer: string | undefined,
        isEntry: boolean =false
    ): Promise<Module> {
        const existingModule = this.modulesById[id]
        if (existingModule) {
			if (existingModule.isExternal) throw new Error(`Cannot fetch external module ${id}`);
			return Promise.resolve(<Module>existingModule);
        }   
        
        const sourceObject = await this.loadModuleSource(id, importer)
            const module = new Module(
                id,
                isEntry,
                this,
                sourceObject.code,
                sourceObject.ast,
            );
            this.modulesById[id] = module;
            this.modules.push(module);
            await this.fetchAllDependencies(module);
            return module;
         
    }
     

    private async fetchAllDependencies(entryModule: Module) {
        const dependPromises = entryModule.dependencies.map(async (depend: string) => {
            let resolvedId = await this.graph.resolveId(depend, entryModule.id);
            const externalId =
					resolvedId ||
					(isRelative(depend) ? resolve(module.id, '..', depend) : depend);
            const isExternal = await isExternalFile(<string>externalId)
            if (!resolveId &&isExternal) {
                this.graph.warn({
                    code: 'UNRESOLVED_IMPORT',
                    source: depend,
                    importer: module.path,
                    message: `'${depend}' is imported by ${module.path
                        }, but could not be resolved – treating it as an external dependency`,
                });

            } 
            if (isExternal) {
                const externalModule = new ExternalModule(depend);
                 entryModule.resolvedIds[depend] = <string> externalId 

                this.externalModules.push(externalModule)
                this.modulesById[depend] = externalModule
            } else {
                    entryModule.resolvedIds[depend]= <string>resolvedId
                return await this.loadModule(depend, false, entryModule.id)
            } 

        
       }
        ) 
        return  Promise.all(dependPromises)

    }

    private async loadModuleSource(id: string, importer: string|undefined): Promise<SourceDescription>  {
        return this.graph.load(id)
                .catch(err => {
                    let message = `Could not load ${id}`;
                    if (importer) message += ` (imported by ${relativeId(importer)})`; 
                        return error({
                                code:ERR_CODE.LODE_MODULE,
                                message: message
                        }) 
                }).then((source => {
                    if (typeof source === 'string') return transform(source);
                    else return source;
                }))
    }

    link() {
        for (const module of this.modules) {
            module.linkDependencies()
        }

        for (let module of this.modules) {
			module.bindReferences();
		}

    }
    analyseExecution() {

    }
    //sortModule的按照dependencies,进行排序
   
    sortModule() {
        let seen: Record<string, boolean> = {}
        let hasCycles: boolean = false
        this.visit(this.modules[0], seen, hasCycles)
    }
    visit(module: Module,seen:Record<string,boolean>,hasCycles:boolean) {
        seen[module.id] = true
        const dependencies = Object.values(module.resolvedIds);

        dependencies.forEach(id => {
            const imported = this.modulesById[id]
            if (seen[id]) {
                hasCycles = true
                return
            }
            if (imported instanceof ExternalModule) return

            this.visit(imported,seen,hasCycles)
        })

         
        this.ordered.push(module)

    }
    
    //export-default-is-bound和method-call-side都是export default
    //export-default 后面还跟着 reassign这个决定export default删除还是转变成var 语句
    //这个解决方式我是采用 original-reassign和assignment来支持的，但是最好的方式还是直接在
    //exportDefaultVariable上赋值是最好的
    deconflict() {
        let usedNames = Object.create(null);
        function getSafeName(name: string) {
             let safeName = name
            while (usedNames[safeName]) {
                safeName = `${name}$${usedNames[name]++}`;

             }
            
            usedNames[safeName] = 1
            return safeName
        }
        
        
        this.ordered.forEach(module => {
            Object.keys(module.scope.variables).forEach(variableName => {
                const variable = module.scope.variables[variableName];
                if (isExportDefaultVariable(variable) && variable.refernceOrignal()) {
                    variable.setSafeName(null);
                    return
                }
                if (!(isExportDefaultVariable(variable) && variable.hasId)) {
                    let safeName;
                    if (!variable.isReassigned || variable.isId) {

                        safeName = getSafeName(variable.name)
                    } else {
                        const safeExportName = variable.exportName
                         if (safeExportName) {
                            
                        } else {
                        safeName = getSafeName(variable.name);

                        }
                    }
                    
                    variable.setSafeName(safeName);

                }

            })
       })
    }
    //要treeshake，首要条件是orderedModules，然后加入默认的treeshakeOptions
    includeMark(modules: Module[]) {
      for (const module of modules) {
           module.include()
      }
    }
    render(format: string) {
        this.link()
        this.deconflict();
        this.modules[0].MarkExports()
        let magicString = new MagicString.Bundle({ separator: '\n\n' });
        this.includeMark(this.ordered)     
        
         this.ordered.forEach(module => {
            const source = module.render();

			if ( source.toString().length ) {
				magicString.addSource( source );
            }
        });
        let finaliser = finalise[format]
        const entryModule = this.modules[0]
        const exports = entryModule.resolveEntryExport()
        let exportReplacements ={}
        let options= {userStrict:true}
        let code = finaliser(this, magicString, {exports,exportReplacements}, {options})
        code = code.toString()
       return {code}
        
    }
}
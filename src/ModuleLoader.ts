import { ResolveResult, type rainbowOptions } from './types/options';
import { Module } from "./Module";
import { type UnresolvedModule } from "./types/modules";
import makeLegalIdentifier, {relativeId, load, resolveId, transform, sequence } from "./utils/utils";
import { Graph } from "./Graph";
import { ErrCode, error } from "./error";
import { Statement } from "./node/Statement";
import * as MagicString from 'magic-string';
import ExternalModule from './ExternalModule';
import finalise from './finalisers';

export class ModuleLoader {
    bodyStatement: Statement[] = [];
    bodyString: string[] = [];
    modules: Module[] = [];
    ordered: Module[] = [];
    modulesById: Record<string, Module|ExternalModule> = {}
    externalModules:ExternalModule[] = []
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
        const { resolvedId: id, path,isExtrnal } = resolvedResult;
         const existingModule = this.modulesById[id];
         if(existingModule && (existingModule instanceof Module)) {
            return existingModule;
         }
      
        
            const sourceObject = await this.loadModuleSource(id, importer)
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
            let resolvedResult = await resolveId(depend, entryModule.id);
            const { resolvedId: id, isExtrnal } = resolvedResult
            entryModule.resolvedIds[depend] = resolvedResult?.resolvedId ?? ''
            if (isExtrnal) {
                const externalModule = new ExternalModule(id);
                this.externalModules.push(externalModule)
                this.modulesById[id] = externalModule
            } else {

                return await this.loadModule(depend, false, entryModule.id)
            }
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
    //sortModule的按照dependencies,进行排序
    sorModule() {
        let seen: Record<string, boolean> = {}
        let hasCycles:boolean = false
        this.visit(this.modules[0], seen, hasCycles)
    }
    visit(module: Module,seen:Record<string,boolean>,hasCycles:boolean) {
        seen[module.id] = true
        const { strongDependencies, weakDependencies } = module.collectDependencies()
        Object.keys(strongDependencies).forEach(id => {
            const imported = strongDependencies[id]
            if (seen[id]) {
                hasCycles = true
                return
            }

            this.visit(imported,seen,hasCycles)
        })

         Object.keys(weakDependencies).forEach(id => {
            const imported = weakDependencies[id]

            if (seen[id]) {
                hasCycles = true
                return
            }

            this.visit(imported,seen,hasCycles)
        })
        this.ordered.push(module)
    }

    deconflict() {
        let allReplacements: Record<string, any> = {}
        let usedNames: Record<string, boolean> = {}
        	this.externalModules.forEach( module => {
			// while we're here...
			allReplacements[ module.id ] =  {}

			// TODO is this necessary in the ES6 case?
			let name = makeLegalIdentifier( module.id );
            module.name = getSafeName(name);
		});
        let i = this.ordered.length
        //reverse modules deconflict identifier
        while (i--) {
            const module = this.ordered[i]
            allReplacements[module.id] = {}
            Object.keys( module.definitions ).forEach( name => {
                const safeName = getSafeName(name);
				if ( safeName !== name ) {
					module.rename( name, safeName );
					allReplacements[ module.id ][ name ] = safeName;
				}
			});


        }
        this.ordered.forEach(module => {
            if (!module.needsDefault) return
            
            if (module.needsDefault) {
                const defaultExport = module.exports['Default']
                if (defaultExport && defaultExport.identifier) return;
                const defaultName = getSafeName( module.suggestNames['Default'] );
				module.replacements['Default'] = defaultName;
            }
        })
       
        //importerModule.imports(specfiers && identifiers) link importeeModule.exports(specfiers | identifiers)
        // importerModule.import[localName].importee => importerModule.resolvedIds[importee]
        //found importeeModule(exportedModule)
        // localExport or re-export
        //module.exports(importee.importName) => re-export's importDeclaration or localExport definition
        // 
        this.ordered.forEach(module => {
            Object.keys(module.imports).forEach(name => {
                const bundleName = this.trace(module, name);
                if (bundleName !== name) {
                    allReplacements[module.id][name] = bundleName
                }
                })
        })
        //usedNames  two: true, one: true, _two: true }
        function getSafeName(name: string) {
		
            while (usedNames[name]) {
				name = `_${name}`;
			}

            usedNames[name] = true;
			return name;

        }
        return allReplacements;
    }

    trace(module: Module, name: string) {
        const importDeclaration = module.imports[name]
        
        //defined in module
        if (!importDeclaration) return module.replacements[name] || name
        
        //find export module
        // if local export
        // reexport
        //reuqired export .... statement
        const id = module.resolvedIds[importDeclaration.importee]
        const traceModule = this.modulesById[id]
        if (traceModule instanceof ExternalModule) {
            return
        }
        return this.traceExport(traceModule,importDeclaration.name!)
    }
    
    traceExport(module: Module, name: string) {
        if (name === 'Default') {
            return module.getDefaultName();
        }

        const exportDeclaration = module.exports[name];
        
		if ( exportDeclaration ) return this.trace( module, exportDeclaration.localName );

    }
    render( format: string) {

        const allReplacements = this.deconflict();
        let magicString = new MagicString.Bundle({ separator: '\n\n' });
        this.ordered.forEach(module => {
            const source = module.render(allReplacements[module.id]);

			if ( source.toString().length ) {
				magicString.addSource( source );
            }
        });
        let finaliser = finalise[format]
        let exportMode =this.modules[0].exports
        let options= {userStrict:true}
        let code = finaliser(this, magicString, {exportMode}, {options})
        code = code.toString()
        console.log("render", code)
       return {code}
        
    }
}
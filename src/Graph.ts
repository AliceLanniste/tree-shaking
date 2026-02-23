import * as acorn from 'acorn';
import { error } from "console";
import ExternalModule from "./ExternalModule";
import Module from "./Module";
import { GlobalScope } from "./scopes";
import { ERR_CODE } from "./error";
import { load, resolveId } from "./utils/util";
import { analyseModuleExecutionOrder, sortByExecutionOrder } from './utils/executionOrder';
import { assignChunkColouringHashes } from './utils/chunkColouring';
import { Unit8ArrayToHexString } from './utils/entryHashing';
import Chunk from './Chunk';

export default class Graph {
    acornOptions: acorn.Options;
    acornParser: typeof acorn.Parser;
    moduleById = new Map<string, Module | ExternalModule>();
    modules: Module[] = [];
    externalModules: ExternalModule[] = [];
    scope:GlobalScope;
    
    constructor(options: any) {
        this.scope = new GlobalScope();
        if(!options.input)  error({code: ERR_CODE.NO_INPUT_OPTIONS, message:'You must supply options.input to rollup'})
        const acornPluginsToInject = [];
        this.acornOptions = {};
        this.acornParser = <any>acorn.Parser.extend(...acornPluginsToInject);


        }
    async build(entryModuleIds: string | string[] | Record<string, string>) {
     // phase 1: load entry modules
      let entryModules = await this.loadEntryModules(entryModuleIds);
      
      //phase2: analyse module execution order
      const {orderedModules, cyclePaths} = analyseModuleExecutionOrder(entryModules);
    
      //phase3: assign chunk colouring hashes
      assignChunkColouringHashes(entryModules);
      
      //phase4: generate chunks
     this.generate(orderedModules);

    }

    generate(orderedModules: Module[]) {
        let chunks: Chunk[] = [];
        const chunkModules: { [entryHashSum: string]: Module[] } = {};
        
        for (let module of orderedModules) {
            let entryPointHashstr = Unit8ArrayToHexString(module.entryPointHash);
            let curChunk = chunkModules[entryPointHashstr];

            if (curChunk) {
                curChunk.push(module);
            } else {
                chunkModules[entryPointHashstr] = [module];
            }
        }

        for (const entryHashSum in chunkModules) {
            let modules = chunkModules[entryHashSum];
            sortByExecutionOrder(modules);
            let chunk = new Chunk(this,modules);
            chunks.push(chunk);
        }

        return chunks;
    }

    private loadEntryModules(entryModules: string | string[] | Record<string, string>):Promise<Module[]> {
        let entryModuleIds: string[];
        if(typeof entryModules === 'string')  entryModules = [entryModules];
        if(Array.isArray(entryModules))  {
            entryModuleIds = entryModules;
        } else{
            entryModuleIds = Object.keys(entryModules).map(key => entryModules[key]);
        }    
    
       return  Promise.all(entryModuleIds.map(entryPath => this.loadModule(entryPath))).then(modules => {return modules;})
    }
    

    private async loadModule(entryPath: string) {
        let resolveIdPromise =Promise.resolve( resolveId(entryPath, undefined));
        let id = await resolveIdPromise;
        if(id == null) {
            error({
            code: ERR_CODE.UNRESOLVE_MODULE,
            message:`Could not resolve module (${entryPath})`
            })
        }
        return this.fetchModule(entryPath,undefined);
    }

    private fetchModule(id: string,importer?:string):Promise<Module> {
        //detect circular module
        const existingModule = this.moduleById.get(id);

        if(existingModule){
            if(existingModule.isExternal) throw new Error(`Cannot fetch external module ${id}`);
            return Promise.resolve(<Module>existingModule);
        }

        const module = new Module(id,this);
        this.moduleById.set(id, module);
        //phaser2
        let source: string;
        try {
            source = load(id);
            module.setSource(source);
            this.modules.push(module);   
            this.moduleById.set(id, module);
        
            this.fetchAllDependencies(module);
        } catch (error) {
            let msg = `Could not load ${id}`;
			if (importer) msg += ` (imported by ${importer})`;

			msg += `: ${error.message}`;
			throw new Error(msg);

        }
        return Promise.resolve(module);
    }

    private fetchAllDependencies(module:Module) {
        //detect source is included resolvedIds,if not ,add, 有resolveId那就fetchModule
        let resolvedIds = module.sources.map(source => {
            let resolvedId = module.resolvedIds[source];
            if(resolvedId) return resolvedId;
            resolvedId = resolveId(source, module.id);
            module.resolvedIds[source] = resolvedId;
            return  resolvedId;
        })
        
        for(let resolvedId of resolvedIds) {
            this.fetchModule(resolvedId, module.id);
            
        }

    }

    private link() {}
}
import { ERR_CODE, error } from "./error";
import ExternalModule from "./ExternalModule";
import finalisers from "./finalisers";
import Graph from "./Graph";
import Module from "./Module";
import { OutputOptions } from "./types";
import Variable from "./variables/Variable";
import MagicString, { Bundle as MagicStringBundle } from 'magic-string';

export default class Chunk {
    execIndex: number;
    entryModules: Module[] = [];
    id: string;
    graph: Graph;
    orderedModules: Module[];
    usedModules?: Module[];
    
    private renderedModuleSources: MagicString[];
    private renderedSource: MagicStringBundle;
    private exports = new Set<Variable>();
    private imports = new Set<Variable>();
    private dependencies?: (Chunk | ExternalModule)[];

    constructor( graph: Graph, orderedModules: Module[] ) {
        this.graph = graph;
        this.orderedModules = orderedModules;
        this.execIndex = orderedModules.length > 0 ? orderedModules[0].execIndex : Infinity;

        for (const module of orderedModules) {
            if (module.isEntryPoint) {
                this.entryModules.push(module);
            }
        }
    }

    getImportIds() {
        return this.dependencies?.map(chunk => chunk.id)
    }

    link() {
        const dependencies :Set<Chunk | ExternalModule> = new Set();
        for (const module of this.orderedModules) {
            this.addChunksFromDependencies(module.dependencies, dependencies);
        }

        this.dependencies= Array.from(dependencies);
    }

    preRender() {
        const magicStringBundle = new MagicStringBundle( {separator: '\n\n'});
        this.renderedModuleSources = []

        for(let i = 0; i < this.orderedModules.length; i++){
            const module = this.orderedModules[i];
            const source = module.render({});
            source.trim();
            
            if (source.lastLine().indexOf('//') !== -1) source.append('\n');
            this.renderedModuleSources.push(source);

            if (!source.isEmpty()) magicStringBundle.addSource(source);
            this.renderedSource = magicStringBundle.trim();

        }
    }

    render(options: OutputOptions) {
        if (!this.renderedSource) 
            throw new Error("Internal error: Chunk render called before preRender");

        const finalise = finalisers[options.format];

        if (!finalise) {
            error({
                code: ERR_CODE.INVALID_OPTION,
                message: `Invalid format: ${options.format} - valid options are ${Object.keys(
					finalisers
				).join(', ')}`
            })
        }

        const magicString = finalise(this.renderedSource, );
        const prevCode = magicString.toString();
        return prevCode;
    }

    private addChunksFromDependencies(moduleDependencies: (Module | ExternalModule)[],
        chunkDependencies: Set<Chunk | ExternalModule>) {
            for (const  depModule of moduleDependencies){
                if(depModule.chunk == this) {
                    continue
                }

                let dependency: Chunk | ExternalModule;
                if(depModule instanceof Module) {
                    dependency  = depModule.chunk;
                } else {
                    dependency = depModule;
                }
                chunkDependencies.add(dependency);
            }
   
        }
}
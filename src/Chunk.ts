import ExternalModule from "./ExternalModule";
import Graph from "./Graph";
import Module from "./Module";
import Variable from "./variables/Variable";

export default class Chunk {
    execIndex: number;
    entryModules: Module[] = [];
    id: string;
    graph: Graph;
    orderedModules: Module[];
    usedModules?: Module[];

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
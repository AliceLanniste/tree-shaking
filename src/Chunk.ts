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
    private dependencies?: Chunk[];

}
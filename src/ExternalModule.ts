import Graph from "./Graph";

export default class ExternalModule {
    private graph: Graph;
    id: string;
    chunk: void;
    isExternal: boolean = true;
    isEntrtyPoint: boolean = false;
    execIndex: number;

    constructor(id: string, graph: Graph) {
        this.id = id;
        this.graph = graph;
    }
}
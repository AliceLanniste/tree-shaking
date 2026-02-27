import {   Node  } from "acorn";

export class Statement {
    node: Node;
    start: number;
    end: number;
    type: string;


    constructor(node: Node,start: number, end: number, type: string) {
        this.node = node;
        this.start = start;
        this.end = end;
        this.type = type;
    }

   
}
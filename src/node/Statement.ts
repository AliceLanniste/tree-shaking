import { ModuleDeclaration, Statement as Acorn_Statement } from "acorn";
import {Module} from "../Module";

export class Statement {
     
    constructor(private readonly node:Acorn_Statement | ModuleDeclaration,
        private readonly module: Module,
        private readonly index: number
    ){
        
    }
}
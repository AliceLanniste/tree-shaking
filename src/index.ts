
import { type rainbowOptions } from "./types/options";
import { Graph } from "./Graph";
import { generate } from "escodegen";


export function rainbowUp(options: rainbowOptions) {
      // create a dependencies graph
      let graph = new Graph(options);
      let statements = graph.createModuleGraph()
     
      return { 
            code: generate({
            type: 'Program',
            body: statements
         }),
         map: null
     }
}
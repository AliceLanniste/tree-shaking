
import { type rainbowOptions } from "./types/options";
import { Graph } from "./Graph";
export function rainbowUp(options: rainbowOptions) {
      // create a dependencies graph
      let graph = new Graph(options);
      graph.createModuleGraph()
     
}
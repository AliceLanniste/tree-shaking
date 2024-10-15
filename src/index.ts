
import { type rainbowOptions } from "./types/options";
import { Graph } from "./Graph";
import { generate } from "escodegen";
import  { Node } from "acorn";

export default async function rainbowUp(options: rainbowOptions) {
      // create a dependencies graph
      let graph = new Graph(options);
      let statements =  await graph.createModuleGraph()
   
      return {
            generate: (options:Record<string,unknown>) => generateCode( options ,statements),
            write: () => {
                  throw new Error( 'TODO' );
            }
      };


}


function generateCode( options:Record<string, unknown>={}, program:Node[]) {
      return {
            code: generate({
                  type: 'Program',
                  body: program
            }),
            map: null 
      }
}

import { type rainbowOptions } from "./types/options";
import { Graph } from "./Graph";
import  * as magicString from "magic-string";
import { Statement } from "./node/Statement";

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


function generateCode( options:Record<string, unknown>={}, program:Statement[]) {
      const bundler =  new magicString.Bundle();
      program.forEach( statement => {
            bundler.addSource( statement.source );
      });
      
      return {
            code: bundler.toString(),
            map: null // TODO use bundle.generateMap()
      };
}
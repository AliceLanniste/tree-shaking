
import { type rainbowOptions } from "./types/options";
import { Graph } from "./Graph";
import  * as magicString from "magic-string";
import { Statement } from "./node/Statement";

export default async function rainbowUp(options: rainbowOptions) {
      // create a dependencies graph
      let graph = new Graph(options);

      let result = await graph.render()

      return {
            generate: (options:Record<string,unknown>) => result,
            write: () => {
                  throw new Error( 'TODO' );
            }
      };


}


function generateCode( options:Record<string, unknown>={}, program:Statement[],strings:string[]) {
      const bundler =  new magicString.Bundle();
      return {
            code:strings.join("\n"),
            map: null // TODO use bundle.generateMap()
      };
}
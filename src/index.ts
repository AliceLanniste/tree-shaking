
import { type rainbowOptions } from "./types/options";
import { Graph } from "./Graph";
import  * as magicString from "magic-string";
import { Statement } from "./node/Statement";
import { writeFileSync } from "fs";

interface writeOptions {
      dest: string,
      format: string
}


export default async function rainbowUp(options: rainbowOptions) {
      // create a dependencies graph
      let graph = new Graph(options);
      return {
            generate: async (options: Record<string, unknown>) => {
                  let result = await graph.render(options.format)
                  return result
            },
            write:  async (options: writeOptions) => {
                  let result = await graph.render(options.format)
                  const { dest } = options
                try {
                  writeFileSync(dest, result.code)
                } catch (error) {
                  console.log("writerror",error)
                }
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
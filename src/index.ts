
import { type rainbowOptions } from "./types/options";
import { Graph } from "./Graph";
import  * as magicString from "magic-string";
import { Statement } from "./node/Statement";
import fs from 'node:fs';

export default async function rainbowUp(options: rainbowOptions) {
      let graph = new Graph(options);
      return {
            generate: async(options:Record<string,unknown>) => await graph.generate( options),
            write: async (dest:string, options:Record<string,unknown>) => {
                  let souceCode = await graph.generate(options)
                  fs.writeFileSync(dest, souceCode.code)
            }
      };


}

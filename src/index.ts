
import { type rainbowOptions } from "./options";
import Bundler from "./bundler";
export function rainbowUp(options: rainbowOptions) {
      
      let bundler = new Bundler(options);
      let buildOuput = bundler.build();
      let output = bundler.generate();

}
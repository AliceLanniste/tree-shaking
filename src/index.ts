
import { type rainbowOptions } from "./options";
import Bundler from "./bundler";
export function rainbowUp(option: rainbowOptions) {
      
      let bundler = new Bundler();
      let buildOuput = bundler.build();
      let output = bundler.generate();

}
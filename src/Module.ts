import { Graph } from "./Graph";
import { rainbowOptions } from "./types";

export class Module {
    constructor(
        private readonly graph: Graph,
		public readonly id: string,
		private readonly options: rainbowOptions,
		isEntry: boolean,
		syntheticNamedExports: boolean | string,
		attributes: Record<string, string>) {

    }
}
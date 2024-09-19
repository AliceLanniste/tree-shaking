import { rainbowOptions } from "./types/options";
import { normalizeOptions } from "./utils";
import { Module } from "./Module";
export default class Bundler {
    options: rainbowOptions;
    entryPathList: string[];
    moduleTable: Module[];


    constructor(options: rainbowOptions) {
        this.options = options
        this.entryPathList = normalizeOptions(options);
    }

    build() {
        this.fetchModule()
    }

    private fetchModule() {
        while (this.entryPathList.length) {
            let entryPath = this.entryPathList.shift()
            

        }

    }

    generate() {

    }
}
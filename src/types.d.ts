import Module from "./Module";
import ImportSpecifier from "./node/ImportSpecifier";
import ImportDefaultSpecifier from "./node/ImportDefaultSpecifier";
import ImportNamespaceSpecifier from "./node/ImportNamespaceSpecifier";

export interface moduleImport {
    source: string;
    specifier: ImportSpecifier | ImportDefaultSpecifier | ImportNamespaceSpecifier;
    name: string;
    module: Module;
}


type OutputOptions = any;

export interface RainbowOutput {
	output: any[];
}

export interface  RainbowOutput{
    generate(outputOptions: OutputOptions, isWrite:boolean): Promise<RainbowOutput>;
    write(outputOptions: OutputOptions): Promise<RainbowOutput>;
}
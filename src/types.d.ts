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

export interface BaseLogProps {
    pos?: number;
    id?: string;
    frame?: string;
    loc?:{
        file:string,
        line: number,
        column: number
    },
    message?:string,
}

export  interface RainbowError extends BaseLogProps {
}
export interface Warning extends BaseLogProps {
    code: string;
    exporter?: string;
    exportName?: string;
    importer?: string;
    missing?: string;
    modules?: string[];
    names?: string[];
    reexporter?: string;
    source?: string;
    sources?: string[];
}
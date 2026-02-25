import Module from "./Module";
import ImportSpecifier from "./node/ImportSpecifier";
import ImportDefaultSpecifier from "./node/ImportDefaultSpecifier";
import ImportNamespaceSpecifier from "./node/ImportNamespaceSpecifier";
import ExternalModule from "./ExternalModule";

export interface CommentDesc {
    block: boolean;
    text: string;
    start: number;
    end: number;
}

export interface moduleImport {
    source: string;
    specifier: ImportSpecifier | ImportDefaultSpecifier | ImportNamespaceSpecifier;
    name: string;
    module: Module;
}

export type ModuleFormat = 'amd' | 'cjs' | 'system' | 'es' | 'esm' | 'iife' | 'umd';

export interface OutputOptions {
    format?: ModuleFormat;
}

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
    code: string;
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

export interface ImportDescription {
    source: string;
    start: number;
    name: string;
    module: Module | ExternalModule | null;
}

export interface ExportDescription {
	localName: string;
	identifier?: string;
	node?: Node;
}

export interface ReexportDescription {
	localName: string;
	start: number;
	source: string;
	module: Module;
}

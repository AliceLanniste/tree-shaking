import { Program } from "acorn";
interface Plugin {
    name: string,
    options?: (options: InputOptions) => void;
	load?: LoadHook;
	resolveId?: ResolveIdHook;
	transform?: TransformHook;

}

interface Warning {
    code?: string;
	loc?: {
		file: string;
		line: number;
		column: number;
    },
    name?: string,
    source?: string,
    missing?: string,
    frame?: any

}



type inputOption = { name: string, import: string };
export type SourceDescription = { code: string, ast?: Program };
export type LoadHook = (id: string) => Promise<SourceDescription | string | void> | SourceDescription | string | void;
export type ResolveIdHook = (id: string, parent: string) => Promise<string | boolean | void> | string | boolean | void;
export type TransformHook = (code: string, id: String) => Promise<SourceDescription | string | void>;
export type WarningHandler = (warn: Warning) => void;


export interface InputOptions {
    input?: inputOption[];
    cwd?: string,
    onWarn?: WarningHandler,
    plugins?: Plugin[],
    treeShake?: boolean,
    watch?: boolean,
}

export interface OutputOptions {

}
export interface rainbowOptions extends InputOptions {
    output?: OutputOptions;
}


export type NomlaizedResolveIdWithoutDefaults = {
    external?: boolean | 'absolute';
    id: string;
    resolveB?: string;
    attributes?: Record<string, string>;
    resolveBy?: string;
    syntheticNamedExports?: boolean | string;
}


interface ModuleOptions {
	attributes: Record<string, string>;
	syntheticNamedExports: boolean | string;
}

export interface ResolvedId extends ModuleOptions {
	external: boolean | 'absolute';
	id: string;
	resolvedBy: string;
}

export type ResolveResult = {
    resolvedId: string,
    path: string,
    isExtrnal: boolean,

} 

export interface writeOptions {
      dest: string,
      format: string
}

export interface renderOptions {
      [key: string]: any,
      format: string
}

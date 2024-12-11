import { resolve } from "path";
import { normalizeModules } from '../utils/utils';

type inputOption = {name: string, import:string};

export interface InputOptions {
    input?: inputOption[];
    cwd?: string,
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

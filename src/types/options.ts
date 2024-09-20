import { resolve } from "path";

type inputOption =Record<string,string>;

export interface InputOptions {
    input?: inputOption;
}

export interface OutputOptions {

}
export interface rainbowOptions extends InputOptions {
    output?: OutputOptions;
}


export type NomlaizedResolveIdWithoutDefaults = {
    id: string;
    resolveB?: string;
    attributes?: Record<string, string>;
    resolveBy?: string;
    syntheticNamedExports?: boolean | string;
}


interface ModuleOptions {
	attributes: Record<string, string>;
	// moduleSideEffects: boolean | 'no-treeshake';
	syntheticNamedExports: boolean | string;
}

export interface ResolvedId extends ModuleOptions {
	external: boolean | 'absolute';
	id: string;
	resolvedBy: string;
}
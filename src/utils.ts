import { dirname, resolve } from 'node:path';
import { rainbowOptions, ResolveResult } from './types/options';
import { UnresolvedModule } from './types/modules';
import { isAbsolute } from './utils/path';

export const BLANK: Record<string, unknown> = Object.freeze(Object.create(null));
export const EMPTY_OBJECT = Object.freeze({});

export function normalizeOptions(options: rainbowOptions) {
    let resolvePath: string[] = [];
    if(options.input) {
        resolvePath =Object.values(options.input).map((s) => resolve(s.replace(/\.js$/, '') + '.js'))
    }
    return resolvePath;
}

export function normalizeModules(entryPoints: Record<string,string>):UnresolvedModule[] {

    return Object.entries(entryPoints).map(([name, id]) => ({
		fileName: null,
		id,
		importer: undefined,
		name
	}));

}

export function resolveId(unresolveId: string,	importer: string | undefined,
): ResolveResult {
    //skip external module
    if(importer !== undefined && !isAbsolute(unresolveId) && unresolveId[0] !== '.') return null;
    return importer ? resolve(dirname(importer), unresolveId) : resolve(unresolveId)
}


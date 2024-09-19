import { resolve } from 'node:path';
import { rainbowOptions } from './types/options';
import { UnresolvedModule } from './types/modules';

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
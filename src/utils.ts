import { basename, dirname, resolve } from 'node:path';
import { rainbowOptions, ResolveResult } from './types/options';
import { UnresolvedModule } from './types/modules';
import { isAbsolute } from './utils/path';
import { readdir, readFile } from 'fs/promises';


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

export async function resolveId(unresolveId: string,	importer: string | undefined,
): Promise<ResolveResult> {
    //skip external module
    if(importer !== undefined && !isAbsolute(unresolveId) && unresolveId[0] !== '.') return null;
    return await addJSExtension( importer ? resolve(dirname(importer), unresolveId) : resolve(unresolveId)
    )
}

//js,cjs,mjs
async function addJSExtension(filename: string) {
    return (await findFile(filename) ??
            await findFile(filename + '.js') ??
            await findFile(filename) +'.mjs')
}


async function  findFile(filename: string) {
     const name = basename(filename);
     const files = await readdir(dirname(filename));
     if (files.includes(name)) {
        return filename
     }
}

export async function load ( id: string ) {
	return await readFile( id, 'utf-8' );
}

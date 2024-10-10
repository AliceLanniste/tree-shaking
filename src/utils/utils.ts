import { basename, dirname, relative, resolve } from 'node:path';
import { rainbowOptions, ResolveResult, InputOptions } from '../types/options';
import { UnresolvedModule } from '../types/modules';

import { readdir, readFile } from 'fs/promises';
import { Identifier } from 'acorn';

const ABSOLUTE_PATH_REGEX = /^(?:\/|(?:[A-Za-z]:)?[/\\|])/;

export function isAbsolute(path: string): boolean {
	return ABSOLUTE_PATH_REGEX.test(path);
}

export function normalizeOptions(options: rainbowOptions) {
    let resolvePath: string[] = [];
    if(options.input) {
        resolvePath =Object.values(options.input).map((entryOption) => resolve(entryOption.import.replace(/\.js$/, '') + '.js'))
    }
    return resolvePath;
}

export function normalizeModules(entryPoints: InputOptions):UnresolvedModule[] {
    if(entryPoints.input) {
        return entryPoints.input.map( entryOption => ({
            id:entryOption.import,	
            name: entryOption.name
        }));
    } else {
        //Default entryPoint
        return []
    }
    

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

//load module source
export async function load ( id: string ) {
	return await readFile( id, 'utf-8' );
}


export  function relativeId(id: string): string {
	if (!isAbsolute(id)) return id;
	return relative(resolve(), id);
}

//transform source to transform OAjec
export function transform(source: string):{code:string, ast: string | null} {
    return {
        code: source,
        ast: null
    }
}

export function getName ( x:Identifier ) {
	return x.name;
}
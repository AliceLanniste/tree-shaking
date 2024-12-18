import { basename, dirname, relative, resolve } from 'node:path';
import { rainbowOptions, ResolveResult, InputOptions } from '../types/options';
import { unresolveId } from '../types/modules';

import { readdir, readFile } from 'fs/promises';
import { Identifier } from 'acorn';

const ABSOLUTE_PATH_REGEX = /^(?:\/|(?:[A-Za-z]:)?[/\\|])/;
 const RELATIVE_PATH = /^\.?\.\//;

export function isAbsolute(path: string): boolean {
	return ABSOLUTE_PATH_REGEX.test(path);
}

export function isRelative(path: string): boolean {
    return RELATIVE_PATH.test(path);
}

export function normalizeOptions(options: rainbowOptions) {
    let resolvePath: string[] = [];
    if(options.input) {
        resolvePath =Object.values(options.input).map((entryOption) => resolve(entryOption.import.replace(/\.js$/, '') + '.js'))
    }
    return resolvePath;
}

export function normalizeModules(entryConfig: InputOptions):unresolveId[] {
    if(entryConfig.input) {
        
        return entryConfig.input.map( entryOption => ({
            id: entryOption.import,	
            name: entryOption.name,
            importer: entryConfig.cwd,
        }));
    } else {
        //Default entryPoint
        return []
    }
    

}

export async function resolveId(unresolveId: string,importer: string | undefined
): Promise<string> {
    //skip external module
    unresolveId = unresolveId.replace(/\.js$/, '')
    if (importer !== undefined && !isAbsolute(unresolveId) && unresolveId[0] !== '.') return '';
    
 
    
        const needResolvePath = importer ? resolve(dirname(importer),unresolveId):resolve(unresolveId)
    const resolvedId = await addJSExtension(needResolvePath)
    return  resolvedId
    
}

//js,cjs,mjs
async function addJSExtension(filename: string) {
    return (
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

export  async function isExternalFile(path: string) {
    const name = basename(path);
     const dir= await readdir(dirname(path));
     if (dir.includes(name)) {
        return  false
     }
     return true
}

//load module source
export async function load ( id: string ):Promise<string> {
	return await readFile( id, 'utf-8' );
}

export function sequence<T>(fnArr: ((...args: any[]) => Promise<T | void> | T | void)[]): (...args: any[]) => Promise<T | void> {
    return function (...args: any[]) {
        return fnArr.reduce((promise, fn) => {
            return promise.then(result => {
                return  result != null? result : Promise.resolve(fn(...args))
            }
            )
        },
     Promise.resolve())
    };
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




export default function makeLegalIdentifier ( str ) {
	str = str.replace( /[^$_a-zA-Z0-9]/g, '_' );
	if ( /\d/.test( str[0] ) ) str = `_${str}`;

	return str;
}
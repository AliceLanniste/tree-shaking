import { lstatSync, readdirSync, readFileSync } from "fs";
import { basename, dirname, isAbsolute, resolve } from "path";

export function resolveId(id: string, importer?: string): string | null {
    if(importer !== undefined && !isAbsolute(id) && id[0] !== '.') return null;
    return addJsExtensionIfNecessary(resolve(importer ? dirname(importer) : resolve(), id))
}

export function load(id: string) {
    return readFileSync(id, 'utf-8');
}

export function transform(code: string) {
    return code;
}

function findFile(file: string): string | void {
    const stats = lstatSync(file);
    if (stats.isFile()) {
        const name = basename(file);
        const files = readdirSync(dirname(file));

        if (files.indexOf(name) != -1) return file;
    }
}

function addJsExtensionIfNecessary(file: string):string {
    let found = findFile(file);
    if(found)  return found;
    found = findFile(file + '.mjs');
    if(found)  return found;
    found = findFile(file + '.js');
    if(found)  return found;

}
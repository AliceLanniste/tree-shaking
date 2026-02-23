import { basename, extname, relative } from "path";

const absolutePath = /^(?:\/|(?:[A-Za-z]:)?[\\|/])/;
const relativePath = /^\.?\.\//;


export function isAbsolute(path: string):boolean {
    return absolutePath.test(path);
}

export function isRelative(path: string):boolean {
    return relativePath.test(path);
}

export function normalizePath(path: string):string {
    if (path.indexOf('\\') == -1) return path;
    return path.replace(/\\/g, '/');
}


export function isPlainName(name: string):boolean {
    //filter starts with './','/','../'
    if (name[0] ==='/' ||
        (name[1] ==='.'&&(name[2] ==='/' || name[2] ==='.' && name[3] ==='/'))
    )
        return false;
    return true;
}

export function relativeId(id:string) {
    if (typeof process === 'undefined' || !isAbsolute(id)) return id;
    return relative(process.cwd(), id);
}

export function getAliasName(resolved: string, unresolved?: string) {
    let alias = basename(resolved || unresolved);
    const ext = extname(resolved);
    if (alias.endsWith(ext)) alias = alias.slice(0, alias.length-ext.length);
    return alias;
}

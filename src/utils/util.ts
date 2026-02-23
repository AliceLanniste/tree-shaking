import { lstatSync, readdirSync, readFileSync } from "fs";
import { basename, dirname, isAbsolute, resolve } from "path";

export function resolveId(id: string, importer?: string): string | null {
    if(importer !== undefined && !isAbsolute(id) && id[0] !== '.') return null;
    return addJsExtensionIfNecessary(resolve(importer ? dirname(importer) : resolve(), id))
}

export function load(id: string) {
    try {
        const fileContent = readFileSync(id, 'utf-8');
        return fileContent;
    } catch (error) {
        throw error;
    }
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

export  function getCodeFrame(source: string, line: number, column: number) {
    let lines = source.split('\n');

    const frameStart = Math.max(0, line - 3);
    let frameEnd = Math.min(lines.length, line + 2);

    lines = lines.slice(frameStart, frameEnd);

    while(!/\S/.test(lines[lines.length - 1])) {
        lines.pop();
        frameEnd -= 1;
    }

    const digits = String(frameEnd).length;

    return lines.map((str,i) => {
        const isErrorLine = frameStart + i + 1 === line;

        let lineNum = String(frameStart + i + 1);
        while(lineNum.length < digits)  lineNum = ` ${lineNum}`;

        if(isErrorLine) {
            const indicator = spaces(digits) + tabsToSpaces(str.slice(0, column)).length + '^';
            return `${lineNum}: ${tabsToSpaces(str)}\n${indicator}}`;
        }

        return `${lineNum}: ${tabsToSpaces(str)}`;
    }).join('\n');
}

function  spaces(i:number) {
   let result = '';
   while(i--) result += ' ';
   return result;
}

function  tabsToSpaces(str: string) {
   return str.replace(/^\t+/,match=>match.split('\t').join('  '));
}
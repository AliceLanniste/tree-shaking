// TODO:
// TODO:2.fetchModule完成

import { resolve } from 'node:path';
import { rainbowOptions } from './options';
export function normalizeOptions(options: rainbowOptions) {
    let resolvePath: string[] = [];
    if(options.input) {
        resolvePath =Object.values(options.input).map((s) => resolve(s.replace(/\.js$/, '') + '.js'))
    }
    return resolvePath;
}
import { GenericNode } from "../shared";

export const STORED_KEYS: { [name: string]: string[] } = {
    Program: ['body']
}

export function getNodeKeys(node:GenericNode) {
    STORED_KEYS[node.type] = Object.keys(node).filter(
        key => typeof node[key] === 'object');
    return STORED_KEYS[node.type];
}

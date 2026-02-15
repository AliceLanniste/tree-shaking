import { Program } from "../node";
import { GenericNode } from "../node/shared";

export const STORE_KEYS: {[name: string]: string[]} = {
    Program: ['body'],
}

export function getNodeKeys(node:GenericNode) {
    STORE_KEYS[node.type] = Object.keys(node).filter(
        key => typeof node[key] === 'object'
    )
    return STORE_KEYS[node.type]
}
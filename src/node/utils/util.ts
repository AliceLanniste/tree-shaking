import ExportDefaultVariable from "../../variables/ExportDefaultVariable";
import Variable from "../../variables/Variable";
import FunctionDeclaration from "../FunctionDeclaration";
import Identifier from "../Identifier";
import { GenericNode } from "../shared/Node";
import { NODETYPE } from "../shared/NodeType";

export const STORED_KEYS: { [name: string]: string[] } = {
    Program: ['body']
}

export function getNodeKeys(node:GenericNode) {
    STORED_KEYS[node.type] = Object.keys(node).filter(
        key => typeof node[key] === 'object');
    return STORED_KEYS[node.type];
}


export function isFunctionDeclaration(node: GenericNode): node is FunctionDeclaration {
    return node.type === NODETYPE.FUNCTION_DECLARATION
}

export function isIdentifier(node: GenericNode): node is Identifier {
	return node.type === NODETYPE.IDENTIFIER;
}

export function isExportDefaultVariable(variable: Variable): variable is ExportDefaultVariable {
	return variable.isDefault;
}

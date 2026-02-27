import { NODETYPE, StatementBase, StatementNode } from "../shared";

export function isBlockStatement(node: StatementNode): node is BlockStatement { 
    return node.type === NODETYPE.BLOCK_STATEMENT;
}

export default class  BlockStatement extends StatementBase { 
    type: NODETYPE.BLOCK_STATEMENT;
    body: StatementNode[];
}
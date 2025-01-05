import MagicString from "magic-string";
import Scope from "../scopes/Scope";
import { StatementBase, StatementNode } from "./shared/Node";
import { NODETYPE } from "./shared/NodeType";
import BlockScope from "../scopes/BlockScope";
import { Statement } from "./Statement";
import { Console } from "node:console";

export default class BlockStatement extends StatementBase {
    type: NODETYPE.BLOCK_STATEMENT;
    body: StatementNode[];


    createScope(parentScope: Scope) {
        this.scope = new BlockScope({ parent:parentScope }); 
    }

    include(): void {
        this.included = true;
        for (const node of this.body) {
            node.include()
        }
    }


    render(code: MagicString, options: any): void {
        if (this.body.length) {
            this.body.forEach(statement => statement.render(code, options))

        }
        super.render(code, options)
    }
}
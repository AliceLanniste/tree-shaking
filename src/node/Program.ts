import MagicString from "magic-string";
import { NodeBase, StatementNode } from "./shared/Node";
import { NODETYPE } from "./shared/NodeType";

export default class Program extends NodeBase {
    type: NODETYPE.PROGRAM;
    sourceType: 'module';
    body: StatementNode[];

    include(): void {
        this.included = true
        for (const node of this.body) {
            if (node.shouldBeIncluded()) {
                node.include()
            }
        }
    }

    render(code: MagicString, options: any): void {
        if (this.body.length) {
            
            this.body.forEach(statement => {
                statement.render(code, options)
            })
        } else {
          super.render(code,options)
            
        }
    }
}
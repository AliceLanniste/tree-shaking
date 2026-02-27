import MagicString from "magic-string";
import { NodeBase,StatementNode } from "../shared/Node";
import { NODETYPE } from "../shared/NodeType";

export default class Program extends NodeBase { 
  type: NODETYPE.PROGRAM;
  body: StatementNode[];

  include() {
    this.included = true
    for (const node of this.body) {
        if (node.shouldBeIncluded()) {
            node.include()
        }
    }
  }

  render(code: MagicString, options: any) {
    super.render(code, options)
  }
}
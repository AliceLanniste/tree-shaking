import Identifier from './Identifier';
import FunctionNode from './shared/FunctionNode';
import { GenericNode } from './shared/Node';
import { NODETYPE } from './shared/NodeType';
export default class FunctionDeclaration extends FunctionNode {
    type: NODETYPE.FUNCTION_DECLARATION;
    id: Identifier;

    initialise(): void {
        super.initialise()
        if (this.id !== null ) {
            this.id.variable.isId = true
        }
    }

    parseNode(node: GenericNode): void {
        if (node.id !== null) {
            this.id = <Identifier>new this.context.nodeConstructor.Identifier(
                node.id,
                this,
                this.scope.parent
            )
        }
        super.parseNode(node)
    }
}
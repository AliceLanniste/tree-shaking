import Identifier from './Identifier';
import { ExpressionNode, NodeBase } from './shared/Node';
import { NODETYPE } from './shared/NodeType';
import { isIdentifier } from './utils';
export default class AssignmentExpression extends NodeBase {
    type: NODETYPE.ASSIGNMENT_EXPR;
	left: Identifier | ExpressionNode;
	right: ExpressionNode;

    bind() {
        super.bind()
        if (isIdentifier(this.left)) {
            const variable = this.scope.findVariable(this.left.name);
            if (variable) {
                variable.setReassigned(true)
            }
       }
    }
}
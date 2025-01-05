import { ExpressionNode, StatementBase } from "./shared/Node";
import { NODETYPE } from "./shared/NodeType";

export default class ReturnStatement extends StatementBase {
	type: NODETYPE.RETURN_STATEMENT;
	argument: ExpressionNode | null;


	initialise() {
		this.included = false;
		this.scope.addReturnExpression(this.argument);
	}
}

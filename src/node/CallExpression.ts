import { ExpressionNode, NodeBase } from './shared/Node';
import { NODETYPE } from './shared/NodeType';
import { isIdentifier } from './utils/util';

//! bindings
//CallExpression 只有callee为identifier的时候，才bind
//bind 就是后执行的文件变量找先执行的变量，因为是通过引用的方式，所以找打哪个variable就可以把import去掉
export default class CallExpression extends NodeBase {
   
    type: NODETYPE.CALLEXPRESSION;
    callee: ExpressionNode;
    arguments: (ExpressionNode)[];
   
    bind(): void {
		super.bind();
            // if (isIdentifier(this.callee)) {
            //     const variable = this.scope.findVariable(this.callee.name);
            //     console.log("callExpression bind", variable);

            // }
    }

    initialise(): void {
        this.included = true

    }
}
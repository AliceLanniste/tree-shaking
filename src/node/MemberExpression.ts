import MagicString from 'magic-string';
import { ExpressionNode, NodeBase } from './shared/Node';
import { NODETYPE } from './shared/NodeType';

export default class MemberExpression extends NodeBase{
    type: NODETYPE.MEMBER_EXPRESSION;
    object: ExpressionNode;
    property: ExpressionNode;

    initialise(): void {
        this.included = true
        console.log("membere expression", this.object);
    }

    include(): void {
        this.included = true
        this.object.include()
        this.property.include()
    }

    render(code: MagicString, options: any): void {
        super.render(code,options)
    }
}
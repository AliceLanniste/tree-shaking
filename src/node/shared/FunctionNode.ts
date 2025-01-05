import { GenericNode, NodeBase } from './Node';
import Identifier from '../Identifier';
import Scope from '../../scopes/Scope';
import { PatternNode } from './PatternNode';
import FunctionScope from '../../scopes/FunctionScope';
import BlockStatement from '../BlockStatements';
export default class FunctionNode extends NodeBase {
    id: Identifier | null;
    body: BlockStatement;
    params: PatternNode[];

    scope: FunctionScope;

    bind() {
        super.bind();
    }

    createScope(parentScope: Scope): void {
       this.scope = new FunctionScope ({parent: parentScope})
    }


    include(): void {
        this.scope.variables.arguments.include()
        super.include()
    }

    initialise(): void {
        this.included = false
        if (this.id !== null) {
            this.id.declare('function');
        }
    }

    parseNode(node: GenericNode): void {
      this.body = <BlockStatement>new this.context.nodeConstructor.BlockStatement(
			node.body,
			this,
			new Scope({ parent: this.scope })
		);
		super.parseNode(node);  
    }
}
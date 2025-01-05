import MagicString from 'magic-string';
import { StatementBase } from './shared/Node';
import {  } from './shared/NodeType';

export default class ExpressionStatement extends StatementBase {
	directive?: string;

    initialise() {
        this.included = true
	}

    shouldBeIncluded() {
        this.included = true
        return super.shouldBeIncluded()
	}

    render(code: MagicString, options: any) {
		super.render(code, options);
	}
}

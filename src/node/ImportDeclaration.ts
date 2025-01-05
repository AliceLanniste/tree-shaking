import MagicString from "magic-string";
import ImportDefaultSpecifier from "./ImportDefaultSpecifier";
import ImportNamespaceSpecifier from "./ImportNamespaceSpecifier";
import ImportSpecifier from "./ImportSpecifier";
import Literal from "./Literal";
import { NodeBase } from "./shared/Node"
import { NODETYPE } from "./shared/NodeType"

export default class ImportDeclaration extends NodeBase {
    type: NODETYPE.IMPORT_DECLARATION;
    specifiers: (ImportSpecifier | ImportDefaultSpecifier | ImportNamespaceSpecifier)[];
    source: Literal;

    initialise() {
		this.included = false;	
		this.context.addImport(this);
	}

	render(code: MagicString, _options: any) {
		code.remove(this.span.start, this.span.end);
	
	}
}
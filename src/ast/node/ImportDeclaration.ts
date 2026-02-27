import ImportDefaultSpecifier from "./ImportDefaultSpecifier";
import ImportNamespaceSpecifier from "./ImportNamespaceSpecifier";
import ImportSpecifier from "./ImportSpecifier";
import Literal from "./Literal";
import { NodeBase } from "../shared";
import { NODETYPE } from "../shared/NodeType";

export default class ImportDeclaration extends NodeBase { 
    type: NODETYPE.IMPORT_DECLARATION;
    specifiers: (ImportSpecifier | ImportNamespaceSpecifier | ImportDefaultSpecifier)[];
    source: Literal;
    initialise() {
        this.context.addImport(this)
    }
}
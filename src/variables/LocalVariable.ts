import { ExportDefaultDeclaration } from "../node";
import Identifier from "../node/Identifier";
import Variable from "./Variable";
import { Node } from '../node/shared/Node';
import { NODETYPE } from "../node/shared/NodeType";
export default class LocalVariable extends Variable {
    declarators: Set<Identifier | ExportDefaultDeclaration>;
    constructor(name:string,idenatifier:Identifier | ExportDefaultDeclaration | null) {
        super(name);
        this.declarators = new Set([idenatifier]);
    }

    addDeclaration(declarator: Identifier) {
        this.declarators.add(declarator)
    }

    include() {
        if (!this.included) {
            this.included = true
            this.declarators.forEach((node: Node) => {
                console.log("localVariable", node);
				if (!node.included) node.include();
				node = <Node>node.parent;
				while (!node.included) {
					node.included = true;
                    if (node.type === NODETYPE.PROGRAM) break;
                    node = <Node>node.parent;
                        
                    
				}
			});

        }
    }
}
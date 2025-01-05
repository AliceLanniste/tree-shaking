import { ExportDefaultDeclaration } from "../node";
import FunctionDeclaration from "../node/FunctionDeclaration";
import Identifier from "../node/Identifier";
import LocalVariable from "./LocalVariable";
import Variable from "./Variable";

export default class ExportDefaultVariable extends LocalVariable {
    isDefault = true;
	hasId: boolean;

    private original:Variable | null =null
    constructor(name: string, exportDefaultDeclaration: ExportDefaultDeclaration) {
        super(name, exportDefaultDeclaration);
        this.hasId = !!(<FunctionDeclaration>exportDefaultDeclaration.declaration)
			.id;

    }

   	addReference (identifier: Identifier) {
		this.name = identifier.name;
		if (this.original !== null) {
			this.original.addReference(identifier);
		}
	}

    getName(reset?: boolean) {
    if (!reset && this.safeName) return this.safeName;
	if (this.original !== null) return this.original.getName();
		return this.name;
    }


    setOriginalVariable(original: Variable) {
        this.original = original
    }
    
    refernceOrignal() {
        return this.original && !this.isReassigned && !this.original.isReassigned;
    }
    

    getOriginalVariableName() {
		return this.original && this.original.getName();
	}

}
import ClassDeclaration from "../node/ClassDeclaration";
import ExportDefaultDeclaration from "../node/ExportDefaultDeclaration";
import FunctionDeclaration from "../node/FunctionDeclaration";
import Identifier from "../node/Identifier";
import { NODETYPE } from "../shared/NodeType";
import LocalVariable from "./LocalVariable";

export class ExportDefaultVariable extends LocalVariable { 
    isDefault = true;
    
    hasId: boolean;
    private orignalId?: Identifier;
    constructor(name: string, exportDefaultDeclaration: ExportDefaultDeclaration) {
        super(name, exportDefaultDeclaration,exportDefaultDeclaration.declaration);
        const declaration = exportDefaultDeclaration.declaration;

        if(
            (declaration.type === NODETYPE.FUNCTION_DECLARATION || 
             declaration.type === NODETYPE.CLASS_DECLARATION) &&
             (<FunctionDeclaration | ClassDeclaration>declaration).id
        )  {
                this.hasId = true;
                this.orignalId = (<FunctionDeclaration | ClassDeclaration>declaration).id;
            } else if (declaration.type === NODETYPE.IDENTIFIER) {
                this.orignalId = <Identifier>declaration;
            }
    }

    addReference(identifier: Identifier) {
        this.name = identifier.name;
    }

    getOriginalVariableName() {
        return this.orignalId?.name ?? null;
    }
}
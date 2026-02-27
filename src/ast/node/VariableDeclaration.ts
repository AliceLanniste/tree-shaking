import { NodeBase, NODETYPE } from "../shared";
import VariableDeclarator from "./VariableDeclarator";

export default class VariableDeclaration extends NodeBase { 
    type: NODETYPE.VARIABLE_DECLARATION;
    declarations:VariableDeclarator[];
}

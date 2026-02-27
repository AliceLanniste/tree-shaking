import Identifier from "./Identifier";
import { NodeBase, NODETYPE } from "../shared";

export default class FunctionDeclaration extends NodeBase { 
    type: NODETYPE.FUNCTION_DECLARATION;
    id: Identifier;
}

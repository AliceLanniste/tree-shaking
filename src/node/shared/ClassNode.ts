import ClassBody from "../ClassBody";
import Identifier from "../Identifier";
import { ExpressionNode, NodeBase } from "./Node";

export default class ClassNode extends NodeBase {
    id: Identifier | null; 
    body: ClassBody;
    superClass: ExpressionNode | null;
}
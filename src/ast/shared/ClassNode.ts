import ClassBody from "../node/ClassBody";
import Identifier from "../node/Identifier";
import { ExpressionNode, NodeBase } from "./Node";

export default class ClassNode extends NodeBase {
    id: Identifier | null; 
    body: ClassBody;
    superClass: ExpressionNode | null;
}
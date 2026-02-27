import MethodDefinition from "./MethodDefinition";
import { NodeBase, NODETYPE } from "../shared";

export default class ClassBody extends NodeBase {
    type: NODETYPE.CLASS_BODY;
    body: MethodDefinition[];

    private classConstructor: MethodDefinition | null;
}
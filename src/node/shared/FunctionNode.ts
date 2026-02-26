import BlockStatement from "../BlockStatement";
import Identifier from "../Identifier";
import { NodeBase } from "./Node";
import PatternNode from "./Pattern";

export default class FunctionNode extends NodeBase { 
    id: Identifier | null;
    params: PatternNode[];
    body: BlockStatement;

}
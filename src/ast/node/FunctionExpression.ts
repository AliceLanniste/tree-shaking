import { NODETYPE } from "../shared";
import FunctionNode from "../shared/FunctionNode";

export default class FunctionExpression extends FunctionNode { 
    type: NODETYPE.FUNCTION_EXPRESSION;
}
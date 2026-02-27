import FunctionExpression from "./FunctionExpression";
import { ExpressionNode, NodeBase, NODETYPE } from "../shared";

export default class MethodDefinition extends NodeBase {
  computed: boolean;
  key: ExpressionNode;
  kind: 'constructor'|'method' | 'get' | 'set';
  static: boolean;
  value: FunctionExpression; 
  type: NODETYPE.METHOD_DEFINITION;
}
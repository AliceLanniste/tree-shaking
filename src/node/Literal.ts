import { NodeBase, NODETYPE } from "./shared";

type LiteralValueType = string | number | boolean | null | RegExp | undefined;
export default class  Literal<T = LiteralValueType> extends NodeBase {
  type: NODETYPE.LITERAL;
  value: T;
}
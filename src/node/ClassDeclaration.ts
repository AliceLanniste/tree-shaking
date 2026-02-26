import Identifier from "./Identifier";
import ClassNode from "./shared/ClassNode";
import { NODETYPE } from "./shared";

export default class ClassDeclaration extends ClassNode {
  id: Identifier;
  type: NODETYPE.CLASS_DECLARATION;
}
import { Node } from "acorn"
import Scope from "../utils/scope"
// 
export type ScopeNode = {
  node: Node,
  scope: Scope | null,
  type:string
}


// export interface ScopeNode extends Node {
//     node:Node,
//     scope: Scope | null,
//     type:string
// }
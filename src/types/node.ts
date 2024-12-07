import Scope from "../utils/scope";
import { Node } from "acorn";
export interface ScopeNode extends Node {
    _scope?: Scope
}
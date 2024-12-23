import Identifier from "../node/Identifier";
import LocalVariable from "./LocalVariable";

export default class ParameterVariable extends LocalVariable {
    constructor(identifier: Identifier) {
        super(identifier.name, identifier);
    }
}
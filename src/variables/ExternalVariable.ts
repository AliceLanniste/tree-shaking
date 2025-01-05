import ExternalModule from "../ExternalModule";
import Variable from "./Variable";

export default class ExternalVariable extends Variable {
    included: boolean =true
    module: ExternalModule;
	isExternal = true;
	isNamespace: boolean;
	referenced: boolean;

    constructor(module: ExternalModule, name: string) {
        super(name);
        this.module = module   
        this.isNamespace = name === '*'
        this.referenced = false
    }

getName() {
    if (this.isNamespace) {
        return this.module.id
    }
    return super.getName();
}
}
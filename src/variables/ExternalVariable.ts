import Variable from "./Variable";

export default class ExternalVariable extends Variable {
    included: boolean =true
    moduleName: string;
    isNameSpace: boolean; 
    constructor(moduleName: string, name: string) {
        super(name);
        this.moduleName = moduleName   
        this.isNameSpace = name === '*'
    }
}
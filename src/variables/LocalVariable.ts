import { ExportDefaultDeclaration, Identifier } from "../node";
import Variable from "./Variable";

export default class LocalVariable extends Variable { 
  declarations: Set<Identifier | ExportDefaultDeclaration>;

  constructor(name: string, identifier: Identifier | ExportDefaultDeclaration | null) 
  {
    super(name);
    this.declarations=new Set([identifier]);
  }

  addDeclaration(declaration:Identifier) {
    this.declarations.add(declaration);
  }

  include() {
    
  }
}
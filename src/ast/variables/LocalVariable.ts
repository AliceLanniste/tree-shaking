import Module from "../../Module";
import { ExportDefaultDeclaration, Identifier } from "../node";
import { Entity } from "../shared/Entity";
import Variable from "./Variable";

export default class LocalVariable extends Variable { 
  declarations: (Identifier | ExportDefaultDeclaration)[];
  init: Entity | null;
  module: Module;
  isLocal: boolean = true;

  constructor(name: string, 
    declarator: Identifier | ExportDefaultDeclaration | null,
    init: Entity | null,
  ) 
  {
    super(name);
    this.declarations= declarator ? [declarator] : [];
    this.init = init;
  }

  addDeclaration(declaration:Identifier) {
    this.declarations.push(declaration);
  }

  include() {
    
  }
}
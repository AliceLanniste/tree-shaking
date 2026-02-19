import { parse,
		Program as AcornProgram } from "acorn";
import { moduleImport } from "./types";
import MagicString from "magic-string";
import ExportAllDeclaration  from './node/ExportAllDeclaration';
import ExportDefaultDeclaration  from './node/ExportDefaultDeclaration';
import ExportNamedDeclaration from './node/ExportNamedDeclaration';
import Identifier from './node/Identifier';
import ImportDeclaration from './node/ImportDeclaration';
import Program from './node/Program';
import { ERR_CODE, error } from "./error";
import { ASTContext } from "./node/utils";
import Scope from "./scopes/Scope";
import GlobalScope from "./scopes/GlobalScope";
import { NODETYPE } from "./node/shared";
import ImportSpecifier from "./node/ImportSpecifier";
import { isExportDefaultDeclaration } from "./node/ExportDefaultDeclaration";
import FunctionDeclaration from "./node/FunctionDeclaration";

export default class Module {
    id:string;
    isExternal: boolean = false;
    source: string;
    comments:Comment[] =[];
    magicString: MagicString;
    originalAst: AcornProgram;
    ast: Program;
    astContext: ASTContext;
    dependencies: string[] =[];
    exportAllSources:string[] = [];
    exports:Record<string, any> = {};
    reexports:Record<string, any> = {};
    imports:Record<string, moduleImport> = {};
    scope:Scope;
    constructor(
       id: string,
    ) {
       this.id = id;
    }

    setSource(code:string) {
        this.source = code;
        this.magicString = new MagicString(this.source, {filename: this.id});
        this.originalAst = this.parse(this.source)
        this.astContext = {
            code: this.source,
            magicString: this.magicString,
            filename: this.id,
            nodeConstructor: {},
            imports: this.imports,
            exports: {},
            addExport: this.addExport.bind(this),
            addImport: this.addImport.bind(this),
        }
        this.scope = new GlobalScope({isModuleScope:false});
        this.ast = new Program(this.originalAst, 
            {type:'Module',context: this.astContext},
            this.scope
        )
    }

    parse(code:string): AcornProgram {
        return this._parseAST(code)
    }

    addImport(node: ImportDeclaration) {
        const source = <string>node.source.value;
        if (!this.dependencies.includes(source)) this.dependencies.push(source);
        const specifiers = node.specifiers;
        for(const specifier of specifiers) {
            const localName = specifier.local.name;
            if (this.imports[localName]) {
                error({code:ERR_CODE.DUPLICATE_IMPORT, message:localName});
            }

            const isDefault = specifier.type === NODETYPE.IMPORT_DEFAULT_SPECIFIER;
            const isNamespace = specifier.type === NODETYPE.IMPORT_NAMESPACE_SPECIFIER;
            const name = isDefault ? 'default' : isNamespace ? '*' : (<ImportSpecifier>specifier).imported.name;
        
            this.imports[localName] ={
                source: source,
                specifier:specifier,
                name: name,
                module: this
            }
       }
   }

    addExport(node: ExportAllDeclaration | ExportNamedDeclaration | ExportDefaultDeclaration) {
        const source = (<ExportAllDeclaration>node).source &&<string>(<ExportAllDeclaration>node).source.value;
        if (source) {
            if (!this.dependencies.includes(source)) this.dependencies.push(source);
            if (node.type === NODETYPE.EXPORT_ALL_DECLARATION) {
                this.exportAllSources.push(source);
            } else {
                for(const specifier of (<ExportNamedDeclaration>node).specifiers) { 
                   const name = specifier.exported.name;
                   if(this.exports[name] || this.reexports[name]) {
                    error({
                        code: ERR_CODE.DUPLICATE_EXPORT,
                        message: `Duplicate export ${name}`
                    });
                   }
                   this.reexports[name] = {};
                }
                
            }
        } else if(isExportDefaultDeclaration(node)) {
            const identifier = ((<FunctionDeclaration>node.declaration).id &&
                                    (<FunctionDeclaration>node.declaration).id.name) ||
                                (<Identifier>node.declaration).name;

            if(this.exports.default) {
                error({
                    code: ERR_CODE.DUPLICATE_EXPORT_DEFAULT,
                    message: `Duplicate export default`
                });
            }

            this.exports.default = {
                localName:'default',
                identifier
            }

        } else if((<ExportNamedDeclaration>node).declaration) {
            const declaration =(<ExportNamedDeclaration>node).declaration;
            if(declaration.type === NODETYPE.VARIABLE_DECLARATION){
                for(const decl of declaration.declarations) {
                    const localName = decl.id.name;
                    this.exports[localName] = {localName};
                }
            } else {
                const localName =declaration.id.name;
                this.exports[localName] = {localName};

            }
        } else {
            	for (const specifier of (<ExportNamedDeclaration>node).specifiers) {
                    const localName = specifier.local.name;
                    const exportedName = specifier.exported.name;

                    if(this.exports[exportedName] || this.reexports[exportedName]){
                        error({
                            code: ERR_CODE.DUPLICATE_EXPORT,
                            message: 'duplicate export'
                        })
                    }
                    this.exports[exportedName] = {localName}
                }


        }
    }

   _parseAST(code:string): AcornProgram {
       try {
           return  parse(code, {
             ecmaVersion: 6,
             sourceType: "module",
           })
       } catch(err:any) {
         error({
             code: ERR_CODE.PARSE_ERROR,
             message: err.message
         })
       }
   }
}
import { parse,
		Program as AcornProgram } from "acorn";
import * as acorn from 'acorn';
import { CommentDesc, ExportDescription, ImportDescription, moduleImport, RainbowError, ReexportDescription, Warning } from "./types";
import { locate } from 'locate-character';
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
import { getCodeFrame } from "./utils/util";
import Graph from "./Graph";
import ExternalModule from "./ExternalModule";
import Chunk from "./Chunk";

export default class Module {
    graph: Graph;
    chunk: Chunk;
    execIndex: number;
    id:string;
    isExternal: boolean = false;
    code: string;
    dependencies: (Module | ExternalModule)[] = [];
    comments: CommentDesc[] =[];
    magicString: MagicString;
    originalAst: AcornProgram;
    entryPointHash: Uint8Array = new Uint8Array(10);
    ast: Program;
    imports: { [name: string]: ImportDescription } = Object.create(null);
    exportsAllModules: (Module | ExternalModule)[] = [];
    exports: {[name: string] : ExportDescription} = Object.create(null);
    exportsAllSources: string[] = [];
    reexports: { [name: string]: ReexportDescription } = Object.create(null);
    //store relative path: absolute path
    resolvedIds:Record<string, string> = {};
    astContext: ASTContext;
    exportAllSources:string[] = [];
    scope:Scope;
    isEntryPoint: boolean;
    //importee file 
    sources: string[] = [];
    
    constructor(
       id: string,
       graph: Graph,
    ) {
       this.id = id;
       this.graph = graph;
    }

    setSource(code:string) {
        this.code = code;
        this.magicString = new MagicString(this.code, {filename: this.id});
        this.originalAst = tryParse(this, this.graph.acornParser,this.graph.acornOptions);
        this.astContext = {
            code: this.code,
            magicString: this.magicString,
            filename: this.id,
            nodeConstructor: {},
            imports: this.imports,
            exports: {},
            addExport: this.addExport.bind(this),
            addImport: this.addImport.bind(this),
        }
        this.scope = new GlobalScope({isModuleScope:false});
        this.ast = new Program(
            this.originalAst, 
            {type:'Module',context: this.astContext},
            this.scope
        )
    }

    addImport(node: ImportDeclaration) {
        const source = <string>node.source.value;
        if (!this.sources.includes(source)) this.sources.push(source);
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
                start: specifier.start,
                name: name,
                module: this
            }
       }
   }

   /**
    * @params node: ExportNamedDeclaration | ExportDefaultDeclaration | ExportAllDeclaration
    */
    addExport(node: ExportAllDeclaration | ExportNamedDeclaration | ExportDefaultDeclaration) {
        const source = (<ExportAllDeclaration>node).source &&<string>(<ExportAllDeclaration>node).source.value;
        
        if(source) {
            if (!this.sources.includes(source)) this.sources.push(source);
            //export * from 'source'
            if (node.type === NODETYPE.EXPORT_ALL_DECLARATION) {
                this.exportAllSources.push(source);
            } else {
                for (const specifier of (<ExportNamedDeclaration>node).specifiers){
                    const name = specifier.exported.name;
                    if (this.exports[name] || this.reexports[name]) {
                        this.error({
                            code: ERR_CODE.DUPLICATE_EXPORT,
                            message:`A module have mulitiple exports with the same name (${name})`
                        },
                            specifier.start);
                    }

                    this.reexports[name] = {
                        localName: specifier.local.name,
                        module: null,
                        start: specifier.start,
                        source: source
                    }
                }
            }
                
        }  else if (isExportDefaultDeclaration(node)) {
             if (this.exports.default) {
                this.error({
                    code: ERR_CODE.DUPLICATE_EXPORT,
                    message:`A module can only have one default export`
                },
                    node.start);
             }

             this.exports.default = {
                localName: 'default',
                identifier: null,
                node: node
             }
        } else if ((<ExportNamedDeclaration>node).declaration){
              const declaration = (<ExportNamedDeclaration>node).declaration;
                //export var a = 1,var b = 2;
              if (declaration.type === NODETYPE.VARIABLE_DECLARATION) {
                    for (const decl of declaration.declarations){
                        const localName = decl.id.name;
                        this.exports[localName] = {
                            localName: localName,
                            node: node
                        };
                    }
              } else if (declaration.type === NODETYPE.FUNCTION_DECLARATION) { 
                 const localName = declaration.id.name;
                 this.exports[localName] = {
                    localName: localName,
                    node: node
                };
            }
        } else {
            //export { a , b }
            for (const specifier of (<ExportNamedDeclaration>node).specifiers) {
                const exportedName = specifier.exported.name;
                const localName = specifier.local.name;
                if (this.exports[exportedName] || this.reexports[exportedName]){
                    this.error({
                        code: ERR_CODE.DUPLICATE_EXPORT,
                        message:`A module can only have one export with the name (${exportedName})`
                    },
                        specifier.start);
                }
                this.exports[exportedName] = {
                    localName: localName,
                    node: node
                };
            }
        }
    }

    linkDependencies() { 
        for (const source of this.sources) {
            const  id = this.resolvedIds[source];

            if(id) {
                const module = this.graph.moduleById.get(id);
                this.dependencies.push(module);
            }
        }
    }

    bindReferences() { 
    }

    private addModulesToSpecifiers(specifiers: {
		[name: string]: ImportDescription | ReexportDescription;
	}) {
        for (const name  of Object.keys(specifiers)) {
            const specifier = specifiers[name];
            specifier.module = this.graph.moduleById.get(this.resolvedIds[specifier.source]);
        }
    }


   error(err: RainbowError, pos?: number){
      if (pos !== undefined){
          err.pos = pos;
          let location = locate(this.code, pos,{offsetLine: 1})
        err.frame = getCodeFrame(this.code, location.line, location.column)

      }

   }

   private warn(warning: Warning,pos?: number) {
       if(pos !== undefined) {
            warning.pos = pos;
            
            const {line, column} = locate(this.code, pos,{offsetLine: 1});

            warning.loc = {
                file: this.id,
                line: warning.loc.line,
                column: warning.loc.column
            }

            warning.frame = getCodeFrame(this.code, line,column)
       }
        warning.id = this.id;
        
   }

   render( options: any): MagicString {
    const magicString = this.magicString.clone();
     this.ast.render(magicString,options);
     return magicString;
   }
}

const defaultAcornOptions: acorn.Options = {
    ecmaVersion: 2019,
    sourceType: 'module',
    allowHashBang: true,
}

function tryParse(module: Module, parser: typeof acorn.Parser, acornOptions:  acorn.Options) {
     try {
        return  parser.parse(module.code, {
            ...defaultAcornOptions,
            ...acornOptions,
            onComment:(block:boolean, text: string, start:number, end:number) => module.comments.push({
                block,
                text,
                start,
                end
            })
        })
     } catch (error) {
        let message = error.message.replace(/ \(\d+:\d+\)$/,'');
        if(module.id.endsWith('.json')) {
            message += ' (Note that you need rollup-plugin-json to import JSON files)';
        } else if(!module.id.endsWith('.js')) {
			message += ' (Note that you need plugins to import files that are not JavaScript)';
        }

        module.error({
                code: 'PARSE_ERROR',
                message,
            
        },
        error.pos
      );
     }  
     
    
}

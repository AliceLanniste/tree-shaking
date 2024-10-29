import { Module } from "./Module";
import { ModuleLoader } from "./ModuleLoader";
import { Statement } from "./node/Statement";
import { type rainbowOptions } from "./types";
import { normalizeModules } from "./utils/utils";
import { sep } from 'path';
import * as magicString from "magic-string";
import  finalisers from './finalisers/index'
export class Graph {
    readonly moduleLoader:ModuleLoader;
    readonly modulesById = new Map<string, Module>();
    names: Record<string, Record<string, string>> = {};
    usedNames: Record<string, boolean> = {};
    base: string;
    constructor(
        private readonly options: rainbowOptions,
    ) {
        this.moduleLoader = new ModuleLoader(this,this.modulesById,options);        
        this.base = options.base || process.cwd()
    } 

    async createModuleGraph():Promise<Statement[]> {
       return await this.generateModuleGraph()
    }

    async generateModuleGraph():Promise<Statement[]> {
        let moduleLoader = await this.moduleLoader.addEntryModule(normalizeModules(this.options), true);
        return moduleLoader.bodyStatement;
    }

    async generate(options: any) {
        const magicBundler = new magicString.Bundle();
        let moduleStatements = await this.generateModuleGraph()
        moduleStatements.forEach(statement => {
            magicBundler.addSource(statement.source)
        })
        let finaliser = finalisers[options.format || 'es6']
        let magicCodeString = finaliser(this, magicBundler, options)
        
        return {
            code:  magicCodeString ? magicCodeString.toString(): '',
            map: null
        }
    }
    
    storeNames(module:Module,exportedName:string, importName:string) {
        if (!(Object.hasOwn(this.names,module.path))) {
            this.names[module.path] = {}
        }
        const moudleNames = this.names[module.path] 
        if (!Object.hasOwn(moudleNames, importName)) {
            const relativePart = module.path.split(sep)

            while (Object.hasOwn(this.usedNames, importName) && relativePart.length) {
                 importName = `${relativePart.pop()}_${importName}`
            }
            while (Object.hasOwn(this.usedNames, importName)) {
                   importName = `_${importName}`
            }
            this.usedNames[importName] = true
           moudleNames[exportedName] = importName
        }

    }

    getName(module:Module,exportedName: string) {
        if (!(Object.hasOwn(this.names,module.path))) {
            this.names[module.path] = {}
        }

        const moudleNames = this.names[module.path]
        if (!moudleNames) {
            throw new Error( `Could not get name for ${module.path}:${exportedName}` );
        }
        
        return moudleNames[exportedName];
    }    
}
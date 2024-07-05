import fs from "fs";
import path from "path";
import esprima from "esprima";
import estraverse from "estraverse";
import escodegen from "escodegen";


function parseEntry(entry,modules) {

}

function collectedUsedModule(modules)  {

}

export  default function  bundle(entry) {
    let modules = {}
    parseEntry(entry,modules)

    const usedModule = collectedUsedModule(modules)

    let bundleOutput =''
    for (const filePath in modules) {
        const { ast } = modules[filePath]
        bundleOutput = escodegen.generate(ast) +'\n'
    }

    return bundleOutput
}

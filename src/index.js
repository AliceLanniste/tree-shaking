import fs from "fs";
import path from "path";
import esprima from "esprima";
import estraverse from "estraverse";
import escodegen from "escodegen";


function parseEntry(entry,modules) {
  let content = fs.readFileSync(entry,'utf-8')
  let ast =esprima.parseModule(content)

  estraverse.traverse(ast,{
    enter(node) {
        if (node.type === 'ImportDeclaration') {
            const importPath = path.resolve(path.dirname(filePath),node.source.value+'.js')
            if(!modules[importPath]) {
                parseEntry(importPath,modules)
            }
        }
    }
  })
  modules[filePath] = {content, ast}
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

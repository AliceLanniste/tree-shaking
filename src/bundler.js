import fs from "fs";
import path from "path";
import esprima from "esprima";
import estraverse from "estraverse";
import escodegen from "escodegen";


function parseEntry(filePath,modules) {
  let content = fs.readFileSync(filePath,'utf-8')
  let ast =esprima.parseModule(content)

  estraverse.traverse(ast,{
    enter(node) {
        if (node.type === 'ImportDeclaration') {
            const importPath = path.resolve(path.dirname(filePath),node.source.value)
            if(!modules[importPath]) {
                parseEntry(importPath,modules)
            }
        }
    }
  })
  modules[filePath] = {content, ast}
}

function collectedUsedModule(modules)  {
    const usedExports = new Set();
     for (const filePath in modules ) {
           const { ast } = modules[filePath]

           estraverse.traverse(ast ,{
            enter(node) {
                if(node.type ==='ImportDeclaration') {
                    node.specifiers.forEach((specifier) =>{
                        usedExports.add(specifier.imported.name)
                    })
                }
            }
           })
     }

     return usedExports;
}

export  default function  bundle(entry) {
    let modules = {}
    parseEntry(entry,modules)

    const usedExports = collectedUsedModule(modules)

    let bundleOutput =''
    for (const filePath in modules) {
        const { ast } = modules[filePath]
        bundleOutput = escodegen.generate(ast) +'\n'
    }

    return bundleOutput
}

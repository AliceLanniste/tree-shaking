

export default function es6(bundle, magicString,{ exportMode }, options=null) {
   let importBlock =''
     bundle.externalModules
        .forEach(module => {
            let specifiers = []

            if (module.needsDefault) {
               
            }
            if (module.isNamespace) {
                 module.namespaceImport.forEach(aliasElement => {
                
                let importe = `* as  ${aliasElement}`
                importBlock += `import ${importe} from ${module.id};\n`

                })


                    
            }
            
            if (module.needsNamed) {
                specifiers = specifiers.concat(module.exportNames)
                importBlock += `import { ${specifiers.join(', ')} } from ${module.id};\n`

                
            }
            if (!specifiers.length) {
                importBlock += `import {${ module.id}};\n`
            }

        })
    
    if (importBlock.length) {
        magicString.prepend( importBlock + '\n\n' );
    }
    if (exportMode) {
        
    }
    return magicString.trim()
}
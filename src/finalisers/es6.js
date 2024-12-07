

export default function es6(bundle, magicString,{ exportMode }, options=null) {
    const importBlock = bundle.externalModules
        .map(module => {
            let specifiers = []
            if (module.needsDefault) {
               
            } else if (module.isNamespace) {
                
                specifiers.push( `* as  ${module.exportNames.pop()}`)
            }
            else {
                specifiers =specifiers.concat(module.exportNames)
                
            }
            return specifiers.length ?
                    module.isNamespace ? 
                    `import ${specifiers} from ${module.id};`
                    : `import { ${specifiers.join(', ')} } from ${module.id};`
                :`import { ${module.id} };`
        })
    
    if (importBlock.length) {
        magicString.prepend( importBlock + '\n\n' );
    }

    return magicString.trim()
}
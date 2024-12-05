

export default function es6(bundle, magicString) {
    const importBlock = bundle.externalModules
        .map(module => {
            let specifiers = []

            if (!module.needsDefault) {
                specifiers = module.exportNames
            }
            return specifiers.length ?
                `import { ${specifiers.join(', ')} } from ${module.id}`
                :`import { ${module.id} }`
        })
    
    if (importBlock.length) {
        magicString.prepend( importBlock + '\n\n' );
    }

    return magicString.trim()
}
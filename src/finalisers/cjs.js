export default function cjs ( bundle, magicString, { exportMode }, options ) {
	let intro = options.useStrict === false ? `` : `'use strict';\n\n`;
	// TODO handle empty imports, once they're supported
	// const importBlock = bundle.externalModules
    //     .map(module => {
    //      let requireStatement = ''

	// 		if ( module.needsDefault ) {
	// 			requireStatement += '\n' + ( module.needsNamed ? `var ${module.name}__default = ` : `${module.name} = ` ) +
	// 				`'default' in ${module.name} ? ${module.name}['default'] : ${module.name};`;
	// 		} else if (module.isNamespace) {
	// 			let export_str = module.exportNames.pop()
	// 			requireStatement += `var ${export_str} = require('${module.id}')`
				
	// 		} else {
	// 		let export_str = module.exportNames.join(' ,')
	// 		requireStatement += `var { ${export_str} } = require('${module.id}');`;
	// 		}

	// 		return requireStatement;
	// 	})
	// 	.join( '\n' );

	// if ( importBlock ) {
	// 	intro += importBlock + '\n\n';
	// }
	let importBlock = ''
	bundle.externalModules
		.forEach(module => {
			let specifiers = []
			if (module.needsDefault) {
				
			}
			if (module.isNamespace) {
				const namespaceStatement = module.namespaceImport.map(aliasElement => {
					let namespaceIdentifier = aliasElement
					return `var ${namespaceIdentifier} = require('${module.id}');`

				}).join('\n')
				importBlock += namespaceStatement
			}

			if (module.needsNamed) {
				specifiers = specifiers.concat(module.exportNames)
                importBlock += `var { ${specifiers.join(', ')} } = require('${module.id}');\n`

			}
		  })

		if ( importBlock ) {
		intro += importBlock + '\n\n';
	}
	magicString.prepend( intro );
	
	const exportBlock = getExportBlock(exportMode)
	if (exportBlock) magicString.append('\n\n' + exportBlock)
	// const exportBlock = getExportBlock( bundle, exportMode, 'module.exports =' );
	// if ( exportBlock ) magicString.append( '\n\n' + exportBlock );

	return magicString;
}


function getExportBlock(exports) {
	const exportStatement=	Object.keys(exports).map(key => {
		let { exportedName, localName, exportMode } = exports[key]
		   if (exportMode === 'named') {
			return `exports.${exportedName} = ${localName}`

		   }
	     }).join('\n')
	return exportStatement
	// if (exportMode === 'default') {
	// 	return
	// }
	
}
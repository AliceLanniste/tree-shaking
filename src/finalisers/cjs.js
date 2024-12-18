export default function cjs ( bundle, magicString, { exportMode, exportReplacements }, options ) {
	let intro = options.useStrict === false ? `` : `'use strict';\n\n`;
	let importBlock = ''
	let needIntrop = false
	bundle.externalModules
		.forEach(module => {
			let specifiers = []
			if (module.defaultImports) {
				needIntrop = true
				if (module.exportNames) {
					
				}
				const defaultStatement = `var ${module.name} = _interopDefault(require('${module.id}')) `
				importBlock += defaultStatement
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
		  if (needIntrop ) {
			intro += `function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }\n\n`;

		  }
	
		if ( importBlock ) {
		intro += importBlock + '\n\n';
	}
	magicString.prepend( intro );
	
	const exportBlock = getExportBlock(exportMode,exportReplacements)
	if (exportBlock) magicString.append('\n\n' + exportBlock)

	return magicString;
}


function getExportBlock(exports,exportReplacements) {
	const exportStatement=	Object.keys(exports).map(key => {
		let { exportedName, localName, exportMode } = exports[key]
		const finalName = exportReplacements[localName] || localName
		if (exportMode === 'default') {
			return `module.exports = ${exportedName}`	
		}
			if (exportMode === 'named') {
			return `exports.${exportedName} = ${finalName}`

		   }
	     }).join('\n')
	return exportStatement
	// if (exportMode === 'default') {
	// 	return
	// }
	
}
export default function cjs ( bundle, magicString, {  exports, exportReplacements }, options ) {
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
			if (module. exportedNamespace) {
				// const namespaceStatement = module.namespaceImport.map(aliasElement => {
				// 	let namespaceIdentifier = aliasElement
				// 	return `var ${namespaceIdentifier} = require('${module.id}');`

				// }).join('\n')
			  let namespaceStatement =`var ${module.name || module.id} = require('${module.id}');\n`
				importBlock += namespaceStatement
			}

			if (module.exportedNamed) {
				specifiers = Object.keys(module.declarations)
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


	const exportBlock = getExportBlock(exports)

	if (exportBlock) magicString.append('\n\n' + exportBlock)

	return magicString;
}


function getExportBlock(exports = {}) {
	const { exportMode, exported, localed } = exports
		if (exportMode === 'default') {
			return `module.exports = ${localed}\n`	
		}
			if (exportMode === 'named') {
			return `exports.${exported} = ${localed}\n`

		   }
	     }
	
	

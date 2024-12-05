export default function getExportBlock ( bundle, exportMode, mechanism = 'return' ) {
	if ( exportMode === 'default' ) {
		const defaultExport = bundle.entryModule.exports['Default'];

		const defaultExportName = bundle.entryModule.replacements.default ||
			defaultExport.identifier;

		return `${mechanism} ${defaultExportName};`;
	}

	return bundle.toExport
		.map( name => {
			const prop = name === 'Default' ? `['Default']` : `.${name}`;
			name = bundle.traceExport( bundle.entryModule, name );
			return `exports${prop} = ${name};`;
		})
		.join( '\n' );
}

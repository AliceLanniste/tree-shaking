import path from 'node:path';
import assert from 'assert';

module.exports = {
	description: 'uses a custom path resolver (synchronous)',
	options: {
		plugins: [{
			resolveId: function (importee, importer) {
				if (path.normalize(importee) === path.resolve(__dirname, 'main.js')) return importee;	
				if (importee === 'foo') return path.resolve(__dirname, 'bar.js');

				return false;
			}
		}]
	},
	warnings: [
		{
			code: 'UNRESOLVED_IMPORT',
			importer: 'main.js',
			source: 'path',
			message: `'path' is imported by main.js, but could not be resolved – treating it as an external dependency`,
		}
	],
	exports: function ( exports ) {
		assert.strictEqual( exports.path, require( 'path' ) );
	},
	skip:true
};

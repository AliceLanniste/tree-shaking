var assert = require( 'assert' );

module.exports = {
	description: 'exports a default value as exports object',
	exports: function (exports) {
		assert.equal( exports, 42 );
	},
};

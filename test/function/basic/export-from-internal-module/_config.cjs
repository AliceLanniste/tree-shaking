module.exports = {
	description: 'exports from an internal module',
	exports: function (exports, assert) {
		console.log("nemade-exports", exports);
		assert.equal( exports.foo, 42 );
	},
	solo:true
};
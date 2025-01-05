import assert from "assert";

module.exports = {
	description: 'remove unused variables from declarations (#1937)',
	exports(exports) {
		assert.deepEqual(exports(), [0.07]);
	},
	solo: true,
	show: true
};

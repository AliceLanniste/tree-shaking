'use strict';

var { relative } = require('path');


//# main.js


var path$1 = 'foo/bar/baz';
var path2 = 'foo/baz/bar';

assert.equal( relative( path$1, path2 ), '../../baz/bar' );
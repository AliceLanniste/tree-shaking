'use strict';

var { relative } = require('path');

//# /root/program/tree-shaking/test/form/basic/external-module/main.js.js

var _path = 'foo/bar/baz';
var path2 = 'foo/baz/bar';

assert.equal( relative( _path, path2 ), '../../baz/bar' );
import * as  path from path;
import {path};


//# /root/program/tree-shaking/test/form/basic/import-namespace-from-external-module/main.js


var path1 = 'foo/bar/baz';
var path2 = 'foo/baz/bar';

assert.equal( path.relative( path1, path2 ), '../../baz/bar' );
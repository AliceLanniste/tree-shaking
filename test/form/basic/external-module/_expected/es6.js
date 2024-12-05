import { relative } from path

var _path = 'foo/bar/baz';
var path2 = 'foo/baz/bar';

assert.equal( relative( _path, path2 ), '../../baz/bar' );
'use strict';

var ext = require('external');var { a, b } = require('external');


//# /root/program/tree-shaking/test/form/basic/import-external-module/main.js


// import './foo'
console.log(ext, a, b)
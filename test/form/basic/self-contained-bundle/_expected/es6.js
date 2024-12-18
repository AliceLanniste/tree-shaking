//# foo.js
function foo () {
	return bar();
}

function bar () {
	return 42;
}

function baz () {
	return 'this should be excluded';
}

//# main.js


// comment before 1

console.log( 1 );
console.log( 2 ); // comment alongside 2
foo();
console.log( 3 );
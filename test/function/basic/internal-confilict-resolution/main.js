import { assert } from 'console';
import foo from './foo';

function bar () {
	return foo();
}

assert(bar(), 42)

export { foo } from './foo';

// "'use strict';\n\nvar foo = 42;\n\nexports.foo = foo;\n",
//'var foo = 42;\n\nexport { foo };\n'
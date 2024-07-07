import fs from "fs";
import path from "path";
import bundle from "./src/bundler.js";
const __dirname = path.resolve();
const entryFile = path.resolve(__dirname, 'src/examples/main.js');
const bundledCode = bundle(entryFile);

// Write the bundled code to a file
fs.writeFileSync(path.resolve(__dirname, 'dist/bundle.js'), bundledCode);

console.log('Bundling complete. Check the dist/bundle.js file.');
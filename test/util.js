import { readdirSync } from 'node:fs';
import { describe } from 'vitest';
import {join } from 'path';

export function  runTestsWithSample(suitname, testDirectory, runTest) {
    describe(suitname, ()=>runSamples(testDirectory, runTest))
    
}


function runSamples(sampleDirectory,runtest) {

    for (const fileName of readdirSync(sampleDirectory)
        .filter(name => name[0] !== '.')
		.sort()) {
         runTestsInDirecotry(join(sampleDirectory, fileName),runtest);
    }
}



function runTestsInDirecotry(directory, runtest) {
     const fileNames = readdirSync(directory);
     if (fileNames.includes('_config.js')) {
        loadConfigAndRunTest(directory,runtest)
     }
}


function loadConfigAndRunTest( directory, runTest) {
    const configFile = join(directory,"_config.js");
    const config = import(configFile);
    runTest(directory,config)
}



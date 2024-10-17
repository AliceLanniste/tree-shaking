import { readdirSync } from 'node:fs';
import { describe } from 'vitest';
import {join } from 'path';

export function  runTestsWithSample(suitname, testDirectory, runTest) {
    describe(suitname, async ()=> await runSamples(testDirectory, runTest))
    
}


async function runSamples(sampleDirectory,runtest) {

    for (const fileName of readdirSync(sampleDirectory)
        .filter(name => name[0] !== '.')
		.sort()) {
        await runTestsInDirecotry(join(sampleDirectory, fileName),runtest);
    }
}



async function runTestsInDirecotry(directory, runtest) {
     const fileNames = readdirSync(directory);
     if (fileNames.includes('_config.js')) {
        await loadConfigAndRunTest(directory,runtest)
     }
}


async function   loadConfigAndRunTest( directory, runTest) {
    const configFile = join(directory,"_config.js");
    const config =  await import(configFile);
    runTest(directory,config)
}



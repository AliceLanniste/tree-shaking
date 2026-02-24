import { dirname, resolve } from 'path';
import { afterEach, describe } from 'vitest';
import { existsSync,  readdirSync, rmdirSync, unlinkSync } from 'fs';

type RunTestType = (dir:string,config:any)=>void;

export function extend(target: any) {
    [].slice.call(arguments, 1).forEach(source => {
		source &&
			Object.keys(source).forEach(key => {
				target[key] = source[key];
			});
	});

	return target;
}
export function runTestSuiteWithSamples(suiteName: string, samplesDir:string, runTest:RunTestType,onTearDown?: any) {
    describe(suiteName, () => {
        runSample(samplesDir, runTest, onTearDown);
    });
}
function runSample(samplesDir: string, runTest:RunTestType,onTearDown?: any ) {
    if (onTearDown) {
        afterEach(onTearDown);
    }
    readdirSync(samplesDir)
    .filter(name => name[0] !=='.')
    .sort()
    .forEach(filename => runTestsInDir(resolve(samplesDir, filename), runTest))
}

function runTestsInDir(dir:string, runtest:RunTestType) {
    const fileNames = readdirSync(dir);

    if(fileNames.includes('_config.js')) {
        removeOldOutput(dir);
        loadConfigAndRunTest(dir,runtest);
    } else if(fileNames.includes('_actual.js') || fileNames.includes('_actual')) {
        removeOldOutput(dir);
        removeOldTest(dir);
    } else {
        describe(dirname(dir), ()=>{
            fileNames
            .filter(name => name[0] !=='.')
            .sort()
            .forEach(filename => runTestsInDir(resolve(dir, filename), runtest))
        })
    }
}

function loadConfigAndRunTest(configPath: string, runTest:RunTestType) { 
    let config = loadConfig(configPath + '/_config.js');

    if (config) {
         runTest(configPath,config);
    }
   
}

function loadConfig(configPath: string) {
    try {
        return require(configPath);
    } catch (error: any) {
        if (error.code === 'MODULE_NOT_FOUND') {
            const dir = dirname(configPath);
            removeOldTest(dir);
        } else {
            throw new Error(`Error loading ${configPath}: ${error.message}`);
        }
    }

}

function removeOldTest(dir: string) {
    removeOldOutput(dir);
    console.warn(
		`Test configuration in ${dir} not found.\nTrying to clean up no longer existing test...`
	);
    rmdirSync(dir);
    console.warn('Directory removed.')
}

function removeOldOutput(dir: string) {
    if (existsSync(resolve(dir, '_actual'))) {
        rmdirSync(resolve(dir, '_actual'));
    }

    if (existsSync(resolve(dir, '_actual.js'))) {
        unlinkSync(resolve(dir, '_actual.js'));
    }
}
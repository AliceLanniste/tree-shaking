import { existsSync } from 'fs';
import { runTestSuiteWithSamples } from '../util';
import { basename, resolve } from 'path';


runTestSuiteWithSamples('form', resolve(__dirname, 'samples'),(dir,config)=> {
    const isSingleFormat = existsSync(resolve(dir, '_expected.js'))
    const itOrDescribe = isSingleFormat ? it : describe;
 (config.skip ? itOrDescribe.skip : config.solo ? itOrDescribe.only : itOrDescribe)(
    `${basename(dir)}: ${config.description}`, () => { 
        
    })
})
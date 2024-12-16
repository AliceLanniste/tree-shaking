import { resolve,basename } from 'path'
import { runTestsWithSample } from '../util';
import  rainbowpack from '@src/index'
import assert from "node:assert";
import { test } from 'vitest';

 runTestsWithSample("function",
       resolve(__dirname, "basic"),
       (directory, config) => {
              (config.skip ? test.skip : config.solo ? test.only : test) (
                     basename(directory) + ': ' + config.description,
                 async () => {
                    let config = await import(directory + '/_config');
                    
                        let bundle = await rainbowpack({
                           input:[
                                 {
                                 name:'main',
                                 import: 'main.js'
                              },
                           ],
                           cwd: directory,
                           ...config.options
                         })
                         let result = await bundle.generate({format:'cjs'})
                         try {
                            let fn = new Function('require','module', 'assert', 'exports', result.code);
                            
                            let module = {
                                exports: {}
                             }
                            fn(require, module,assert, module.exports)
                            
                            if (config.exports) {
								      config.exports( module.exports );
							      
                            }

                         } catch (error) {
                            console.log( "error-generate",result.code );
                            throw error;
                         }
                     }
              )
       }
)

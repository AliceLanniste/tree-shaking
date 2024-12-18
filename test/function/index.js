import { resolve,basename } from 'path'
import { compareWarnings, runTestsWithSample } from '../util';
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
                    let warnings = []
                    const captureWarnning=(msg) => warnings.push(msg)
                        let bundle = await rainbowpack({
                           input:[
                                 {
                                 name:'main',
                                 import: directory+'/main.js'
                              },
                           ],
                           onWarn: captureWarnning,
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

                            if (config.warnnings) {
                               compareWarnings(warnnings, config.warnnings)
                            }
                            if (config.show) {
                               console.log("config.show \n", result.code);
                            }

                         } catch (error) {
                            console.log( "error-generate",result.code );
                            throw error;
                         }
                     }
              )
       }
)

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
                        let bundle = await rainbowpack({
                           input:[
                                 {
                                 name:'main',
                                 import: directory +'/main.js'
                                 } 
                              ]
                         })
                         let result = await bundle.generate({format:'cjs'})
                         try {
                            let fn = new Function('require','assert', result.code);
                            fn(require,assert)
                            console.log( "success-generate",result );

                         } catch (error) {
                            console.log( "error-generate",result.code );
                            throw error;
                         }
                     }
              )
       }
)

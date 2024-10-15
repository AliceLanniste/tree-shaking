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
                         let result = bundle.generate({format:'cjs'})
                         try {
                            let fn = new Function('assert', result.code);
                            fn(assert)
                            console.log( "success-generate",result.code );

                         } catch (error) {
                            console.log( "error-generate",result.code );
                            throw error;
                         }
                     }
              )
       }
)

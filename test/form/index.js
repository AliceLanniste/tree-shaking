import { resolve,basename, format } from 'path'
import { runTestsWithSample } from '../util';
import  rainbowpack from '@src/index'
import { test } from 'vitest';
const FORMAT = [
    { format: 'cjs' },
    {format: 'es6' }
]

 runTestsWithSample("form",
       resolve(__dirname, "basic"),
     (directory, config) => {
         FORMAT.forEach(item => {
             (config.skip ? test.skip : config.solo ? test.only : test)(
                  item.format+':'+ basename(directory) + ': ' + config.description,
                  
                  async () => {
                      let dest =`${directory}/_expected/${item.format}.js`
                        let bundle = await rainbowpack({
                           input:[
                                  {
                                  name:'main',
                                  import: 'main.js'
                                  } 
                               ],
                          cwd: directory 
                         })
                       bundle.write({dest ,format:item.format})
                         
                     }
              )
         })     
       }
)

import  typescript from '@rollup/plugin-typescript';
import  commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import { resolve } from 'path';
export default {
    input:{
        'rainbowpack.js': 'src/index.ts'

    },

    output: {
        chunkFileNames: 'shared/[name].js',
        dir: 'dist',
        entryFileNames: '[name]',
        exports: 'named',
        externalLiveBindings: false,
        format: 'es',
        freeze: false,
        generatedCode: 'es2015',
        interop: 'default',
        sourcemap: true
    },

    plugins:[
        nodeResolve(),
        json(),
        commonjs({
            ignoreTryCatch: false,
            include: 'node_modules/**'
        }),
        typescript()
    ],
	
    resolve: {
        alias: {
          '@src': resolve(__dirname, 'src'),
        },
      },
};

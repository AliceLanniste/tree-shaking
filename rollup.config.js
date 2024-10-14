export default {
    input:{
        'rollup.js': 'src/index.ts'

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
	
};

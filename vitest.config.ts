import { defineConfig } from 'vitest/config'
import nodePath from 'node:path'

export default defineConfig({
  test: {
    testTimeout: 20000,
   disableConsoleIntercept:true,
    
  },
  resolve: {
    alias: {
      '@src': nodePath.resolve(__dirname, 'src'),
    },
  },
  esbuild: {
    target: 'node18',
  },
})

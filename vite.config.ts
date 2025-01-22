import { builtinModules } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// eslint-disable-next-line import/order
import { defineConfig } from 'vite'

import analyser from 'vite-bundle-analyzer'
import dts from 'vite-plugin-dts'
import tsconfigPaths from 'vite-tsconfig-paths'

import packageJson from './package.json'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const getPackageName = () => packageJson.name

const getPackageNameCamelCase = () => {
  try {
    return getPackageName().replace(/-./g, char => char[1]!.toUpperCase())
  }
  catch (err) {
    throw new Error('Name property in package.json is missing.')
  }
}

export default defineConfig({
  base: './',
  esbuild: {
    define: {
      'process.env': 'import.meta.env',
    },
    drop: [
      /* 'console' */
      'debugger'
    ],
    keepNames: true,
    treeShaking: true,
    color: true,
  },
  build: {
    target: 'esnext',
    outDir: './dist',
    minify: false,
    sourcemap: false,
    lib: {
      entry: path.resolve(__dirname, 'src/cli.ts'),
      name: getPackageNameCamelCase(),
      formats: ['es'],
      fileName: () => 'cli.js',
      // formats: ['es', 'cjs'],
      // fileName: format => format === 'es' ? 'cli.js' : 'cli.cjs',
    },
    rollupOptions: {
      external: [
        /node_modules/,
        ...builtinModules,
        ...builtinModules.map(m => `node:${m}`),
      ],
      // output: {
      //   chunkFileNames: 'chunks/[name]-[hash].mjs',
      //   assetFileNames: 'assets/[name]-[hash].[ext]',
      //   hoistTransitiveImports: false,
      //   preserveModules: true,
      //   preserveModulesRoot: 'src',
      // },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  plugins: [
    // analyser(),
    tsconfigPaths(),
    dts({
      outDir: './dist/dts',
    })
  ]

})

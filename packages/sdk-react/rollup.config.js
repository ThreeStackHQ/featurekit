// @ts-check
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const external = ['react', 'react-dom', 'react/jsx-runtime', '@featurekit/sdk'];

/** @type {import('rollup').RollupOptions[]} */
export default [
  // ESM build
  {
    input: path.join(__dirname, 'src/index.tsx'),
    output: {
      file: path.join(__dirname, 'dist/index.js'),
      format: 'esm',
      sourcemap: true,
    },
    external,
    plugins: [
      resolve(),
      typescript({
        tsconfig: path.join(__dirname, 'tsconfig.json'),
        noEmit: false,
        declaration: false,
        outDir: undefined,
      }),
    ],
  },
  // CJS build
  {
    input: path.join(__dirname, 'src/index.tsx'),
    output: {
      file: path.join(__dirname, 'dist/index.cjs'),
      format: 'cjs',
      sourcemap: true,
      exports: 'named',
    },
    external,
    plugins: [
      resolve(),
      typescript({
        tsconfig: path.join(__dirname, 'tsconfig.json'),
        noEmit: false,
        declaration: false,
        outDir: undefined,
      }),
    ],
  },
];

import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import pkg from './package.json';

const entrypoint = 'src/index.js';

export default [
  {
    input: entrypoint,
    output: {
      name: 'statezero',
      file: pkg.browser,
      format: 'umd',
    },
    plugins: [commonjs(), resolve()],
  },
  {
    input: entrypoint,
    external: Object.keys(pkg.dependencies),
    output: [{ file: pkg.main, format: 'cjs' }, { file: pkg.module, format: 'es' }],
  },
];

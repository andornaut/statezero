import pkg from './package.json';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';

export default [
  {
    input: 'src/index.js',
    output: {
      name: 'statezero',
      file: pkg.browser,
      format: 'umd',
    },
    plugins: [commonjs(), resolve()],
  },
  {
    input: 'src/index.js',
    external: Object.keys(pkg.dependencies),
    output: [{ file: pkg.main, format: 'cjs' }, { file: pkg.module, format: 'es' }],
  },
];

import ts from '@wessberg/rollup-plugin-ts'
import babel from '@rollup/plugin-babel'

export default {
  input: './src/index.ts',
  output: {
    file: './dist/index.js',
    format: 'cjs',
  },
  plugins: [ts(), babel({ babelHelpers: 'bundled' })],
}

const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const path = require('path');

const srcPath = path.join(__dirname, 'src');

module.exports = (env, argv = {}) => {
  const mode = argv.mode || 'production';
  return {
    mode,
    module: {
      rules: [
        {
          test: /\.js$/,
          include: [srcPath],
          use: {
            loader: 'babel-loader',
          },
        },
      ],
    },
    output: {
      filename: 'statezero.js',
      // https://github.com/webpack/webpack/issues/6525
      globalObject: 'typeof self !== "undefined" ? self : this',
      library: 'statezero',
      libraryTarget: 'umd',
    },
    plugins: [new CleanWebpackPlugin()],
  };
};

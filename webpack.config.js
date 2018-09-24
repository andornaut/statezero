const CleanWebpackPlugin = require('clean-webpack-plugin');
const path = require('path');

const srcPath = path.join(__dirname, 'src');
const testPath = path.join(__dirname, 'test');

module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        include: [srcPath],
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
      {
        test: /\.js$/,
        include: [srcPath, testPath],
        enforce: 'pre',
        loader: 'eslint-loader',
      },
    ],
  },
  plugins: [new CleanWebpackPlugin(['dist'])],
};

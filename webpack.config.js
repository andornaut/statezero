const CleanWebpackPlugin = require('clean-webpack-plugin');
const path = require('path');

const srcPath = path.join(__dirname, 'src');

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
        include: [srcPath],
        enforce: 'pre',
        loader: 'eslint-loader',
      },
    ],
  },
  plugins: [new CleanWebpackPlugin(['dist'])],
};

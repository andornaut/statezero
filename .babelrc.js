module.exports = {
  plugins: ['lodash'],
  presets: [
    [
      '@babel/preset-env',
      {
        corejs: '3',
        useBuiltIns: 'usage',
      },
    ],
  ],
};

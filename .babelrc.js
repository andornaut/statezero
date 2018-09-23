module.exports = {
  presets: [
    [
      /*
      Related:
      https://github.com/tkrotoff/babel-preset-env-example
      https://github.com/facebook/react/issues/13018
      */
      '@babel/preset-env',
      {
        modules: false,
        targets: {
          browser: '1%, not op_mini, ie >= 11',
        },
        useBuiltIns: 'usage',
      },
    ],
  ],
};

const rootConfig = require('../.eslintrc');

module.exports = Object.assign({}, rootConfig, {
  env: {
    mocha: true,
  },
  globals: {
    expect: false,
  },
  plugins: rootConfig.plugins.concat('chai-friendly'),
  rules: Object.assign({}, rootConfig.rules, {
    'no-unused-expressions': 0,
    'chai-friendly/no-unused-expressions': ['error', { allowTaggedTemplates: true }],
  }),
});

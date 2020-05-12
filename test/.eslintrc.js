const rootConfig = require('../.eslintrc');

module.exports = {
  ...rootConfig,
  env: {
    mocha: true,
  },
  globals: {
    expect: false,
  },
  plugins: rootConfig.plugins.concat('chai-friendly'),
  rules: {
    ...rootConfig.rules,
    'no-unused-expressions': 0,
    'chai-friendly/no-unused-expressions': ['error', { allowTaggedTemplates: true }],
  },
};

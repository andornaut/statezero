module.exports = {
  extends: ['airbnb-base'],
  plugins: ['html', 'import'],
  parserOptions: {
    ecmaVersion: 8,
    sourceType: 'module',
  },
  rules: {
    'class-methods-use-this': 0,
    'guard-for-in': 0,
    'import/prefer-default-export': 0,
    'max-len': ['error', { code: 120 }],
    'no-continue': 0,
    'no-param-reassign': 0,
    'no-restricted-syntax': ['error', 'WithStatement'],
    'no-underscore-dangle': 0,
    'no-unused-expressions': ['error', { allowTaggedTemplates: true }],
  },
  env: {
    browser: true,
  },
};

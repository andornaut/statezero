module.exports = {
  env: {
    browser: true,
  },
  extends: ['airbnb-base'],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  plugins: ['eslint-plugin-import-order-alphabetical', 'html', 'import'],
  rules: {
    'class-methods-use-this': 0,
    'func-names': 0,
    'guard-for-in': 0,
    'implicit-arrow-linebreak': 0,
    'import/no-extraneous-dependencies': ['error', { devDependencies: ['test/**/**', 'webpack.config.js'] }],
    'import/prefer-default-export': 0,
    'import-order-alphabetical/order': [
      'error',
      {
        groups: [
          ['builtin', 'external'],
          ['internal', 'parent', 'sibling', 'index'],
        ],
        'newlines-between': 'always',
      },
    ],
    'max-len': ['error', { code: 120 }],
    'no-continue': 0,
    'no-param-reassign': 0,
    'no-restricted-syntax': ['error', 'WithStatement'],
    'no-underscore-dangle': 0,
    'no-unused-expressions': ['error', { allowTaggedTemplates: true }],
    'no-useless-escape': 0,
    'no-var': 0,
    'prefer-arrow-callback': 0,
  },
};

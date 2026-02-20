module.exports = {
  env: {
    browser: true,
    es2020: true,
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
  plugins: ["import", "simple-import-sort", "sort-destructure-keys"],
  rules: {
    "class-methods-use-this": 0,
    "guard-for-in": 0,
    "implicit-arrow-linebreak": 0,
    "import/no-extraneous-dependencies": ["error", { devDependencies: ["test/**/**", "jest.config.js"] }],
    "import/prefer-default-export": 0,
    "max-len": ["error", { code: 120 }],
    "no-continue": 0,
    "no-param-reassign": 0,
    "no-restricted-syntax": ["error", "WithStatement"],
    "no-underscore-dangle": 0,
    "no-unused-expressions": ["error", { allowTaggedTemplates: true }],
    "no-useless-escape": 0,
    "simple-import-sort/exports": "error",
    "simple-import-sort/imports": "error",
    "sort-destructure-keys/sort-destructure-keys": "error",
  },
};

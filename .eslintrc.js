module.exports = {
  env: {
    browser: true,
    es2020: true,
  },
  parserOptions: {
    sourceType: "module",
  },
  plugins: ["simple-import-sort", "sort-destructure-keys"],
  rules: {
    "max-len": ["error", { code: 120 }],
    "simple-import-sort/exports": "error",
    "simple-import-sort/imports": "error",
    "sort-destructure-keys/sort-destructure-keys": "error",
  },
};

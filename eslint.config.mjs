import js from "@eslint/js";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import sortDestructureKeys from "eslint-plugin-sort-destructure-keys";
import globals from "globals";

export default [
  js.configs.recommended,
  {
    files: ["src/**/*.js"],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
      globals: {
        ...globals.browser,
      },
    },
    plugins: {
      "simple-import-sort": simpleImportSort,
      "sort-destructure-keys": sortDestructureKeys,
    },
    rules: {
      "max-len": ["error", { code: 120 }],
      "simple-import-sort/exports": "error",
      "simple-import-sort/imports": "error",
      "sort-destructure-keys/sort-destructure-keys": "error",
    },
  },
  {
    files: ["test/**/*.js"],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.jest,
      },
    },
    plugins: {
      "simple-import-sort": simpleImportSort,
      "sort-destructure-keys": sortDestructureKeys,
    },
    rules: {
      "max-len": ["error", { code: 120 }],
      "simple-import-sort/exports": "error",
      "simple-import-sort/imports": "error",
      "sort-destructure-keys/sort-destructure-keys": "error",
    },
  },
];

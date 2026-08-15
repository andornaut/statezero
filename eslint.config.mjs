import js from "@eslint/js";
import globals from "globals";

import { plugins, sourceRules, toolingRules } from "./eslint.config.base.mjs";

export default [
  {
    ignores: ["dist/**", "node_modules/**"],
  },
  js.configs.recommended,
  {
    files: ["*.config.js"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.node,
      },
      sourceType: "commonjs",
    },
    plugins,
    rules: toolingRules,
  },
  {
    files: ["src/**/*.js"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
      },
      sourceType: "module",
    },
    plugins,
    rules: sourceRules,
  },
  {
    files: ["test/**/*.js"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        ...globals.jest,
      },
      sourceType: "module",
    },
    plugins,
    rules: sourceRules,
  },
];

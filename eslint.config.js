// @ts-check

import js from "@eslint/js";
import vuePlugin from "eslint-plugin-vue";
import globals from "globals";
import prettierConfig from "eslint-config-prettier";

export default [
  { ignores: ["dist"] },
  js.configs.recommended,
  prettierConfig,
  {
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  {
    files: ["**/*.vue"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parser: vuePlugin.parser,
    },
    plugins: {
      vue: vuePlugin,
    },
    rules: {
      // Vue specific rules
      "vue/multi-word-component-names": "off",
      "vue/no-v-html": "warn",
      "vue/require-default-prop": "off",
      "vue/max-attributes-per-line": "off",
      "vue/html-indent": ["error", 2],
      "vue/html-self-closing": "error",
      "vue/component-name-in-template-casing": ["error", "PascalCase"],
      "vue/no-unused-components": "warn",
    },
  },
];

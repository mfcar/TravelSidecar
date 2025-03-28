// @ts-check
const eslint = require("@eslint/js");
const tseslint = require("typescript-eslint");
const angular = require("angular-eslint");
const eslintPluginPrettierRecommended = require("eslint-plugin-prettier/recommended");

module.exports = tseslint.config(
  {
    files: ["**/*.ts"],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
      ...angular.configs.tsRecommended,
      eslintPluginPrettierRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      "@angular-eslint/component-class-suffix": [
        "error",
        {
          "suffixes": ["Page", "Component", "Modal", "Container", "ViewMode"]
        }
      ],
      "@angular-eslint/directive-selector": [
        "error",
        {
          type: "attribute",
          prefix: "ts",
          style: "camelCase",
        },
      ],
      "@angular-eslint/component-selector": [
        "error",
        {
          type: "element",
          prefix: "ts",
          style: "kebab-case",
        },
      ],
      "@angular-eslint/relative-url-prefix": [
        "error"
      ],
      "prettier/prettier": ["error"],
    },
  },
  {
    files: ["**/*.html"],
    extends: [
      ...angular.configs.templateRecommended,
      ...angular.configs.templateAccessibility,
    ],
    rules: {
      "@angular-eslint/template/prefer-self-closing-tags": ["error"],
      "@angular-eslint/template/eqeqeq": ["error"],
      "@angular-eslint/template/prefer-ngsrc": ["error"],
      "@angular-eslint/template/alt-text": ["error"]
      // "@angular-eslint/template/i18n": ["error"]
    },
  }
);

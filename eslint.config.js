// @ts-check
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintPluginAstro from "eslint-plugin-astro";
import globals from "globals";

export default tseslint.config(
  {
    ignores: [
      "dist/",
      ".astro/",
      "node_modules/",
      ".agents/",
      ".claude/",
      "claude-design/",
      "public/",
      "pnpm-lock.yaml",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...eslintPluginAstro.configs["flat/recommended"],
  ...eslintPluginAstro.configs["flat/jsx-a11y-recommended"],
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  }
);

import typescriptEslint from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import reactPlugin from "eslint-plugin-react";
import nextPlugin from "@next/eslint-plugin-next";

export default [
  {
    ignores: [
      "**/.next/**",
      "**/node_modules/**",
      "drizzle/**",
      "*.config.js",
      "*.config.mjs",
      "*.config.ts",
    ],
  },
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: {
      "@typescript-eslint": typescriptEslint,
      "react": reactPlugin,
      "@next/next": nextPlugin,
    },
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
    },
  },
];

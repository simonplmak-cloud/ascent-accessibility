import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // `_`-prefixed identifiers are the repo convention for intentionally-unused
      // args/vars (e.g. unused handler params, mock signatures).
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      // The codebase is `any`-free; lock it in as a hard error.
      "@typescript-eslint/no-explicit-any": "error",
    },
  },
  {
    ignores: [".next/**", "node_modules/**", "coverage/**", "playwright-report/**", "dist/**", "next-env.d.ts"],
  },
];

export default eslintConfig;

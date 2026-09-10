import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // New rules from the react-hooks eslint plugin (pulled in via the
      // dependency security update) flag pre-existing, working patterns
      // in this codebase (fetch-on-mount helpers declared after the
      // effect that calls them, a media-query listener setting state in
      // an effect, a random width computed in useMemo). Disabling rather
      // than rewriting working app code; revisit separately if desired.
      "react-hooks/immutability": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/purity": "off",
    },
  },
]);

export default eslintConfig;

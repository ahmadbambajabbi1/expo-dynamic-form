// module.exports = {
//   parser: "@typescript-eslint/parser",
//   plugins: ["react", "@typescript-eslint", "react-hooks", "react-native"],
//   extends: [
//     "eslint:recommended",
//     "plugin:react/recommended",
//     "plugin:@typescript-eslint/recommended",
//     "plugin:react-hooks/recommended",
//   ],
//   env: {
//     browser: true,
//     es2021: true,
//     node: true,
//     // Remove the problematic environment
//   },
//   parserOptions: {
//     ecmaFeatures: {
//       jsx: true,
//     },
//     ecmaVersion: "latest",
//     sourceType: "module",
//   },
//   rules: {
//     "react/react-in-jsx-scope": "off",
//     "react/prop-types": "off",
//   },
//   settings: {
//     react: {
//       version: "detect",
//     },
//   },
// };
module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
    project: "./tsconfig.json",
    tsconfigRootDir: __dirname,
  },
  plugins: ["@typescript-eslint", "react", "react-hooks"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
  ],
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  settings: {
    react: {
      version: "detect",
    },
  },
  rules: {
    // Disable rules that cause problems in your codebase
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-unused-vars": [
      "warn",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
      },
    ],
    "react-hooks/exhaustive-deps": "warn",
  },
  settings: {
    react: {
      version: "detect",
    },
    "import/resolver": {
      node: {
        extensions: [".js", ".jsx", ".ts", ".tsx"],
      },
    },
  },
};

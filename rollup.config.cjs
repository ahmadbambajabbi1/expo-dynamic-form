const resolve = require("@rollup/plugin-node-resolve");
const commonjs = require("@rollup/plugin-commonjs");
const typescript = require("@rollup/plugin-typescript");
const { babel } = require("@rollup/plugin-babel");
const terser = require("@rollup/plugin-terser");
const peerDepsExternal = require("rollup-plugin-peer-deps-external");
const { dts } = require("rollup-plugin-dts");
const packageJson = require("./package.json");

module.exports = [
  // JS bundle
  {
    input: "src/index.ts",
    output: [
      {
        file: packageJson.main,
        format: "cjs",
        sourcemap: true,
        exports: "named",
      },
      {
        file: packageJson.module,
        format: "esm",
        sourcemap: true,
      },
    ],
    plugins: [
      // Automatically exclude peer dependencies from the bundle
      peerDepsExternal(),

      // Custom plugin to handle React Native modules
      {
        name: "react-native-module-resolution",
        resolveId(source) {
          if (
            source.startsWith("react-native") ||
            source.startsWith("expo") ||
            source.startsWith("@react-native") ||
            source === "react" ||
            source === "react-dom"
          ) {
            return { id: source, external: true };
          }
          return null;
        },
      },

      // Resolve node_modules
      resolve({
        extensions: [".js", ".jsx", ".ts", ".tsx"],
        preferBuiltins: false,
      }),

      // Convert CommonJS modules to ES6
      commonjs(),

      // Compile TypeScript
      typescript({
        tsconfig: "./tsconfig.json",
        sourceMap: true,
        declaration: true,
      }),

      // Transform with Babel
      babel({
        babelHelpers: "bundled",
        presets: [
          "@babel/preset-env",
          "@babel/preset-typescript",
          ["@babel/preset-react", { runtime: "automatic" }],
        ],
        extensions: [".js", ".jsx", ".ts", ".tsx"],
        exclude: "node_modules/**",
      }),

      // Minify output for production
      terser(),
    ],
    // External dependencies that shouldn't be bundled
    external: [
      "react",
      "react-native",
      "expo",
      "expo-location",
      "expo-image-picker",
      "expo-document-picker",
      "expo-file-system",
      "@react-native-async-storage/async-storage",
      "@react-native-community/datetimepicker",
      "react-hook-form",
      "zod",
      "@hookform/resolvers",
      "axios",
      "date-fns",
      /^@expo.*/,
      /^@react-native.*/,
    ],
  },

  // TypeScript declarations
  {
    input: "src/index.ts",
    output: [{ file: "dist/index.d.ts", format: "es" }],
    plugins: [dts()],
  },
];

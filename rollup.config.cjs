const resolve = require("@rollup/plugin-node-resolve");
const commonjs = require("@rollup/plugin-commonjs");
const typescript = require("@rollup/plugin-typescript");
const { babel } = require("@rollup/plugin-babel");
const terser = require("@rollup/plugin-terser");
const peerDepsExternal = require("rollup-plugin-peer-deps-external");
const { dts } = require("rollup-plugin-dts");
const nodePolyfills = require("rollup-plugin-node-polyfills");
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
      {
        name: "react-native-module-resolution",
        resolveId(source) {
          if (
            source.startsWith("react-native") ||
            source.startsWith("expo") ||
            source.startsWith("@react-native")
          ) {
            return { id: source, external: true };
          }
          return null;
        },
      },
      peerDepsExternal(),

      // Add node polyfills - this should come before resolve
      nodePolyfills(),

      // Resolve node_modules
      resolve({
        preferBuiltins: false, // Important for React Native compatibility
        browser: true, // Use browser-compatible versions when available
      }),

      // Convert CommonJS modules to ES6
      commonjs(),

      // Compile TypeScript
      typescript({ tsconfig: "./tsconfig.json" }),

      // Transform modern JS to ES5
      // babel({
      //   // babelHelpers: "bundled",
      //   // exclude: "node_modules/**",
      //   // extensions: [".ts", ".tsx"],
      // }),
      babel({
        babelHelpers: "bundled",
        presets: [
          "@babel/preset-env",
          "@babel/preset-typescript",
          ["@babel/preset-react", { runtime: "automatic" }],
        ],
        exclude: "node_modules/**",
      }),

      // Minify output
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
      "@react-native-async-storage/async-storage",
      "axios",
      "date-fns",
      "@react-native-community/datetimepicker",
      "react-hook-form",
      "zod",
      "@hookform/resolvers/zod",
      "invariant",
      "expo-modules-core",
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

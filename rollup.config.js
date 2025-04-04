import { terser } from "rollup-plugin-terser";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

export default {
  input: ["lib/module/index.js", "lib/commonjs/index.js"],
  output: {
    dir: "lib",
    format: "cjs",
    exports: "named",
    preserveModules: true,
    preserveModulesRoot: "lib",
  },
  plugins: [
    resolve(),
    commonjs(),
    terser({
      compress: true,
      mangle: true,
    }),
  ],
  external: [
    "react",
    "react-native",
    "@hookform/resolvers/zod",
    "zod",
    "react-hook-form",
    "expo-location",
    "expo-document-picker",
    "expo-file-system",
    "expo-image-picker",
    "date-fns",
    "@react-native-async-storage/async-storage",
    "@react-native-community/datetimepicker",
    "axios",
    /^\.{1,2}\//,
  ],
};

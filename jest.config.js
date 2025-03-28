// module.exports = {
//   preset: "jest-expo",
//   testEnvironment: "node",
//   transform: {
//     "^.+\\.(js|jsx|ts|tsx)$": "babel-jest",
//   },
//   moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
//   transformIgnorePatterns: [
//     "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)",
//   ],
//   collectCoverage: true,
//   collectCoverageFrom: [
//     "src/**/*.{ts,tsx}",
//     "!src/**/*.d.ts",
//     "!src/**/*.test.{ts,tsx}",
//   ],
//   setupFilesAfterEnv: ["@testing-library/jest-native/extend-expect"],
//   moduleNameMapper: {
//     // Handle module aliases
//     "^@/(.*)$": "<rootDir>/src/$1",
//   },
// };
module.exports = {
  preset: "jest-expo",
  testEnvironment: "node",
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": [
      "babel-jest",
      {
        presets: ["babel-preset-expo"],
        plugins: ["@babel/plugin-proposal-class-properties"],
      },
    ],
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  transformIgnorePatterns: [
    "node_modules/(?!(jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@unimodules/.*|unimodules|react-navigation|@react-navigation/.*)",
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  setupFilesAfterEnv: ["@testing-library/jest-native/extend-expect"],
  collectCoverage: true,
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/*.test.{ts,tsx}",
  ],
  // p,
  // setupFiles: ["<rootDir>/jest-setup.js"],
};

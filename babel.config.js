module.exports = {
  presets: [
    "@babel/preset-env",
    "@babel/preset-typescript",
    ["@babel/preset-react", { runtime: "automatic" }],
  ],
  plugins: [],
  env: {
    test: {
      presets: [["@babel/preset-env", { targets: { node: "current" } }]],
    },
  },
};

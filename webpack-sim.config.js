const path = require("path");

module.exports = {
  mode: "development",
  entry: "./sim/webxdc.ts",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-typescript"],
          },
        },
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  watch: true,
  output: {
    filename: "webxdc.js",
    path: path.resolve(__dirname, "build-sim"),
  },
};

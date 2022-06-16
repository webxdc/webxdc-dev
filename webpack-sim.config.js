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
            presets: ["@babel/preset-typescript"], // , "babel-preset-solid"],
          },
        },
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  output: {
    filename: "webxdc.js",
    path: path.resolve(__dirname, "build-sim"),
  },
};

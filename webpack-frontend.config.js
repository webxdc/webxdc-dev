const path = require("path");

module.exports = {
  mode: "development",
  entry: "./frontend/index.tsx",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-typescript", "babel-preset-solid"],
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
    filename: "bundle.js",
    path: path.resolve(__dirname, "public"),
  },
};

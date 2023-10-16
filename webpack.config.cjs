const path = require("path");

const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

const dotenv = require("dotenv");
dotenv.config();

const mode = process.env.NODE_ENV || "development";
const devMode = mode === "development";
const target = devMode ? "web" : "browserslist";
const devtool = devMode ? "source-map" : undefined;

module.exports = {
  mode,
  devtool,
  target,
  entry: path.resolve(__dirname, "src", "index.js"),
  output: {
    path: path.resolve(__dirname, "dist"),
    clean: true,
    filename: devMode ? "index.[contenthash].js" : "index.js",
    assetModuleFilename: "assets/[name][ext]"
  },
  devServer: {
    static: {
      directory: path.resolve(__dirname, "dist")
    },
    port: process.env.DEV_SERVER_PORT,
    open: true,
    hot: true
  },
  watchOptions: {
    ignored: "/node_modules"
  },
  module: {
    rules: [
      {
        test: /\.html$/,
        loader: "html-loader"
      },
      {
        test: /\.s?css$/,
        use: [
          devMode ? "style-loader" : MiniCssExtractPlugin.loader,
          "css-loader",
          "postcss-loader",
          "sass-loader"
        ]
      },
      {
        test: /\.[m|c]?js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [["@babel/preset-env", { targets: "defaults" }]]
          }
        }
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "index.html")
    }),
    new MiniCssExtractPlugin({
      filename: devMode ? "[name].[contenthash].css" : "[name].css"
    }),
    new CopyWebpackPlugin({
      patterns: [{ from: path.resolve(__dirname, "src/img/"), to: "assets" }]
    })
  ]
};

import webpackDevMiddleware from "webpack-dev-middleware";
import webpack from "webpack";
import express from "express";
import { createProgram } from "./program";
import config from "../webpack.dev.js";

const compiler = webpack(config);

const program = createProgram({
  injectFrontend: (app) => {
    // in dev mode the webpack-dev-middleware serves the files for us
    // so they are automatically rebuilt
    // we do want to write to disk as the instances requires the webxdc.js
    // simulator
    app.use(webpackDevMiddleware(compiler, { writeToDisk: true }));
  },
  injectSim: (app) => {
    // in dev mode we serve the files from the dist directory
    app.use(express.static("./dist/webxdc"));
  },
});

program.parse();

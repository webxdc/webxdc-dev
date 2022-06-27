#!/usr/bin/env node
import path from "path";
import express from "express";
import { createProgram } from "./program";

const program = createProgram({
  injectFrontend: (app) => {
    // in production we serve the static files ourselves
    // XXX annoying we're also serving dist/backend and dist/webxdc
    app.use(express.static(path.resolve(__dirname, "..")));
  },
  injectSim: (app) => {
    // in production we serve the static files from within the dist directory
    app.use(express.static(path.resolve(__dirname, "../webxdc")));
  },
  getIndexHtml: () => {
    return path.resolve(__dirname, "..", "index.html");
  },
});

program.parse();

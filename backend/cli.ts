#!/usr/bin/env node
import express from "express";
import { createProgram } from "./program";

const program = createProgram((app) => {
  // in production we serve the static files ourselves
  app.use(express.static("./dist"));
});

program.parse();

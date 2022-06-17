#!/usr/bin/env node
import { Command } from "commander";
import { run } from "./run";

function createProgram(): Command {
  const program = new Command();
  program.name("webxdc-dev").description("Tool simulate Webxdc in the browser");

  program
    .command("run")
    .argument("<directory>", "directory with Webxdc")
    .description("Run Webxdc from directory")
    .action((directory) => {
      run(directory);
    });
  return program;
}

const program = createProgram();

program.parse();

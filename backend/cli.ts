#!/usr/bin/env node
import { program } from "commander";

program
  .command("run")
  .argument("<directory>", "directory with Webxdc")
  .description("Run Webxdc from directory")
  .action((directory) => {
    console.log("Running directory: ", directory);
  });

program.parse();

// const options = program.opts();

// console.log(options);

#!/usr/bin/env node
import { program } from "commander";
import { run } from "./run";

program.name("webxdc-dev").description("Tool simulate Webxdc in the browser");

program
  .command("run")
  .argument("<directory>", "directory with Webxdc")
  .description("Run Webxdc from directory")
  .action((directory) => {
    run(directory);
  });

program.parse();

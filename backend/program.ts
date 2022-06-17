import { Command } from "commander";
import { run } from "./run";
import { Inject } from "./run";

export function createProgram(inject: Inject): Command {
  const program = new Command();
  program.name("webxdc-dev").description("Tool simulate Webxdc in the browser");

  program
    .command("run")
    .argument("<directory>", "directory with Webxdc")
    .description("Run Webxdc from directory")
    .action((directory) => {
      run(directory, inject);
    });
  return program;
}

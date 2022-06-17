import { Command } from "commander";
import { run } from "./run";
import { InjectExpress } from "./app";

export function createProgram(injectExpress: InjectExpress): Command {
  const program = new Command();
  program.name("webxdc-dev").description("Tool simulate Webxdc in the browser");

  program
    .command("run")
    .argument("<directory>", "directory with Webxdc")
    .description("Run Webxdc from directory")
    .action((directory) => {
      run(directory, injectExpress);
    });
  return program;
}

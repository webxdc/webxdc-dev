import { Command, InvalidArgumentError } from "commander";
import { run } from "./run";
import { Inject } from "./run";
import { getToolVersion } from "./appInfo";

function parsePort(value: string): number {
  const result = Number(value);
  if (isNaN(result)) {
    throw new InvalidArgumentError("not a number");
  }
  if (result < 0 || result > 65535) {
    throw new InvalidArgumentError("port number out of range");
  }
  return result;
}

export function createProgram(inject: Inject): Command {
  const program = new Command();
  program
    .name("webxdc-dev")
    .description("Tool simulate Webxdc in the browser")
    .version(getToolVersion());

  program
    .command("run")
    .argument(
      "<location>",
      "URL with dev server, path to .xdc file, or path to webxdc dist directory"
    )
    .option(
      "-p, --port <port>",
      "start port for webxdc-dev UI, instance ports are incremented by one each",
      parsePort,
      7000
    )
    .option("-o, --open", "Automatically open instance tabs", false)
    .description(
      "Run webxdc-dev simulator with webxdc from dev server URL, .xdc file or dist directory"
    )
    .action((location, options) => {
      run(location, options.port, inject, options.open);
    });
  return program;
}

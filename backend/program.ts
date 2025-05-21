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
    .command("run", { isDefault: true })
    .argument(
      "[location]",
      "URL with dev server, path to .xdc file, or path to webxdc dist directory",
      ".", // current directory
    )
    .option(
      "-p, --port <port>",
      "start port for webxdc-dev UI, instance ports are incremented by one each",
      parsePort,
      7000,
    )
    .option("--no-csp", "run instances without CSP applied")
    .option(
      "-v, --verbose",
      "Print all messages sent and received by instances",
      false,
    )
    .description(
      "Run webxdc-dev simulator with webxdc from dev server URL, .xdc file or dist directory",
    )
    .action(async (location, options) => {
      await run(
        location,
        { basePort: options.port, csp: options.csp, verbose: options.verbose },
        inject,
      );
    });
  return program;
}

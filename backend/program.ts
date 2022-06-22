import { Command } from "commander";
import { run } from "./run";
import { Inject } from "./run";

export function createProgram(inject: Inject): Command {
  const program = new Command();
  program.name("webxdc-dev").description("Tool simulate Webxdc in the browser");

  program
    .command("run")
    .argument(
      "<location>",
      "URL with dev server, path to .xdc file, or path to webxdc dist directory"
    )
    .option(
      "-p, --port <port>",
      "start port for webxdc-dev UI, instance ports are incremented by one each",
      "7000"
    )
    .description(
      "Run webxdc-dev simulator with webxdc from dev server URL, .xdc file or dist directory"
    )
    .action((location, portString) => {
      const port = Number(portString.port);
      if (isNaN(port) || port < 0 || port > 65535) {
        throw new Error(
          "provided port is invalid: " + JSON.stringify(portString)
        );
      }
      run(location, Number(port), inject);
    });
  program.showHelpAfterError();
  return program;
}

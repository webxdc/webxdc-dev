import { Command } from "commander";
import { run } from "./run";
import { Inject } from "./run";

export function createProgram(inject: Inject): Command {
  const program = new Command();
  program.name("webxdc-dev").description("Tool simulate Webxdc in the browser");

  program
    .command("run")
    .argument("<location>", "Webxdc directory or URL to proxy")
    .option(
      "-p, --port <port>",
      "start port for controller, instance ports are incremented by one each",
      "7000"
    )
    .description("Run Webxdc from directory")
    .action((location, portString) => {
      const port = Number(portString.port);
      if (isNaN(port) || port < 0 || port > 65535) {
        throw new Error(
          "provided port is invalid: " + JSON.stringify(portString)
        );
      }
      run(location, Number(port), inject);
    });
  return program;
}

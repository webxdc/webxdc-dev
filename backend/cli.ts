#!/usr/bin/env node
import { program } from "commander";
import { createFrontend, WebXdc, Instances } from "./app";
import open from "open";

program.name("webxdc-dev").description("Tool simulate Webxdc in the browser");

program
  .command("run")
  .argument("<directory>", "directory with Webxdc")
  .description("Run Webxdc from directory")
  .action((directory) => {
    console.log("Starting Webxdc in: ", directory);
    const webXdc: WebXdc = {
      name: "My App",
      path: directory,
    };
    const frontend = createFrontend();
    frontend.listen(3000, () => {
      console.log("Starting frontend");
    });

    const instances = new Instances(webXdc);

    const peer0 = instances.add(3001);
    const peer1 = instances.add(3002);

    peer0.start();
    peer1.start();

    open("http://localhost:3000");
  });

program.parse();

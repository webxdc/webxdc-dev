#!/usr/bin/env node
import { program } from "commander";
import { createFrontend, createPeer, WebXdc, gossip } from "./app";

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

    const peer0 = createPeer(webXdc);
    const peer1 = createPeer(webXdc);

    gossip([peer0, peer1]);

    peer0.listen(3001, () => {
      console.log("Starting peer at 3001");
    });

    peer1.listen(3002, () => {
      console.log("Starting peer at 3002");
    });
  });

program.parse();

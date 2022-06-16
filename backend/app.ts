import express from "express";
import { WebSocket } from "ws";
import expressWs from "express-ws";

export type WebXdc = {
  name: string;
  path: string;
};

type Instance = {
  app: expressWs.Application;
  port: number;
};

class Instances {
  webXdc: WebXdc;
  instances: Map<number, Instance>;

  constructor(webXdc: WebXdc) {
    this.webXdc = webXdc;
    this.instances = new Map();
  }

  start(port: number) {
    if (this.instances.has(port)) {
      throw new Error(`Already have Webxdc instance at port: ${port}`);
    }
    this.instances.set(port, { app: createPeer(this.webXdc), port: port });
  }
}

function createWsExpress(staticPaths: string[]): expressWs.Application {
  const expressApp = express();
  const { app } = expressWs(expressApp);

  staticPaths.forEach((path) => {
    // maxAge is 0 for no caching, so should be live
    app.use(express.static(path));
  });

  return app;
}

export function createFrontend(): expressWs.Application {
  return createWsExpress(["./public"]);
}

export function createPeer(webxdc: WebXdc): expressWs.Application {
  // layer the simulated directory with webxdc tooling in front of webxdc path
  return createWsExpress(["./build-sim", webxdc.path]);
}

let serial: number = 0;

function distribute(self: WebSocket, webSockets: WebSocket[], update: any) {
  serial++;
  update.serial = serial;
  update.max_serial = serial; // XXX this is always the same
  webSockets.forEach((peerWebSocket) => {
    if (peerWebSocket === self) {
      // we shouldn't send to ourselves
      return;
    }
    console.log("gossip", update);
    peerWebSocket.send(JSON.stringify(update));
  });
}

export function gossip(apps: expressWs.Application[]): void {
  const webSockets: WebSocket[] = [];
  apps.forEach((app) => {
    app.ws("/webxdc", (ws, req) => {
      webSockets.push(ws);
      // when receiving an update from this peer
      ws.on("message", (msg: string) => {
        if (typeof msg !== "string") {
          console.error(
            "webxdc: Don't know how to handle unexpected non-string data"
          );
          return;
        }
        const parsed = JSON.parse(msg);
        // XXX should validate parsed
        const update = parsed.update;

        distribute(ws, webSockets, update);
      });
    });
  });
}

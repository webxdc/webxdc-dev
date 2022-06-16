import express from "express";
import { WebSocket } from "ws";
import expressWs from "express-ws";

type WebXdc = {
  name: string;
  path: string;
};

function createWsExpress(staticPaths: string[]): expressWs.Application {
  const expressApp = express();
  const { app } = expressWs(expressApp);

  staticPaths.forEach((path) => {
    // maxAge is 0 for no caching, so should be live
    app.use(express.static(path));
  });

  return app;
}

function createPeer(webxdc: WebXdc): expressWs.Application {
  // layer the simulated directory with webxdc tooling in front of webxdc path
  return createWsExpress(["./build-sim", webxdc.path]);
}

let serial: number = 0;

function gossip(apps: expressWs.Application[]): void {
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
        serial++;
        update.serial = serial;
        update.max_serial = serial; // XXX this is always the same
        webSockets.forEach((peerWebSocket) => {
          if (peerWebSocket === ws) {
            // we shouldn't send to ourselves
            return;
          }
          console.log("gossip", update);
          peerWebSocket.send(JSON.stringify(update));
        });
      });
    });
  });
}

const hello: WebXdc = {
  name: "My App",
  path: "/home/faassen/projects/webxdc/clean",
};

function main() {
  const helloPeer = createPeer(hello);
  const helloPeer2 = createPeer(hello);

  gossip([helloPeer, helloPeer2]);

  helloPeer.listen(3000, () => {
    console.log("Starting peer");
  });

  helloPeer2.listen(3001, () => {
    console.log("Starting another peer");
  });
}

main();

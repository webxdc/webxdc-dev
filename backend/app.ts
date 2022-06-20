import path from "path";
import express, { Express } from "express";
import { WebSocket } from "ws";
import expressWs from "express-ws";

export type WebXdc = {
  name: string;
  path: string;
};

export type InjectExpress = (app: Express) => void;

export function createFrontend(
  instances: Instances,
  injectFrontend: InjectExpress
): Express {
  const app = express();

  // inject how to serve the frontend; this is
  // different in dev mode and in production
  injectFrontend(app);

  app.get("/instances", (req, res) => {
    res.json(
      Array.from(instances.instances.values()).map((instance) => ({
        id: instance.port,
        url: `http://localhost:${instance.port}`,
      }))
    );
  });
  app.post("/instances", (req, res) => {
    const instance = instances.add();
    instance.start();
    res.json({
      status: "ok",
    });
  });
  return app;
}

export function createPeer(
  webxdc: WebXdc,
  injectSim: InjectExpress
): expressWs.Application {
  const expressApp = express();
  const wsInstance = expressWs(expressApp);

  // layer the simulated directory with webxdc tooling in front of webxdc path
  // this has to be injected as it differs between dev and production
  injectSim(wsInstance.app as unknown as Express);
  // now serve the webxdc project itself
  wsInstance.app.use(express.static(webxdc.path));

  return wsInstance.app;
}

let serial: number = 0;

// XXX if we only had a single shared web socket server we'd be able
// to use wss.clients.forEach to distribute. Is expressWs really helping or
// is it hurting?
function distribute(self: WebSocket, webSockets: WebSocket[], update: any) {
  serial++;
  update.serial = serial;
  update.max_serial = serial; // XXX this is always the same
  webSockets.forEach((peerWebSocket) => {
    console.log("gossip", update);
    peerWebSocket.send(JSON.stringify(update));
  });
}

export class Instance {
  webSocket: WebSocket | null = null;

  constructor(public app: expressWs.Application, public port: number) {}

  start() {
    this.app.listen(this.port, () => {
      console.log(`Starting Webxdc instance at port ${this.port}`);
    });
  }
}

export class Instances {
  webXdc: WebXdc;
  instances: Map<number, Instance>;
  basePort: number;
  currentPort: number;
  injectSim: InjectExpress;

  constructor(webXdc: WebXdc, injectSim: InjectExpress, basePort: number) {
    this.webXdc = webXdc;
    this.basePort = basePort;
    this.currentPort = basePort;
    this.instances = new Map();
    this.injectSim = injectSim;
  }

  add(): Instance {
    this.currentPort++;
    const port = this.currentPort;
    if (this.instances.has(port)) {
      throw new Error(`Already have Webxdc instance at port: ${port}`);
    }
    const app = createPeer(this.webXdc, this.injectSim);
    const instance = new Instance(app, port);

    app.ws("/webxdc", (ws, req) => {
      instance.webSocket = ws;
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
        distribute(ws, this.getWebSockets(), update);
      });
    });
    this.instances.set(port, instance);
    return instance;
  }

  getWebSockets(): WebSocket[] {
    const result: WebSocket[] = [];
    for (const instance of this.instances.values()) {
      if (instance.webSocket == null) {
        continue;
      }
      result.push(instance.webSocket);
    }
    return result;
  }
}

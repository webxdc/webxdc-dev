import express, { Express } from "express";
import expressWs from "express-ws";
import { WebSocket } from "ws";
import { createProcessor, IProcessor, WebXdcMulti } from "./message";
import { JsonValue, ReceivedUpdate } from "../types/webxdc-types";
import { createProxyMiddleware } from "http-proxy-middleware";

const SIMULATOR_PATHS = ["/webxdc.js", "/webxdc", "/webxdc/.websocket"];

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
      port: instance.port,
    });
  });
  app.post("/clear", (req, res) => {
    instances.clear();
    res.json({
      status: "ok",
    });
  });
  return app;
}

export function createPeer(
  location: string,
  injectSim: InjectExpress
): expressWs.Application {
  const expressApp = express();
  const wsInstance = expressWs(expressApp);

  // layer the simulated directory with webxdc tooling in front of webxdc path
  // this has to be injected as it differs between dev and production
  injectSim(wsInstance.app as unknown as Express);

  if (location.startsWith("http://")) {
    // serve webxdc project from URL by proxying
    const filter = (pathname: string) => {
      // make sure we don't proxy any path to do with the simulator
      return !SIMULATOR_PATHS.includes(pathname);
    };
    wsInstance.app.use(
      "/",
      createProxyMiddleware(filter, {
        target: location,
        ws: false,
      })
    );
  } else {
    // serve webxdc project from directory
    wsInstance.app.use(express.static(location));
  }
  return wsInstance.app;
}

export class Instance {
  id: string;

  constructor(
    public app: expressWs.Application,
    public port: number,
    public webXdc: WebXdcMulti
  ) {
    this.id = port.toString();
  }

  start() {
    this.app.listen(this.port, () => {
      console.log(`Starting Webxdc instance at port ${this.port}`);
    });
  }
}

export class Instances {
  location: string;
  instances: Map<number, Instance>;
  basePort: number;
  currentPort: number;
  injectSim: InjectExpress;
  processor: IProcessor;

  constructor(location: string, injectSim: InjectExpress, basePort: number) {
    this.location = location;
    this.basePort = basePort;
    this.currentPort = basePort;
    this.instances = new Map();
    this.injectSim = injectSim;
    this.processor = createProcessor();
  }

  add(): Instance {
    this.currentPort++;
    const port = this.currentPort;
    if (this.instances.has(port)) {
      throw new Error(`Already have Webxdc instance at port: ${port}`);
    }
    const app = createPeer(this.location, this.injectSim);
    const instance = new Instance(
      app,
      port,
      this.processor.createClient(port.toString())
    );

    app.ws("/webxdc", (ws, req) => {
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
        if (isSendUpdateMessage(parsed)) {
          instance.webXdc.sendUpdate(parsed.update, "update");
        } else if (isSetUpdateListenerMessage(parsed)) {
          instance.webXdc.connect(
            (updates) => {
              console.info("gossip", updates);
              ws.send(JSON.stringify({ type: "updates", updates }));
            },
            parsed.serial,
            () => {
              console.info("clear");
              ws.send(JSON.stringify({ type: "clear" }));
            }
          );
        } else {
          throw new Error(`Unknown message: ${JSON.stringify(parsed)}`);
        }
      });
    });
    this.instances.set(port, instance);
    return instance;
  }

  clear() {
    this.processor.clear();
  }
}

type SendUpdateMessage = {
  type: "sendUpdate";
  update: ReceivedUpdate<JsonValue>;
  descr: string;
};

type SetUpdateListenerMessage = {
  type: "setUpdateListener";
  serial: number;
};

function isSendUpdateMessage(value: any): value is SendUpdateMessage {
  return value.type === "sendUpdate";
}

function isSetUpdateListenerMessage(
  value: any
): value is SetUpdateListenerMessage {
  return value.type === "setUpdateListener";
}

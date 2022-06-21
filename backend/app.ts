import express, { Express } from "express";
import expressWs from "express-ws";
import { createProcessor, IProcessor, WebXdcMulti } from "./message";
import { JsonValue, ReceivedUpdate } from "../types/webxdc-types";

export type WebXdcDescription = {
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
  webXdcDescription: WebXdcDescription,
  injectSim: InjectExpress
): expressWs.Application {
  const expressApp = express();
  const wsInstance = expressWs(expressApp);

  // layer the simulated directory with webxdc tooling in front of webxdc path
  // this has to be injected as it differs between dev and production
  injectSim(wsInstance.app as unknown as Express);
  // now serve the webxdc project itself
  wsInstance.app.use(express.static(webXdcDescription.path));

  return wsInstance.app;
}

export class Instance {
  constructor(
    public app: expressWs.Application,
    public port: number,
    public webXdc: WebXdcMulti
  ) {}

  start() {
    this.app.listen(this.port, () => {
      console.log(`Starting Webxdc instance at port ${this.port}`);
    });
  }
}

export class Instances {
  webXdcDescription: WebXdcDescription;
  instances: Map<number, Instance>;
  basePort: number;
  currentPort: number;
  injectSim: InjectExpress;
  processor: IProcessor;

  constructor(
    webXdcDescription: WebXdcDescription,
    injectSim: InjectExpress,
    basePort: number
  ) {
    this.webXdcDescription = webXdcDescription;
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
    const app = createPeer(this.webXdcDescription, this.injectSim);
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
          instance.webXdc.setUpdateListenerMulti((updates) => {
            console.log("gossip", updates);
            ws.send(JSON.stringify(updates));
          }, parsed.serial);
        } else {
          throw new Error(`Unknown message: ${JSON.stringify(parsed)}`);
        }
      });
    });
    this.instances.set(port, instance);
    return instance;
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

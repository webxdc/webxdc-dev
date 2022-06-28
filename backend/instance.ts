import { Express } from "express";
import expressWs from "express-ws";
import { WebSocket, Server } from "ws";
import open from "open";

import { JsonValue, ReceivedUpdate } from "../types/webxdc";
import { createProcessor, IProcessor, WebXdcMulti, OnMessage } from "./message";
import { Location } from "./location";
import { waitOnUrl } from "./waitOn";
import { createPeer, InjectExpress } from "./app";

// timeout for open in miliseconds
const OPEN_TIMEOUT = 500;

type SendUpdateMessage = {
  type: "sendUpdate";
  update: ReceivedUpdate<JsonValue>;
  descr: string;
};

type SetUpdateListenerMessage = {
  type: "setUpdateListener";
  serial: number;
};

export class Instance {
  id: string;
  url: string;

  constructor(
    public app: expressWs.Application,
    public port: number,
    public webXdc: WebXdcMulti
  ) {
    this.id = port.toString();
    this.url = `http://localhost:${port}`;
  }

  start() {
    this.app.listen(this.port, () => {
      console.log(`Starting webxdc instance at port ${this.port}`);
    });
  }

  async open(): Promise<void> {
    await waitOnUrl(this.url, OPEN_TIMEOUT);
    await open(this.url);
  }
}

export class Instances {
  location: Location;
  instances: Map<number, Instance>;
  basePort: number;
  currentPort: number;
  injectSim: InjectExpress;
  processor: IProcessor;
  _onMessage: OnMessage | null = null;

  constructor(location: Location, injectSim: InjectExpress, basePort: number) {
    this.location = location;
    this.basePort = basePort;
    this.currentPort = basePort;
    this.instances = new Map();
    this.injectSim = injectSim;
    this.processor = createProcessor((message) => {
      if (this._onMessage == null) {
        return;
      }
      this._onMessage(message);
    });
  }

  add(): Instance {
    this.currentPort++;
    const port = this.currentPort;
    if (this.instances.has(port)) {
      throw new Error(`Already have Webxdc instance at port: ${port}`);
    }
    const wsInstance = createPeer(this.location, this.injectSim);
    const app = wsInstance.app;
    const wss = wsInstance.getWss();

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
          instance.webXdc.sendUpdate(parsed.update, parsed.descr);
        } else if (isSetUpdateListenerMessage(parsed)) {
          instance.webXdc.connect(
            (updates) => {
              console.info("gossip", updates);
              broadcast(
                wss,
                JSON.stringify({
                  type: "updates",
                  updates: updates.map(([update]) => update),
                })
              );
            },
            parsed.serial,
            () => {
              console.info("clear");
              broadcast(wss, JSON.stringify({ type: "clear" }));
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

  start() {
    for (const instance of this.instances.values()) {
      instance.start();
    }
  }

  async open() {
    // open the URLs
    for (const instance of this.instances.values()) {
      await instance.open();
    }
  }

  clear() {
    this.processor.clear();
  }

  onMessage(onMessage: OnMessage) {
    this._onMessage = onMessage;
  }
}

function broadcast(wss: Server<WebSocket>, data: string) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

function isSendUpdateMessage(value: any): value is SendUpdateMessage {
  return value.type === "sendUpdate";
}

function isSetUpdateListenerMessage(
  value: any
): value is SetUpdateListenerMessage {
  return value.type === "setUpdateListener";
}

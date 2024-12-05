import expressWs from "express-ws";
import { WebSocket, Server } from "ws";

import { ReceivedStatusUpdate } from "@webxdc/types";
import { createProcessor, IProcessor, WebXdcMulti, OnMessage } from "./message";
import { Location } from "./location";
import { createPeer, InjectExpress } from "./app";
import { AppInfo } from "./appInfo";
import { getColorForId } from "./color";
import { Instance as FrontendInstance } from "../types/instance";
import { getInstanceUrl } from "./instance_url";

export type Options = {
  basePort: number;
  csp: boolean;
  verbose: boolean;
};

type SendUpdateMessage = {
  type: "sendUpdate";
  update: ReceivedStatusUpdate<any>;
  descr: string;
};

type SendRealtimeMessage = {
  type: "sendRealtime";
  data: Uint8Array
};

type SetUpdateListenerMessage = {
  type: "setUpdateListener";
  serial: number;
};

type RequestInfoMessage = {
  type: "requestInfo";
};

class Instance {
  id: string;
  color: string;
  server: any;

  constructor(
    public app: expressWs.Application,
    public port: number,
    public url: string,
    public webXdc: WebXdcMulti,
  ) {
    this.id = port.toString();
    this.color = getColorForId(this.id);
  }

  start() {
    this.server = this.app.listen(this.port, () => {
      console.log(`Starting webxdc instance at port ${this.port}`);
    });
  }

  close() {
    this.server.close();
  }
}

export class Instances {
  location: Location;
  appInfo: AppInfo;
  instances: Map<number, Instance>;
  basePort: number;
  currentPort: number;
  csp: boolean;
  injectSim: InjectExpress;
  processor: IProcessor;
  _onMessage: OnMessage | null = null;

  constructor(appInfo: AppInfo, injectSim: InjectExpress, options: Options) {
    this.location = appInfo.location;
    this.appInfo = appInfo;
    this.basePort = options.basePort;
    this.csp = options.csp;
    this.currentPort = options.basePort;
    this.instances = new Map();
    this.injectSim = injectSim;
    this.processor = createProcessor((message) => {
      if (this._onMessage == null) {
        return;
      }
      if (options.verbose) {
        console.info(message);
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

    const instanceUrl = getInstanceUrl(port);

    const wsInstance = createPeer({
      location: this.location,
      injectSim: this.injectSim,
      csp: this.csp,
      instanceUrl: instanceUrl,
    });

    const app = wsInstance.app;
    const instance = new Instance(
      app,
      port,
      instanceUrl,
      this.processor.createClient(port.toString()),
    );

    const wss = wsInstance.getWss();

    app.ws("/webxdc", (ws, req) => {
      // when receiving an update from this peer
      ws.on("message", (msg: string) => {
        if (typeof msg !== "string") {
          console.error(
            "webxdc: Don't know how to handle unexpected non-string data",
          );
          return;
        }
        const parsed = JSON.parse(msg);
        // XXX should validate parsed
        if (isSendUpdateMessage(parsed)) {
          instance.webXdc.sendUpdate(parsed.update, "");
        } else if (isSendRealtimeMessage(parsed)) {
          instance.webXdc.sendRealtimeData(parsed.data);          
        } else if (isJoinRealtimeMessage(parsed)) {
          instance.webXdc.joinRealtimeChannel();          
        } else if (isSetUpdateListenerMessage(parsed)) {
          instance.webXdc.connect(
            (updates) => {
              return broadcast(
                wss,
                JSON.stringify({
                  type: "updates",
                  updates: updates.map(([update]) => update),
                }),
              );
            },
            parsed.serial,
            () => {
              return broadcast(wss, JSON.stringify({ type: "clear" }));
            },
            () => {
              return broadcast(wss, JSON.stringify({ type: "delete" }));
            },
          );
        } else if (isRequestInfoMessage(parsed)) {
          ws.send(
            JSON.stringify({
              type: "info",
              info: {
                name: this.appInfo.manifest.name,
                color: instance.color,
              },
            }),
          );
        } else {
          throw new Error(`Unknown message: ${JSON.stringify(parsed)}`);
        }
      });
    });
    this.instances.set(port, instance);
    return instance;
  }

  delete(id: number) {
    let instance = this.instances.get(id);
    if (instance == null) {
      throw new Error(
        `Instance with id ${id} can't be deleted because it does not exist`,
      );
    }
    instance.close();
    this.processor.removeClient(instance.id);
    this.instances.delete(id);
  }

  start() {
    for (const instance of this.instances.values()) {
      instance.start();
    }
  }

  clear() {
    this.processor.clear();
  }

  onMessage(onMessage: OnMessage) {
    this._onMessage = onMessage;
  }

  list(): FrontendInstance[] {
    return Array.from(this.instances.values()).map((instance) => ({
      id: instance.id,
      port: instance.port,
      url: instance.url,
      color: instance.color,
    }));
  }
}

function broadcast(wss: Server<WebSocket>, data: string): boolean {
  let result = false;

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
      result = true;
    }
  });

  return result;
}

function isSendUpdateMessage(value: any): value is SendUpdateMessage {
  return value.type === "sendUpdate";
}

function isSendRealtimeMessage(value: any): value is SendRealtimeMessage {
  return value.type === "sendRealtime";
}

function isJoinRealtimeMessage(value: any): value is { type: "joinRealtime" } {
  return value.type === "joinRealtime";
}

function isSetUpdateListenerMessage(
  value: any,
): value is SetUpdateListenerMessage {
  return value.type === "setUpdateListener";
}

function isRequestInfoMessage(value: any): value is RequestInfoMessage {
  return value.type === "requestInfo";
}

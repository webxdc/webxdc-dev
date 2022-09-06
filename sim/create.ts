import { WebXdc, JsonValue, ReceivedUpdate } from "../types/webxdc";

type UpdatesMessage = {
  type: "updates";
  updates: ReceivedUpdate<JsonValue>[];
};

type ClearMessage = {
  type: "clear";
};

export type Info = {
  name: string;
  color: string;
};

type InfoMessage = {
  type: "info";
  info: Info;
};

type DeleteMessage = {
  type: "delete";
};

type Message = UpdatesMessage | ClearMessage | InfoMessage | DeleteMessage;

export type TransportMessageCallback = (message: Message) => void;

export type TransportConnectCallback = () => void;

export type Transport = {
  send(data: JsonValue): void;
  onMessage(callback: TransportMessageCallback): void;
  onConnect(callback: TransportConnectCallback): void;
  clear(): void;
  address(): string;
  name(): string;
  setInfo(info: Info): void;
  // getInfo(): Promise<Info>;
};

type Log = (...args: any[]) => void;

export function createWebXdc(
  transport: Transport,
  log: Log = () => {}
): WebXdc {
  let resolveUpdateListenerPromise: (() => void) | null = null;

  const webXdc: WebXdc = {
    sendUpdate: (update, descr) => {
      transport.send({ type: "sendUpdate", update, descr });
      log("send", { update, descr });
    },
    setUpdateListener: (listener, serial = 0): Promise<void> => {
      transport.onMessage((message) => {
        if (isUpdatesMessage(message)) {
          log("recv", message.updates);
          for (const update of message.updates) {
            listener(update);
          }
          if (resolveUpdateListenerPromise != null) {
            resolveUpdateListenerPromise();
            resolveUpdateListenerPromise = null;
          }
        } else if (isClearMessage(message)) {
          log("clear");
          transport.clear();
        } else if (isInfoMessage(message)) {
          log("info", message.info);
          transport.setInfo(message.info);
        } else if (isDeleteMessage(message)) {
          log("delete");
          //transport.clear();
        }
      });
      transport.onConnect(() => {
        transport.send({ type: "requestInfo" });
        transport.send({ type: "setUpdateListener", serial });
      });
      const promise = new Promise<void>((resolve) => {
        resolveUpdateListenerPromise = resolve;
      });
      return promise;
    },
    selfAddr: transport.address(),
    selfName: transport.name(),
  };
  return webXdc;
}

function isUpdatesMessage(data: Message): data is UpdatesMessage {
  return data.type === "updates";
}

function isClearMessage(data: Message): data is ClearMessage {
  return data.type === "clear";
}

function isInfoMessage(data: Message): data is InfoMessage {
  return data.type === "info";
}

function isDeleteMessage(data: Message): data is InfoMessage {
  return data.type === "delete";
}

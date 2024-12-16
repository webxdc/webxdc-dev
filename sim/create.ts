import { Webxdc, ReceivedStatusUpdate, RealtimeListener as WebxdcRealtimeListener } from "@webxdc/types";
type UpdatesMessage = {
  type: "updates";
  updates: ReceivedStatusUpdate<any>[];
};

type RealtimeMessage = {
  type: "realtime";
  data: Uint8Array;
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

type Message =
  | UpdatesMessage
  | ClearMessage
  | InfoMessage
  | DeleteMessage
  | RealtimeMessage;

export type TransportMessageCallback = (message: Message) => void;

export type TransportConnectCallback = () => void;

export type Transport = {
  send(data: any): void;
  onMessage(callback: TransportMessageCallback): void;
  hasMessageListener(): boolean;
  onConnect(callback: TransportConnectCallback): void; // Socket connection cb
  clear(): void;
  address(): string;
  name(): string;
  setInfo(info: Info): void;
  // getInfo(): Promise<Info>;
};

type Log = (...args: any[]) => void;

export class RealtimeListener implements WebxdcRealtimeListener {
  private trashed = false;
  private listener: (data: Uint8Array) => void = () => { };

  constructor(
    public sendHook: (data: Uint8Array) => void = () => { },
    public setListenerHook: () => void = () => { },
    private leaveHook: () => void = () => { },
  ) { }

  is_trashed(): boolean {
    return this.trashed;
  }

  receive(data: Uint8Array) {
    if (this.trashed) {
      throw new Error("realtime listener is trashed and can no longer be used");
    }
    if (this.listener) {
      this.listener(data);
    }
  }

  setListener(listener: (data: Uint8Array) => void) {
    this.setListenerHook();
    this.listener = listener;
  }

  send(data: Uint8Array) {
    if (!(data instanceof Uint8Array)) {
      throw new Error("realtime listener data must be a Uint8Array");
    }
    this.sendHook(data);
  }

  leave() {
    this.leaveHook();
    this.trashed = true;
  }
}

export function createWebXdc(
  transport: Transport,
  log: Log = () => { },
): Webxdc<any> {
  let resolveUpdateListenerPromise: (() => void) | null = null;
  let realtime: RealtimeListener | null = null;

  const webXdc: Webxdc<any> = {
    sendUpdate: (update) => {
      transport.send({ type: "sendUpdate", update });
      log("send update", { update });
    },
    setUpdateListener: (listener, serial = 0): Promise<void> => {
      transport.onMessage((message) => {
        if (isUpdatesMessage(message)) {
          log("recv update", message.updates);
          for (const update of message.updates) {
            listener(update);
          }
          if (resolveUpdateListenerPromise != null) {
            resolveUpdateListenerPromise();
            resolveUpdateListenerPromise = null;
          }
        } else if (isRealtimeMessage(message)) {
          if (realtime === null) {
            return
          }
          // Conversion to any because the actual data is a dict representation of Uint8Array
          // This is due to JSON.stringify conversion.
          realtime!.receive(new Uint8Array(Object.values(message.data as any)));
        } else if (isClearMessage(message)) {
          log("clear");
          transport.clear();
        } else if (isInfoMessage(message)) {
          log("info", message.info);
          transport.setInfo(message.info);
        } else if (isDeleteMessage(message)) {
          log("delete");
          window.top?.close();
        } else {
          log("error", `Unhandled message ${message}`);
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
    sendToChat: async (content) => {
      if (!content.file && !content.text) {
        alert("🚨 Error: either file or text need to be set. (or both)");
        return Promise.reject(
          "Error from sendToChat: either file or text need to be set",
        );
      }

      const blob_to_base64 = (file: Blob) => {
        const data_start = ";base64,";
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => {
            let data: string = reader.result as string;
            resolve(data!.slice(data!.indexOf(data_start) + data_start.length));
          };
          reader.onerror = () => reject(reader.error);
        });
      };

      let base64Content;
      if (content.file) {
        if (!content.file.name) {
          return Promise.reject("file name is missing");
        }
        if (
          Object.keys(content.file).filter((key) =>
            ["blob", "base64", "plainText"].includes(key),
          ).length > 1
        ) {
          return Promise.reject(
            "you can only set one of `blob`, `base64` or `plainText`, not multiple ones",
          );
        }

        // @ts-ignore - needed because typescript imagines that blob would not exist
        if (content.file.blob instanceof Blob) {
          // @ts-ignore - needed because typescript imagines that blob would not exist
          base64Content = await blob_to_base64(content.file.blob);
          // @ts-ignore - needed because typescript imagines that base64 would not exist
        } else if (typeof content.file.base64 === "string") {
          // @ts-ignore - needed because typescript imagines that base64 would not exist
          base64Content = content.file.base64;
          // @ts-ignore - needed because typescript imagines that plainText would not exist
        } else if (typeof content.file.plainText === "string") {
          base64Content = await blob_to_base64(
            // @ts-ignore - needed because typescript imagines that plainText would not exist
            new Blob([content.file.plainText]),
          );
        } else {
          return Promise.reject(
            "data is not set or wrong format, set one of `blob`, `base64` or `plainText`, see webxdc documentation for sendToChat",
          );
        }
      }
      const msg = `The app would now close and the user would select a chat to send this message:\nText: ${content.text ? `"${content.text}"` : "No Text"
        }\nFile: ${content.file
          ? `${content.file.name} - ${base64Content.length} bytes`
          : "No File"
        }`;
      if (content.file) {
        const confirmed = confirm(
          msg + "\n\nDownload the file in the browser instead?",
        );
        if (confirmed) {
          var element = document.createElement("a");
          element.setAttribute(
            "href",
            "data:application/octet-stream;base64," + base64Content,
          );
          element.setAttribute("download", content.file.name);
          document.body.appendChild(element);
          element.click();
          document.body.removeChild(element);
        }
      } else {
        alert(msg);
      }
    },
    importFiles: (filters) => {
      var element = document.createElement("input");
      element.type = "file";
      element.accept = [
        ...(filters.extensions || []),
        ...(filters.mimeTypes || []),
      ].join(",");
      element.multiple = filters.multiple || false;
      const promise: Promise<File[]> = new Promise((resolve, _reject) => {
        element.onchange = (_ev) => {
          console.log("element.files", element.files);
          const files = Array.from(element.files || []);
          document.body.removeChild(element);
          resolve(files);
        };
      });
      element.style.display = "none";
      document.body.appendChild(element);
      element.click();
      console.log(element);
      return promise;
    },

    joinRealtimeChannel: () => {
      if (!transport.hasMessageListener()) {
        // we can only have one message listener with the current implementation, 
        // so we need to set it here to receive realtime data. When `setUpdateListener`
        // is called, the callback is overwritten but the new value also looks for 
        // realtime data.
        transport.onMessage((message) => {
          if (isRealtimeMessage(message)) {
            if (realtime === null) {
              return
            }
            realtime!.receive(new Uint8Array(Object.values(message.data as any)));
          }
        })
      }
      let should_create = false
      realtime = new RealtimeListener(
        () => { },
        () => {
          should_create = true
        },
        () => {
          should_create = false
          realtime = null
        },
      );
      transport.onConnect(() => {
        if (!realtime) {
          return
        }
        
        if (should_create) {
          transport.send({ type: "setRealtimeListener" });
        }
        
        realtime.sendHook = (data) => {
          transport.send({ type: "sendRealtime", data });
          log("send realtime", { data });
        };
        realtime.setListenerHook = () => {
          transport.send({ type: "setRealtimeListener" });
        }
      });
      return realtime;
    },
    getAllUpdates: () => {
      console.log("[Webxdc] WARNING: getAllUpdates() is deprecated.");
      return Promise.resolve([]);
    },
    sendUpdateInterval: 1000,
    sendUpdateMaxSize: 999999,
    selfAddr: transport.address(),
    selfName: transport.name(),
  };
  return webXdc;
}

function isUpdatesMessage(data: Message): data is UpdatesMessage {
  return data.type === "updates";
}

function isRealtimeMessage(data: Message): data is RealtimeMessage {
  return data.type === "realtime";
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

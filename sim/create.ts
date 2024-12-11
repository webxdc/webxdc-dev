import { Webxdc, ReceivedStatusUpdate } from "@webxdc/types";

type UpdatesMessage = {
  type: "updates";
  updates: ReceivedStatusUpdate<any>[];
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
  send(data: any): void;
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
  log: Log = () => {},
): Webxdc<any> {
  let resolveUpdateListenerPromise: (() => void) | null = null;

  const webXdc: Webxdc<any> = {
    sendUpdate: (update: any) => {
      transport.send({ type: "sendUpdate", update });
      log("send", { update });
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
          window.top?.close();
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

      /** @type {(file: Blob) => Promise<string>} */
      const blob_to_base64 = (file) => {
        const data_start = ";base64,";
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => {
            /** @type {string} */
            //@ts-ignore
            let data = reader.result;
            resolve(data.slice(data.indexOf(data_start) + data_start.length));
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
      const msg = `The app would now close and the user would select a chat to send this message:\nText: ${
        content.text ? `"${content.text}"` : "No Text"
      }\nFile: ${
        content.file
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

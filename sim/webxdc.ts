import { JsonValue, WebXdc } from "../types/webxdc";
import {
  Transport,
  TransportMessageCallback,
  TransportConnectCallback,
  createWebXdc,
  Info,
} from "./create";

if (document.location.search) {
  const deviceIdentifier = `%c${document.location.port}`;
  const logStyle = `color:white;font-weight:bold;border-radius:4px;padding:2px;background: ${
    decodeURIComponent(document.location.search).substring(1) || "lightgrey"
  }`;
  function overwriteConsoleFunction(
    subFunction: "debug" | "log" | "info" | "warn" | "error"
  ) {
    const original = console[subFunction];
    const replacement = original.bind(null, deviceIdentifier, logStyle);
    window.console[subFunction] = replacement;
    console[subFunction] = replacement;
  }
  overwriteConsoleFunction("debug");
  overwriteConsoleFunction("log");
  overwriteConsoleFunction("info");
  overwriteConsoleFunction("warn");
  overwriteConsoleFunction("error");
}

const url = `ws://${document.location.host}/webxdc`;

type SocketMessageListener = (event: Event) => void;

class DevServerTransport implements Transport {
  socket: WebSocket;
  messageListener: SocketMessageListener | null = null;
  promise: Promise<Info>;
  resolveInfo!: (info: Info) => void;

  constructor(url: string) {
    this.socket = new WebSocket(url);
    this.promise = new Promise((resolve, reject) => {
      this.resolveInfo = resolve;
    });
  }

  send(data: JsonValue): void {
    this.socket.send(JSON.stringify(data));
  }

  onMessage(callback: TransportMessageCallback): void {
    if (this.messageListener != null) {
      this.socket.removeEventListener("message", this.messageListener);
    }
    const listener = (event: Event): void => {
      callback(JSON.parse((event as any).data));
    };
    this.messageListener = listener;

    this.socket.addEventListener("message", listener);
  }

  onConnect(callback: TransportConnectCallback): void {
    const readyState = this.socket.readyState;
    if (readyState === 0) {
      // if the socket is connecting, we send the information
      // as soon as we're open
      const listener = (): void => {
        callback();
        // only listen to open once
        this.socket.removeEventListener("open", listener);
      };
      this.socket.addEventListener("open", callback);
    } else if (readyState === 1) {
      // if it's already open, we send the information immediately
      callback();
    } else {
      throw new Error(`SocketTransport: socket not ready: ${readyState}`);
    }
  }

  clear() {
    window.localStorage.clear();
    window.sessionStorage.clear();
    // XXX what about indexedDB?

    // we want to reload the window otherwise we won't take the
    // cleared localstorage into account
    window.location.reload();
  }

  address() {
    return `instance@${document.location.port}`;
  }
  name() {
    return `Instance ${document.location.port}`;
  }

  setInfo(info: Info): void {
    this.resolveInfo(info);
  }

  async getInfo(): Promise<Info> {
    return this.promise;
  }
}

async function alterUi(): Promise<void> {
  const info = await transport.getInfo();
  let title = document.getElementsByTagName("title")[0];
  if (title == null) {
    title = document.createElement("title");
    document.getElementsByTagName("head")[0].append(title);
  }
  title.innerText = `${getWebXdc().selfName} - ${info.name}`;
}

function getWebXdc(): WebXdc {
  return (window as any).webxdc;
}

const transport = new DevServerTransport(url);

(window as any).webxdc = createWebXdc(transport, (...args) => {
  console.info(...args);
});

window.addEventListener("load", alterUi);

window.addEventListener("message", (event) => {
  if (event.origin.indexOf("localhost:") !== -1) {
    if (event.data === "reload") {
      window.location.reload();
    }
  }
});

import { Webxdc } from "@webxdc/types";
import {
  Transport,
  TransportMessageCallback,
  TransportConnectCallback,
  createWebXdc,
  Info,
} from "./create";
import { overwriteConsole, alterUi } from "./ui";

const url = `ws://${document.location.host}/webxdc`;

type SocketMessageListener = (event: Event) => void;

export class DevServerTransport implements Transport {
  socket: WebSocket;
  messageListener: SocketMessageListener | null = null;
  promise: Promise<Info>;
  resolveInfo!: (info: Info) => void;

  constructor(url: string) {
    this.socket = new WebSocket(url);
    this.promise = new Promise((resolve) => {
      this.resolveInfo = resolve;
    });
  }

  send(data: any): void {
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

  hasMessageListener() {
    return this.messageListener !== null;
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

  async clear() {
    window.localStorage.clear();
    window.sessionStorage.clear();

    const databases = await window.indexedDB.databases();

    await Promise.all(
      databases.map((result) => {
        return new Promise((resolve, reject) => {
          const name = result?.name;
          console.log(`Deleting indexedDB database: ${name}`);
          const request = window.indexedDB.deleteDatabase(name!);
          request.onsuccess = (ev) => resolve(ev);
          request.onerror = (ev) => reject(ev);
        });
      }),
    );

    // we want to reload the window otherwise we won't take the
    // cleared localstorage into account
    window.location.reload();
  }

  static port() {
    if (location.host.endsWith(".webcontainer.io")) {
      // stackblitz / webcontainer uses different url to represent different ports.
      // example: `localhost:7002` becomes `https://xoriwypmnngithub-ltqe--7002--f565b097.local-corp.webcontainer.io/`
      // in stackblitz environment.
      // This regex extracts the port from the url.
      return (
        /--(\d+)--/.exec(document.location.href)?.[1] ||
        "error in webxdc simulator"
      );
    } else if (location.host.endsWith(".app.github.dev")) {
      return (
        /-(\d+)\.app\.github\.dev/.exec(document.location.href)?.[1] ||
        "error in webxdc simulator"
      );
    } else {
      return document.location.port;
    }
  }

  address() {
    return `instance@${DevServerTransport.port()}`;
  }
  name() {
    return `Instance ${DevServerTransport.port()}`;
  }

  setInfo(info: Info): void {
    this.resolveInfo(info);
  }

  async getInfo(): Promise<Info> {
    return this.promise;
  }
}

function getWebXdc(): Webxdc<any> {
  return (window as any).webxdc;
}

const transport = new DevServerTransport(url);

(window as any).webxdc = createWebXdc(transport, (...args) => {
  console.info(...args);
});

overwriteConsole(document.location.port, transport);

window.addEventListener("load", () => alterUi(getWebXdc().selfName, transport));

// listen to messages coming into iframe
window.addEventListener("message", (event) => {
  const isAllowed =
    event.origin.includes("localhost:") ||
    (location.host.endsWith(".webcontainer.io") &&
      event.origin.includes(".webcontainer.io"));
  if (!isAllowed) {
    return;
  }
  if (event.data === "reload") {
    window.location.reload();
  }
});

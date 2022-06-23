import { JsonValue } from "../types/webxdc-types";
import {
  Transport,
  TransportMessageCallback,
  TransportConnectCallback,
  createWebXdc,
} from "./create";

const url = `ws://${document.location.host}/webxdc`;

type SocketMessageListener = (event: Event) => void;

class DevServerTransport implements Transport {
  socket: WebSocket;
  messageListener: SocketMessageListener | null = null;

  constructor(url: string) {
    this.socket = new WebSocket(url);
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
}

(window as any).webxdc = createWebXdc(
  new DevServerTransport(url),
  (...args) => {
    console.info(...args);
  }
);

import { WebXdc } from "../types/webxdc-types";

const url = `ws://${document.location.host}/webxdc`;
const socket = new WebSocket(url);

let currentMessageEventListener: ((event: Event) => void) | null = null;
let currentOpenEventListener: (() => void) | null = null;

const webXdc: WebXdc = {
  sendUpdate: (update, descr) => {
    socket.send(JSON.stringify({ type: "sendUpdate", update, descr }));
    console.info("send", { update, descr });
  },
  setUpdateListener: (listener, serial = 0): Promise<void> => {
    // remove old message even listener if necessary
    if (currentMessageEventListener != null) {
      socket.removeEventListener("message", currentMessageEventListener);
    }
    // send any updates to the server
    const eventListener = (event: Event): void => {
      const receivedUpdate = JSON.parse((event as any).data);
      console.info("recv", receivedUpdate);
      listener(receivedUpdate);
    };
    currentMessageEventListener = eventListener;
    socket.addEventListener("message", eventListener);

    // remove any current open event listener
    if (currentOpenEventListener != null) {
      socket.removeEventListener("open", currentOpenEventListener);
    }

    // if the socket is connecting, we send the information
    // as soon as we're open
    if (socket.readyState === 0) {
      const openEventListener = (): void => {
        socket.send(JSON.stringify({ type: "setUpdateListener", serial }));
      };
      currentOpenEventListener = openEventListener;
      socket.addEventListener("open", openEventListener);
    } else if (socket.readyState === 1) {
      // if it's open, we send the information immediately
      socket.send(JSON.stringify({ type: "setUpdateListener", serial }));
    } else {
      throw new Error("Cannot access socket to register setUpdateListener");
    }
    // XXX this isn't correct yet
    return Promise.resolve();
  },
  selfAddr: `device@${document.location.port}`,
  selfName: document.location.port,
};

(window as any).webxdc = webXdc;

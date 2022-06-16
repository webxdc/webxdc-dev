import { WebXdc } from "./webxdc-types";

// XXX this stuff should be compiled in a mode that supports document
const url = `ws://${document.location.host}/webxdc`;
const socket = new WebSocket(url);

let currentMessageEventListener: ((event: Event) => void) | null = null;

const webXdc: WebXdc = {
  sendUpdate: (update, descr) => {
    socket.send(JSON.stringify({ update, descr }));
  },
  setUpdateListener: (listener, serial = 0) => {
    if (currentMessageEventListener) {
      socket.removeEventListener("message", currentMessageEventListener);
    }
    const eventListener = (event: Event): void => {
      const receivedUpdate = JSON.parse((event as any).data);
      listener(receivedUpdate);
    };
    currentMessageEventListener = eventListener;
    socket.addEventListener("message", eventListener);
  },
  selfAddr: "wat",
  selfName: "Something",
};

(window as any).webxdc = webXdc;

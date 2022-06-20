import { WebXdc } from "./webxdc-types";

const url = `ws://${document.location.host}/webxdc`;
const socket = new WebSocket(url);

let currentMessageEventListener: ((event: Event) => void) | null = null;

const webXdc: WebXdc = {
  sendUpdate: (update, descr) => {
    socket.send(JSON.stringify({ update, descr }));
    console.info("send", { update, descr });
  },
  setUpdateListener: (listener, serial = 0) => {
    if (currentMessageEventListener) {
      socket.removeEventListener("message", currentMessageEventListener);
    }
    const eventListener = (event: Event): void => {
      const receivedUpdate = JSON.parse((event as any).data);
      console.info("recv", receivedUpdate);
      listener(receivedUpdate);
    };
    currentMessageEventListener = eventListener;
    socket.addEventListener("message", eventListener);
  },
  selfAddr: `device@${document.location.port}`,
  selfName: document.location.port,
};

(window as any).webxdc = webXdc;

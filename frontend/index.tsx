import { render } from "solid-js/web";
import { HopeProvider, NotificationsProvider } from "@hope-ui/solid";

import App from "./App";

const url = `ws://${document.location.host}/webxdc-message`;

const socket = new WebSocket(url);

socket.addEventListener("open", () => {
  console.log("client web socket open");
});
socket.addEventListener("message", (event) => {
  console.log("from socket:", JSON.stringify(event.data));
});

render(
  () => (
    <HopeProvider>
      <NotificationsProvider>
        <App />
      </NotificationsProvider>
    </HopeProvider>
  ),
  document.getElementById("root") as HTMLElement
);

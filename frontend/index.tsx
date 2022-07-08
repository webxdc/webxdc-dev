import { render } from "solid-js/web";
import { HopeProvider, NotificationsProvider } from "@hope-ui/solid";
import { Router } from "solid-app-router";

import { Message } from "../types/message";
import { addMessage } from "./db";

import App from "./App";

const url = `ws://${document.location.host}/webxdc-message`;

const socket = new WebSocket(url);

socket.addEventListener("message", (event) => {
  const message = JSON.parse((event as any).data) as Message;
  addMessage(message);
});

render(
  () => (
    <Router>
      <HopeProvider>
        <NotificationsProvider>
          <App />
        </NotificationsProvider>
      </HopeProvider>
    </Router>
  ),
  document.getElementById("root") as HTMLElement
);

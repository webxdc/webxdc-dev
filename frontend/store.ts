import { createStore } from "solid-js/store";
import type { Message } from "../types/message";

const [state, setState] = createStore<Message[]>([]);

export function addMessage(message: Message): void {
  setState((s) => {
    s.push(message);
  });
}

export function sent(clientId: string): number {
  let result = 0;
  for (const message of state) {
    if (message.type === "sent" && message.clientId === clientId) {
      result++;
    }
  }
  return result;
}

export function received(clientId: string): number {
  let result = 0;
  for (const message of state) {
    if (message.type === "received" && message.clientId === clientId) {
      result++;
    }
  }
  return result;
}

export function getMessages(): Message[] {
  return state;
}

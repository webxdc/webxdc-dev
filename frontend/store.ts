import { createStore, produce } from "solid-js/store";
import type { Message } from "../types/message";

const [state, setState] = createStore<Message[]>([]);

export function addMessage(message: Message): void {
  setState(
    produce((s) => {
      s.push(message);
    })
  );
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

export function getMessages(
  clientId: string | undefined,
  type: string | undefined
): Message[] {
  if (clientId == null && type == null) {
    return state;
  }
  return state.filter(
    (message) =>
      (clientId == null || message.clientId === clientId) &&
      (type == null || message.type === type)
  );
}

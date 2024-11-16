import { createResource, createSignal } from "solid-js";
import { createStore, produce } from "solid-js/store";

import type { Message, UpdateMessage } from "../types/message";
import type { Instance as InstanceData } from "../types/instance";
import type { Info } from "../types/info";

export type Search = {
  instanceId?: string;
  type?: string;
  info?: boolean;
};

const [appInfo] = createResource<Info>(async () => {
  return await (await fetch("/app-info")).json();
});

export { appInfo };

const [instances, { refetch: refetchInstances, mutate: mutateInstances }] =
  createResource<InstanceData[]>(async () => {
    return (await fetch(`/instances`)).json();
  });

export { instances, refetchInstances, mutateInstances };

const [state, setState] = createStore<Message[]>([]);

const [summary, setSummary] = createSignal<string | undefined>(undefined);

export { summary };

export function addMessage(message: Message): void {
  if (isUpdateMessage(message) && message.type === "received") {
    const summary = message.update.summary;
    if (hasText(summary)) {
      setSummary(summary);
    }
  }

  setState(
    produce((s) => {
      s.push(message);
    }),
  );
}

export function clearMessages(): void {
  setState([]);
}

export function sent(instanceId: string): number {
  let result = 0;
  for (const message of state) {
    if (message.type === "sent" && message.instanceId === instanceId) {
      result++;
    }
  }
  return result;
}

export function received(instanceId: string): number {
  let result = 0;
  for (const message of state) {
    if (message.type === "received" && message.instanceId === instanceId) {
      result++;
    }
  }
  return result;
}

export function getMessages(search: Search): Message[] {
  const { instanceId, type, info } = search;

  if (instanceId == null && type == null && info == null) {
    return state;
  }

  return state.filter(
    (message) =>
      (instanceId == null || message.instanceId === instanceId) &&
      (type == null || message.type === type) &&
      (!info || (isUpdateMessage(message) && hasText(message.update.info))),
  );
}

function hasText(s: string | undefined): s is string {
  return s != null && s.length > 0;
}

export function isUpdateMessage(message: Message): message is UpdateMessage {
  return message.type === "sent" || message.type === "received";
}

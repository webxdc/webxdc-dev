import { Accessor } from "solid-js";
import Dexie, { Table } from "dexie";
import { createDexieSignalQuery, createDexieArrayQuery } from "solid-dexie";

import type { Message, UpdateMessage } from "../types/message";

export type Search = {
  instanceId?: string;
  type?: string;
  info?: boolean;
};

export type Info = {
  lastSummary: string | undefined;
};

export class Db extends Dexie {
  messages!: Table<Message>;
  infos!: Table<Info>;

  constructor() {
    super("webxdc-dev");
    this.version(1).stores({
      infos: "++id",
      messages: "++id, timestamp, instanceId, type",
    });
  }
}
export const db = new Db();

export async function addMessage(message: Message): Promise<void> {
  if (isUpdateMessage(message) && message.type === "received") {
    const summary = message.update.summary;
    if (hasText(summary)) {
      await updateInfo({ lastSummary: summary });
    }
  }
  await db.messages.add(message);
}

export async function clearMessages(): Promise<void> {
  await db.infos.clear();
  await db.messages.clear();
}

const infos = createDexieArrayQuery(() => {
  return db.infos.toArray();
});

export const summary = () => {
  if (infos.length === 0) {
    return undefined;
  }
  return infos[0].lastSummary;
};

async function updateInfo(info: Info) {
  const infos = await db.infos.toArray();
  if (infos.length === 0) {
    await db.infos.add(info);
    return;
  }
  if (infos.length !== 1) {
    throw new Error(
      "There should only ever be a single entry in the infos table"
    );
  }
  await db.infos.put({ ...infos[0], ...info });
}

export function createSentSignal(instanceId: string) {
  return createDexieSignalQuery(() =>
    db.messages.where({ type: "sent", instanceId: instanceId }).count()
  );
}

export function createReceivedSignal(instanceId: string) {
  return createDexieSignalQuery(() =>
    db.messages.where({ type: "received", instanceId: instanceId }).count()
  );
}

export function createMessagesQuery(search: Accessor<Search>) {
  return createDexieArrayQuery(() => {
    const s = search();
    const where: { [key: string]: any } = {};
    if (s.type != null) {
      where.type = s.type;
    }
    if (s.instanceId != null) {
      where.instanceId = s.instanceId;
    }
    if (s.type == null && s.instanceId == null) {
      return db.messages.toArray();
    }
    return db.messages.where(where).toArray();
  });
}

function hasText(s: string | undefined): s is string {
  return s != null && s.length > 0;
}

export function isUpdateMessage(message: Message): message is UpdateMessage {
  return message.type === "sent" || message.type === "received";
}

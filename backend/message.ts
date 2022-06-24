import type {
  Update,
  JsonValue,
  ReceivedUpdate,
  SendUpdate,
} from "../types/webxdc-types";
import type { Message } from "../types/message";

type UpdateListenerMulti = (
  updates: [ReceivedUpdate<JsonValue>, string][]
) => void;
type ClearListener = () => void;

type Connect = (
  updateListener: UpdateListenerMulti,
  serial: number,
  clearListener?: ClearListener
) => void;

export type WebXdcMulti = {
  connect: Connect;
  sendUpdate: SendUpdate<JsonValue>;
};

export type UpdateDescr = [ReceivedUpdate<JsonValue>, string];

export type OnMessage = (message: Message) => void;

export interface IProcessor {
  createClient(id: string): WebXdcMulti;
  clear(): void;
}

class Client implements WebXdcMulti {
  updateListener: UpdateListenerMulti | null = null;
  clearListener: ClearListener | null = null;
  updateSerial: number | null = null;

  constructor(public processor: Processor, public id: string) {}

  sendUpdate(update: Update<JsonValue>, descr: string): void {
    this.processor.distribute(this.id, update, descr);
  }

  connect(
    listener: UpdateListenerMulti,
    serial: number,
    clearListener: ClearListener = () => {}
  ): void {
    this.setClearListener(() => {
      this.processor.onMessage({ type: "clear", clientId: this.id });
      clearListener();
    });
    const updateListener = (updates: UpdateDescr[]) => {
      for (const [update, descr] of updates) {
        this.processor.onMessage({
          type: "received",
          update: update,
          clientId: this.id,
          descr,
        });
      }
      return listener(updates);
    };
    this.updateListener = updateListener;
    this.updateSerial = serial;
    this.processor.catchUp(updateListener, serial);
  }

  setClearListener(listener: ClearListener): void {
    this.clearListener = listener;
    this.clear();
  }

  receiveUpdate(update: ReceivedUpdate<JsonValue>, descr: string) {
    if (this.updateListener == null || this.updateSerial == null) {
      return;
    }
    // don't send the update if it's not required
    if (update.serial <= this.updateSerial) {
      return;
    }
    this.updateListener([[update, descr]]);
  }

  clear() {
    if (
      this.clearListener == null ||
      this.processor.clearClientIds.has(this.id)
    ) {
      return;
    }
    this.clearListener();
    this.processor.clearClientIds.add(this.id);
  }
}

class Processor implements IProcessor {
  clients: Client[] = [];
  currentSerial: number = 0;
  updates: UpdateDescr[] = [];
  clearClientIds: Set<string> = new Set();

  constructor(public onMessage: OnMessage) {}

  createClient(id: string): WebXdcMulti {
    const client = new Client(this, id);
    this.clients.push(client);
    return client;
  }

  distribute(clientId: string, update: Update<JsonValue>, descr: string) {
    this.currentSerial++;
    const receivedUpdate: ReceivedUpdate<JsonValue> = {
      ...update,
      serial: this.currentSerial,
      max_serial: this.updates.length + 1,
    };
    this.updates.push([receivedUpdate, descr]);
    this.onMessage({
      type: "sent",
      clientId,
      update: receivedUpdate,
      descr,
    });
    for (const client of this.clients) {
      client.receiveUpdate(receivedUpdate, descr);
    }
  }

  clear() {
    this.clearClientIds = new Set();
    for (const client of this.clients) {
      client.clear();
    }
    this.updates = [];
    this.currentSerial = 0;
  }

  catchUp(updateListener: UpdateListenerMulti, serial: number) {
    const maxSerial = this.updates.length;
    updateListener(
      this.updates
        .slice(serial)
        .map(([update, descr]) => [{ ...update, max_serial: maxSerial }, descr])
    );
  }
}

export function createProcessor(onMessage: OnMessage = () => {}): IProcessor {
  return new Processor(onMessage);
}

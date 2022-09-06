import type {
  Update,
  JsonValue,
  ReceivedUpdate,
  SendUpdate,
} from "../types/webxdc";
import type { Message } from "../types/message";
import { getColorForId } from "./color";

type UpdateListenerMulti = (
  updates: [ReceivedUpdate<JsonValue>, string][]
) => boolean;

type ClearListener = () => boolean;
type DeleteListener = () => boolean;

type Connect = (
  updateListener: UpdateListenerMulti,
  serial: number,
  deleteListener: DeleteListener,
  clearListener?: ClearListener,
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
  removeClient(id: string): void;
}

class Client implements WebXdcMulti {
  updateListener: UpdateListenerMulti | null = null;
  clearListener: ClearListener | null = null;
  updateSerial: number | null = null;
  deleteListener: DeleteListener | null = null;

  constructor(public processor: Processor, public id: string) { }

  sendUpdate(update: Update<JsonValue>, descr: string): void {
    this.processor.distribute(this.id, update, descr);
  }

  connect(
    listener: UpdateListenerMulti,
    serial: number,
    deleteListene: DeleteListener,
    clearListener: ClearListener = () => true,
  ): void {
    this.processor.onMessage({
      type: "connect",
      instanceId: this.id,
      instanceColor: getColorForId(this.id),
      timestamp: Date.now(),
    });
    this.setClearListener(() => {
      const hasReceived = clearListener();
      if (hasReceived) {
        this.processor.onMessage({
          type: "clear",
          instanceId: this.id,
          instanceColor: getColorForId(this.id),
          timestamp: Date.now(),
        });
      }
      return hasReceived;
    });
    const updateListener = (updates: UpdateDescr[]) => {
      const hasReceived = listener(updates);
      if (hasReceived) {
        for (const [update, descr] of updates) {
          this.processor.onMessage({
            type: "received",
            update: update,
            instanceId: this.id,
            instanceColor: getColorForId(this.id),
            timestamp: Date.now(),
            descr,
          });
        }
      }
      return hasReceived;
    };

    this.deleteListener = deleteListene;
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
      this.processor.clearInstanceIds.has(this.id)
    ) {
      return;
    }
    this.clearListener();
    this.processor.clearInstanceIds.add(this.id);
  }

  // sends a message to the all clients to shut down
  delete() {
    if (
      this.deleteListener == null ||
      this.processor.clearInstanceIds.has(this.id)
    ) {
      return;
    }
    this.deleteListener()
  }
}

class Processor implements IProcessor {
  clients: Client[] = [];
  currentSerial: number = 0;
  updates: UpdateDescr[] = [];
  clearInstanceIds: Set<string> = new Set();

  constructor(public onMessage: OnMessage) { }

  createClient(id: string): WebXdcMulti {
    const client = new Client(this, id);
    this.clients.push(client);
    return client;
  }

  removeClient(id: string) {
    let client_index = this.clients.findIndex((client) => client.id == id);
    this.clients[client_index].delete();
    this.clients.splice(client_index, 1);
  }

  distribute(instanceId: string, update: Update<JsonValue>, descr: string) {
    this.currentSerial++;
    const receivedUpdate: ReceivedUpdate<JsonValue> = {
      ...update,
      serial: this.currentSerial,
      max_serial: this.updates.length + 1,
    };
    this.updates.push([receivedUpdate, descr]);
    this.onMessage({
      type: "sent",
      instanceId: instanceId,
      instanceColor: getColorForId(instanceId),
      update: receivedUpdate,
      timestamp: Date.now(),
      descr,
    });
    for (const client of this.clients) {
      client.receiveUpdate(receivedUpdate, descr);
    }
  }

  clear() {
    this.clearInstanceIds = new Set();
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

export function createProcessor(onMessage: OnMessage = () => { }): IProcessor {
  return new Processor(onMessage);
}

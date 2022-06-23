import type {
  Update,
  ReceivedUpdate,
  JsonValue,
  SendUpdate,
} from "../types/webxdc-types";

type UpdateListenerMulti<T> = (updates: ReceivedUpdate<T>[]) => void;
type ClearListener = () => void;

type Connect<T> = (
  updateListener: UpdateListenerMulti<T>,
  serial: number,
  clearListener?: ClearListener
) => void;

export type WebXdcMulti<T = JsonValue> = {
  connect: Connect<T>;
  sendUpdate: SendUpdate<T>;
};

type Message<T> = {
  clientId: string;
  update: ReceivedUpdate<T>;
  descr: string;
};

export interface IProcessor<T = JsonValue> {
  createClient(id: string): WebXdcMulti<T>;
  clear(): void;
}

class Client<T> implements WebXdcMulti<T> {
  updateListener: UpdateListenerMulti<T> | null = null;
  clearListener: ClearListener | null = null;
  updateSerial: number | null = null;

  constructor(public processor: Processor<T>, public id: string) {}

  sendUpdate(update: Update<T>, descr: string): void {
    this.processor.distribute(this.id, update, descr);
  }

  connect(
    listener: UpdateListenerMulti<T>,
    serial: number,
    clearListener: ClearListener = () => {}
  ): void {
    this.setClearListener(clearListener);
    this.updateListener = listener;
    this.updateSerial = serial;
    this.processor.catchUp(listener, serial);
  }

  setClearListener(listener: ClearListener): void {
    this.clearListener = listener;
    this.clear();
  }

  receiveUpdate(update: ReceivedUpdate<T>) {
    if (this.updateListener == null || this.updateSerial == null) {
      return;
    }
    // don't send the update if it's not required
    if (update.serial <= this.updateSerial) {
      return;
    }
    this.updateListener([update]);
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

class Processor<T> implements IProcessor<T> {
  clients: Client<T>[] = [];
  currentSerial: number = 0;
  messages: Message<T>[] = [];
  clearClientIds: Set<string> = new Set();

  createClient(id: string): WebXdcMulti<T> {
    const client = new Client(this, id);
    this.clients.push(client);
    return client;
  }

  distribute(clientId: string, update: Update<T>, descr: string) {
    this.currentSerial++;
    const receivedUpdate: ReceivedUpdate<T> = {
      ...update,
      serial: this.currentSerial,
      max_serial: this.messages.length + 1,
    };
    this.messages.push({ clientId, update: receivedUpdate, descr });
    for (const client of this.clients) {
      client.receiveUpdate(receivedUpdate);
    }
  }

  clear() {
    this.clearClientIds = new Set();
    for (const client of this.clients) {
      client.clear();
    }
    this.messages = [];
    this.currentSerial = 0;
  }

  catchUp(updateListener: UpdateListenerMulti<T>, serial: number) {
    const maxSerial = this.messages.length;
    updateListener(
      this.messages
        .slice(serial)
        .map((message) => ({ ...message.update, max_serial: maxSerial }))
    );
  }
}

export function createProcessor<T = JsonValue>(): IProcessor<T> {
  return new Processor();
}

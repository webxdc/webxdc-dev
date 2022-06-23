import type {
  Update,
  ReceivedUpdate,
  JsonValue,
  SendUpdate,
} from "../types/webxdc-types";

type UpdateListenerMulti<T> = (updates: ReceivedUpdate<T>[]) => void;
type WipeListener = () => void;

type Connect<T> = (
  updateListener: UpdateListenerMulti<T>,
  serial: number,
  wipeListener?: WipeListener
) => void;

export type WebXdcMulti<T = JsonValue> = {
  connect: Connect<T>;
  sendUpdate: SendUpdate<T>;
};

export interface IProcessor<T = JsonValue> {
  createClient(name: string): WebXdcMulti<T>;
  wipe(): void;
}

class Client<T> implements WebXdcMulti<T> {
  updateListener: UpdateListenerMulti<T> | null = null;
  wipeListener: WipeListener | null = null;
  updateSerial: number | null = null;

  constructor(public processor: Processor<T>, public id: string) {}

  sendUpdate(update: Update<T>, descr: string): void {
    this.processor.distribute(update, descr);
  }

  connect(
    listener: UpdateListenerMulti<T>,
    serial: number,
    wipeListener: WipeListener = () => {}
  ): void {
    this.setWipeListener(wipeListener);
    this.updateListener = listener;
    this.updateSerial = serial;
    this.processor.catchUp(listener, serial);
  }

  setWipeListener(listener: WipeListener): void {
    this.wipeListener = listener;
    this.wipe();
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

  wipe() {
    if (
      this.wipeListener == null ||
      this.processor.wipeClientIds == null ||
      this.processor.wipeClientIds.has(this.id)
    ) {
      return;
    }
    this.wipeListener();
    this.processor.wipeClientIds.add(this.id);
  }
}

class Processor<T> implements IProcessor<T> {
  clients: Client<T>[] = [];
  currentSerial: number = 0;
  updates: ReceivedUpdate<T>[] = [];
  wipeClientIds: Set<string> | null = null;

  createClient(id: string): WebXdcMulti<T> {
    const client = new Client(this, id);
    this.clients.push(client);
    return client;
  }

  distribute(update: Update<T>, desc: string) {
    this.currentSerial++;
    const receivedUpdate: ReceivedUpdate<T> = {
      ...update,
      serial: this.currentSerial,
      max_serial: this.updates.length + 1,
    };
    this.updates.push(receivedUpdate);
    for (const client of this.clients) {
      client.receiveUpdate(receivedUpdate);
    }
  }

  wipe() {
    this.wipeClientIds = new Set();
    for (const client of this.clients) {
      client.wipe();
    }
    this.updates = [];
    this.currentSerial = 0;
  }

  catchUp(updateListener: UpdateListenerMulti<T>, serial: number) {
    const updates = this.updates;
    updateListener(
      updates
        .slice(serial)
        .map((update) => ({ ...update, max_serial: updates.length }))
    );
  }
}

export function createProcessor<T = JsonValue>(): IProcessor<T> {
  return new Processor();
}

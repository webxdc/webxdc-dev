import type {
  Update,
  ReceivedUpdate,
  JsonValue,
  SendUpdate,
} from "../types/webxdc-types";

type UpdateListenerMulti<T> = (updates: ReceivedUpdate<T>[]) => void;

type SetUpdateListenerMulti<T> = (
  listener: UpdateListenerMulti<T>,
  serial: number
) => Promise<void>;

export type WebXdcMulti<T = JsonValue> = {
  sendUpdate: SendUpdate<T>;
  setUpdateListenerMulti: SetUpdateListenerMulti<T>;
};

export interface IProcessor<T = JsonValue> {
  createClient(name: string): WebXdcMulti<T>;
}

class Client<T> implements WebXdcMulti<T> {
  updateListener: UpdateListenerMulti<T> | null = null;
  updateSerial: number | null = null;

  constructor(public processor: Processor<T>, public name: string) {}

  sendUpdate(update: Update<T>, descr: string): void {
    this.processor.distribute(update, descr);
  }

  async setUpdateListenerMulti(
    listener: UpdateListenerMulti<T>,
    serial: number
  ): Promise<void> {
    this.updateListener = listener;
    this.updateSerial = serial;
    this.processor.catchUp(listener, serial);
    return Promise.resolve();
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
}

class Processor<T> implements IProcessor<T> {
  clients: Client<T>[] = [];
  currentSerial: number = 0;
  updates: ReceivedUpdate<T>[] = [];

  createClient(name: string): WebXdcMulti<T> {
    const client = new Client(this, name);
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

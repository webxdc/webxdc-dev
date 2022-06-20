import type {
  WebXdc,
  Update,
  UpdateListener,
  ReceivedUpdate,
  JsonValue,
} from "../types/webxdc-types";

export interface IProcessor<T = JsonValue> {
  createClient(name: string): WebXdc<T>;
}

class Client<T> implements WebXdc<T> {
  updateListener: UpdateListener<T> | null = null;
  updateSerial: number | null = null;

  constructor(public processor: Processor<T>, public name: string) {}

  sendUpdate(update: Update<T>, descr: string): void {
    this.processor.distribute(update, descr);
  }

  setUpdateListener(listener: UpdateListener<T>, serial: number): void {
    this.updateListener = listener;
    this.updateSerial = serial;
    this.processor.catchUp(listener, serial);
  }

  receiveUpdate(update: ReceivedUpdate<T>) {
    if (this.updateListener == null || this.updateSerial == null) {
      return;
    }
    // don't send the update if it's not required
    if (update.serial <= this.updateSerial) {
      return;
    }
    this.updateListener(update);
  }

  get selfAddr() {
    return this.name;
  }

  get selfName() {
    return this.name;
  }
}

class Processor<T> implements IProcessor<T> {
  clients: Client<T>[] = [];
  currentSerial: number = 0;
  updates: ReceivedUpdate<T>[] = [];

  createClient(name: string): WebXdc<T> {
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

  catchUp(updateListener: UpdateListener<T>, serial: number) {
    const updates = this.updates;
    for (const update of updates.slice(serial)) {
      updateListener({
        ...update,
        max_serial: updates.length,
      });
    }
  }
}

export function createProcessor<T = JsonValue>(): IProcessor<T> {
  return new Processor();
}

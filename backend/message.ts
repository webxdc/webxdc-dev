import type {
  WebXdc,
  Update,
  UpdateListener,
  ReceivedUpdate,
} from "../types/webxdc-types";

interface IProcessor<T> {
  createClient(name: string): WebXdc<T>;
}

class Client<T> implements WebXdc<T> {
  updateListener: UpdateListener<T> | null = null;
  updateSerial: number | null = null;
  buffer: ReceivedUpdate<T>[] = [];

  constructor(public processor: Processor<T>, public name: string) {}

  sendUpdate(update: Update<T>, descr: string): void {
    this.processor.distribute(update, descr);
  }

  setUpdateListener(listener: UpdateListener<T>, serial: number): void {
    this.updateListener = listener;
    this.updateSerial = serial;
    for (const update of this.buffer.slice(serial)) {
      this.updateListener(update);
    }
  }

  receiveUpdate(update: ReceivedUpdate<T>) {
    this.buffer.push(update);

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

  createClient(name: string): WebXdc<T> {
    const client = new Client(this, name);
    this.clients.push(client);
    return client;
  }

  distribute(update: Update<T>, desc: string) {
    this.currentSerial++;
    for (const client of this.clients) {
      client.receiveUpdate({
        ...update,
        serial: this.currentSerial,
        max_serial: this.currentSerial,
      });
    }
  }
}

export function createProcessor<T>(): IProcessor<T> {
  return new Processor();
}

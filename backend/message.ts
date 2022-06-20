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

  constructor(public processor: Processor<T>, public name: string) {}

  sendUpdate(update: Update<T>, descr: string): void {
    this.processor.distribute(update, descr);
  }

  setUpdateListener(listener: UpdateListener<T>, serial: number): void {
    this.updateListener = listener;
    this.updateSerial = serial;
  }

  receiveUpdate(update: ReceivedUpdate<T>) {
    if (this.updateListener == null) {
      throw new Error("Received update but no listener registered");
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
    for (const client of this.clients) {
      client.receiveUpdate({
        ...update,
        serial: this.currentSerial,
        max_serial: this.currentSerial,
      });
    }
    this.currentSerial++;
  }
}

export function createProcessor<T>(): IProcessor<T> {
  return new Processor();
}

import type {
  WebXdc,
  Update,
  UpdateListener,
  ReceivedUpdate,
} from "../types/webxdc-types";

interface IProcessor {
  createClient(name: string): WebXdc;
}

class Client implements WebXdc {
  updateListener: UpdateListener | null = null;
  updateSerial: number | null = null;

  constructor(public processor: Processor, public name: string) {}

  sendUpdate(update: Update, descr: string): void {
    this.processor.distribute(update, descr);
  }

  setUpdateListener(listener: UpdateListener, serial: number): void {
    this.updateListener = listener;
    this.updateSerial = serial;
  }

  receiveUpdate(update: ReceivedUpdate) {
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

class Processor implements IProcessor {
  clients: Client[] = [];
  currentSerial: number = 0;

  createClient(name: string): WebXdc {
    const client = new Client(this, name);
    this.clients.push(client);
    return client;
  }

  distribute(update: Update, desc: string) {
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

export function createProcessor(): IProcessor {
  return new Processor();
}

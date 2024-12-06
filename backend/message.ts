import {
  RealtimeListener as WebxdcRealtimeListener,
  ReceivedStatusUpdate,
  SendingStatusUpdate,
  Webxdc,
} from "@webxdc/types";
import type { Message } from "../types/message";
import { getColorForId } from "./color";

type UpdateListenerMulti = (
  updates: [ReceivedStatusUpdate<any>, string][],
) => boolean;

type ClearListener = () => boolean;
type DeleteListener = () => boolean;
type RealtimeListenerListener = (data: Uint8Array) => boolean

type Connect = (
  updateListener: UpdateListenerMulti,
  serial: number,
  clearListener?: ClearListener,
  deleteListener?: DeleteListener,
) => void;

export type WebXdcMulti = {
  connect: Connect;
  connectRealtime: (listener: RealtimeListenerListener) => void;
  sendUpdate: Webxdc<any>["sendUpdate"];
  sendRealtimeData: (data: Uint8Array) => void;
};

export type UpdateDescr = [ReceivedStatusUpdate<any>, string];

export type OnMessage = (message: Message) => void;

export type OnRealtime = (message: Message) => void;

export interface IProcessor {
  createClient(id: string): WebXdcMulti;
  clear(): void;
  removeClient(id: string): void;
}

export class RealtimeListener implements WebxdcRealtimeListener {
  private trashed = false;
  private listener: (data: Uint8Array) => void = () => { }

  constructor(
    public sendHook: (data: Uint8Array) => void = () => { },
    public setListenerHook: () => void = () => { },
    private leaveHook: () => void = () => { }
  ) { }

  is_trashed(): boolean {
    return this.trashed;
  }

  receive(data: Uint8Array) {
    if (this.trashed) {
      throw new Error(
        "realtime listener is trashed and can no longer be used",
      );
    }
    if (this.listener) {
      this.listener(data);
    }
  }

  setListener(listener: (data: Uint8Array) => void) {
    this.setListenerHook()
    this.listener = listener;
  }

  send(data: Uint8Array) {
    if (!(data instanceof Uint8Array)) {
      throw new Error("realtime listener data must be a Uint8Array");
    }
    this.sendHook(data)
  }

  leave() {
    this.leaveHook()
    this.trashed = true;
  }
}

class Client implements WebXdcMulti {
  updateListener: UpdateListenerMulti | null = null;
  realtimeListener: RealtimeListenerListener | null = null;
  realtime: RealtimeListener | null = null;
  clearListener: ClearListener | null = null;
  updateSerial: number | null = null;
  deleteListener: DeleteListener | null = null;

  constructor(
    public processor: Processor,
    public id: string,
  ) { }

  sendUpdate(update: SendingStatusUpdate<any>, descr: ""): void {
    this.processor.distribute(this.id, update, "");
  }

  sendRealtimeData(data: Uint8Array): void {
    this.processor.distributeRealtime(this.id, data);
  }

  connectRealtime(listener: RealtimeListenerListener) {
    console.warn("connecting realtime")
    this.processor.onMessage({
      type: "connect-realtime",
      instanceId: this.id,
      instanceColor: getColorForId(this.id),
      timestamp: Date.now(),
    });

    const realtimeListener= (data: Uint8Array) => {
      const hasReceived = listener(data);
      if (hasReceived) {
          this.processor.onMessage({
            type: "realtime-received",
            data,
            instanceId: this.id,
            instanceColor: getColorForId(this.id),
            timestamp: Date.now(),
          });
      }
      return hasReceived;
    };

    this.realtimeListener = realtimeListener
  }

  connect(
    listener: UpdateListenerMulti,
    serial: number,
    clearListener: ClearListener = () => true,
    deleteListener: DeleteListener = () => true,
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

    this.deleteListener = deleteListener;
    this.updateListener = updateListener;
    this.updateSerial = serial;
    this.processor.catchUp(updateListener, serial);
  }

  setClearListener(listener: ClearListener): void {
    this.clearListener = listener;
    this.clear();
  }

  receiveUpdate(update: ReceivedStatusUpdate<any>, descr: string) {
    if (this.updateListener == null || this.updateSerial == null) {
      return;
    }
    // don't send the update if it's not required
    if (update.serial <= this.updateSerial) {
      return;
    }
    this.updateListener([[update, descr]]);
  }

  receiveRealtime(data: Uint8Array) {
    if (this.realtimeListener == null) {
      return;
    }
    console.warn("hiiiii");
    this.realtimeListener(data);
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
    if (this.deleteListener == null) {
      return;
    }
    this.deleteListener();
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

  distributeRealtime(
    instanceId: string,
    data: Uint8Array,
  ) {
    this.onMessage({
      type: "sendRealtime",
      instanceId: instanceId,
      instanceColor: getColorForId(instanceId),
      data,
      timestamp: Date.now(),
    });
    for (const client of this.clients) {
      if (client.id != instanceId) {
        client.receiveRealtime(data)
      }
    }
  }

  distribute(
    instanceId: string,
    update: SendingStatusUpdate<any>,
    descr: string,
  ) {
    this.currentSerial++;
    const receivedUpdate: ReceivedStatusUpdate<any> = {
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
        .map(([update, descr]) => [
          { ...update, max_serial: maxSerial },
          descr,
        ]),
    );
  }
}

export function createProcessor(onMessage: OnMessage = () => { }): IProcessor {
  return new Processor(onMessage);
}

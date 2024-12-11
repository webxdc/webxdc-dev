import {
  createWebXdc,
  Transport,
  TransportMessageCallback,
  TransportConnectCallback,
  Info,
} from "./create";
import { createProcessor, WebXdcMulti } from "../backend/message";

// we have a transport that integrates directly with the backend
class FakeTransport implements Transport {
  messageCallback: TransportMessageCallback | null = null;
  connectCallback: TransportConnectCallback | null = null;
  _address: string;
  _name: string;
  info: Info | null = null;

  constructor(
    public client: WebXdcMulti,
    address: string,
    name: string,
    public onClear: () => void,
  ) {
    this._address = address;
    this._name = name;
  }

  send(data: any) {
    if (data.type === "sendUpdate") {
      const { update } = data;
      this.client.sendUpdate(update, "");
    } else if (data.type === "setUpdateListener") {
      this.client.connect(
        (updates) => {
          if (this.messageCallback != null) {
            this.messageCallback({
              type: "updates",
              updates,
            });
          }
          return true;
        },
        data.serial,
        () => {
          if (this.messageCallback != null) {
            this.messageCallback({ type: "clear" });
          }
          return true;
        },
      );
    } else if (data.type === "requestInfo") {
      if (this.messageCallback != null) {
        this.messageCallback({
          type: "info",
          info: {
            name: "Foo",
            color: "red",
          },
        });
      }
    } else {
      throw new Error(`Unknown data ${JSON.stringify(data)}`);
    }
  }
  onMessage(callback: TransportMessageCallback) {
    this.messageCallback = callback;
  }
  onConnect(callback: TransportConnectCallback) {
    this.connectCallback = callback;
  }
  clear() {
    this.onClear();
  }
  address() {
    return this._address;
  }
  name() {
    return this._name;
  }

  connect() {
    if (this.connectCallback != null) {
      this.connectCallback();
    }
  }

  setInfo(info: Info): void {
    this.info = info;
  }
}

test("webxdc sends", async () => {
  const processor = createProcessor();
  const client = processor.createClient("a");
  const clientCleared: string[] = [];

  const fakeTransport = new FakeTransport(client, "A", "a", () => {
    clientCleared.push("cleared");
  });

  const webXdc = createWebXdc(fakeTransport);
  const updates: any[] = [];

  const promise = webXdc.setUpdateListener((value) => {
    updates.push(value);
  }, 0);
  fakeTransport.connect();
  await promise;
  webXdc.sendUpdate({ payload: "hello" }, "");
  expect(updates).toEqual([
    {
      payload: "hello",
      serial: 1,
      max_serial: 1,
    },
  ]);
  expect(fakeTransport.info).toEqual({ name: "Foo", color: "red" });
});

test("webxdc distributes", async () => {
  const processor = createProcessor();
  const clientA = processor.createClient("a");
  const clientB = processor.createClient("b");
  const clientACleared: string[] = [];
  const clientBCleared: string[] = [];

  const fakeTransportA = new FakeTransport(clientA, "A", "a", () => {
    clientACleared.push("cleared");
  });
  const fakeTransportB = new FakeTransport(clientB, "B", "b", () => {
    clientBCleared.push("cleared");
  });

  const webXdcA = createWebXdc(fakeTransportA);
  const webXdcB = createWebXdc(fakeTransportB);
  const updatesA: any[] = [];
  const updatesB: any[] = [];

  const promiseA = webXdcA.setUpdateListener((value) => {
    updatesA.push(value);
  }, 0);
  fakeTransportA.connect();
  await promiseA;

  const promiseB = webXdcB.setUpdateListener((value) => {
    updatesB.push(value);
  }, 0);
  fakeTransportB.connect();
  await promiseB;

  webXdcA.sendUpdate({ payload: "hello" }, "");
  expect(updatesA).toEqual([
    {
      payload: "hello",
      serial: 1,
      max_serial: 1,
    },
  ]);
  expect(updatesB).toEqual([
    {
      payload: "hello",
      serial: 1,
      max_serial: 1,
    },
  ]);
});

export {};

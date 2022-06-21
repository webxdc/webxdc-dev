import { createProcessor } from "./message";
import type { ReceivedUpdate } from "../types/webxdc-types";

test("distribute to self", () => {
  const processor = createProcessor<string>();
  const client0 = processor.createClient("3001");

  const client0Heard: ReceivedUpdate<string>[] = [];

  client0.setUpdateListenerMulti((updates) => {
    client0Heard.push(...updates);
  }, 0);

  client0.sendUpdate({ payload: "Hello" }, "update");

  expect(client0Heard).toMatchObject([
    { payload: "Hello", serial: 1, max_serial: 1 },
  ]);
});

test("distribute to self and other", () => {
  const processor = createProcessor<string>();
  const client0 = processor.createClient("3001");
  const client1 = processor.createClient("3002");

  const client0Heard: ReceivedUpdate<string>[] = [];
  const client1Heard: ReceivedUpdate<string>[] = [];

  client0.setUpdateListenerMulti((updates) => {
    client0Heard.push(...updates);
  }, 0);

  client1.setUpdateListenerMulti((updates) => {
    client1Heard.push(...updates);
  }, 0);

  client0.sendUpdate({ payload: "Hello" }, "update");
  client1.sendUpdate({ payload: "Bye" }, "update 2");
  expect(client0Heard).toMatchObject([
    { payload: "Hello", serial: 1, max_serial: 1 },
    { payload: "Bye", serial: 2, max_serial: 2 },
  ]);
  expect(client1Heard).toMatchObject([
    { payload: "Hello", serial: 1, max_serial: 1 },
    { payload: "Bye", serial: 2, max_serial: 2 },
  ]);
});

test("setUpdateListener serial should skip older", () => {
  const processor = createProcessor<string>();
  const client0 = processor.createClient("3001");
  const client1 = processor.createClient("3002");

  const client0Heard: ReceivedUpdate<string>[] = [];
  const client1Heard: ReceivedUpdate<string>[] = [];

  client0.setUpdateListenerMulti((updates) => {
    client0Heard.push(...updates);
  }, 0);

  client1.setUpdateListenerMulti((updates) => {
    client1Heard.push(...updates);
  }, 1);

  client0.sendUpdate({ payload: "Hello" }, "update");
  client0.sendUpdate({ payload: "Bye" }, "update 2");
  expect(client0Heard).toMatchObject([
    { payload: "Hello", serial: 1, max_serial: 1 },
    { payload: "Bye", serial: 2, max_serial: 2 },
  ]);
  expect(client1Heard).toMatchObject([
    { payload: "Bye", serial: 2, max_serial: 2 },
  ]);
});

test("other starts listening later", () => {
  const processor = createProcessor<string>();
  const client0 = processor.createClient("3001");
  const client1 = processor.createClient("3002");

  const client0Heard: ReceivedUpdate<string>[] = [];
  const client1Heard: ReceivedUpdate<string>[] = [];

  client0.setUpdateListenerMulti((updates) => {
    client0Heard.push(...updates);
  }, 0);

  client0.sendUpdate({ payload: "Hello" }, "update");
  client0.sendUpdate({ payload: "Bye" }, "update 2");

  expect(client0Heard).toMatchObject([
    { payload: "Hello", serial: 1, max_serial: 1 },
    { payload: "Bye", serial: 2, max_serial: 2 },
  ]);
  // we only join later, so we haven't heard a thing yet
  expect(client1Heard).toMatchObject([]);

  client1.setUpdateListenerMulti((updates) => {
    client1Heard.push(...updates);
  }, 0);

  expect(client0Heard).toMatchObject([
    { payload: "Hello", serial: 1, max_serial: 1 },
    { payload: "Bye", serial: 2, max_serial: 2 },
  ]);
  expect(client1Heard).toMatchObject([
    { payload: "Hello", serial: 1, max_serial: 2 },
    { payload: "Bye", serial: 2, max_serial: 2 },
  ]);
});

test("client is created later and needs to catch up", () => {
  const processor = createProcessor<string>();
  const client0 = processor.createClient("3001");

  const client0Heard: ReceivedUpdate<string>[] = [];
  const client1Heard: ReceivedUpdate<string>[] = [];

  client0.setUpdateListenerMulti((updates) => {
    client0Heard.push(...updates);
  }, 0);

  client0.sendUpdate({ payload: "Hello" }, "update");
  client0.sendUpdate({ payload: "Bye" }, "update 2");

  expect(client0Heard).toMatchObject([
    { payload: "Hello", serial: 1, max_serial: 1 },
    { payload: "Bye", serial: 2, max_serial: 2 },
  ]);

  // we only join later, so we haven't heard a thing yet
  expect(client1Heard).toMatchObject([]);
  const client1 = processor.createClient("3002");

  client1.setUpdateListenerMulti((updates) => {
    client1Heard.push(...updates);
  }, 0);

  expect(client0Heard).toMatchObject([
    { payload: "Hello", serial: 1, max_serial: 1 },
    { payload: "Bye", serial: 2, max_serial: 2 },
  ]);
  expect(client1Heard).toMatchObject([
    { payload: "Hello", serial: 1, max_serial: 2 },
    { payload: "Bye", serial: 2, max_serial: 2 },
  ]);
});

test("other starts listening later but is partially caught up", () => {
  const processor = createProcessor<string>();
  const client0 = processor.createClient("3001");
  const client1 = processor.createClient("3002");

  const client0Heard: ReceivedUpdate<string>[] = [];
  const client1Heard: ReceivedUpdate<string>[] = [];

  client0.setUpdateListenerMulti((updates) => {
    client0Heard.push(...updates);
  }, 0);

  client0.sendUpdate({ payload: "Hello" }, "update");
  client0.sendUpdate({ payload: "Bye" }, "update 2");
  expect(client0Heard).toMatchObject([
    { payload: "Hello", serial: 1, max_serial: 1 },
    { payload: "Bye", serial: 2, max_serial: 2 },
  ]);
  // we only join later, so we haven't heard a thing yet
  expect(client1Heard).toMatchObject([]);

  // start at 1, as we're already partially caught up
  client1.setUpdateListenerMulti((updates) => {
    client1Heard.push(...updates);
  }, 1);

  expect(client0Heard).toMatchObject([
    { payload: "Hello", serial: 1, max_serial: 1 },
    { payload: "Bye", serial: 2, max_serial: 2 },
  ]);
  expect(client1Heard).toMatchObject([
    { payload: "Bye", serial: 2, max_serial: 2 },
  ]);
});

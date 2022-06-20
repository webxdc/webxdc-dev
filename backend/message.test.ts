import { createProcessor } from "./message";
import type { ReceivedUpdate } from "../types/webxdc-types";

test("distribute to self", () => {
  const processor = createProcessor<string>();
  const client0 = processor.createClient("3001");

  const client0Heard: ReceivedUpdate<string>[] = [];

  client0.setUpdateListener((update) => {
    client0Heard.push(update);
  }, 0);

  client0.sendUpdate({ payload: "Hello" }, "update");

  expect(client0Heard).toMatchObject([{ payload: "Hello", serial: 1 }]);
});

test("distribute to self and other", () => {
  const processor = createProcessor<string>();
  const client0 = processor.createClient("3001");
  const client1 = processor.createClient("3002");

  const client0Heard: ReceivedUpdate<string>[] = [];
  const client1Heard: ReceivedUpdate<string>[] = [];

  client0.setUpdateListener((update) => {
    client0Heard.push(update);
  }, 0);

  client1.setUpdateListener((update) => {
    client1Heard.push(update);
  }, 0);

  client0.sendUpdate({ payload: "Hello" }, "update");
  client1.sendUpdate({ payload: "Bye" }, "update 2");
  expect(client0Heard).toMatchObject([
    { payload: "Hello", serial: 1 },
    { payload: "Bye", serial: 2 },
  ]);
  expect(client1Heard).toMatchObject([
    { payload: "Hello", serial: 1 },
    { payload: "Bye", serial: 2 },
  ]);
});

test("distribute to self and other, other sets serial", () => {
  const processor = createProcessor<string>();
  const client0 = processor.createClient("3001");
  const client1 = processor.createClient("3002");

  const client0Heard: ReceivedUpdate<string>[] = [];
  const client1Heard: ReceivedUpdate<string>[] = [];

  client0.setUpdateListener((update) => {
    client0Heard.push(update);
  }, 0);

  client1.setUpdateListener((update) => {
    client1Heard.push(update);
  }, 1);

  client0.sendUpdate({ payload: "Hello" }, "update");
  client1.sendUpdate({ payload: "Bye" }, "update 2");
  expect(client0Heard).toMatchObject([
    { payload: "Hello", serial: 1 },
    { payload: "Bye", serial: 2 },
  ]);
  expect(client1Heard).toMatchObject([{ payload: "Bye", serial: 2 }]);
});

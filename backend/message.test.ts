import { createProcessor } from "./message";

test("distribute to self", () => {
  const processor = createProcessor();
  const client0 = processor.createClient("3001");

  const client0Heard: string[] = [];

  client0.setUpdateListener(({ payload }: { payload: any }) => {
    client0Heard.push(payload);
  }, 0);

  client0.sendUpdate({ payload: "Hello" }, "update");

  expect(client0Heard).toMatchObject(["Hello"]);
});

test("distribute to self and other", () => {
  const processor = createProcessor();
  const client0 = processor.createClient("3001");
  const client1 = processor.createClient("3002");

  const client0Heard: string[] = [];
  const client1Heard: string[] = [];

  client0.setUpdateListener(({ payload }: { payload: any }) => {
    client0Heard.push(payload);
  }, 0);

  client1.setUpdateListener(({ payload }: { payload: any }) => {
    client1Heard.push(payload);
  }, 0);

  client0.sendUpdate({ payload: "Hello" }, "update");
  client1.sendUpdate({ payload: "Bye" }, "update 2");
  expect(client0Heard).toMatchObject(["Hello", "Bye"]);
  expect(client1Heard).toMatchObject(["Hello", "Bye"]);
});

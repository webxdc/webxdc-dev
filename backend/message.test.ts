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
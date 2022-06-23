import { createProcessor } from "./message";
import type { ReceivedUpdate } from "../types/webxdc-types";

test("distribute to self", () => {
  const processor = createProcessor<string>();
  const client0 = processor.createClient("3001");

  const client0Heard: ReceivedUpdate<string>[] = [];

  client0.connect((updates) => {
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

  client0.connect((updates) => {
    client0Heard.push(...updates);
  }, 0);

  client1.connect((updates) => {
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

  client0.connect((updates) => {
    client0Heard.push(...updates);
  }, 0);

  client1.connect((updates) => {
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

  client0.connect((updates) => {
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

  client1.connect((updates) => {
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

  client0.connect((updates) => {
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

  client1.connect((updates) => {
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

  client0.connect((updates) => {
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
  client1.connect((updates) => {
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

test("wipe single client", () => {
  const processor = createProcessor<string>();
  const client0 = processor.createClient("3001");

  const client0Wiped: string[] = [];

  client0.connect(
    () => {},
    0,
    () => {
      client0Wiped.push("wiped");
    }
  );

  processor.wipe();

  expect(client0Wiped).toMatchObject(["wiped"]);

  // reconnecting shouldn't have an effect as it was wiped already
  client0.connect(
    () => {},
    0,
    () => {
      client0Wiped.push("wiped");
    }
  );
  expect(client0Wiped).toMatchObject(["wiped"]);
});

test("wipe multiple clients", () => {
  const processor = createProcessor<string>();
  const client0 = processor.createClient("3001");
  const client1 = processor.createClient("3002");

  const client0Wiped: string[] = [];
  const client1Wiped: string[] = [];

  client0.connect(
    () => {},
    0,
    () => {
      client0Wiped.push("wiped");
    }
  );

  client1.connect(
    () => {},
    0,
    () => {
      client1Wiped.push("wiped");
    }
  );

  processor.wipe();

  expect(client0Wiped).toMatchObject(["wiped"]);
  expect(client1Wiped).toMatchObject(["wiped"]);

  // reconnecting doesn't have any effect as it was already wiped
  client0.connect(
    () => {},
    0,
    () => {
      client0Wiped.push("wiped");
    }
  );
  expect(client0Wiped).toMatchObject(["wiped"]);
});

test("wipe client that is created later", () => {
  const processor = createProcessor<string>();
  const client0 = processor.createClient("3001");

  const client0Wiped: string[] = [];
  const client1Wiped: string[] = [];

  client0.connect(
    () => {},
    0,
    () => {
      client0Wiped.push("wiped");
    }
  );

  processor.wipe();

  const client1 = processor.createClient("3002");
  client1.connect(
    () => {},
    0,
    () => {
      client1Wiped.push("wiped");
    }
  );

  expect(client0Wiped).toMatchObject(["wiped"]);
  expect(client1Wiped).toMatchObject(["wiped"]);
});

test("wipe multiple clients, multiple times", () => {
  const processor = createProcessor<string>();
  const client0 = processor.createClient("3001");
  const client1 = processor.createClient("3002");

  const client0Wiped: string[] = [];
  const client1Wiped: string[] = [];

  client0.connect(
    () => {},
    0,
    () => {
      client0Wiped.push("wiped");
    }
  );

  client1.connect(
    () => {},
    0,
    () => {
      client1Wiped.push("wiped");
    }
  );

  processor.wipe();
  processor.wipe();

  expect(client0Wiped).toMatchObject(["wiped", "wiped"]);
  expect(client1Wiped).toMatchObject(["wiped", "wiped"]);
});

test("connect with wipe means we get no catchup if no new updates", () => {
  const processor = createProcessor<string>();
  const client0 = processor.createClient("3001");

  const client0Heard: (ReceivedUpdate<string> | string)[] = [];
  const client1Heard: (ReceivedUpdate<string> | string)[] = [];

  client0.connect(
    (updates) => {
      client0Heard.push(...updates);
    },
    0,
    () => {
      client0Heard.push("wipe");
    }
  );

  client0.sendUpdate({ payload: "Hello" }, "update");
  client0.sendUpdate({ payload: "Bye" }, "update 2");

  // now we wipe, triggering a wipe event
  processor.wipe();

  expect(client0Heard).toMatchObject([
    { payload: "Hello", serial: 1, max_serial: 1 },
    { payload: "Bye", serial: 2, max_serial: 2 },
    "wipe",
  ]);

  // we only join later, so we haven't heard a thing yet
  expect(client1Heard).toMatchObject([]);
  const client1 = processor.createClient("3002");

  client1.connect(
    (updates) => {
      client1Heard.push(...updates);
    },
    0,
    () => {
      client1Heard.push("wipe");
    }
  );

  expect(client0Heard).toMatchObject([
    { payload: "Hello", serial: 1, max_serial: 1 },
    { payload: "Bye", serial: 2, max_serial: 2 },
    "wipe",
  ]);
  expect(client1Heard).toMatchObject(["wipe"]);
});

test("connect with wipe means catchup only with updates after wipe", () => {
  const processor = createProcessor<string>();
  const client0 = processor.createClient("3001");

  const client0Heard: (ReceivedUpdate<string> | string)[] = [];
  const client1Heard: (ReceivedUpdate<string> | string)[] = [];

  client0.connect(
    (updates) => {
      client0Heard.push(...updates);
    },
    0,
    () => {
      client0Heard.push("wipe");
    }
  );

  client0.sendUpdate({ payload: "Hello" }, "update");
  client0.sendUpdate({ payload: "Bye" }, "update 2");

  // now we wipe, triggering a wipe event
  processor.wipe();

  // the aftermath update, which the newly connecting client should get
  client0.sendUpdate({ payload: "Aftermath" }, "update 3");

  expect(client0Heard).toMatchObject([
    { payload: "Hello", serial: 1, max_serial: 1 },
    { payload: "Bye", serial: 2, max_serial: 2 },
    "wipe",
    { payload: "Aftermath", serial: 1, max_serial: 1 },
  ]);

  // we only join later, so we haven't heard a thing yet
  expect(client1Heard).toMatchObject([]);
  const client1 = processor.createClient("3002");

  client1.connect(
    (updates) => {
      client1Heard.push(...updates);
    },
    0,
    () => {
      client1Heard.push("wipe");
    }
  );

  expect(client0Heard).toMatchObject([
    { payload: "Hello", serial: 1, max_serial: 1 },
    { payload: "Bye", serial: 2, max_serial: 2 },
    "wipe",
    { payload: "Aftermath", serial: 1, max_serial: 1 },
  ]);
  expect(client1Heard).toMatchObject([
    "wipe",
    {
      payload: "Aftermath",
      serial: 1,
      max_serial: 1,
    },
  ]);
});

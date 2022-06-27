import { createProcessor, UpdateDescr } from "./message";
import type { Message } from "../types/message";

// a little helper to let us track messages for testing purposes
function track(): [() => Message[], (message: Message) => void] {
  const messages: Message[] = [];
  const getMessages = () => {
    return messages;
  };
  const onMessage = (message: Message) => {
    messages.push(message);
  };
  return [getMessages, onMessage];
}

test("distribute to self", () => {
  const [getMessages, onMessage] = track();

  const processor = createProcessor(onMessage);
  const client0 = processor.createClient("3001");

  const client0Heard: UpdateDescr[] = [];

  client0.connect((updates) => {
    client0Heard.push(...updates);
  }, 0);

  client0.sendUpdate({ payload: "Hello" }, "update");

  expect(client0Heard).toMatchObject([
    [{ payload: "Hello", serial: 1, max_serial: 1 }, "update"],
  ]);

  expect(getMessages()).toEqual([
    { type: "clear", instanceId: "3001" },
    {
      type: "sent",
      instanceId: "3001",
      update: { payload: "Hello", serial: 1, max_serial: 1 },
      descr: "update",
    },
    {
      type: "received",
      update: { payload: "Hello", serial: 1, max_serial: 1 },
      instanceId: "3001",
      descr: "update",
    },
  ]);
});

test("distribute to self and other", () => {
  const [getMessages, onMessage] = track();
  const processor = createProcessor(onMessage);
  const client0 = processor.createClient("3001");
  const client1 = processor.createClient("3002");

  const client0Heard: UpdateDescr[] = [];
  const client1Heard: UpdateDescr[] = [];

  client0.connect((updates) => {
    client0Heard.push(...updates);
  }, 0);

  client1.connect((updates) => {
    client1Heard.push(...updates);
  }, 0);

  client0.sendUpdate({ payload: "Hello" }, "update");
  client1.sendUpdate({ payload: "Bye" }, "update 2");
  expect(client0Heard).toMatchObject([
    [{ payload: "Hello", serial: 1, max_serial: 1 }, "update"],
    [{ payload: "Bye", serial: 2, max_serial: 2 }, "update 2"],
  ]);
  expect(client1Heard).toMatchObject([
    [{ payload: "Hello", serial: 1, max_serial: 1 }, "update"],
    [{ payload: "Bye", serial: 2, max_serial: 2 }, "update 2"],
  ]);

  expect(getMessages()).toEqual([
    { type: "clear", instanceId: "3001" },
    { type: "clear", instanceId: "3002" },
    {
      type: "sent",
      instanceId: "3001",
      update: { payload: "Hello", serial: 1, max_serial: 1 },
      descr: "update",
    },
    {
      type: "received",
      update: { payload: "Hello", serial: 1, max_serial: 1 },
      instanceId: "3001",
      descr: "update",
    },
    {
      type: "received",
      update: { payload: "Hello", serial: 1, max_serial: 1 },
      instanceId: "3002",
      descr: "update",
    },
    {
      type: "sent",
      instanceId: "3002",
      update: { payload: "Bye", serial: 2, max_serial: 2 },
      descr: "update 2",
    },
    {
      type: "received",
      update: { payload: "Bye", serial: 2, max_serial: 2 },
      instanceId: "3001",
      descr: "update 2",
    },
    {
      type: "received",
      update: { payload: "Bye", serial: 2, max_serial: 2 },
      instanceId: "3002",
      descr: "update 2",
    },
  ]);
});

test("setUpdateListener serial should skip older", () => {
  const processor = createProcessor();
  const client0 = processor.createClient("3001");
  const client1 = processor.createClient("3002");

  const client0Heard: UpdateDescr[] = [];
  const client1Heard: UpdateDescr[] = [];

  client0.connect((updates) => {
    client0Heard.push(...updates);
  }, 0);

  client1.connect((updates) => {
    client1Heard.push(...updates);
  }, 1);

  client0.sendUpdate({ payload: "Hello" }, "update");
  client0.sendUpdate({ payload: "Bye" }, "update 2");
  expect(client0Heard).toMatchObject([
    [{ payload: "Hello", serial: 1, max_serial: 1 }, "update"],
    [{ payload: "Bye", serial: 2, max_serial: 2 }, "update 2"],
  ]);
  expect(client1Heard).toMatchObject([
    [{ payload: "Bye", serial: 2, max_serial: 2 }, "update 2"],
  ]);
});

test("other starts listening later", () => {
  const [getMessages, onMessage] = track();
  const processor = createProcessor(onMessage);
  const client0 = processor.createClient("3001");
  const client1 = processor.createClient("3002");

  const client0Heard: UpdateDescr[] = [];
  const client1Heard: UpdateDescr[] = [];

  client0.connect((updates) => {
    client0Heard.push(...updates);
  }, 0);

  client0.sendUpdate({ payload: "Hello" }, "update");
  client0.sendUpdate({ payload: "Bye" }, "update 2");

  expect(client0Heard).toMatchObject([
    [{ payload: "Hello", serial: 1, max_serial: 1 }, "update"],
    [{ payload: "Bye", serial: 2, max_serial: 2 }, "update 2"],
  ]);
  // we only join later, so we haven't heard a thing yet
  expect(client1Heard).toMatchObject([]);

  client1.connect((updates) => {
    client1Heard.push(...updates);
  }, 0);

  expect(client0Heard).toMatchObject([
    [{ payload: "Hello", serial: 1, max_serial: 1 }, "update"],
    [{ payload: "Bye", serial: 2, max_serial: 2 }, "update 2"],
  ]);
  expect(client1Heard).toMatchObject([
    [{ payload: "Hello", serial: 1, max_serial: 2 }, "update"],
    [{ payload: "Bye", serial: 2, max_serial: 2 }, "update 2"],
  ]);

  expect(getMessages()).toEqual([
    { type: "clear", instanceId: "3001" },
    {
      type: "sent",
      instanceId: "3001",
      update: { payload: "Hello", serial: 1, max_serial: 1 },
      descr: "update",
    },
    {
      type: "received",
      update: { payload: "Hello", serial: 1, max_serial: 1 },
      instanceId: "3001",
      descr: "update",
    },
    {
      type: "sent",
      instanceId: "3001",
      update: { payload: "Bye", serial: 2, max_serial: 2 },
      descr: "update 2",
    },
    {
      type: "received",
      update: { payload: "Bye", serial: 2, max_serial: 2 },
      instanceId: "3001",
      descr: "update 2",
    },
    { type: "clear", instanceId: "3002" },
    {
      type: "received",
      update: { payload: "Hello", serial: 1, max_serial: 2 },
      instanceId: "3002",
      descr: "update",
    },
    {
      type: "received",
      update: { payload: "Bye", serial: 2, max_serial: 2 },
      instanceId: "3002",
      descr: "update 2",
    },
  ]);
});

test("client is created later and needs to catch up", () => {
  const processor = createProcessor();
  const client0 = processor.createClient("3001");

  const client0Heard: UpdateDescr[] = [];
  const client1Heard: UpdateDescr[] = [];

  client0.connect((updates) => {
    client0Heard.push(...updates);
  }, 0);

  client0.sendUpdate({ payload: "Hello" }, "update");
  client0.sendUpdate({ payload: "Bye" }, "update 2");

  expect(client0Heard).toMatchObject([
    [{ payload: "Hello", serial: 1, max_serial: 1 }, "update"],
    [{ payload: "Bye", serial: 2, max_serial: 2 }, "update 2"],
  ]);

  // we only join later, so we haven't heard a thing yet
  expect(client1Heard).toMatchObject([]);
  const client1 = processor.createClient("3002");

  client1.connect((updates) => {
    client1Heard.push(...updates);
  }, 0);

  expect(client0Heard).toMatchObject([
    [{ payload: "Hello", serial: 1, max_serial: 1 }, "update"],
    [{ payload: "Bye", serial: 2, max_serial: 2 }, "update 2"],
  ]);
  expect(client1Heard).toMatchObject([
    [{ payload: "Hello", serial: 1, max_serial: 2 }, "update"],
    [{ payload: "Bye", serial: 2, max_serial: 2 }, "update 2"],
  ]);
});

test("other starts listening later but is partially caught up", () => {
  const processor = createProcessor();
  const client0 = processor.createClient("3001");
  const client1 = processor.createClient("3002");

  const client0Heard: UpdateDescr[] = [];
  const client1Heard: UpdateDescr[] = [];

  client0.connect((updates) => {
    client0Heard.push(...updates);
  }, 0);

  client0.sendUpdate({ payload: "Hello" }, "update");
  client0.sendUpdate({ payload: "Bye" }, "update 2");
  expect(client0Heard).toMatchObject([
    [{ payload: "Hello", serial: 1, max_serial: 1 }, "update"],
    [{ payload: "Bye", serial: 2, max_serial: 2 }, "update 2"],
  ]);
  // we only join later, so we haven't heard a thing yet
  expect(client1Heard).toMatchObject([]);

  // start at 1, as we're already partially caught up
  client1.connect((updates) => {
    client1Heard.push(...updates);
  }, 1);

  expect(client0Heard).toMatchObject([
    [{ payload: "Hello", serial: 1, max_serial: 1 }, "update"],
    [{ payload: "Bye", serial: 2, max_serial: 2 }, "update 2"],
  ]);
  expect(client1Heard).toMatchObject([
    [{ payload: "Bye", serial: 2, max_serial: 2 }, "update 2"],
  ]);
});

test("clear single client", () => {
  const processor = createProcessor();
  const client0 = processor.createClient("3001");

  const client0Cleared: string[] = [];

  client0.connect(
    () => {},
    0,
    () => {
      client0Cleared.push("cleared");
    }
  );
  // we always clear on first connection with a new processor
  expect(client0Cleared).toMatchObject(["cleared"]);

  processor.clear();

  expect(client0Cleared).toMatchObject(["cleared", "cleared"]);

  // reconnecting shouldn't have an effect as it was cleared already
  client0.connect(
    () => {},
    0,
    () => {
      client0Cleared.push("cleared");
    }
  );
  expect(client0Cleared).toMatchObject(["cleared", "cleared"]);
});

test("clear multiple clients", () => {
  const processor = createProcessor();
  const client0 = processor.createClient("3001");
  const client1 = processor.createClient("3002");

  const client0Cleared: string[] = [];
  const client1Cleared: string[] = [];

  client0.connect(
    () => {},
    0,
    () => {
      client0Cleared.push("cleared");
    }
  );

  client1.connect(
    () => {},
    0,
    () => {
      client1Cleared.push("cleared");
    }
  );

  expect(client0Cleared).toMatchObject(["cleared"]);
  expect(client1Cleared).toMatchObject(["cleared"]);

  processor.clear();

  expect(client0Cleared).toMatchObject(["cleared", "cleared"]);
  expect(client1Cleared).toMatchObject(["cleared", "cleared"]);

  // reconnecting doesn't have any effect as it was already Cleared
  client0.connect(
    () => {},
    0,
    () => {
      client0Cleared.push("cleared");
    }
  );
  expect(client0Cleared).toMatchObject(["cleared", "cleared"]);
});

test("clear client that is created later", () => {
  const processor = createProcessor();
  const client0 = processor.createClient("3001");

  const client0Cleared: string[] = [];
  const client1Cleared: string[] = [];

  client0.connect(
    () => {},
    0,
    () => {
      client0Cleared.push("cleared");
    }
  );

  expect(client0Cleared).toMatchObject(["cleared"]);
  expect(client1Cleared).toMatchObject([]);

  processor.clear();

  const client1 = processor.createClient("3002");
  client1.connect(
    () => {},
    0,
    () => {
      client1Cleared.push("cleared");
    }
  );

  expect(client0Cleared).toMatchObject(["cleared", "cleared"]);
  // first connected, so cleared only once
  expect(client1Cleared).toMatchObject(["cleared"]);
});

test("clear multiple clients, multiple times", () => {
  const processor = createProcessor();
  const client0 = processor.createClient("3001");
  const client1 = processor.createClient("3002");

  const client0Cleared: string[] = [];
  const client1Cleared: string[] = [];

  client0.connect(
    () => {},
    0,
    () => {
      client0Cleared.push("cleared");
    }
  );

  client1.connect(
    () => {},
    0,
    () => {
      client1Cleared.push("cleared");
    }
  );

  expect(client0Cleared).toMatchObject(["cleared"]);
  expect(client1Cleared).toMatchObject(["cleared"]);

  processor.clear();
  processor.clear();

  expect(client0Cleared).toMatchObject(["cleared", "cleared", "cleared"]);
  expect(client1Cleared).toMatchObject(["cleared", "cleared", "cleared"]);
});

test("connect with clear means we get no catchup if no new updates", () => {
  const processor = createProcessor();
  const client0 = processor.createClient("3001");

  const client0Heard: (UpdateDescr | string)[] = [];
  const client1Heard: (UpdateDescr | string)[] = [];

  client0.connect(
    (updates) => {
      client0Heard.push(...updates);
    },
    0,
    () => {
      client0Heard.push("cleared");
    }
  );

  client0.sendUpdate({ payload: "Hello" }, "update");
  client0.sendUpdate({ payload: "Bye" }, "update 2");

  // now we clear
  processor.clear();

  expect(client0Heard).toMatchObject([
    "cleared",
    [{ payload: "Hello", serial: 1, max_serial: 1 }, "update"],
    [{ payload: "Bye", serial: 2, max_serial: 2 }, "update 2"],
    "cleared",
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
      client1Heard.push("cleared");
    }
  );

  expect(client0Heard).toMatchObject([
    "cleared",
    [{ payload: "Hello", serial: 1, max_serial: 1 }, "update"],
    [{ payload: "Bye", serial: 2, max_serial: 2 }, "update 2"],
    "cleared",
  ]);
  expect(client1Heard).toMatchObject(["cleared"]);
});

test("connect with clear means catchup only with updates after clear", () => {
  const [getMessages, onMessage] = track();
  const processor = createProcessor(onMessage);
  const client0 = processor.createClient("3001");

  const client0Heard: (UpdateDescr | string)[] = [];
  const client1Heard: (UpdateDescr | string)[] = [];

  client0.connect(
    (updates) => {
      client0Heard.push(...updates);
    },
    0,
    () => {
      client0Heard.push("cleared");
    }
  );

  client0.sendUpdate({ payload: "Hello" }, "update");
  client0.sendUpdate({ payload: "Bye" }, "update 2");

  processor.clear();

  // the aftermath update, which the newly connecting client should get
  client0.sendUpdate({ payload: "Aftermath" }, "update 3");

  expect(client0Heard).toMatchObject([
    "cleared",
    [{ payload: "Hello", serial: 1, max_serial: 1 }, "update"],
    [{ payload: "Bye", serial: 2, max_serial: 2 }, "update 2"],
    "cleared",
    [{ payload: "Aftermath", serial: 1, max_serial: 1 }, "update 3"],
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
      client1Heard.push("cleared");
    }
  );

  expect(client0Heard).toMatchObject([
    "cleared",
    [{ payload: "Hello", serial: 1, max_serial: 1 }, "update"],
    [{ payload: "Bye", serial: 2, max_serial: 2 }, "update 2"],
    "cleared",
    [{ payload: "Aftermath", serial: 1, max_serial: 1 }, "update 3"],
  ]);
  expect(client1Heard).toMatchObject([
    "cleared",
    [{ payload: "Aftermath", serial: 1, max_serial: 1 }, "update 3"],
  ]);

  expect(getMessages()).toEqual([
    { type: "clear", instanceId: "3001" },
    {
      type: "sent",
      instanceId: "3001",
      update: { payload: "Hello", serial: 1, max_serial: 1 },
      descr: "update",
    },
    {
      type: "received",
      update: { payload: "Hello", serial: 1, max_serial: 1 },
      instanceId: "3001",
      descr: "update",
    },
    {
      type: "sent",
      instanceId: "3001",
      update: { payload: "Bye", serial: 2, max_serial: 2 },
      descr: "update 2",
    },
    {
      type: "received",
      update: { payload: "Bye", serial: 2, max_serial: 2 },
      instanceId: "3001",
      descr: "update 2",
    },
    { type: "clear", instanceId: "3001" },
    {
      type: "sent",
      instanceId: "3001",
      update: { payload: "Aftermath", serial: 1, max_serial: 1 },
      descr: "update 3",
    },
    {
      type: "received",
      update: { payload: "Aftermath", serial: 1, max_serial: 1 },
      instanceId: "3001",
      descr: "update 3",
    },
    { type: "clear", instanceId: "3002" },
    {
      type: "received",
      instanceId: "3002",
      update: { payload: "Aftermath", serial: 1, max_serial: 1 },
      descr: "update 3",
    },
  ]);
});

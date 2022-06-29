import { ReceivedUpdate, JsonValue } from "./webxdc";

export type UpdateMessage = {
  instanceId: string;
  instanceColor: string;
  update: ReceivedUpdate<JsonValue>;
  descr: string;
};

export type Message =
  | (UpdateMessage & { type: "sent" })
  | (UpdateMessage & { type: "received" })
  | { type: "clear"; instanceId: string; instanceColor: string };

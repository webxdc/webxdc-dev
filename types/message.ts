import { ReceivedUpdate, JsonValue } from "./webxdc-types";

type UpdateMessage = {
  clientId: string;
  update: ReceivedUpdate<JsonValue>;
  descr: string;
};

export type Message =
  | (UpdateMessage & { type: "sent" })
  | (UpdateMessage & { type: "received" })
  | { type: "clear"; clientId: string };

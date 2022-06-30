import { ReceivedUpdate, JsonValue } from "./webxdc";

export type InstanceMessage = {
  instanceId: string;
  instanceColor: string;
};

export type BaseUpdateMessage = {
  update: ReceivedUpdate<JsonValue>;
  descr: string;
} & InstanceMessage;

export type UpdateMessage =
  | (BaseUpdateMessage & { type: "sent" })
  | (BaseUpdateMessage & { type: "received" });

export type Message =
  | UpdateMessage
  | ({ type: "clear" } & InstanceMessage)
  | ({ type: "connect" } & InstanceMessage);

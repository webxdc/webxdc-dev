import { ReceivedStatusUpdate } from "@webxdc/types";

export type InstanceMessage = {
  instanceId: string;
  instanceColor: string;
  timestamp: number;
};

export type BaseUpdateMessage = {
  update: ReceivedStatusUpdate<any>;
} & InstanceMessage;

export type UpdateMessage =
  | (BaseUpdateMessage & { type: "sent" })
  | (BaseUpdateMessage & { type: "received" });

export type Message =
  | UpdateMessage
  | ({ type: "realtime-sent", data: Uint8Array} & InstanceMessage)
  | ({ type: "clear" } & InstanceMessage)
  | ({ type: "connect" } & InstanceMessage);

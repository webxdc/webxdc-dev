import { ReceivedStatusUpdate } from "@webxdc/types";

export type InstanceMessage = {
  instanceId: string;
  instanceColor: string;
  timestamp: number;
};

export type BaseUpdateMessage = {
  update: ReceivedStatusUpdate<any>;
  descr: string;
} & InstanceMessage;

export type UpdateMessage =
  | (BaseUpdateMessage & { type: "sent" })
  | (BaseUpdateMessage & { type: "received" });

export type Message =
  | UpdateMessage
  | ({ type: "sendRealtime", data: Uint8Array } & InstanceMessage)
  | ({ type: "clear" } & InstanceMessage)
  | ({ type: "connect" } & InstanceMessage)
  | ({ type: "connect-realtime" } & InstanceMessage)
  | ({ type: "realtime-received", data: Uint8Array} & InstanceMessage);

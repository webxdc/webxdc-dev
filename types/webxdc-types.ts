// XXX these type signatures should go into some reusable typescript library

type JsonObject = {
  [x: string]: JsonValue;
};

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonObject
  | Array<JsonValue>;

export type Update = {
  payload: JsonValue;
  info?: string;
  document?: string;
  summary?: string;
};

export type ReceivedUpdate = Update & {
  serial: number;
  max_serial: number;
};

export type UpdateListener = (update: ReceivedUpdate) => void;

export type SendUpdate = (update: Update, descr: string) => void;

export type SetUpdateListener = (
  listener: UpdateListener,
  serial: number
) => void;

export type WebXdc = {
  sendUpdate: SendUpdate;
  setUpdateListener: SetUpdateListener;
  selfAddr: string;
  selfName: string;
};

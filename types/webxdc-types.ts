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

export type Update<T> = {
  payload: T;
  info?: string;
  document?: string;
  summary?: string;
};

export type ReceivedUpdate<T> = Update<T> & {
  serial: number;
  max_serial: number;
};

export type UpdateListener<T> = (update: ReceivedUpdate<T>) => void;

export type SendUpdate<T> = (update: Update<T>, descr: string) => void;

// XXX this should resolve a promise
export type SetUpdateListener<T> = (
  listener: UpdateListener<T>,
  serial: number
) => Promise<void>;

export type WebXdc<T = JsonValue> = {
  sendUpdate: SendUpdate<T>;
  setUpdateListener: SetUpdateListener<T>;
  selfAddr: string;
  selfName: string;
};

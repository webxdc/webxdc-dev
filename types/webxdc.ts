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

type XDCFile = {
  /** name of the file, including extension */
  name: string;
} & (
  | {
      /** Blob, also accepts inherit types like File */
      blob: Blob;
    }
  | {
      /** base64 encoded file data */
      base64: string;
    }
  | {
      /** text for textfile, will be encoded as utf8 */
      plainText: string;
    }
);

type SendOptions =
  | {
      file: XDCFile;
      text?: string;
    }
  | {
      file?: XDCFile;
      text: string;
    };

export type ReceivedUpdate<T> = Update<T> & {
  serial: number;
  max_serial: number;
};

export type UpdateListener<T> = (update: ReceivedUpdate<T>) => void;

export type SendUpdate<T> = (update: Update<T>, descr: string) => void;

export type SendToChat = (message: SendOptions) => Promise<void>;

export type ImportFiles = (filter: {
  /**
   * mimetypes as in https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/accept#unique_file_type_specifiers
   */
  mimeTypes?: string[];
  /** only show files with these extensions.
   * All extensions need to start with a dot and have the format `.ext`. */
  extensions?: string[];
  /** false by default, whether to allow multiple files to be selected */
  multiple?: boolean;
}) => Promise<File[]>;

export type SetUpdateListener<T> = (
  listener: UpdateListener<T>,
  serial: number,
) => Promise<void>;

export type WebXdc<T = JsonValue> = {
  sendUpdate: SendUpdate<T>;
  setUpdateListener: SetUpdateListener<T>;
  sendToChat: SendToChat;
  importFiles: ImportFiles;
  selfAddr: string;
  selfName: string;
};

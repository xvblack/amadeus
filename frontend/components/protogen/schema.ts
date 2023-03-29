/* eslint-disable */
import Long from "long";
import _m0 from "protobufjs/minimal";

export const protobufPackage = "";

export enum Source {
  UNDEFINED_SEED = 0,
  POCKET = 1,
  TELEGRAM = 2,
  RSS_PODCAST = 3,
  FEEDLY = 4,
  INFERRED = 5,
  UNRECOGNIZED = -1,
}

export function sourceFromJSON(object: any): Source {
  switch (object) {
    case 0:
    case "UNDEFINED_SEED":
      return Source.UNDEFINED_SEED;
    case 1:
    case "POCKET":
      return Source.POCKET;
    case 2:
    case "TELEGRAM":
      return Source.TELEGRAM;
    case 3:
    case "RSS_PODCAST":
      return Source.RSS_PODCAST;
    case 4:
    case "FEEDLY":
      return Source.FEEDLY;
    case 5:
    case "INFERRED":
      return Source.INFERRED;
    case -1:
    case "UNRECOGNIZED":
    default:
      return Source.UNRECOGNIZED;
  }
}

export function sourceToJSON(object: Source): string {
  switch (object) {
    case Source.UNDEFINED_SEED:
      return "UNDEFINED_SEED";
    case Source.POCKET:
      return "POCKET";
    case Source.TELEGRAM:
      return "TELEGRAM";
    case Source.RSS_PODCAST:
      return "RSS_PODCAST";
    case Source.FEEDLY:
      return "FEEDLY";
    case Source.INFERRED:
      return "INFERRED";
    case Source.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export enum ResourceType {
  UNDEFINED_RESOURCE_TYPE = 0,
  HTML = 1,
  PDF = 2,
  PODCAST = 3,
  VIDEO = 4,
  UNRECOGNIZED = -1,
}

export function resourceTypeFromJSON(object: any): ResourceType {
  switch (object) {
    case 0:
    case "UNDEFINED_RESOURCE_TYPE":
      return ResourceType.UNDEFINED_RESOURCE_TYPE;
    case 1:
    case "HTML":
      return ResourceType.HTML;
    case 2:
    case "PDF":
      return ResourceType.PDF;
    case 3:
    case "PODCAST":
      return ResourceType.PODCAST;
    case 4:
    case "VIDEO":
      return ResourceType.VIDEO;
    case -1:
    case "UNRECOGNIZED":
    default:
      return ResourceType.UNRECOGNIZED;
  }
}

export function resourceTypeToJSON(object: ResourceType): string {
  switch (object) {
    case ResourceType.UNDEFINED_RESOURCE_TYPE:
      return "UNDEFINED_RESOURCE_TYPE";
    case ResourceType.HTML:
      return "HTML";
    case ResourceType.PDF:
      return "PDF";
    case ResourceType.PODCAST:
      return "PODCAST";
    case ResourceType.VIDEO:
      return "VIDEO";
    case ResourceType.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export interface Seed {
  source: Source;
  id: string;
  title: string;
  abstract: string;
  raw_content: string;
  first_touch_timestamp: number;
  resource_type: ResourceType;
  web: Seed_WebPagePayload | undefined;
  attachment: Seed_AttachmentPayload | undefined;
  pocket_payload: Seed_PocketPayload | undefined;
}

export interface Seed_WebPagePayload {
  public_url: string;
}

export interface Seed_AttachmentPayload {
  file_path: string;
}

export interface Seed_PocketPayload {
  status: Seed_PocketPayload_Status;
}

export enum Seed_PocketPayload_Status {
  UNDEFINED_STATUS = 0,
  NEW = 1,
  ARCHIVED = 2,
  DELETED = 3,
  UNRECOGNIZED = -1,
}

export function seed_PocketPayload_StatusFromJSON(object: any): Seed_PocketPayload_Status {
  switch (object) {
    case 0:
    case "UNDEFINED_STATUS":
      return Seed_PocketPayload_Status.UNDEFINED_STATUS;
    case 1:
    case "NEW":
      return Seed_PocketPayload_Status.NEW;
    case 2:
    case "ARCHIVED":
      return Seed_PocketPayload_Status.ARCHIVED;
    case 3:
    case "DELETED":
      return Seed_PocketPayload_Status.DELETED;
    case -1:
    case "UNRECOGNIZED":
    default:
      return Seed_PocketPayload_Status.UNRECOGNIZED;
  }
}

export function seed_PocketPayload_StatusToJSON(object: Seed_PocketPayload_Status): string {
  switch (object) {
    case Seed_PocketPayload_Status.UNDEFINED_STATUS:
      return "UNDEFINED_STATUS";
    case Seed_PocketPayload_Status.NEW:
      return "NEW";
    case Seed_PocketPayload_Status.ARCHIVED:
      return "ARCHIVED";
    case Seed_PocketPayload_Status.DELETED:
      return "DELETED";
    case Seed_PocketPayload_Status.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export interface Post {
  id: string;
  url: string;
  source: string;
  time_added: number;
  title: string;
  abstract: string;
  tags: string[];
  /** repeated Document sub_documents = 9; */
  html: string;
}

function createBaseSeed(): Seed {
  return {
    source: 0,
    id: "",
    title: "",
    abstract: "",
    raw_content: "",
    first_touch_timestamp: 0,
    resource_type: 0,
    web: undefined,
    attachment: undefined,
    pocket_payload: undefined,
  };
}

export const Seed = {
  encode(message: Seed, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.source !== 0) {
      writer.uint32(8).int32(message.source);
    }
    if (message.id !== "") {
      writer.uint32(18).string(message.id);
    }
    if (message.title !== "") {
      writer.uint32(26).string(message.title);
    }
    if (message.abstract !== "") {
      writer.uint32(34).string(message.abstract);
    }
    if (message.raw_content !== "") {
      writer.uint32(42).string(message.raw_content);
    }
    if (message.first_touch_timestamp !== 0) {
      writer.uint32(48).int64(message.first_touch_timestamp);
    }
    if (message.resource_type !== 0) {
      writer.uint32(56).int32(message.resource_type);
    }
    if (message.web !== undefined) {
      Seed_WebPagePayload.encode(message.web, writer.uint32(66).fork()).ldelim();
    }
    if (message.attachment !== undefined) {
      Seed_AttachmentPayload.encode(message.attachment, writer.uint32(74).fork()).ldelim();
    }
    if (message.pocket_payload !== undefined) {
      Seed_PocketPayload.encode(message.pocket_payload, writer.uint32(90).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Seed {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSeed();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.source = reader.int32() as any;
          break;
        case 2:
          message.id = reader.string();
          break;
        case 3:
          message.title = reader.string();
          break;
        case 4:
          message.abstract = reader.string();
          break;
        case 5:
          message.raw_content = reader.string();
          break;
        case 6:
          message.first_touch_timestamp = longToNumber(reader.int64() as Long);
          break;
        case 7:
          message.resource_type = reader.int32() as any;
          break;
        case 8:
          message.web = Seed_WebPagePayload.decode(reader, reader.uint32());
          break;
        case 9:
          message.attachment = Seed_AttachmentPayload.decode(reader, reader.uint32());
          break;
        case 11:
          message.pocket_payload = Seed_PocketPayload.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): Seed {
    return {
      source: isSet(object.source) ? sourceFromJSON(object.source) : 0,
      id: isSet(object.id) ? String(object.id) : "",
      title: isSet(object.title) ? String(object.title) : "",
      abstract: isSet(object.abstract) ? String(object.abstract) : "",
      raw_content: isSet(object.raw_content) ? String(object.raw_content) : "",
      first_touch_timestamp: isSet(object.first_touch_timestamp) ? Number(object.first_touch_timestamp) : 0,
      resource_type: isSet(object.resource_type) ? resourceTypeFromJSON(object.resource_type) : 0,
      web: isSet(object.web) ? Seed_WebPagePayload.fromJSON(object.web) : undefined,
      attachment: isSet(object.attachment) ? Seed_AttachmentPayload.fromJSON(object.attachment) : undefined,
      pocket_payload: isSet(object.pocket_payload) ? Seed_PocketPayload.fromJSON(object.pocket_payload) : undefined,
    };
  },

  toJSON(message: Seed): unknown {
    const obj: any = {};
    message.source !== undefined && (obj.source = sourceToJSON(message.source));
    message.id !== undefined && (obj.id = message.id);
    message.title !== undefined && (obj.title = message.title);
    message.abstract !== undefined && (obj.abstract = message.abstract);
    message.raw_content !== undefined && (obj.raw_content = message.raw_content);
    message.first_touch_timestamp !== undefined &&
      (obj.first_touch_timestamp = Math.round(message.first_touch_timestamp));
    message.resource_type !== undefined && (obj.resource_type = resourceTypeToJSON(message.resource_type));
    message.web !== undefined && (obj.web = message.web ? Seed_WebPagePayload.toJSON(message.web) : undefined);
    message.attachment !== undefined &&
      (obj.attachment = message.attachment ? Seed_AttachmentPayload.toJSON(message.attachment) : undefined);
    message.pocket_payload !== undefined &&
      (obj.pocket_payload = message.pocket_payload ? Seed_PocketPayload.toJSON(message.pocket_payload) : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<Seed>, I>>(object: I): Seed {
    const message = createBaseSeed();
    message.source = object.source ?? 0;
    message.id = object.id ?? "";
    message.title = object.title ?? "";
    message.abstract = object.abstract ?? "";
    message.raw_content = object.raw_content ?? "";
    message.first_touch_timestamp = object.first_touch_timestamp ?? 0;
    message.resource_type = object.resource_type ?? 0;
    message.web = (object.web !== undefined && object.web !== null)
      ? Seed_WebPagePayload.fromPartial(object.web)
      : undefined;
    message.attachment = (object.attachment !== undefined && object.attachment !== null)
      ? Seed_AttachmentPayload.fromPartial(object.attachment)
      : undefined;
    message.pocket_payload = (object.pocket_payload !== undefined && object.pocket_payload !== null)
      ? Seed_PocketPayload.fromPartial(object.pocket_payload)
      : undefined;
    return message;
  },
};

function createBaseSeed_WebPagePayload(): Seed_WebPagePayload {
  return { public_url: "" };
}

export const Seed_WebPagePayload = {
  encode(message: Seed_WebPagePayload, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.public_url !== "") {
      writer.uint32(10).string(message.public_url);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Seed_WebPagePayload {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSeed_WebPagePayload();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.public_url = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): Seed_WebPagePayload {
    return { public_url: isSet(object.public_url) ? String(object.public_url) : "" };
  },

  toJSON(message: Seed_WebPagePayload): unknown {
    const obj: any = {};
    message.public_url !== undefined && (obj.public_url = message.public_url);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<Seed_WebPagePayload>, I>>(object: I): Seed_WebPagePayload {
    const message = createBaseSeed_WebPagePayload();
    message.public_url = object.public_url ?? "";
    return message;
  },
};

function createBaseSeed_AttachmentPayload(): Seed_AttachmentPayload {
  return { file_path: "" };
}

export const Seed_AttachmentPayload = {
  encode(message: Seed_AttachmentPayload, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.file_path !== "") {
      writer.uint32(10).string(message.file_path);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Seed_AttachmentPayload {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSeed_AttachmentPayload();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.file_path = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): Seed_AttachmentPayload {
    return { file_path: isSet(object.file_path) ? String(object.file_path) : "" };
  },

  toJSON(message: Seed_AttachmentPayload): unknown {
    const obj: any = {};
    message.file_path !== undefined && (obj.file_path = message.file_path);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<Seed_AttachmentPayload>, I>>(object: I): Seed_AttachmentPayload {
    const message = createBaseSeed_AttachmentPayload();
    message.file_path = object.file_path ?? "";
    return message;
  },
};

function createBaseSeed_PocketPayload(): Seed_PocketPayload {
  return { status: 0 };
}

export const Seed_PocketPayload = {
  encode(message: Seed_PocketPayload, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.status !== 0) {
      writer.uint32(8).int32(message.status);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Seed_PocketPayload {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSeed_PocketPayload();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.status = reader.int32() as any;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): Seed_PocketPayload {
    return { status: isSet(object.status) ? seed_PocketPayload_StatusFromJSON(object.status) : 0 };
  },

  toJSON(message: Seed_PocketPayload): unknown {
    const obj: any = {};
    message.status !== undefined && (obj.status = seed_PocketPayload_StatusToJSON(message.status));
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<Seed_PocketPayload>, I>>(object: I): Seed_PocketPayload {
    const message = createBaseSeed_PocketPayload();
    message.status = object.status ?? 0;
    return message;
  },
};

function createBasePost(): Post {
  return { id: "", url: "", source: "", time_added: 0, title: "", abstract: "", tags: [], html: "" };
}

export const Post = {
  encode(message: Post, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.url !== "") {
      writer.uint32(18).string(message.url);
    }
    if (message.source !== "") {
      writer.uint32(26).string(message.source);
    }
    if (message.time_added !== 0) {
      writer.uint32(32).int32(message.time_added);
    }
    if (message.title !== "") {
      writer.uint32(42).string(message.title);
    }
    if (message.abstract !== "") {
      writer.uint32(50).string(message.abstract);
    }
    for (const v of message.tags) {
      writer.uint32(58).string(v!);
    }
    if (message.html !== "") {
      writer.uint32(66).string(message.html);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Post {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePost();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.id = reader.string();
          break;
        case 2:
          message.url = reader.string();
          break;
        case 3:
          message.source = reader.string();
          break;
        case 4:
          message.time_added = reader.int32();
          break;
        case 5:
          message.title = reader.string();
          break;
        case 6:
          message.abstract = reader.string();
          break;
        case 7:
          message.tags.push(reader.string());
          break;
        case 8:
          message.html = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): Post {
    return {
      id: isSet(object.id) ? String(object.id) : "",
      url: isSet(object.url) ? String(object.url) : "",
      source: isSet(object.source) ? String(object.source) : "",
      time_added: isSet(object.time_added) ? Number(object.time_added) : 0,
      title: isSet(object.title) ? String(object.title) : "",
      abstract: isSet(object.abstract) ? String(object.abstract) : "",
      tags: Array.isArray(object?.tags) ? object.tags.map((e: any) => String(e)) : [],
      html: isSet(object.html) ? String(object.html) : "",
    };
  },

  toJSON(message: Post): unknown {
    const obj: any = {};
    message.id !== undefined && (obj.id = message.id);
    message.url !== undefined && (obj.url = message.url);
    message.source !== undefined && (obj.source = message.source);
    message.time_added !== undefined && (obj.time_added = Math.round(message.time_added));
    message.title !== undefined && (obj.title = message.title);
    message.abstract !== undefined && (obj.abstract = message.abstract);
    if (message.tags) {
      obj.tags = message.tags.map((e) => e);
    } else {
      obj.tags = [];
    }
    message.html !== undefined && (obj.html = message.html);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<Post>, I>>(object: I): Post {
    const message = createBasePost();
    message.id = object.id ?? "";
    message.url = object.url ?? "";
    message.source = object.source ?? "";
    message.time_added = object.time_added ?? 0;
    message.title = object.title ?? "";
    message.abstract = object.abstract ?? "";
    message.tags = object.tags?.map((e) => e) || [];
    message.html = object.html ?? "";
    return message;
  },
};

declare var self: any | undefined;
declare var window: any | undefined;
declare var global: any | undefined;
var globalThis: any = (() => {
  if (typeof globalThis !== "undefined") {
    return globalThis;
  }
  if (typeof self !== "undefined") {
    return self;
  }
  if (typeof window !== "undefined") {
    return window;
  }
  if (typeof global !== "undefined") {
    return global;
  }
  throw "Unable to locate global object";
})();

type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;

export type DeepPartial<T> = T extends Builtin ? T
  : T extends Array<infer U> ? Array<DeepPartial<U>> : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>>
  : T extends {} ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

type KeysOfUnion<T> = T extends T ? keyof T : never;
export type Exact<P, I extends P> = P extends Builtin ? P
  : P & { [K in keyof P]: Exact<P[K], I[K]> } & { [K in Exclude<keyof I, KeysOfUnion<P>>]: never };

function longToNumber(long: Long): number {
  if (long.gt(Number.MAX_SAFE_INTEGER)) {
    throw new globalThis.Error("Value is larger than Number.MAX_SAFE_INTEGER");
  }
  return long.toNumber();
}

if (_m0.util.Long !== Long) {
  _m0.util.Long = Long as any;
  _m0.configure();
}

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}

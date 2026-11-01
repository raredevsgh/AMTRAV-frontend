/** UUID and timestamp values are serialized as strings over HTTP. */
export type Uuid = string;
export type IsoTimestamp = string;

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

export type PaginationParams = {
  limit?: number;
  offset?: number;
};

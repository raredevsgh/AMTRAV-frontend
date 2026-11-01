export type {
  Credentials,
  Role,
  TokenPair,
  User,
} from "./auth";
export type {
  Device,
  DeviceAudit,
  DeviceListParams,
  DeviceStatus,
  ProvisionedDevice,
  RegisterDevice,
  UpdateDevice,
} from "./devices";
export type {
  JobReceipt,
  JobResult,
  ManufacturerCredentials,
  ManufacturerJobResult,
  ManufacturerResponse,
  RoleUpdate,
  UserListParams,
} from "./administration";
export type { FileListParams, FileMetadata } from "./files";
export type {
  IsoTimestamp,
  JsonPrimitive,
  JsonValue,
  PaginationParams,
  Uuid,
} from "./common";

/** Backend application errors use the JSON envelope { error: string }. */
export type ErrorResponse = {
  error: string;
};

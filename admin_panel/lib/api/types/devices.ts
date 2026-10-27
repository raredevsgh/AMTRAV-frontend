import type { IsoTimestamp, PaginationParams, Uuid } from "./common";

export type DeviceStatus = "registered" | "claimed" | "revoked";

export type Device = {
  id: Uuid;
  serial_number: string;
  model: string;
  firmware_version: string;
  manufacturer_id: Uuid;
  owner_id: Uuid | null;
  nickname: string | null;
  status: DeviceStatus;
  claimed_at: IsoTimestamp | null;
  created_at: IsoTimestamp;
  updated_at: IsoTimestamp;
};

export type ProvisionedDevice = {
  device: Device;
  /** One-time ownership proof; only its hash is persisted by the backend. */
  claim_code: string;
};

export type RegisterDevice = {
  serial_number: string;
  model: string;
  firmware_version: string;
  /** Required when an administrator registers for a manufacturer. */
  manufacturer_id?: Uuid | null;
};

export type UpdateDevice = {
  model?: string | null;
  firmware_version?: string | null;
};

export type DeviceAudit = {
  id: Uuid;
  device_id: Uuid;
  actor_id: Uuid;
  action: string;
  created_at: IsoTimestamp;
};

export type DeviceListParams = PaginationParams;

import type { JsonValue, PaginationParams, Uuid } from "./common";
import type { Credentials, Role, User } from "./auth";

export type JobReceipt = {
  job_id: Uuid;
  /** Private bearer capability sent in X-Job-Receipt, never in a URL. */
  receipt: string;
  poll_url: string;
  expires_in: number;
  poll_after_ms: number;
};

/** The backend currently serializes this as a string, not a JSON enum. */
export type JobResult = {
  status: string;
  http_status: number | null;
  result: JsonValue | null;
};

export type ManufacturerResponse = {
  message: string;
  user_id: Uuid;
};

export type RoleUpdate = {
  role: Role;
};

export type UserListParams = PaginationParams;
export type ManufacturerCredentials = Credentials;
export type ManufacturerJobResult = User | { error: string };

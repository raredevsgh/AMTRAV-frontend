import type { IsoTimestamp, Uuid } from "./common";

/** Serialized by the backend as user, manufacturer, or admin. */
export type Role = "user" | "manufacturer" | "admin";

export type User = {
  id: Uuid;
  email: string;
  email_verified: boolean;
  role: Role;
  created_at: IsoTimestamp;
};

export type TokenPair = {
  access_token: string;
  refresh_token: string;
  token_type: "Bearer";
  expires_in: number;
  user: User;
};

export type Credentials = {
  email: string;
  password: string;
};

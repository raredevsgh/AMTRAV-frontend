import type { IsoTimestamp, Uuid } from "./common";

export type OverviewKpiData = {
  totalFleet: number;
  activeJourneys: number;
  tamperAlerts: number;
  claimRate: number;
  fleetHealth: number;
  registeredBags: number;
  unclaimedBags: number;
  claimedBags: number;
  revokedBags: number;
};

export type FleetActivityEventType =
  | "device_registered"
  | "bag_claimed"
  | "journey_started"
  | "checkpoint_scanned"
  | "tamper_detected"
  | "battery_low"
  | "firmware_updated"
  | "claim_code_rotated";

export type FleetActivityStatus = "normal" | "warning" | "critical" | "success";

export type FleetActivityItem = {
  id: string;
  timestamp: IsoTimestamp;
  device_serial: string;
  device_id?: Uuid;
  event_type: FleetActivityEventType;
  description: string;
  status: FleetActivityStatus;
  location?: string;
  actor?: string;
};

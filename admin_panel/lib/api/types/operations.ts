import type { IsoTimestamp, Uuid } from "./common";

export type BatteryState = "charging" | "discharging" | "full" | "critical";

export type SignalQuality = "excellent" | "good" | "fair" | "poor";

export type LockState = "locked" | "unlocked";

export type ConnectionType = "cellular" | "ble" | "offline";

export type TamperStatus = "secure" | "breached";

export type DeviceTelemetry = {
  deviceId: Uuid;
  serialNumber: string;
  batteryLevel: number;
  batteryState: BatteryState;
  signalRssi: number;
  signalQuality: SignalQuality;
  lockState: LockState;
  lastPing: IsoTimestamp;
  firmwareVersion: string;
  connectionType: ConnectionType;
  tamperStatus: TamperStatus;
};

export type SignalDistribution = {
  excellent: number;
  good: number;
  fair: number;
  poor: number;
};

export type OperationsSummary = {
  totalOnline: number;
  totalOffline: number;
  averageBattery: number;
  lockedCount: number;
  unlockedCount: number;
  signalDistribution: SignalDistribution;
  firmwareDistribution: Record<string, number>;
};

export type DiagnosticCheck = {
  name: string;
  status: "passed" | "failed";
  latencyMs: number;
  detail?: string;
};

export type DiagnosticReport = {
  deviceId: Uuid;
  timestamp: IsoTimestamp;
  overallStatus: "passed" | "failed" | "warning";
  checks: DiagnosticCheck[];
  success?: boolean;
};

export type FirmwareTargetScope = "fleet" | "single" | "manufacturer";

export type FirmwareChannel = "production" | "staging" | "canary";

export type FirmwareStagingPayload = {
  targetScope: FirmwareTargetScope;
  targetId?: string;
  version: string;
  channel: FirmwareChannel;
  scheduledAt?: string;
  rolloutPercentage?: number;
};

export type OperationResult = {
  success: boolean;
  message: string;
  timestamp: IsoTimestamp;
  details?: Record<string, unknown>;
};

export type TelemetryFilterParams = {
  status?: string;
  lockState?: string;
  search?: string;
};

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
  OverviewKpiData,
  FleetActivityEventType,
  FleetActivityStatus,
  FleetActivityItem,
} from "./overview";
export type {
  BatteryState,
  SignalQuality,
  LockState,
  ConnectionType,
  TamperStatus,
  DeviceTelemetry,
  SignalDistribution,
  OperationsSummary,
  DiagnosticCheck,
  DiagnosticReport,
  FirmwareTargetScope,
  FirmwareChannel,
  FirmwareStagingPayload,
  OperationResult,
  TelemetryFilterParams,
} from "./operations";
export type {
  JourneyStatus,
  CheckpointType,
  CheckpointStatus,
  JourneyCheckpoint,
  FlightLeg,
  JourneyRecord,
  JourneyDetail,
  JourneyFilterParams,
} from "./journeys";
export type {
  MembershipTier,
  CustomerStatus,
  CustomerRecord,
  CustomerDetail,
  CustomerFilterParams,
} from "./customers";
export type {
  AlertNote,
  AlertOutcome,
  AlertStatusChange,
  AlertSeverity,
  AlertStatus,
  AlertCategory,
  AlertRecord,
  AlertFilterParams,
  AlertResolutionPayload,
} from "./alerts";
export type { ManufacturerPartner } from "./manufacturers";
export type {
  ConsoleSettingsConfig,
  DemoResetOptions,
} from "./settings";
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

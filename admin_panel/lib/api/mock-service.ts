import {
  registrationErrors,
  validMetadata,
  validEmail,
  validPassword,
  fileError,
} from "./validation";
import { mockError, MockApiError } from "./errors";
import {
  mockDeviceAudit,
  mockDevices,
  mockFiles,
  mockJobReceipts,
  mockJobResults,
  mockManufacturerResponse,
  mockTokenPair,
  mockUsers,
} from "./fixtures";
import type {
  AlertFilterParams,
  AlertRecord,
  AlertResolutionPayload,
  AlertStatusChange,
  ConsoleSettingsConfig,
  Credentials,
  CustomerDetail,
  CustomerFilterParams,
  CustomerRecord,
  DemoResetOptions,
  Device,
  DeviceAudit,
  DeviceListParams,
  DeviceTelemetry,
  DiagnosticCheck,
  DiagnosticReport,
  FileListParams,
  FileMetadata,
  FirmwareStagingPayload,
  FleetActivityItem,
  JobReceipt,
  JobResult,
  JourneyCheckpoint,
  JourneyDetail,
  JourneyFilterParams,
  JourneyRecord,
  ManufacturerPartner,
  ManufacturerResponse,
  OperationResult,
  OperationsSummary,
  OverviewKpiData,
  ProvisionedDevice,
  RegisterDevice,
  Role,
  RoleUpdate,
  SignalDistribution,
  TelemetryFilterParams,
  TokenPair,
  UpdateDevice,
  User,
  UserListParams,
} from "./types";
import {
  consoleAlerts,
  consoleCustomers,
  consoleDeviceTelemetry,
  consoleFleetActivity,
  consoleJourneys,
  consoleManufacturers,
  consoleSettings,
} from "../console-fixtures";
import {demoReplacementSerial, referenceAdminAudit, type DemoDeviceAdminState} from "../operations-design-fixtures";

export type MockFailure = "rate_limit" | "unavailable";

export type MockApiOptions = {
  actor?: User;
  latencyMs?: number;
  failure?: MockFailure;
  devices?: readonly Device[];
  users?: readonly User[];
  files?: readonly FileMetadata[];
  audits?: readonly DeviceAudit[];
  fileBodies?: readonly string[];
  advanceJobs?: boolean;
  provisionTelemetry?: boolean;
  activities?: readonly FleetActivityItem[];
  telemetries?: readonly DeviceTelemetry[];
  journeys?: readonly JourneyDetail[];
  customers?: readonly CustomerDetail[];
  alerts?: readonly AlertRecord[];
  manufacturers?: readonly ManufacturerPartner[];
  settings?: ConsoleSettingsConfig;
};

export type MockPage<T> = {
  items: T[];
  limit: number;
  offset: number;
};

type StoredJob = {
  receipt: JobReceipt;
  result: JobResult;
  polls?: number;
  email?: string;
};

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

function clone<T>(value: T): T {
  return structuredClone(value);
}

function restore<T>(target: T[], baseline: readonly T[]) {
  target.splice(0, target.length, ...clone(baseline));
}

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function normalizePage(params: {page?: number; pageSize?: number}) {
  const page = params.page ?? 1;
  const size = params.pageSize ?? DEFAULT_LIMIT;
  if (!Number.isSafeInteger(page) || !Number.isSafeInteger(size)) {
    throw mockError.badRequest("page and pageSize must be safe integers");
  }
  return normalizePagination({limit:size,offset:Math.max(page-1,0)*Math.min(Math.max(size,1),MAX_LIMIT)});
}

function normalizePagination(
  params: DeviceListParams | UserListParams | FileListParams,
) {
  const { limit = DEFAULT_LIMIT, offset = 0 } = params;
  if (!Number.isInteger(limit) || !Number.isInteger(offset)) {
    throw mockError.badRequest("limit and offset must be integers");
  }
  return {
    limit: Math.min(Math.max(limit, 1), MAX_LIMIT),
    offset: Math.max(offset, 0),
  };
}

function page<T>(
  items: readonly T[],
  params: DeviceListParams | UserListParams | FileListParams,
): MockPage<T> {
  const normalized = normalizePagination(params);
  return {
    items: clone(
      items.slice(normalized.offset, normalized.offset + normalized.limit),
    ),
    ...normalized,
  };
}

function roleUser(role: Role): User {
  const user = mockUsers.find((candidate) => candidate.role === role);
  if (!user) throw new Error(`Missing mock user for role ${role}`);
  return clone(user);
}

export class MockApiService {
  private readonly initialOptions: MockApiOptions;
  private readonly actor: User;
  private readonly latencyMs: number;
  private readonly failure: MockFailure | undefined;
  private readonly devices: Device[];
  private readonly audits: DeviceAudit[];
  private readonly files: FileMetadata[];
  private readonly users: User[];
  private readonly fileBodies = new Map<string, Uint8Array>();
  private readonly advanceJobs: boolean;
  private readonly provisionTelemetry: boolean;
  private readonly jobs = new Map<string, StoredJob>();
  private readonly fleetActivities: FleetActivityItem[];
  private readonly telemetries: DeviceTelemetry[];
  private readonly journeys: JourneyDetail[];
  private readonly customers: CustomerDetail[];
  private readonly alerts: AlertRecord[];
  private readonly manufacturers: ManufacturerPartner[];
  private settings: ConsoleSettingsConfig;
  private readonly demoAdminStates = new Map<string,DemoDeviceAdminState>();
  private readonly initialAuditIds:ReadonlySet<string>;
  private readonly demoCustomerReveals = new Map<string,number>();

  constructor(options: MockApiOptions = {}) {
    this.initialOptions = clone(options);
    this.actor = clone(options.actor ?? roleUser("admin"));
    this.latencyMs = options.latencyMs ?? 0;
    this.failure = options.failure;
    this.advanceJobs = options.advanceJobs ?? false;
    this.provisionTelemetry = options.provisionTelemetry ?? true;
    this.devices = clone([...(options.devices ?? mockDevices)]);
    this.audits = clone([...(options.audits ?? mockDeviceAudit)]);
    this.initialAuditIds = new Set(this.audits.map((audit) => audit.id));
    this.files = clone([...(options.files ?? mockFiles)]);
    this.users = clone([...(options.users ?? mockUsers)]);
    this.fleetActivities = clone([
      ...(options.activities ?? consoleFleetActivity),
    ]);
    this.telemetries = clone([
      ...(options.telemetries ?? consoleDeviceTelemetry),
    ]);
    this.journeys = clone([...(options.journeys ?? consoleJourneys)]);
    this.customers = clone([...(options.customers ?? consoleCustomers)]);
    this.alerts = clone([...(options.alerts ?? consoleAlerts)]);
    this.manufacturers = clone([
      ...(options.manufacturers ?? consoleManufacturers),
    ]);
    this.settings = clone(options.settings ?? consoleSettings);
    for (const dev of this.devices) {
      if (this.provisionTelemetry && !this.telemetries.some((t) => t.deviceId === dev.id)) {
        this.telemetries.push({
          deviceId: dev.id,
          serialNumber: dev.serial_number,
          batteryLevel: 85,
          batteryState: "discharging",
          signalRssi: -70,
          signalQuality: "good",
          lockState: "locked",
          lastPing: "2026-10-24T09:30:00Z",
          firmwareVersion: dev.firmware_version,
          connectionType: "cellular",
          tamperStatus: "secure",
        });
      }
    }
    options.fileBodies?.forEach((body, i) => {
      if (this.files[i])
        this.fileBodies.set(this.files[i].id, new TextEncoder().encode(body));
    });
    for (const kind of ["pending", "completed", "failed"] as const) {
      this.jobs.set(mockJobReceipts[kind].job_id, {
        receipt: clone(mockJobReceipts[kind]),
        result: clone(mockJobResults[kind]),
      });
    }
  }

  get session(): User {
    return clone(this.actor);
  }

  async login(credentials: Credentials): Promise<TokenPair> {
    await this.beforeRequest();
    const valid =
      credentials.email.trim().toLowerCase() ===
        "admin@amtrav.example.invalid" &&
      credentials.password === "mock-password-not-for-production";
    if (!valid) throw mockError.unauthorized();
    return this.respond(clone(mockTokenPair));
  }

  async refresh(refreshToken: string): Promise<TokenPair> {
    await this.beforeRequest();
    if (refreshToken !== mockTokenPair.refresh_token) {
      throw mockError.unauthorized();
    }
    return this.respond(clone(mockTokenPair));
  }

  async logout(): Promise<void> {
    await this.beforeRequest();
    return this.respond(undefined);
  }

  async me(): Promise<User> {
    await this.beforeRequest();
    return this.respond(this.actor);
  }

  async manufacturerAccess(): Promise<ManufacturerResponse> {
    await this.beforeRequest();
    this.requireManufacturer();
    return this.respond(clone(mockManufacturerResponse));
  }

  async getOverviewKpis(): Promise<OverviewKpiData> {
    await this.beforeRequest();
    this.requireManufacturer();
    const visible = this.devices.filter((device) => this.canViewDevice(device));
    const totalFleet = visible.length;
    const registeredBags = visible.filter(
      (d) => d.status === "registered",
    ).length;
    const claimedBags = visible.filter((d) => d.status === "claimed").length;
    const revokedBags = visible.filter((d) => d.status === "revoked").length;
    const unclaimedBags = registeredBags;
    const claimRate =
      totalFleet > 0 ? Math.round((claimedBags / totalFleet) * 100) : 0;
    const visibleIds = new Set(visible.map((device) => device.id));
    const activeJourneys = this.journeys.filter(
      (journey) =>
        visibleIds.has(journey.deviceId) &&
        (journey.status === "in_transit" || journey.status === "delayed"),
    ).length;
    const tamperAlerts = this.alerts.filter(
      (alert) =>
        visibleIds.has(alert.deviceId) &&
        alert.category === "tamper" &&
        alert.status !== "resolved",
    ).length;
    const fleetHealth =
      totalFleet > 0
        ? revokedBags === 0
          ? 100
          : Math.round(((totalFleet - revokedBags) / totalFleet) * 99.4 * 10) /
            10
        : 100;

    return this.respond({
      totalFleet,
      activeJourneys,
      tamperAlerts,
      claimRate,
      fleetHealth,
      registeredBags,
      unclaimedBags,
      claimedBags,
      revokedBags,
    });
  }

  async getRecentActivity(limit = 10): Promise<FleetActivityItem[]> {
    await this.beforeRequest();
    this.requireManufacturer();
    const visibleDeviceIds = new Set(
      this.devices.filter((d) => this.canViewDevice(d)).map((d) => d.id),
    );
    const visible = this.fleetActivities.filter(
      (item) => !item.device_id || visibleDeviceIds.has(item.device_id),
    );
    return this.respond(visible.slice(0, Math.max(1, limit)));
  }

  async getOperationsSummary(): Promise<OperationsSummary> {
    await this.beforeRequest();
    this.requireManufacturer();
    const visibleDevices = this.devices.filter((device) =>
      this.canViewDevice(device),
    );
    const visibleDeviceIds = new Set(visibleDevices.map((d) => d.id));
    const visibleTelemetry = this.telemetries.filter((t) =>
      visibleDeviceIds.has(t.deviceId),
    );

    const totalOnline = visibleTelemetry.filter(
      (t) => t.connectionType !== "offline",
    ).length;
    const totalOffline = visibleTelemetry.filter(
      (t) => t.connectionType === "offline",
    ).length;
    const averageBattery =
      visibleTelemetry.length > 0
        ? Math.round(
            (visibleTelemetry.reduce((acc, t) => acc + t.batteryLevel, 0) /
              visibleTelemetry.length) *
              10,
          ) / 10
        : 0;
    const lockedCount = visibleTelemetry.filter(
      (t) => t.lockState === "locked",
    ).length;
    const unlockedCount = visibleTelemetry.filter(
      (t) => t.lockState === "unlocked",
    ).length;

    const signalDistribution: SignalDistribution = {
      excellent: 0,
      good: 0,
      fair: 0,
      poor: 0,
    };
    for (const t of visibleTelemetry) {
      if (t.signalQuality in signalDistribution) {
        signalDistribution[t.signalQuality]++;
      }
    }

    const firmwareDistribution: Record<string, number> = {};
    for (const t of visibleTelemetry) {
      firmwareDistribution[t.firmwareVersion] =
        (firmwareDistribution[t.firmwareVersion] || 0) + 1;
    }

    return this.respond({
      totalOnline,
      totalOffline,
      averageBattery,
      lockedCount,
      unlockedCount,
      signalDistribution,
      firmwareDistribution,
    });
  }

  async getDeviceTelemetry(deviceId: string): Promise<DeviceTelemetry | null> {
    await this.beforeRequest();
    this.requireManufacturer();
    const device = this.devices.find((candidate) => candidate.id === deviceId);
    if (!device || !this.canViewDevice(device)) {
      return this.respond(null);
    }
    const item = this.telemetries.find((t) => t.deviceId === deviceId);
    return this.respond(item ?? null);
  }

  async listTelemetry(
    filter: TelemetryFilterParams = {},
  ): Promise<DeviceTelemetry[]> {
    await this.beforeRequest();
    this.requireManufacturer();
    const visibleDevices = this.devices.filter((device) =>
      this.canViewDevice(device),
    );
    const visibleDeviceMap = new Map(visibleDevices.map((d) => [d.id, d]));
    let items = this.telemetries.filter((t) => visibleDeviceMap.has(t.deviceId));

    if (filter.status && filter.status.toLowerCase() !== "all") {
      const st = filter.status.toLowerCase();
      items = items.filter((t) => {
        if (st === "online") return t.connectionType !== "offline";
        if (st === "offline") return t.connectionType === "offline";
        if (st === "cellular") return t.connectionType === "cellular";
        if (st === "ble") return t.connectionType === "ble";
        if (st === "standby")
          return t.batteryState === "full" || t.batteryState === "discharging";
        if (st === "error")
          return (
            t.tamperStatus === "breached" || t.batteryState === "critical"
          );
        return true;
      });
    }

    if (filter.lockState && filter.lockState.toLowerCase() !== "all") {
      const ls = filter.lockState.toLowerCase();
      items = items.filter((t) => t.lockState.toLowerCase() === ls);
    }

    if (filter.search && filter.search.trim()) {
      const q = filter.search.toLowerCase().trim();
      items = items.filter((t) => {
        const device = visibleDeviceMap.get(t.deviceId);
        return (
          t.serialNumber.toLowerCase().includes(q) ||
          (device && device.model.toLowerCase().includes(q))
        );
      });
    }

    return this.respond(items);
  }

  async toggleRemoteLock(
    deviceId: string,
    locked: boolean,
  ): Promise<OperationResult> {
    await this.beforeRequest();
    this.requireManufacturer();
    const device = this.devices.find((candidate) => candidate.id === deviceId);
    if (!device || !this.canViewDevice(device)) {
      throw mockError.notFound("device not found");
    }
    if (device.status === "revoked") {
      throw mockError.conflict("device is revoked");
    }
    const telemetry = this.telemetries.find((t) => t.deviceId === deviceId);
    if (!telemetry) {
      throw mockError.notFound("telemetry record not found");
    }

    const previousLockState = telemetry.lockState;
    telemetry.lockState = locked ? "locked" : "unlocked";
    telemetry.lastPing = new Date().toISOString();

    const timestamp = new Date().toISOString();
    this.fleetActivities.unshift({
      id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp,
      device_serial: device.serial_number,
      device_id: device.id,
      event_type: "checkpoint_scanned",
      description: `Demo lock state set to ${locked ? "LOCKED" : "UNLOCKED"}; no hardware command sent`,
      status: "normal",
      location: "Local demo",
      actor: this.actor.email,
    });
    this.record(device.id, `remote_${locked ? "locked" : "unlocked"}`);

    return this.respond({
      success: true,
      message: `Demo lock state for ${device.serial_number} set to ${locked ? "locked" : "unlocked"}. No hardware command was sent.`,
      timestamp,
      details: {
        deviceId: device.id,
        serialNumber: device.serial_number,
        previousState: previousLockState,
        currentState: telemetry.lockState,
      },
    });
  }

  async triggerDiagnostics(deviceId: string): Promise<DiagnosticReport> {
    await this.beforeRequest();
    this.requireManufacturer();
    const device = this.devices.find((candidate) => candidate.id === deviceId);
    if (!device || !this.canViewDevice(device)) {
      throw mockError.notFound("device not found");
    }
    if (device.status === "revoked") {
      throw mockError.conflict("device is revoked");
    }
    const telemetry = this.telemetries.find((t) => t.deviceId === deviceId);

    if (!telemetry) throw mockError.conflict("no simulated readings are available for this device");

    const checks: DiagnosticCheck[] = [
      {
        name: "Cellular Baseband Ping",
        status:
          telemetry && telemetry.connectionType === "offline"
            ? "failed"
            : "passed",
        latencyMs: 28,
        detail:
          telemetry && telemetry.connectionType === "offline"
            ? "Fixture connection is offline"
            : `Fixture signal reading ${telemetry ? telemetry.signalRssi : -65} dBm`,
      },
      {
        name: "BLE Heartbeat Beacon",
        status:
          telemetry && telemetry.batteryLevel < 10 ? "failed" : "passed",
        latencyMs: 14,
        detail: "Simulated BLE fixture check",
      },
      {
        name: "Inertial Sensor Calibration",
        status:
          telemetry && telemetry.tamperStatus === "breached"
            ? "failed"
            : "passed",
        latencyMs: 35,
        detail:
          telemetry && telemetry.tamperStatus === "breached"
            ? "Fixture tamper state is breached"
            : "Simulated sensor fixture check",
      },
      {
        name: "Luggage Tamper Sensor Loop",
        status:
          telemetry && telemetry.tamperStatus === "breached"
            ? "failed"
            : "passed",
        latencyMs: 8,
        detail:
          telemetry && telemetry.tamperStatus === "breached"
            ? "Fixture tamper state is breached"
            : "Simulated tamper fixture check",
      },
      {
        name: "Power Management Rail",
        status:
          telemetry && telemetry.batteryLevel < 10 ? "failed" : "passed",
        latencyMs: 12,
        detail: `Fixture battery level ${telemetry ? telemetry.batteryLevel : 85}%`,
      },
    ];

    const overallStatus: "passed" | "failed" | "warning" = checks.every(
      (c) => c.status === "passed",
    )
      ? "passed"
      : checks.some((c) => c.status === "failed" && c.name.includes("Tamper"))
        ? "failed"
        : "warning";

    const timestamp = new Date().toISOString();
    return this.respond({
      deviceId: device.id,
      timestamp,
      overallStatus,
      checks,
      success: overallStatus === "passed",
    });
  }

  async stageFirmwareUpdate(
    payload: FirmwareStagingPayload,
  ): Promise<OperationResult> {
    await this.beforeRequest();
    this.requireManufacturer();

    if (
      !validMetadata(payload.version,64)
    ) {
      throw mockError.badRequest("invalid firmware version");
    }

    const validChannels = ["production","staging","canary","stable","beta"];
    if (!validChannels.includes(payload.channel as string)) {
      throw mockError.badRequest("invalid deployment channel");
    }
    if (!["single","manufacturer","fleet"].includes(payload.targetScope) ||
      (payload.targetScope !== "fleet" && !payload.targetId) ||
      (payload.rolloutPercentage !== undefined && (!Number.isInteger(payload.rolloutPercentage) || payload.rolloutPercentage < 1 || payload.rolloutPercentage > 100)) ||
      (payload.scheduledAt !== undefined && !Number.isFinite(Date.parse(payload.scheduledAt)))) {
      throw mockError.badRequest("invalid rollout target, percentage or schedule");
    }

    let affectedDevices: Device[];
    if (payload.targetScope === "single" && payload.targetId) {
      const device = this.devices.find((d) => d.id === payload.targetId);
      if (!device || !this.canViewDevice(device)) {
        throw mockError.notFound("target device not found");
      }
      if (device.status === "revoked") {
        throw mockError.conflict("device is revoked");
      }
      affectedDevices = [device];
    } else if (payload.targetScope === "manufacturer" && payload.targetId) {
      if (this.actor.role === "manufacturer" && payload.targetId !== this.actor.id) throw mockError.notFound("target manufacturer not found");
      affectedDevices = this.devices.filter(
        (d) =>
          d.manufacturer_id === payload.targetId &&
          this.canViewDevice(d) &&
          d.status !== "revoked",
      );
    } else {
      affectedDevices = this.devices.filter(
        (d) => this.canViewDevice(d) && d.status !== "revoked",
      );
    }
    if (!affectedDevices.length) throw mockError.notFound("no eligible target devices");

    const timestamp = new Date().toISOString();
    this.fleetActivities.unshift({
      id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp,
      device_serial: affectedDevices[0]?.serial_number ?? "FLEET-OTA",
      event_type: "firmware_updated",
      description: `Demo firmware rollout ${payload.version} recorded for ${payload.channel} channel (${affectedDevices.length} fixture units); no OTA sent`,
      status: "normal",
      location: "Local demo",
      actor: this.actor.email,
    });

    return this.respond({
      success: true,
      message: `Demo rollout for ${payload.version} recorded (${affectedDevices.length} fixture units). No firmware was sent.`,
      timestamp,
      details: {
        version: payload.version,
        channel: payload.channel,
        targetScope: payload.targetScope,
        stagedCount: affectedDevices.length,
        rolloutPercentage: payload.rolloutPercentage ?? 100,
        scheduledAt: payload.scheduledAt ?? timestamp,
      },
    });
  }

  // --- Journeys ---
  async listJourneys(
    params: JourneyFilterParams = {},
  ): Promise<MockPage<JourneyRecord>> {
    await this.beforeRequest();
    this.requireManufacturer();

    let items = this.journeys.filter((journey) => {
      if (this.actor.role === "manufacturer") {
        const device = this.devices.find((d) => d.id === journey.deviceId);
        if (!device || device.manufacturer_id !== this.actor.id) return false;
      }
      return true;
    });

    if (params.status && params.status !== "all") {
      items = items.filter((j) => j.status === params.status);
    }
    if (params.origin) {
      const orig = params.origin.toLowerCase();
      items = items.filter(
        (j) =>
          j.originCode.toLowerCase() === orig ||
          j.origin.toLowerCase().includes(orig),
      );
    }
    if (params.destination) {
      const dest = params.destination.toLowerCase();
      items = items.filter(
        (j) =>
          j.destinationCode.toLowerCase() === dest ||
          j.destination.toLowerCase().includes(dest),
      );
    }
    if (params.search && params.search.trim()) {
      const q = params.search.trim().toLowerCase();
      items = items.filter(
        (j) =>
          j.trackingNumber.toLowerCase().includes(q) ||
          j.travelerName.toLowerCase().includes(q) ||
          j.flightNumber.toLowerCase().includes(q) ||
          j.deviceSerial.toLowerCase().includes(q) ||
          j.originCode.toLowerCase().includes(q) ||
          j.destinationCode.toLowerCase().includes(q),
      );
    }

    const {limit, offset} = normalizePage(params);
    const paginated = items.slice(offset, offset + limit);

    return this.respond({
      items: paginated.map((detail) => ({
        id: detail.id,
        trackingNumber: detail.trackingNumber,
        travelerId: detail.travelerId,
        travelerName: detail.travelerName,
        travelerEmail: detail.travelerEmail,
        travelerPhone: detail.travelerPhone,
        deviceId: detail.deviceId,
        deviceSerial: detail.deviceSerial,
        deviceModel: detail.deviceModel,
        manufacturerId: detail.manufacturerId,
        status: detail.status,
        origin: detail.origin,
        destination: detail.destination,
        originCode: detail.originCode,
        destinationCode: detail.destinationCode,
        departureDate: detail.departureDate,
        estimatedArrival: detail.estimatedArrival,
        actualArrival: detail.actualArrival,
        flightNumber: detail.flightNumber,
        carrier: detail.carrier,
        currentLocation: detail.currentLocation,
        lastScanTime: detail.lastScanTime,
        checkpointsCount: detail.checkpointsCount,
        flaggedIncidentsCount: detail.flaggedIncidentsCount,
      })),
      limit,
      offset,
    });
  }

  async getJourneyById(id: string): Promise<JourneyDetail> {
    await this.beforeRequest();
    this.requireManufacturer();

    const journey = this.journeys.find((j) => j.id === id);
    if (!journey) throw mockError.notFound("journey not found");

    if (this.actor.role === "manufacturer") {
      const device = this.devices.find((d) => d.id === journey.deviceId);
      if (!device || device.manufacturer_id !== this.actor.id) {
        throw mockError.notFound("journey not found");
      }
    }

    const telemetry = this.telemetries.find((t) => t.deviceId === journey.deviceId);
    if (telemetry) {
      journey.assignedDevice.batteryPct = telemetry.batteryLevel;
      journey.assignedDevice.lockState = telemetry.lockState;
      journey.assignedDevice.signalRssi = telemetry.signalRssi;
    }

    return this.respond(journey);
  }

  async addJourneyCheckpoint(
    journeyId: string,
    checkpoint: Omit<JourneyCheckpoint, "id">,
  ): Promise<JourneyCheckpoint> {
    await this.beforeRequest();
    this.requireManufacturer();

    const journey = this.journeys.find((j) => j.id === journeyId);
    if (!journey) throw mockError.notFound("journey not found");

    if (this.actor.role === "manufacturer") {
      const device = this.devices.find((d) => d.id === journey.deviceId);
      if (!device || device.manufacturer_id !== this.actor.id) {
        throw mockError.notFound("journey not found");
      }
    }

    const newCheckpoint: JourneyCheckpoint = {
      ...checkpoint,
      id: `chk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    };

    journey.checkpoints.push(newCheckpoint);
    journey.checkpointsCount = journey.checkpoints.length;
    journey.lastScanTime = newCheckpoint.timestamp;
    if (newCheckpoint.status === "flagged") {
      journey.flaggedIncidentsCount++;
    }

    return this.respond(newCheckpoint);
  }

  // --- Customers ---
  async listCustomers(
    params: CustomerFilterParams = {},
  ): Promise<MockPage<CustomerRecord>> {
    await this.beforeRequest();
    this.requireAdmin();

    let items = [...this.customers];

    if (params.membershipTier && params.membershipTier !== "all") {
      items = items.filter((c) => c.membershipTier === params.membershipTier);
    }
    if (params.status && params.status !== "all") {
      items = items.filter((c) => c.status === params.status);
    }
    if (params.search && params.search.trim()) {
      const q = params.search.trim().toLowerCase();
      items = items.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          (c.frequentFlyerNumber && c.frequentFlyerNumber.toLowerCase().includes(q)) ||
          (c.phone && c.phone.toLowerCase().includes(q)),
      );
    }

    const {limit, offset} = normalizePage(params);
    const paginated = items.slice(offset, offset + limit);

    return this.respond({
      items: paginated.map((detail) => ({
        id: detail.id,
        name: detail.name,
        email: detail.email,
        phone: detail.phone,
        membershipTier: detail.membershipTier,
        totalTrips: detail.totalTrips,
        activeLuggageCount: detail.activeLuggageCount,
        joinedDate: detail.joinedDate,
        lastActiveDate: detail.lastActiveDate,
        status: detail.status,
        frequentFlyerNumber: detail.frequentFlyerNumber,
      })),
      limit,
      offset,
    });
  }

  async getCustomerById(id: string): Promise<CustomerDetail> {
    await this.beforeRequest();
    this.requireAdmin();

    const customer = this.customers.find((c) => c.id === id);
    if (!customer) throw mockError.notFound("customer not found");

    return this.respond({...customer,
      devices: customer.devices.flatMap((linked) => { const current = this.devices.find((device) => device.id === linked.id); return current ? [current] : []; }),
      recentJourneys: customer.recentJourneys.flatMap((linked) => { const current = this.journeys.find((journey) => journey.id === linked.id); return current ? [current] : []; }),
    });
  }

  async updateCustomerNotes(id: string, note: string): Promise<CustomerDetail> {
    await this.beforeRequest();
    this.requireAdmin();

    const customer = this.customers.find((c) => c.id === id);
    if (!customer) throw mockError.notFound("customer not found");

    if (!validMetadata(note,2000)) throw mockError.badRequest("enter a support note of at most 2000 UTF-8 bytes without control characters");
    customer.supportNotes.push(note.trim());

    return this.respond(customer);
  }

  // --- Alerts ---
  async listAlerts(
    params: AlertFilterParams = {},
  ): Promise<MockPage<AlertRecord>> {
    await this.beforeRequest();
    this.requireManufacturer();

    let items = this.alerts.filter((alert) => {
      if (this.actor.role === "manufacturer") {
        return alert.manufacturerId === this.actor.id;
      }
      return true;
    });

    if (params.severity && params.severity !== "all") {
      items = items.filter((a) => a.severity === params.severity);
    }
    if (params.status && params.status !== "all") {
      items = items.filter((a) => a.status === params.status);
    }
    if (params.category && params.category !== "all") {
      items = items.filter((a) => a.category === params.category);
    }
    if (params.search && params.search.trim()) {
      const q = params.search.trim().toLowerCase();
      items = items.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.message.toLowerCase().includes(q) ||
          a.deviceSerial.toLowerCase().includes(q) ||
          (a.airportCode && a.airportCode.toLowerCase().includes(q)),
      );
    }

    const {limit, offset} = normalizePage(params);
    const paginated = items.slice(offset, offset + limit);

    return this.respond({
      items: paginated,
      limit,
      offset,
    });
  }

  async getAlertById(id: string): Promise<AlertRecord> {
    await this.beforeRequest();
    this.requireManufacturer();

    const alert = this.alerts.find((a) => a.id === id);
    if (!alert) throw mockError.notFound("alert not found");

    if (this.actor.role === "manufacturer" && alert.manufacturerId !== this.actor.id) {
      throw mockError.notFound("alert not found");
    }

    return this.respond(alert);
  }

  async acknowledgeAlert(id: string): Promise<AlertRecord> {
    await this.beforeRequest();
    this.requireManufacturer();

    const alert = this.alerts.find((a) => a.id === id);
    if (!alert) throw mockError.notFound("alert not found");

    if (this.actor.role === "manufacturer" && alert.manufacturerId !== this.actor.id) {
      throw mockError.notFound("alert not found");
    }

    alert.status = "acknowledged";
    delete alert.resolvedAt;
    delete alert.outcome;
    delete alert.resolutionNotes;
    alert.resolvedBy = this.actor.email;

    return this.respond(alert);
  }

  async resolveAlert(
    id: string,
    payload: AlertResolutionPayload,
  ): Promise<AlertRecord> {
    await this.beforeRequest();
    this.requireManufacturer();
    if (!["dismissed","inspected_safe","quarantined","escalated_to_security"].includes(payload.resolutionAction) || !validMetadata(payload.notes,2000)) {
      throw mockError.badRequest("provide a valid resolution action and a note of at most 2000 UTF-8 bytes");
    }

    const alert = this.alerts.find((a) => a.id === id);
    if (!alert) throw mockError.notFound("alert not found");

    if (this.actor.role === "manufacturer" && alert.manufacturerId !== this.actor.id) {
      throw mockError.notFound("alert not found");
    }

    alert.status = "resolved";
    alert.resolvedAt = new Date().toISOString();
    alert.resolvedBy = this.actor.email;
    alert.resolutionNotes = `${payload.resolutionAction}: ${payload.notes}`;

    return this.respond(alert);
  }

  // Isolated demo triage. This is not a production notification or incident API.
  async addAlertNote(id:string, text:string):Promise<AlertRecord> {
    const alert = await this.getAlertById(id);
    if (!validMetadata(text,2000)) throw mockError.badRequest("enter a note of at most 2000 UTF-8 bytes without control characters");
    const stored = this.alerts.find((item) => item.id === alert.id)!;
    stored.notes ??= [];
    stored.notes.unshift({id:crypto.randomUUID(),author:this.actor.email,timestamp:new Date().toISOString(),text:text.trim()});
    return this.respond(stored);
  }

  async changeAlertStatus(id:string, change:AlertStatusChange):Promise<AlertRecord> {
    await this.getAlertById(id);
    if (!["active","acknowledged","resolved"].includes(change.status) ||
      (change.outcome !== undefined && !["no_tampering_found","charged","recalibrated","owner_reunited","reviewed"].includes(change.outcome)) ||
      (change.status === "resolved" && (!change.outcome || !change.note?.trim())) ||
      (change.note !== undefined && change.note !== "" && !validMetadata(change.note,2000))) {
      throw mockError.badRequest("choose a valid status; closing requires an outcome and a note of at most 2000 UTF-8 bytes");
    }
    const alert = this.alerts.find((item) => item.id === id)!;
    const timestamp = new Date().toISOString();
    alert.status = change.status;
    if (change.status === "resolved") {
      alert.outcome = change.outcome; alert.resolvedAt = timestamp; alert.resolvedBy = this.actor.email;
      alert.resolutionNotes = change.note?.trim();
    } else {
      delete alert.outcome; delete alert.resolvedAt; delete alert.resolvedBy; delete alert.resolutionNotes;
    }
    if (change.note?.trim()) {
      alert.notes ??= [];
      alert.notes.unshift({id:crypto.randomUUID(),author:this.actor.email,timestamp,text:change.note.trim()});
    }
    alert.activity ??= [];
    alert.activity.unshift({timestamp,author:this.actor.email,status:change.status,...(alert.outcome ? {outcome:alert.outcome} : {})});
    return this.respond(alert);
  }

  async getDemoDeviceAdminState(id:string):Promise<DemoDeviceAdminState> {
    await this.beforeRequest();this.requireManufacturer();
    const device=this.findManagedDevice(id);
    const state=clone(this.demoAdminStates.get(id) ?? {suspended:false,audit:device.serial_number === "AMT-ES55-5A06B3" ? referenceAdminAudit : []});
    const present=new Set(state.audit.map((audit) => audit.id));
    for (const audit of this.audits) {
      if (audit.device_id !== id || present.has(audit.id) || (device.serial_number === "AMT-ES55-5A06B3" && this.initialAuditIds.has(audit.id))) continue;
      state.audit.push({id:audit.id,action:audit.action,who:this.users.find((user) => user.id === audit.actor_id)?.email ?? "Staff member",timestamp:audit.created_at,detail:"Registry update"});
      present.add(audit.id);
    }
    state.audit.sort((a,b) => Date.parse(b.timestamp)-Date.parse(a.timestamp));
    if (this.actor.role !== "admin") state.audit=state.audit.map((audit) => audit.action.includes("claimed") ? {...audit,who:"Customer masked"} : audit);
    return this.respond(state);
  }

  async setDemoDeviceSuspension(id:string,suspended:boolean,reason:string):Promise<DemoDeviceAdminState> {
    this.requireAdmin();
    const seed=await this.getDemoDeviceAdminState(id);
    const baseline=clone(this.demoAdminStates.get(id) ?? seed);
    const device=this.findManagedDevice(id);
    if (device.status === "revoked") throw mockError.conflict("device is revoked");
    if (typeof suspended !== "boolean" || !validMetadata(reason,128)) throw mockError.badRequest("provide a suspension state and reason of at most 128 UTF-8 bytes");
    if (baseline.suspended === suspended) throw mockError.conflict("demo device already has that suspension state");
    const action=`device.${suspended ? "suspended" : "resumed"} (simulated)`;
    baseline.suspended=suspended;
    const audit=this.record(id,action);
    baseline.audit.unshift({id:audit.id,action,who:this.actor.email,timestamp:audit.created_at,detail:`Reason: ${reason.trim()}`});
    this.demoAdminStates.set(id,baseline);
    return this.respond(baseline);
  }

  async requestDemoReplacement(id:string,serial:string,reason:string,note:string):Promise<DemoDeviceAdminState> {
    this.requireAdmin();
    const seed=await this.getDemoDeviceAdminState(id);
    const baseline=clone(this.demoAdminStates.get(id) ?? seed);
    const source=this.findManagedDevice(id);
    if (!source.owner_id) throw mockError.conflict("replacement requires a claimed source device");
    if (!validMetadata(reason,128) || !validMetadata(note,2000)) throw mockError.badRequest("provide a replacement reason and note within the demo limits");
    const target=this.devices.find((device) => device.serial_number === serial);
    if (serial === source.serial_number || (serial !== demoReplacementSerial && (!target || target.owner_id || target.status !== "registered"))) throw mockError.badRequest("choose an available fictional replacement device");
    if (baseline.replacementSerial || [...this.demoAdminStates.values()].some((state) => state.replacementSerial === serial)) throw mockError.conflict("a demo replacement has already been requested");
    baseline.replacementSerial=serial;
    const action="device.replacement_requested (simulated)";
    const audit=this.record(id,action);
    baseline.audit.unshift({id:audit.id,action,who:this.actor.email,timestamp:audit.created_at,detail:`New device: ${serial}; ${reason.trim()}; ${note.trim()}`});
    this.demoAdminStates.set(id,baseline);
    return this.respond(baseline);
  }

  async getDemoCustomerRevealUntil(id:string):Promise<number|null> {
    await this.beforeRequest();this.requireAdmin();this.findManagedDevice(id);
    const until=this.demoCustomerReveals.get(id) ?? null;
    if (until !== null && until <= Date.now()) {this.demoCustomerReveals.delete(id);return this.respond(null);}
    return this.respond(until);
  }

  async revealDemoCustomer(id:string,reason:string):Promise<{visibleUntil:number}> {
    this.requireAdmin();
    const seed=await this.getDemoDeviceAdminState(id);
    const state=clone(this.demoAdminStates.get(id) ?? seed);
    const device=this.findManagedDevice(id);
    if (!device.owner_id) throw mockError.conflict("device has no customer to reveal");
    if (!validMetadata(reason,128)) throw mockError.badRequest("provide a reveal reason of at most 128 UTF-8 bytes");
    const visibleUntil=Date.now()+15*60_000;
    this.demoCustomerReveals.set(id,visibleUntil);
    const audit=this.record(id,"customer.revealed");
    state.audit.unshift({id:audit.id,action:audit.action,who:this.actor.email,timestamp:audit.created_at,detail:`Reason: ${reason.trim()}; visible for 15 minutes`});
    this.demoAdminStates.set(id,state);
    return this.respond({visibleUntil});
  }

  // --- Manufacturers ---
  async listManufacturers(): Promise<ManufacturerPartner[]> {
    await this.beforeRequest();
    this.requireAdmin();
    return this.respond(this.manufacturers);
  }

  // --- Settings ---
  async getSettings(): Promise<ConsoleSettingsConfig> {
    await this.beforeRequest();
    this.requireManufacturer();
    return this.respond(this.settings);
  }

  async updateSettings(
    patch: Partial<ConsoleSettingsConfig>,
  ): Promise<ConsoleSettingsConfig> {
    await this.beforeRequest();
    this.requireAdmin();

    const allowed = new Set(Object.keys(this.settings));
    if (Object.keys(patch).some((key) => !allowed.has(key))) throw mockError.badRequest("unknown demo setting");
    const next = {...this.settings,...patch};
    if (![30,60,120,300].includes(next.telemetryIntervalSec) ||
      ![10,15,20,25].includes(next.lowBatteryThresholdPct) ||
      ![60,120,240,600].includes(next.apiRateLimitRpm) ||
      !["system","light","dark"].includes(next.theme) ||
      [next.flightSafeAutoEngage,next.criticalTamperAlerts,next.maintenanceMode,next.demoResetAllowed].some((value) => typeof value !== "boolean") ||
      !Array.isArray(next.allowedGeofences) || next.allowedGeofences.length > 100 ||
      next.allowedGeofences.some((code) => typeof code !== "string" || !/^[A-Z]{3}$/.test(code))) {
      throw mockError.badRequest("invalid demo settings");
    }
    this.settings = {
      ...this.settings,
      ...clone(patch),
    };

    return this.respond(this.settings);
  }

  async resetDemoData(
    options: DemoResetOptions = {},
  ): Promise<{ success: boolean; message: string }> {
    await this.beforeRequest();
    this.requireAdmin();
    if (!this.settings.demoResetAllowed) throw mockError.forbidden("demo reset is disabled");
    const baseline = new MockApiService(this.initialOptions);
    this.demoAdminStates.clear();
    this.demoCustomerReveals.clear();
    if (!options.preserveRegisteredSerials) {
      restore(this.devices, baseline.devices);
    }
    if (options.resetAuditLogs) {
      restore(this.audits, baseline.audits);
    }
    const baselineIds = new Set(baseline.devices.map((device) => device.id));
    const retainedTelemetry = options.preserveRegisteredSerials
      ? this.telemetries.filter((item) => !baselineIds.has(item.deviceId))
      : [];
    restore(this.telemetries, [...baseline.telemetries, ...retainedTelemetry]);
    restore(this.journeys, baseline.journeys);
    restore(this.customers, baseline.customers);
    restore(this.alerts, baseline.alerts);
    restore(this.fleetActivities, baseline.fleetActivities);
    restore(this.users, baseline.users);
    restore(this.files, baseline.files);
    restore(this.manufacturers, baseline.manufacturers);
    this.settings = clone(baseline.settings);
    this.fileBodies.clear();
    for (const [id, bytes] of baseline.fileBodies) {
      this.fileBodies.set(id, bytes.slice());
    }
    this.jobs.clear();
    for (const [id, job] of baseline.jobs) this.jobs.set(id, clone(job));

    return this.respond({
      success: true,
      message: "Fictional demo dataset restored to baseline defaults.",
    });
  }

  async listDevices(params: DeviceListParams = {}): Promise<MockPage<Device>> {
    await this.beforeRequest();
    const visible = this.devices.filter((device) => this.canViewDevice(device));
    return this.respond(page(visible, params));
  }

  async getDevice(id: string): Promise<Device> {
    await this.beforeRequest();
    const device = this.devices.find((candidate) => candidate.id === id);
    if (!device || !this.canViewDevice(device))
      throw mockError.notFound("device not found");
    return this.respond(device);
  }

  async registerDevice(input: RegisterDevice): Promise<ProvisionedDevice> {
    await this.beforeRequest();
    this.requireManufacturer();
    const serial = input.serial_number.trim().toUpperCase();
    if (Object.keys(registrationErrors(input)).length) {
      throw mockError.badRequest("invalid device metadata");
    }
    if (this.devices.some((device) => device.serial_number === serial)) {
      throw mockError.conflict("device serial number already exists");
    }
    const manufacturerId = input.manufacturer_id ?? this.actor.id;
    if (
      this.actor.role === "manufacturer" &&
      manufacturerId !== this.actor.id
    ) {
      throw mockError.forbidden(
        "cannot register devices for another manufacturer",
      );
    }
    if (this.actor.role === "admin" && !input.manufacturer_id) {
      throw mockError.badRequest(
        "manufacturer_id is required for admin registration",
      );
    }
    const manufacturer = this.users.find(
      (user) => user.id === manufacturerId && user.role === "manufacturer",
    );
    if (!manufacturer)
      throw mockError.badRequest(
        "manufacturer_id must identify a manufacturer account",
      );
    const timestamp = new Date().toISOString();
    const device: Device = {
      id: `10000000-0000-4000-8000-${String(this.devices.length + 1).padStart(12, "0")}`,
      serial_number: serial,
      model: input.model.trim(),
      firmware_version: input.firmware_version.trim(),
      manufacturer_id: manufacturerId,
      owner_id: null,
      nickname: null,
      status: "registered",
      claimed_at: null,
      created_at: timestamp,
      updated_at: timestamp,
    };
    this.devices.push(device);
    if (this.provisionTelemetry) this.telemetries.push({
      deviceId: device.id,
      serialNumber: device.serial_number,
      batteryLevel: 100,
      batteryState: "full",
      signalRssi: -60,
      signalQuality: "excellent",
      lockState: "unlocked",
      lastPing: timestamp,
      firmwareVersion: device.firmware_version,
      connectionType: "ble",
      tamperStatus: "secure",
    });
    this.record(device.id, "registered");
    this.fleetActivities.unshift({
      id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp,
      device_serial: serial,
      device_id: device.id,
      event_type: "device_registered",
      description: `New luggage unit registered under ${device.model}`,
      status: "normal",
      location: "Console Registry",
      actor: this.actor.email,
    });
    return this.respond({
      device,
      claim_code:
        "eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
    });
  }

  async updateDevice(id: string, input: UpdateDevice): Promise<Device> {
    await this.beforeRequest();
    this.requireManufacturer();
    if (input.model == null && input.firmware_version == null) {
      throw mockError.badRequest("provide at least one device metadata field");
    }
    const device = this.findManagedDevice(id);
    if (device.status === "revoked")
      throw mockError.conflict("device is revoked");
    if (this.demoAdminStates.get(id)?.suspended) throw mockError.conflict("device registry updates are suspended in this demo");
    if (
      (input.model != null && !validMetadata(input.model, 128)) ||
      (input.firmware_version != null &&
        !validMetadata(input.firmware_version, 64))
    )
      throw mockError.badRequest("invalid device metadata");
    if (input.model !== undefined)
      device.model = input.model?.trim() ?? device.model;
    if (input.firmware_version !== undefined) {
      device.firmware_version =
        input.firmware_version?.trim() ?? device.firmware_version;
    }
    device.updated_at = new Date().toISOString();
    this.record(device.id, "metadata_updated");
    return this.respond(device);
  }

  async rotateClaimCode(id: string): Promise<ProvisionedDevice> {
    await this.beforeRequest();
    this.requireManufacturer();
    const device = this.findManagedDevice(id);
    if (device.status !== "registered" || device.owner_id) {
      throw mockError.conflict(
        "only unclaimed devices can receive a new claim code",
      );
    }
    this.record(device.id, "claim_code_rotated");
    this.fleetActivities.unshift({
      id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      device_serial: device.serial_number,
      device_id: device.id,
      event_type: "claim_code_rotated",
      description: "One-time claim code rotated",
      status: "normal",
      location: "Security Console",
      actor: this.actor.email,
    });
    return this.respond({
      device,
      claim_code:
        "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
    });
  }

  async revokeDevice(id: string): Promise<Device> {
    await this.beforeRequest();
    this.requireManufacturer();
    const device = this.findManagedDevice(id);
    if (device.status === "revoked") return this.respond(device);
    device.status = "revoked";
    device.updated_at = new Date().toISOString();
    this.record(device.id, "revoked");
    this.fleetActivities.unshift({
      id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: device.updated_at,
      device_serial: device.serial_number,
      device_id: device.id,
      event_type: "tamper_detected",
      description: "Device decommissioned and revoked from active fleet",
      status: "critical",
      location: "Admin Console",
      actor: this.actor.email,
    });
    return this.respond(device);
  }

  async listDeviceAudit(
    id: string,
    params: DeviceListParams = {},
  ): Promise<MockPage<DeviceAudit>> {
    await this.beforeRequest();
    await this.getDevice(id);
    return this.respond(
      page(
        this.audits.filter((audit) => audit.device_id === id),
        params,
      ),
    );
  }

  async listUsers(params: UserListParams = {}): Promise<MockPage<User>> {
    await this.beforeRequest();
    this.requireAdmin();
    return this.respond(page(this.users, params));
  }

  async updateRole(id: string, input: RoleUpdate): Promise<User> {
    await this.beforeRequest();
    this.requireAdmin();
    if (id === this.actor.id)
      throw mockError.badRequest("use another admin to change your own role");
    const user = this.users.find((candidate) => candidate.id === id);
    if (!user) throw mockError.notFound("user not found");
    if ((user.role === "user") !== (input.role === "user")) {
      throw mockError.badRequest(
        "role is incompatible with the account sign-in method",
      );
    }
    user.role = input.role;
    return this.respond(user);
  }

  async createManufacturer(credentials: Credentials): Promise<JobReceipt> {
    await this.beforeRequest();
    this.requireAdmin();
    const email = credentials.email.trim().toLowerCase();
    if (!validEmail(email) || !validPassword(credentials.password)) {
      throw mockError.badRequest("invalid manufacturer credentials");
    }
    if (!this.advanceJobs) return this.respond(clone(mockJobReceipts.pending));
    const id = `40000000-0000-4000-8000-${String(this.jobs.size + 1).padStart(12, "0")}`;
    const receipt = {
      ...clone(mockJobReceipts.pending),
      job_id: id,
      receipt: id.replaceAll("-", "").repeat(2),
      poll_url: `/api/v1/auth/jobs/${id}`,
    };
    this.jobs.set(id, {
      receipt,
      result: { status: "queued", http_status: null, result: null },
      polls: 0,
      email,
    });
    return this.respond(receipt);
  }

  async getJob(id: string, receipt: string): Promise<JobResult> {
    await this.beforeRequest();
    const job = this.jobs.get(id);
    if (!job || job.receipt.receipt !== receipt)
      throw mockError.notFound("job not found");
    if (this.advanceJobs && job.email && job.result.status !== "completed") {
      job.polls = (job.polls ?? 0) + 1;
      if (job.polls === 1)
        job.result = { status: "processing", http_status: null, result: null };
      else if (this.users.some((user) => user.email === job.email))
        job.result = {
          status: "completed",
          http_status: 409,
          result: {
            error: "account already exists; sign in using its original method",
          },
        };
      else {
        const user: User = {
          id: `00000000-0000-4000-8000-${String(this.users.length + 10).padStart(12, "0")}`,
          email: job.email,
          role: "manufacturer",
          email_verified: false,
          created_at: new Date().toISOString(),
        };
        this.users.push(user);
        job.result = {
          status: "completed",
          http_status: 201,
          result: { ...user },
        };
      }
    }
    return this.respond(job.result);
  }

  async listFiles(
    params: FileListParams = {},
  ): Promise<MockPage<FileMetadata>> {
    await this.beforeRequest();
    const visible =
      this.actor.role === "admin"
        ? this.files
        : this.files.filter((file) => file.owner_id === this.actor.id);
    return this.respond(page(visible, params));
  }

  async getFile(id: string): Promise<FileMetadata> {
    await this.beforeRequest();
    const file = this.files.find((candidate) => candidate.id === id);
    const canRead =
      file && (this.actor.role === "admin" || file.owner_id === this.actor.id);
    if (!canRead) throw mockError.notFound("file not found");
    return this.respond(file);
  }

  async uploadFile(
    filename: string,
    contentType: string,
    bytes: Uint8Array,
  ): Promise<FileMetadata> {
    await this.beforeRequest();
    this.requireManufacturer();
    const error = fileError(filename, contentType, bytes.byteLength);
    if (error)
      throw new MockApiError(
        bytes.byteLength > 10 * 1024 * 1024 ? 413 : 400,
        error,
      );
    const file: FileMetadata = {
      id: `30000000-0000-4000-8000-${String(this.files.length + 1).padStart(12, "0")}`,
      owner_id: this.actor.id,
      filename: filename.trim(),
      content_type: contentType || "application/octet-stream",
      size_bytes: bytes.byteLength,
      created_at: new Date().toISOString(),
    };
    this.files.unshift(file);
    this.fileBodies.set(file.id, new Uint8Array(bytes));
    return this.respond(file);
  }

  async downloadFile(id: string): Promise<Uint8Array> {
    await this.getFile(id);
    const body = this.fileBodies.get(id);
    if (!body)
      throw mockError.notFound(
        "no harmless mock content is available for this fixture",
      );
    return new Uint8Array(body);
  }

  private record(deviceId: string, action: string): DeviceAudit {
    const audit:DeviceAudit={
      id: crypto.randomUUID(),
      device_id: deviceId,
      actor_id: this.actor.id,
      action,
      created_at: new Date().toISOString(),
    };
    this.audits.unshift(audit);
    return audit;
  }

  private async beforeRequest(): Promise<void> {
    if (this.latencyMs > 0) await wait(this.latencyMs);
    if (this.failure === "rate_limit") throw mockError.rateLimited();
    if (this.failure === "unavailable") throw mockError.unavailable();
  }

  private async respond<T>(value: T): Promise<T> {
    if (this.latencyMs > 0) await wait(this.latencyMs);
    return clone(value);
  }

  private requireAdmin(): void {
    if (this.actor.role !== "admin")
      throw mockError.forbidden("admin role required");
  }

  private requireManufacturer(): void {
    if (this.actor.role !== "admin" && this.actor.role !== "manufacturer") {
      throw mockError.forbidden("required role is missing");
    }
  }

  private canViewDevice(device: Device): boolean {
    return (
      this.actor.role === "admin" ||
      (this.actor.role === "manufacturer" &&
        device.manufacturer_id === this.actor.id) ||
      (this.actor.role === "user" && device.owner_id === this.actor.id)
    );
  }

  private findManagedDevice(id: string): Device {
    const device = this.devices.find((candidate) => candidate.id === id);
    const canManage =
      device &&
      (this.actor.role === "admin" ||
        (this.actor.role === "manufacturer" &&
          device.manufacturer_id === this.actor.id));
    if (!canManage) throw mockError.notFound("device not found");
    return device;
  }
}

export function createMockApi(options: MockApiOptions = {}): MockApiService {
  return new MockApiService(options);
}

export function mockUserForRole(role: Role): User {
  return roleUser(role);
}

export function isMockApiError(error: unknown): error is MockApiError {
  return error instanceof MockApiError;
}

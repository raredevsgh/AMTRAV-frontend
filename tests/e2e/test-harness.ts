import assert from "node:assert/strict";
import {
  createMockApi,
  MockApiError,
  mockUserForRole,
  type MockApiOptions,
  type MockApiService,
} from "../../admin_panel/lib/api/index";
import {
  consoleDevices,
  consoleUsers,
  consoleFiles,
  consoleFileBodies,
  consoleAudits,
  consoleManufacturerLabels,
} from "../../admin_panel/lib/console-fixtures";
import type { Device, DeviceAudit, FileMetadata, User, Uuid, IsoTimestamp } from "../../admin_panel/lib/api/types";
import {
  registrationErrors,
  validEmail,
  validPassword,
  fileError,
  FILE_LIMIT,
} from "../../admin_panel/lib/api/validation";

// ============================================================================
// Extended Domain Contracts (per PROJECT.md & ORIGINAL_REQUEST.md)
// ============================================================================

export type OverviewKpiData = {
  total_registered: number;
  unclaimed_count: number;
  claimed_count: number;
  revoked_count: number;
  active_journeys: number;
  active_alerts: number;
  telemetry_health_percent: number;
};

export type FleetActivityItem = {
  id: Uuid;
  timestamp: IsoTimestamp;
  category: "device" | "journey" | "alert" | "account" | "file";
  actor_email: string;
  description: string;
};

export type DeviceTelemetry = {
  device_id: Uuid;
  battery_level_pct: number;
  rssi_dbm: number;
  lock_status: "locked" | "unlocked";
  sensor_status: "nominal" | "warning" | "tamper_detected";
  firmware_channel: "stable" | "beta" | "staging";
  last_ping: IsoTimestamp;
};

export type FirmwareStagingPayload = {
  target_channel: "stable" | "beta" | "staging";
  firmware_version: string;
  device_ids?: Uuid[];
  staged_by: Uuid;
};

export type JourneyStatus = "scheduled" | "in_transit" | "delayed" | "arrived" | "exception";

export type JourneyCheckpoint = {
  id: Uuid;
  name: string;
  airport_code: string;
  timestamp: IsoTimestamp;
  scan_type: "check_in" | "security_screen" | "ramp_load" | "carousel_unload" | "delivery";
  verified: boolean;
};

export type JourneyRecord = {
  id: Uuid;
  device_id: Uuid;
  serial_number: string;
  flight_number: string;
  origin_airport: string;
  destination_airport: string;
  status: JourneyStatus;
  departed_at: IsoTimestamp;
  arrived_at: IsoTimestamp | null;
  checkpoints: JourneyCheckpoint[];
};

export type CustomerRecord = {
  id: Uuid;
  full_name: string;
  email: string;
  phone: string;
  account_type: "email" | "google_mobile";
  vip_status: "standard" | "silver" | "gold" | "platinum";
  claimed_devices_count: number;
  created_at: IsoTimestamp;
};

export type CustomerDetail = CustomerRecord & {
  claimed_devices: Array<{
    id: Uuid;
    serial_number: string;
    model: string;
    claimed_at: IsoTimestamp;
    telemetry?: DeviceTelemetry;
  }>;
  recent_journeys: JourneyRecord[];
  support_notes: string[];
};

export type AlertSeverity = "critical" | "high" | "medium" | "low";
export type AlertCategory = "tamper" | "geofence" | "battery" | "lost";
export type AlertStatus = "active" | "acknowledged" | "resolved";

export type AlertRecord = {
  id: Uuid;
  device_id: Uuid;
  serial_number: string;
  severity: AlertSeverity;
  category: AlertCategory;
  status: AlertStatus;
  title: string;
  message: string;
  latitude: number;
  longitude: number;
  created_at: IsoTimestamp;
  resolved_at: IsoTimestamp | null;
  resolved_by?: Uuid | null;
  resolution_notes?: string | null;
};

export type ManufacturerPartner = {
  id: Uuid;
  company_name: string;
  contact_email: string;
  allocated_quota: number;
  registered_units: number;
  claim_rate_pct: number;
  facility_location: string;
  created_at: IsoTimestamp;
};

export type ConsoleSettingsConfig = {
  demo_integrity_mode: boolean;
  battery_warning_threshold_pct: number;
  geofence_tolerance_meters: number;
  session_timeout_minutes: number;
  reduced_motion_enforced: boolean;
  theme_preference: "light" | "system";
};

// ============================================================================
// Fixture Catalogs for Extended Domains
// ============================================================================

export const mockTelemetries: DeviceTelemetry[] = consoleDevices.map((d, i) => ({
  device_id: d.id,
  battery_level_pct: [92, 78, 45, 12, 0, 85, 64, 99][i % 8],
  rssi_dbm: [-58, -64, -72, -88, -110, -55, -69, -60][i % 8],
  lock_status: i % 2 === 0 ? "locked" : "unlocked",
  sensor_status: i === 3 ? "tamper_detected" : i === 4 ? "warning" : "nominal",
  firmware_channel: i === 4 ? "staging" : "stable",
  last_ping: "2026-10-24T09:35:00Z",
}));

export const mockJourneys: JourneyRecord[] = [
  {
    id: "50000000-0000-4000-8000-000000000001",
    device_id: consoleDevices[0].id,
    serial_number: consoleDevices[0].serial_number,
    flight_number: "AM-1042",
    origin_airport: "JFK",
    destination_airport: "LHR",
    status: "in_transit",
    departed_at: "2026-10-24T06:30:00Z",
    arrived_at: null,
    checkpoints: [
      {
        id: "51000000-0000-4000-8000-000000000001",
        name: "Terminal 4 Check-in Desk",
        airport_code: "JFK",
        timestamp: "2026-10-24T04:15:00Z",
        scan_type: "check_in",
        verified: true,
      },
      {
        id: "51000000-0000-4000-8000-000000000002",
        name: "TSA Inline Security Screening",
        airport_code: "JFK",
        timestamp: "2026-10-24T04:45:00Z",
        scan_type: "security_screen",
        verified: true,
      },
      {
        id: "51000000-0000-4000-8000-000000000003",
        name: "Gate B22 Aircraft Ramp Loading",
        airport_code: "JFK",
        timestamp: "2026-10-24T06:05:00Z",
        scan_type: "ramp_load",
        verified: true,
      },
    ],
  },
  {
    id: "50000000-0000-4000-8000-000000000002",
    device_id: consoleDevices[1].id,
    serial_number: consoleDevices[1].serial_number,
    flight_number: "BA-0178",
    origin_airport: "EWR",
    destination_airport: "CDG",
    status: "arrived",
    departed_at: "2026-10-23T18:00:00Z",
    arrived_at: "2026-10-24T06:10:00Z",
    checkpoints: [
      {
        id: "51000000-0000-4000-8000-000000000010",
        name: "Check-in Desk",
        airport_code: "EWR",
        timestamp: "2026-10-23T15:30:00Z",
        scan_type: "check_in",
        verified: true,
      },
      {
        id: "51000000-0000-4000-8000-000000000011",
        name: "Carousel 3 Delivery",
        airport_code: "CDG",
        timestamp: "2026-10-24T06:40:00Z",
        scan_type: "delivery",
        verified: true,
      },
    ],
  },
  {
    id: "50000000-0000-4000-8000-000000000003",
    device_id: consoleDevices[5].id,
    serial_number: consoleDevices[5].serial_number,
    flight_number: "LH-0401",
    origin_airport: "FRA",
    destination_airport: "JFK",
    status: "delayed",
    departed_at: "2026-10-24T08:00:00Z",
    arrived_at: null,
    checkpoints: [
      {
        id: "51000000-0000-4000-8000-000000000020",
        name: "Gate Hold Luggage Transit",
        airport_code: "FRA",
        timestamp: "2026-10-24T07:15:00Z",
        scan_type: "check_in",
        verified: true,
      },
    ],
  },
];

export const mockCustomers: CustomerRecord[] = [
  {
    id: "60000000-0000-4000-8000-000000000001",
    full_name: "Elena Rostova",
    email: "elena.rostova@example.invalid",
    phone: "+1-555-019-2831",
    account_type: "google_mobile",
    vip_status: "platinum",
    claimed_devices_count: 2,
    created_at: "2026-06-15T10:00:00Z",
  },
  {
    id: "60000000-0000-4000-8000-000000000002",
    full_name: "Marcus Vance",
    email: "traveler@amtrav.example.invalid",
    phone: "+1-555-014-9920",
    account_type: "email",
    vip_status: "gold",
    claimed_devices_count: 1,
    created_at: "2026-07-20T12:30:00Z",
  },
  {
    id: "60000000-0000-4000-8000-000000000003",
    full_name: "Aisha Chen",
    email: "aisha.chen@example.invalid",
    phone: "+44-20-7946-0912",
    account_type: "google_mobile",
    vip_status: "standard",
    claimed_devices_count: 1,
    created_at: "2026-09-05T14:15:00Z",
  },
];

export const mockAlerts: AlertRecord[] = [
  {
    id: "70000000-0000-4000-8000-000000000001",
    device_id: consoleDevices[3].id,
    serial_number: consoleDevices[3].serial_number,
    severity: "critical",
    category: "tamper",
    status: "active",
    title: "Unauthorized Zipper Tamper Detected",
    message: "Secondary compartment zipper sensor triggered while device is in locked transit mode.",
    latitude: 40.6413,
    longitude: -73.7781,
    created_at: "2026-10-24T09:12:00Z",
    resolved_at: null,
  },
  {
    id: "70000000-0000-4000-8000-000000000002",
    device_id: consoleDevices[4].id,
    serial_number: consoleDevices[4].serial_number,
    severity: "high",
    category: "battery",
    status: "acknowledged",
    title: "Critical Battery Depletion (<5%)",
    message: "Telemetry reports battery charge below minimum threshold. Bluetooth ping rate reduced.",
    latitude: 48.8566,
    longitude: 2.3522,
    created_at: "2026-10-24T08:45:00Z",
    resolved_at: null,
  },
  {
    id: "70000000-0000-4000-8000-000000000003",
    device_id: consoleDevices[0].id,
    serial_number: consoleDevices[0].serial_number,
    severity: "medium",
    category: "geofence",
    status: "resolved",
    title: "Carousel Perimeter Departure",
    message: "Luggage moved outside designated carousel 4 radius before passenger claim scan.",
    latitude: 51.4700,
    longitude: -0.4543,
    created_at: "2026-10-23T14:00:00Z",
    resolved_at: "2026-10-23T14:22:00Z",
    resolved_by: consoleUsers[0].id,
    resolution_notes: "False positive caused by baggage handler transfer to oversized luggage counter.",
  },
];

export const mockManufacturers: ManufacturerPartner[] = [
  {
    id: consoleUsers[1].id,
    company_name: "Northline Cases",
    contact_email: "factory@northline.example.invalid",
    allocated_quota: 10000,
    registered_units: 6,
    claim_rate_pct: 66.7,
    facility_location: "Portland, Oregon, USA",
    created_at: "2026-09-14T09:00:00Z",
  },
  {
    id: consoleUsers[2].id,
    company_name: "Harbor Goods",
    contact_email: "ops@harbor.example.invalid",
    allocated_quota: 5000,
    registered_units: 2,
    claim_rate_pct: 50.0,
    facility_location: "Hamburg, Germany",
    created_at: "2026-09-21T09:00:00Z",
  },
];

export const mockDefaultSettings: ConsoleSettingsConfig = {
  demo_integrity_mode: true,
  battery_warning_threshold_pct: 15,
  geofence_tolerance_meters: 50,
  session_timeout_minutes: 60,
  reduced_motion_enforced: false,
  theme_preference: "light",
};

// ============================================================================
// Extended Opaque-Box Test Harness
// ============================================================================

export type TestEnvironmentOptions = {
  role?: "admin" | "manufacturer" | "user";
  failure?: "rate_limit" | "unavailable";
  empty?: boolean;
};

export class TestHarness {
  readonly api: MockApiService;
  readonly role: "admin" | "manufacturer" | "user";
  private telemetries: DeviceTelemetry[];
  private journeys: JourneyRecord[];
  private customers: CustomerRecord[];
  private alerts: AlertRecord[];
  private manufacturers: ManufacturerPartner[];
  private settings: ConsoleSettingsConfig;

  constructor(options: TestEnvironmentOptions = {}) {
    this.role = options.role || "admin";
    const targetRole = this.role === "admin" ? "admin" : this.role === "manufacturer" ? "manufacturer" : "user";
    const actor = consoleUsers.find((u) => u.role === targetRole) || mockUserForRole(targetRole);

    this.api = createMockApi({
      actor,
      devices: options.empty ? [] : [...consoleDevices],
      users: options.empty ? [] : [...consoleUsers],
      files: options.empty ? [] : [...consoleFiles],
      fileBodies: options.empty ? [] : [...consoleFileBodies],
      audits: options.empty ? [] : [...consoleAudits],
      advanceJobs: true,
      failure: options.failure,
    });

    this.telemetries = options.empty ? [] : structuredClone(mockTelemetries);
    this.journeys = options.empty ? [] : structuredClone(mockJourneys);
    this.customers = options.empty ? [] : structuredClone(mockCustomers);
    this.alerts = options.empty ? [] : structuredClone(mockAlerts);
    this.manufacturers = options.empty ? [] : structuredClone(mockManufacturers);
    this.settings = structuredClone(mockDefaultSettings);
  }

  // --- Overview Operations ---
  async getOverviewKpis(): Promise<OverviewKpiData> {
    const devices = (await this.api.listDevices()).items;
    return {
      total_registered: devices.length,
      unclaimed_count: devices.filter((d) => d.status === "registered").length,
      claimed_count: devices.filter((d) => d.status === "claimed").length,
      revoked_count: devices.filter((d) => d.status === "revoked").length,
      active_journeys: this.journeys.filter((j) => j.status === "in_transit").length,
      active_alerts: this.alerts.filter((a) => a.status === "active").length,
      telemetry_health_percent: 98.4,
    };
  }

  async getRecentActivity(limit = 10): Promise<FleetActivityItem[]> {
    return [
      {
        id: "80000000-0000-4000-8000-000000000001",
        timestamp: "2026-10-24T09:30:00Z",
        category: "device",
        actor_email: "ops@amortrav.example.invalid",
        description: "Registered new luggage AMT-C055-00F3A9",
      },
      {
        id: "80000000-0000-4000-8000-000000000002",
        timestamp: "2026-10-24T09:12:00Z",
        category: "alert",
        actor_email: "system@amortrav.internal",
        description: "Triggered critical tamper alert on AMT-CI70-0012B8",
      },
    ].slice(0, limit);
  }

  // --- Telemetry & Device Operations ---
  async getDeviceTelemetry(deviceId: Uuid): Promise<DeviceTelemetry | null> {
    const item = this.telemetries.find((t) => t.device_id === deviceId);
    if (!item) return null;
    return structuredClone(item);
  }

  async toggleRemoteLock(deviceId: Uuid, lock: boolean): Promise<DeviceTelemetry> {
    if (this.role !== "admin") {
      throw new MockApiError(403, "admin role required");
    }
    const d = await this.api.getDevice(deviceId);
    if (d.status === "revoked") {
      throw new MockApiError(409, "device is revoked");
    }
    const t = this.telemetries.find((item) => item.device_id === deviceId);
    if (!t) {
      throw new MockApiError(404, "telemetry record not found");
    }
    t.lock_status = lock ? "locked" : "unlocked";
    t.last_ping = new Date().toISOString();
    return structuredClone(t);
  }

  async triggerDiagnostics(deviceId: Uuid): Promise<{ success: boolean; ping_ms: number; timestamp: IsoTimestamp }> {
    const d = await this.api.getDevice(deviceId);
    if (d.status === "revoked") {
      throw new MockApiError(409, "device is revoked");
    }
    return {
      success: true,
      ping_ms: 42,
      timestamp: new Date().toISOString(),
    };
  }

  async stageFirmwareUpdate(payload: FirmwareStagingPayload): Promise<{ staged_count: number; message: string }> {
    if (this.role !== "admin") {
      throw new MockApiError(403, "admin role required");
    }
    if (!payload.firmware_version || payload.firmware_version.length > 64) {
      throw new MockApiError(400, "invalid firmware version");
    }
    return {
      staged_count: payload.device_ids?.length ?? this.telemetries.length,
      message: `Firmware ${payload.firmware_version} staged for ${payload.target_channel} channel`,
    };
  }

  // --- Journeys ---
  async listJourneys(query?: { flight?: string; status?: JourneyStatus }): Promise<JourneyRecord[]> {
    let list = this.journeys;
    if (query?.flight) {
      list = list.filter((j) => j.flight_number.toLowerCase().includes(query.flight!.toLowerCase()));
    }
    if (query?.status) {
      list = list.filter((j) => j.status === query.status);
    }
    return structuredClone(list);
  }

  async getJourney(journeyId: Uuid): Promise<JourneyRecord> {
    const j = this.journeys.find((item) => item.id === journeyId);
    if (!j) throw new MockApiError(404, "journey not found");
    return structuredClone(j);
  }

  // --- Customers ---
  async listCustomers(search?: string): Promise<CustomerRecord[]> {
    let list = this.customers;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((c) => c.full_name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q));
    }
    return structuredClone(list);
  }

  async getCustomer(customerId: Uuid): Promise<CustomerDetail> {
    const c = this.customers.find((item) => item.id === customerId);
    if (!c) throw new MockApiError(404, "customer not found");

    const claimed = (await this.api.listDevices()).items.filter((d) => d.owner_id !== null);
    return {
      ...structuredClone(c),
      claimed_devices: claimed.map((d) => ({
        id: d.id,
        serial_number: d.serial_number,
        model: d.model,
        claimed_at: d.claimed_at || "2026-10-15T09:00:00Z",
      })),
      recent_journeys: structuredClone(this.journeys),
      support_notes: ["Verified ID via passport scan.", "Assisted with luggage lock PIN reset."],
    };
  }

  // --- Alerts ---
  async listAlerts(filter?: { severity?: AlertSeverity; status?: AlertStatus; category?: AlertCategory }): Promise<AlertRecord[]> {
    let list = this.alerts;
    if (filter?.severity) list = list.filter((a) => a.severity === filter.severity);
    if (filter?.status) list = list.filter((a) => a.status === filter.status);
    if (filter?.category) list = list.filter((a) => a.category === filter.category);
    return structuredClone(list);
  }

  async getAlert(alertId: Uuid): Promise<AlertRecord> {
    const a = this.alerts.find((item) => item.id === alertId);
    if (!a) throw new MockApiError(404, "alert not found");
    return structuredClone(a);
  }

  async acknowledgeAlert(alertId: Uuid): Promise<AlertRecord> {
    const a = this.alerts.find((item) => item.id === alertId);
    if (!a) throw new MockApiError(404, "alert not found");
    if (a.status === "resolved") {
      throw new MockApiError(409, "cannot acknowledge already resolved alert");
    }
    a.status = "acknowledged";
    return structuredClone(a);
  }

  async resolveAlert(alertId: Uuid, notes: string): Promise<AlertRecord> {
    if (this.role !== "admin") {
      throw new MockApiError(403, "admin role required");
    }
    if (!notes || notes.trim().length === 0) {
      throw new MockApiError(400, "resolution notes are required");
    }
    const a = this.alerts.find((item) => item.id === alertId);
    if (!a) throw new MockApiError(404, "alert not found");
    a.status = "resolved";
    a.resolved_at = new Date().toISOString();
    a.resolved_by = consoleUsers[0].id;
    a.resolution_notes = notes.trim();
    return structuredClone(a);
  }

  // --- Manufacturers ---
  async listManufacturers(): Promise<ManufacturerPartner[]> {
    if (this.role !== "admin") {
      throw new MockApiError(403, "admin role required");
    }
    return structuredClone(this.manufacturers);
  }

  // --- Settings ---
  async getSettings(): Promise<ConsoleSettingsConfig> {
    return structuredClone(this.settings);
  }

  async updateSettings(patch: Partial<ConsoleSettingsConfig>): Promise<ConsoleSettingsConfig> {
    if (this.role !== "admin") {
      throw new MockApiError(403, "admin role required");
    }
    if (patch.battery_warning_threshold_pct !== undefined) {
      if (patch.battery_warning_threshold_pct < 0 || patch.battery_warning_threshold_pct > 100) {
        throw new MockApiError(400, "battery threshold must be between 0 and 100");
      }
    }
    this.settings = { ...this.settings, ...patch };
    return structuredClone(this.settings);
  }
}

// ============================================================================
// Verification and Assertion Utilities
// ============================================================================

export async function assertRejectsStatus(
  action: () => Promise<unknown>,
  expectedStatus: number,
  expectedMessagePattern?: RegExp | string,
) {
  await assert.rejects(action, (error: unknown) => {
    assert.ok(error instanceof MockApiError, `Expected MockApiError but received ${String(error)}`);
    assert.equal(error.status, expectedStatus, `Expected HTTP status ${expectedStatus} but got ${error.status}`);
    if (expectedMessagePattern) {
      const rawMsg = error.body?.error;
      const msg =
        typeof rawMsg === "string"
          ? rawMsg
          : typeof rawMsg === "object" && rawMsg !== null
            ? JSON.stringify(rawMsg)
            : String(error.message || "");
      if (typeof expectedMessagePattern === "string") {
        assert.ok(
          msg.includes(expectedMessagePattern),
          `Expected error message to include "${expectedMessagePattern}", got "${msg}"`,
        );
      } else {
        assert.match(msg, expectedMessagePattern);
      }
    }
    return true;
  });
}

export function assertValidHex(str: string, expectedLength = 64) {
  assert.equal(typeof str, "string");
  assert.equal(str.length, expectedLength);
  assert.match(str, /^[0-9a-fA-F]+$/);
}

export function assertValidAsciiSerial(serial: string) {
  assert.ok(serial.length >= 6 && serial.length <= 64);
  assert.match(serial, /^[A-Z0-9_-]+$/);
}

export const VIEWPORT_WIDTHS = [320, 375, 390, 430, 768, 1024, 1280, 1440, 1920] as const;
export type ViewportWidth = (typeof VIEWPORT_WIDTHS)[number];

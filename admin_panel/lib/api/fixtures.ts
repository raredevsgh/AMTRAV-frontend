import type {
  Credentials,
  Device,
  DeviceAudit,
  ErrorResponse,
  FileMetadata,
  JobReceipt,
  JobResult,
  ManufacturerResponse,
  ProvisionedDevice,
  TokenPair,
  User,
} from "./types";

export const MOCK_IDS = {
  admin: "00000000-0000-4000-8000-000000000001",
  manufacturer: "00000000-0000-4000-8000-000000000002",
  user: "00000000-0000-4000-8000-000000000003",
  deviceRegistered: "10000000-0000-4000-8000-000000000001",
  deviceClaimed: "10000000-0000-4000-8000-000000000002",
  deviceRevoked: "10000000-0000-4000-8000-000000000003",
  auditRegistered: "20000000-0000-4000-8000-000000000001",
  auditClaimed: "20000000-0000-4000-8000-000000000002",
  auditRevoked: "20000000-0000-4000-8000-000000000003",
  fileManual: "30000000-0000-4000-8000-000000000001",
  fileExport: "30000000-0000-4000-8000-000000000002",
  pendingJob: "40000000-0000-4000-8000-000000000001",
  completedJob: "40000000-0000-4000-8000-000000000002",
  failedJob: "40000000-0000-4000-8000-000000000003",
} as const;

const MOCK_DATE = "2026-01-15T12:00:00.000Z";
const MOCK_LATER_DATE = "2026-01-16T12:00:00.000Z";

export const mockUsers: readonly User[] = [
  {
    id: MOCK_IDS.admin,
    email: "admin@amtrav.example.invalid",
    email_verified: true,
    role: "admin",
    created_at: MOCK_DATE,
  },
  {
    id: MOCK_IDS.manufacturer,
    email: "manufacturer@amtrav.example.invalid",
    email_verified: true,
    role: "manufacturer",
    created_at: MOCK_DATE,
  },
  {
    id: MOCK_IDS.user,
    email: "traveler@amtrav.example.invalid",
    email_verified: false,
    role: "user",
    created_at: MOCK_LATER_DATE,
  },
];

const registeredDevice: Device = {
  id: MOCK_IDS.deviceRegistered,
  serial_number: "AMTRAV-REG-0001",
  model: "AMTRAV Bag Pro v1",
  firmware_version: "1.4.0",
  manufacturer_id: MOCK_IDS.manufacturer,
  owner_id: null,
  nickname: null,
  status: "registered",
  claimed_at: null,
  created_at: MOCK_DATE,
  updated_at: MOCK_DATE,
};

const claimedDevice: Device = {
  id: MOCK_IDS.deviceClaimed,
  serial_number: "AMTRAV-CLM-0002",
  model: "AMTRAV Carry-on v2",
  firmware_version: "2.1.0",
  manufacturer_id: MOCK_IDS.manufacturer,
  owner_id: MOCK_IDS.user,
  nickname: "Conference carry-on",
  status: "claimed",
  claimed_at: MOCK_LATER_DATE,
  created_at: MOCK_DATE,
  updated_at: MOCK_LATER_DATE,
};

const revokedDevice: Device = {
  id: MOCK_IDS.deviceRevoked,
  serial_number: "AMTRAV-REV-0003",
  model: "AMTRAV Bag Lite v1",
  firmware_version: "1.1.2",
  manufacturer_id: MOCK_IDS.manufacturer,
  owner_id: null,
  nickname: null,
  status: "revoked",
  claimed_at: null,
  created_at: MOCK_DATE,
  updated_at: MOCK_LATER_DATE,
};

export const mockDevices: readonly Device[] = [
  registeredDevice,
  claimedDevice,
  revokedDevice,
];

export const mockProvisionedDevice: ProvisionedDevice = {
  device: registeredDevice,
  claim_code: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
};

export const mockDeviceAudit: readonly DeviceAudit[] = [
  {
    id: MOCK_IDS.auditRegistered,
    device_id: MOCK_IDS.deviceRegistered,
    actor_id: MOCK_IDS.manufacturer,
    action: "registered",
    created_at: MOCK_DATE,
  },
  {
    id: MOCK_IDS.auditClaimed,
    device_id: MOCK_IDS.deviceClaimed,
    actor_id: MOCK_IDS.user,
    action: "claimed",
    created_at: MOCK_LATER_DATE,
  },
  {
    id: MOCK_IDS.auditRevoked,
    device_id: MOCK_IDS.deviceRevoked,
    actor_id: MOCK_IDS.manufacturer,
    action: "revoked",
    created_at: MOCK_LATER_DATE,
  },
];

export const mockFiles: readonly FileMetadata[] = [
  {
    id: MOCK_IDS.fileManual,
    owner_id: MOCK_IDS.manufacturer,
    filename: "device-manual.pdf",
    content_type: "application/pdf",
    size_bytes: 245760,
    created_at: MOCK_DATE,
  },
  {
    id: MOCK_IDS.fileExport,
    owner_id: MOCK_IDS.admin,
    filename: "registry-export.json",
    content_type: "application/json",
    size_bytes: 4096,
    created_at: MOCK_LATER_DATE,
  },
];

export const mockTokenPair: TokenPair = {
  access_token: "mock-access-token-not-for-production",
  refresh_token: "mock-refresh-token-not-for-production",
  token_type: "Bearer",
  expires_in: 900,
  user: mockUsers[0],
};

export const mockCredentials: Credentials = {
  email: "admin@amtrav.example.invalid",
  password: "mock-password-not-for-production",
};

export const mockJobReceipts: Readonly<Record<"pending" | "completed" | "failed", JobReceipt>> = {
  pending: {
    job_id: MOCK_IDS.pendingJob,
    receipt: "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
    poll_url: `/api/v1/auth/jobs/${MOCK_IDS.pendingJob}`,
    expires_in: 300,
    poll_after_ms: 1000,
  },
  completed: {
    job_id: MOCK_IDS.completedJob,
    receipt: "cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc",
    poll_url: `/api/v1/auth/jobs/${MOCK_IDS.completedJob}`,
    expires_in: 300,
    poll_after_ms: 1000,
  },
  failed: {
    job_id: MOCK_IDS.failedJob,
    receipt: "dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd",
    poll_url: `/api/v1/auth/jobs/${MOCK_IDS.failedJob}`,
    expires_in: 300,
    poll_after_ms: 1000,
  },
};

export const mockJobResults: Readonly<Record<"pending" | "completed" | "failed", JobResult>> = {
  pending: { status: "queued", http_status: null, result: null },
  completed: {
    status: "completed",
    http_status: 201,
    result: {
      id: mockUsers[1].id,
      email: mockUsers[1].email,
      email_verified: mockUsers[1].email_verified,
      role: mockUsers[1].role,
      created_at: mockUsers[1].created_at,
    },
  },
  failed: {
    status: "completed",
    http_status: 409,
    result: { error: "account already exists; sign in using its original method" },
  },
};

export const mockManufacturerResponse: ManufacturerResponse = {
  message: "manufacturer access granted",
  user_id: MOCK_IDS.manufacturer,
};

export const mockErrors: Readonly<Record<400 | 401 | 403 | 404 | 409 | 422 | 429 | 503, ErrorResponse>> = {
  400: { error: "invalid request" },
  401: { error: "invalid credentials or expired session" },
  403: { error: "required role is missing" },
  404: { error: "resource not found" },
  409: { error: "resource conflict" },
  422: { error: "invalid request body" },
  429: { error: "retry later" },
  503: { error: "service temporarily unavailable" },
};

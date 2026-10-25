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
  Credentials,
  Device,
  DeviceAudit,
  DeviceListParams,
  FileListParams,
  FileMetadata,
  JobReceipt,
  JobResult,
  ManufacturerResponse,
  ProvisionedDevice,
  RegisterDevice,
  Role,
  RoleUpdate,
  TokenPair,
  UpdateDevice,
  User,
  UserListParams,
} from "./types";

export type MockFailure = "rate_limit" | "unavailable";

export type MockApiOptions = {
  actor?: User;
  latencyMs?: number;
  failure?: MockFailure;
};

export type MockPage<T> = {
  items: T[];
  limit: number;
  offset: number;
};

type StoredJob = {
  receipt: JobReceipt;
  result: JobResult;
};

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

function clone<T>(value: T): T {
  return structuredClone(value);
}

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function normalizePagination(params: DeviceListParams | UserListParams | FileListParams) {
  const { limit = DEFAULT_LIMIT, offset = 0 } = params;
  if (!Number.isInteger(limit) || !Number.isInteger(offset)) {
    throw mockError.badRequest("limit and offset must be integers");
  }
  return {
    limit: Math.min(Math.max(limit, 1), MAX_LIMIT),
    offset: Math.max(offset, 0),
  };
}

function page<T>(items: readonly T[], params: DeviceListParams | UserListParams | FileListParams): MockPage<T> {
  const normalized = normalizePagination(params);
  return {
    items: clone(items.slice(normalized.offset, normalized.offset + normalized.limit)),
    ...normalized,
  };
}

function roleUser(role: Role): User {
  const user = mockUsers.find((candidate) => candidate.role === role);
  if (!user) throw new Error(`Missing mock user for role ${role}`);
  return clone(user);
}

export class MockApiService {
  private readonly actor: User;
  private readonly latencyMs: number;
  private readonly failure: MockFailure | undefined;
  private readonly devices: Device[];
  private readonly audits: DeviceAudit[];
  private readonly files: FileMetadata[];
  private readonly users: User[];
  private readonly jobs = new Map<string, StoredJob>();

  constructor(options: MockApiOptions = {}) {
    this.actor = clone(options.actor ?? roleUser("admin"));
    this.latencyMs = options.latencyMs ?? 0;
    this.failure = options.failure;
    this.devices = clone([...mockDevices]);
    this.audits = clone([...mockDeviceAudit]);
    this.files = clone([...mockFiles]);
    this.users = clone([...mockUsers]);
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
      credentials.email.trim().toLowerCase() === "admin@amtrav.example.invalid" &&
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

  async listDevices(params: DeviceListParams = {}): Promise<MockPage<Device>> {
    await this.beforeRequest();
    const visible = this.devices.filter((device) => this.canViewDevice(device));
    return this.respond(page(visible, params));
  }

  async getDevice(id: string): Promise<Device> {
    await this.beforeRequest();
    const device = this.devices.find((candidate) => candidate.id === id);
    if (!device || !this.canViewDevice(device)) throw mockError.notFound("device not found");
    return this.respond(device);
  }

  async registerDevice(input: RegisterDevice): Promise<ProvisionedDevice> {
    await this.beforeRequest();
    this.requireManufacturer();
    const serial = input.serial_number.trim().toUpperCase();
    if (!serial || !input.model.trim() || !input.firmware_version.trim()) {
      throw mockError.badRequest("invalid device metadata");
    }
    if (this.devices.some((device) => device.serial_number === serial)) {
      throw mockError.conflict("device serial number already exists");
    }
    const manufacturerId = input.manufacturer_id ?? this.actor.id;
    if (this.actor.role === "manufacturer" && manufacturerId !== this.actor.id) {
      throw mockError.forbidden("cannot register devices for another manufacturer");
    }
    if (this.actor.role === "admin" && !input.manufacturer_id) {
      throw mockError.badRequest("manufacturer_id is required for admin registration");
    }
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
      created_at: "2026-01-17T12:00:00.000Z",
      updated_at: "2026-01-17T12:00:00.000Z",
    };
    this.devices.push(device);
    return this.respond({
      device,
      claim_code: "eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
    });
  }

  async updateDevice(id: string, input: UpdateDevice): Promise<Device> {
    await this.beforeRequest();
    this.requireManufacturer();
    if (input.model === undefined && input.firmware_version === undefined) {
      throw mockError.badRequest("provide at least one device metadata field");
    }
    const device = this.findManagedDevice(id);
    if (device.status === "revoked") throw mockError.conflict("device is revoked");
    if (input.model !== undefined) device.model = input.model?.trim() ?? device.model;
    if (input.firmware_version !== undefined) {
      device.firmware_version = input.firmware_version?.trim() ?? device.firmware_version;
    }
    return this.respond(device);
  }

  async rotateClaimCode(id: string): Promise<ProvisionedDevice> {
    await this.beforeRequest();
    this.requireManufacturer();
    const device = this.findManagedDevice(id);
    if (device.status !== "registered" || device.owner_id) {
      throw mockError.conflict("only unclaimed devices can receive a new claim code");
    }
    return this.respond({
      device,
      claim_code: "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
    });
  }

  async revokeDevice(id: string): Promise<Device> {
    await this.beforeRequest();
    this.requireManufacturer();
    const device = this.findManagedDevice(id);
    device.status = "revoked";
    device.updated_at = "2026-01-17T12:00:00.000Z";
    return this.respond(device);
  }

  async listDeviceAudit(id: string, params: DeviceListParams = {}): Promise<MockPage<DeviceAudit>> {
    await this.beforeRequest();
    await this.getDevice(id);
    return this.respond(page(this.audits.filter((audit) => audit.device_id === id), params));
  }

  async listUsers(params: UserListParams = {}): Promise<MockPage<User>> {
    await this.beforeRequest();
    this.requireAdmin();
    return this.respond(page(this.users, params));
  }

  async updateRole(id: string, input: RoleUpdate): Promise<User> {
    await this.beforeRequest();
    this.requireAdmin();
    if (id === this.actor.id) throw mockError.badRequest("use another admin to change your own role");
    const user = this.users.find((candidate) => candidate.id === id);
    if (!user) throw mockError.notFound("user not found");
    if (user.role === "user" && input.role !== "user") {
      throw mockError.badRequest("role is incompatible with the account sign-in method");
    }
    user.role = input.role;
    return this.respond(user);
  }

  async createManufacturer(credentials: Credentials): Promise<JobReceipt> {
    await this.beforeRequest();
    this.requireAdmin();
    const email = credentials.email.trim().toLowerCase();
    const passwordBytes = new TextEncoder().encode(credentials.password).byteLength;
    if (!email.includes("@") || passwordBytes < 12 || passwordBytes > 128) {
      throw mockError.badRequest("invalid manufacturer credentials");
    }
    return this.respond(clone(mockJobReceipts.pending));
  }

  async getJob(id: string, receipt: string): Promise<JobResult> {
    await this.beforeRequest();
    const job = this.jobs.get(id);
    if (!job || job.receipt.receipt !== receipt) throw mockError.notFound("job not found");
    return this.respond(job.result);
  }

  async listFiles(params: FileListParams = {}): Promise<MockPage<FileMetadata>> {
    await this.beforeRequest();
    const visible = this.actor.role === "admin"
      ? this.files
      : this.files.filter((file) => file.owner_id === this.actor.id);
    return this.respond(page(visible, params));
  }

  async getFile(id: string): Promise<FileMetadata> {
    await this.beforeRequest();
    const file = this.files.find((candidate) => candidate.id === id);
    const canRead = file && (this.actor.role === "admin" || file.owner_id === this.actor.id);
    if (!canRead) throw mockError.notFound("file not found");
    return this.respond(file);
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
    if (this.actor.role !== "admin") throw mockError.forbidden("admin role required");
  }

  private requireManufacturer(): void {
    if (this.actor.role !== "admin" && this.actor.role !== "manufacturer") {
      throw mockError.forbidden("required role is missing");
    }
  }

  private canViewDevice(device: Device): boolean {
    return (
      this.actor.role === "admin" ||
      (this.actor.role === "manufacturer" && device.manufacturer_id === this.actor.id) ||
      (this.actor.role === "user" && device.owner_id === this.actor.id)
    );
  }

  private findManagedDevice(id: string): Device {
    const device = this.devices.find((candidate) => candidate.id === id);
    const canManage = device &&
      (this.actor.role === "admin" ||
        (this.actor.role === "manufacturer" && device.manufacturer_id === this.actor.id));
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

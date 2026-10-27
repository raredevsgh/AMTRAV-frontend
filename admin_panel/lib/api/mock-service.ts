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
  devices?: readonly Device[];
  users?: readonly User[];
  files?: readonly FileMetadata[];
  audits?: readonly DeviceAudit[];
  fileBodies?: readonly string[];
  advanceJobs?: boolean;
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

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
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
  private readonly actor: User;
  private readonly latencyMs: number;
  private readonly failure: MockFailure | undefined;
  private readonly devices: Device[];
  private readonly audits: DeviceAudit[];
  private readonly files: FileMetadata[];
  private readonly users: User[];
  private readonly fileBodies = new Map<string, Uint8Array>();
  private readonly advanceJobs: boolean;
  private readonly jobs = new Map<string, StoredJob>();

  constructor(options: MockApiOptions = {}) {
    this.actor = clone(options.actor ?? roleUser("admin"));
    this.latencyMs = options.latencyMs ?? 0;
    this.failure = options.failure;
    this.advanceJobs = options.advanceJobs ?? false;
    this.devices = clone([...(options.devices ?? mockDevices)]);
    this.audits = clone([...(options.audits ?? mockDeviceAudit)]);
    this.files = clone([...(options.files ?? mockFiles)]);
    this.users = clone([...(options.users ?? mockUsers)]);
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
    this.record(device.id, "registered");
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
    device.updated_at = "2026-10-26T12:00:00.000Z";
    this.record(device.id, "revoked");
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
          created_at: "2026-10-26T12:00:00Z",
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
      created_at: "2026-10-26T12:00:00Z",
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

  private record(deviceId: string, action: string): void {
    this.audits.unshift({
      id: `20000000-0000-4000-8000-${String(this.audits.length + 1).padStart(12, "0")}`,
      device_id: deviceId,
      actor_id: this.actor.id,
      action,
      created_at: "2026-10-26T12:00:00Z",
    });
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

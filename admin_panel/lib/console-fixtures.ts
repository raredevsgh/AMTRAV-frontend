import type { Device, DeviceAudit, FileMetadata, User } from "./api/types";
import { MOCK_IDS, mockUsers } from "./api/fixtures";

// Explicit fictional visual fixtures. These never represent a connected fleet.
export const consoleUsers: User[] = [
  {
    ...mockUsers[0],
    email: "ops@amortrav.example.invalid",
    created_at: "2026-08-02T09:00:00Z",
  },
  {
    ...mockUsers[1],
    email: "factory@northline.example.invalid",
    created_at: "2026-09-14T09:00:00Z",
  },
  {
    id: "00000000-0000-4000-8000-000000000004",
    email: "ops@harbor.example.invalid",
    role: "manufacturer",
    email_verified: false,
    created_at: "2026-09-21T09:00:00Z",
  },
  {
    id: "00000000-0000-4000-8000-000000000005",
    email: "qa@amortrav.example.invalid",
    role: "admin",
    email_verified: true,
    created_at: "2026-09-28T09:00:00Z",
  },
  mockUsers[2],
];
const serials = [
  "AMT-C055-00F3A1",
  "AMT-C055-00F3A2",
  "AMT-CI70-0012B7",
  "AMT-CI70-0012B8",
  "AMT-WK40-1A09C3",
  "AMT-WK40-1A09C4",
  "AMT-C055-00F3A9",
  "AMT-CI70-0012C1",
];
export const consoleDevices: Device[] = serials.map((serial, i) => ({
  id: `10000000-0000-4000-8000-${String(i + 1).padStart(12, "0")}`,
  serial_number: serial,
  model:
    i === 4 || i === 5
      ? "Weekender 40"
      : i === 2 || i === 3 || i === 7
        ? "Check-In 70"
        : "Carry-On 55",
  firmware_version: i === 4 ? "1.3.9" : i === 2 || i === 3 ? "1.4.0" : "1.4.2",
  manufacturer_id:
    i === 4 || i === 5 ? consoleUsers[2].id : MOCK_IDS.manufacturer,
  owner_id: [0, 1, 5, 7].includes(i) ? MOCK_IDS.user : null,
  nickname: null,
  status:
    i === 4 ? "revoked" : [0, 1, 5, 7].includes(i) ? "claimed" : "registered",
  claimed_at: [0, 1, 5, 7].includes(i)
    ? `2026-10-${String(11 + i).padStart(2, "0")}T09:00:00Z`
    : null,
  created_at: "2026-10-01T09:00:00Z",
  updated_at: "2026-10-24T09:40:00Z",
}));
export const consoleAudits: DeviceAudit[] = consoleDevices.map((d, i) => ({
  id: `20000000-0000-4000-8000-${String(i + 1).padStart(12, "0")}`,
  device_id: d.id,
  actor_id: MOCK_IDS.admin,
  action: "registered",
  created_at: d.created_at,
}));
export const consoleFileBodies = [
  "EXAMPLE ONLY — fictional C055 specification. Not a product certificate.\n",
  '{"example":true,"serials":["AMT-C055-00F3A1"]}\n',
  "EXAMPLE ONLY — no live device diagnostics.\n",
  "EXAMPLE ONLY — luggage label fixture.\n",
  "EXAMPLE ONLY — not an FCC certificate.\n",
];
export const consoleFiles: FileMetadata[] = consoleFileBodies.map(
  (body, i) => ({
    id: `30000000-0000-4000-8000-${String(i + 1).padStart(12, "0")}`,
    owner_id:
      i === 2
        ? MOCK_IDS.admin
        : i === 3
          ? consoleUsers[2].id
          : MOCK_IDS.manufacturer,
    filename: [
      "C055-example-spec.txt",
      "batch-example.json",
      "diagnostic-example.txt",
      "label-example.txt",
      "certificate-example.txt",
    ][i],
    content_type: i === 1 ? "application/json" : "text/plain",
    size_bytes: new TextEncoder().encode(body).length,
    created_at: "2026-10-16T10:30:00Z",
  }),
);

import type {
  Device,
  BatchSummary,
  MfaStatus,
  SecurityEvent,
  SessionInfo,
  StaffRole,
  SentMessage,
  Traveller,
  TravellerDetail,
  User,
} from "./types";

export const previewUsers: User[] = [
  {
    id: "00000000-0000-4000-8000-000000000001",
    email: "ops@amortrav.example",
    role: "admin",
    email_verified: true,
    created_at: "2026-08-02T09:00:00Z",
  },
  {
    id: "00000000-0000-4000-8000-000000000002",
    email: "factory@northline.example",
    role: "manufacturer",
    email_verified: true,
    created_at: "2026-09-14T09:00:00Z",
  },
  {
    id: "00000000-0000-4000-8000-000000000003",
    email: "ops@harborgoods.example",
    role: "manufacturer",
    email_verified: true,
    created_at: "2026-09-21T09:00:00Z",
  },
];

export function previewUser(role: StaffRole) {
  return previewUsers[role === "admin" ? 0 : 1];
}

const rows = [
  ["AMT-CO55-00F3A1", "Carry-On 55", "1.4.2", 1, "claimed", 18],
  ["AMT-CO55-00F3A2", "Carry-On 55", "1.4.2", 1, "claimed", 17],
  ["AMT-CI70-0012B7", "Check-In 70", "1.4.0", 1, "unclaimed", 0],
  ["AMT-CI70-0012B8", "Check-In 70", "1.4.0", 1, "unclaimed", 0],
  ["AMT-WK40-1A09C3", "Weekender 40", "1.3.9", 2, "revoked", 1],
  ["AMT-WK40-1A09C4", "Weekender 40", "1.4.2", 2, "claimed", 2],
  ["AMT-CO55-00F3A9", "Carry-On 55", "1.4.2", 1, "unclaimed", 0],
  ["AMT-CI70-0012C1", "Check-In 70", "1.4.2", 2, "claimed", 11],
] as const;

export const previewDevices: Device[] = rows.map(
  ([serial, model, firmware, maker, status, day], i) => ({
    id: `10000000-0000-4000-8000-${String(i + 1).padStart(12, "0")}`,
    serial_number: serial,
    model,
    firmware_version: firmware,
    manufacturer_id: previewUsers[maker].id,
    owner_id: day ? `20000000-0000-4000-8000-${String(i + 1).padStart(12, "0")}` : null,
    nickname: i === 0 ? "Blue carry-on" : null,
    status,
    claimed_at: day ? `2026-10-${String(day).padStart(2, "0")}T09:14:00Z` : null,
    created_at: `2026-09-${String(i + 2).padStart(2, "0")}T11:47:00Z`,
    updated_at: "2026-10-18T09:14:00Z",
  }),
);

export const previewSessions: SessionInfo[] = [
  {
    id: "00000000-0000-4000-8000-0000000000a1",
    method: "password",
    client: "Chrome on macOS",
    created_at: "2026-10-24T08:12:00Z",
    expires_at: "2026-10-31T08:12:00Z",
    current: true,
  },
  {
    id: "00000000-0000-4000-8000-0000000000a2",
    method: "password",
    client: "Safari on iPhone",
    created_at: "2026-10-20T17:40:00Z",
    expires_at: "2026-10-27T17:40:00Z",
    current: false,
  },
];

export const previewSecurityEvents: SecurityEvent[] = [
  {
    id: "00000000-0000-4000-8000-0000000000b1",
    occurred_at: "2026-10-24T08:12:00Z",
    actor_id: previewUsers[0].id,
    action: "login",
    outcome: "success",
    subject_type: null,
    subject_id: null,
    detail: "password",
  },
  {
    id: "00000000-0000-4000-8000-0000000000b2",
    occurred_at: "2026-10-24T07:58:00Z",
    actor_id: previewUsers[1].id,
    action: "login",
    outcome: "denied",
    subject_type: null,
    subject_id: null,
    detail: "password",
  },
  {
    id: "00000000-0000-4000-8000-0000000000b3",
    occurred_at: "2026-10-23T15:03:00Z",
    actor_id: previewUsers[0].id,
    action: "role_changed",
    outcome: "success",
    subject_type: "user",
    subject_id: previewUsers[2].id,
    detail: "manufacturer -> admin",
  },
];

export const previewMfa: MfaStatus = {
  required: true,
  enabled: true,
  totp: true,
  passkeys: [
    {
      id: "00000000-0000-4000-8000-0000000000c1",
      name: "MacBook Touch ID",
      created_at: "2026-10-02T10:00:00Z",
      last_used_at: "2026-10-24T08:12:00Z",
    },
  ],
  recovery_codes_remaining: 9,
  passkeys_available: true,
};

export const previewBatches: BatchSummary[] = [
  {
    id: "00000000-0000-4000-8000-0000000000d1",
    manufacturer_id: previewUsers[1].id,
    manufacturer_email: previewUsers[1].email,
    created_by: previewUsers[1].id,
    model: "Carry-On 55",
    firmware_version: "1.2.0",
    device_count: 250,
    created_at: "2026-10-21T13:30:00Z",
    claimed_count: 61,
    revoked_count: 2,
    keyed_count: 250,
  },
];

// Invented travellers for the preview; no real people.
const traveller = (
  index: number,
  name: string,
  username: string | null,
  fields: Partial<Traveller>,
): Traveller => ({
  id: `00000000-0000-4000-8000-0000000000c${index}`,
  email: `${(username ?? name.split(" ")[0])
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()}@example.com`,
  display_name: name,
  avatar_url: null,
  username,
  google: !username,
  password: !!username,
  email_verified: true,
  mfa_enabled: false,
  created_at: `2026-10-${String(10 + index).padStart(2, "0")}T09:30:00Z`,
  terms_accepted_at: username
    ? `2026-10-${String(10 + index).padStart(2, "0")}T09:31:00Z`
    : null,
  adult_confirmed_at: username
    ? `2026-10-${String(10 + index).padStart(2, "0")}T09:31:00Z`
    : null,
  bags: 1,
  last_sign_in: "2026-10-24T18:02:00Z",
  last_bag_activity: "2026-10-24T21:40:00Z",
  ...fields,
});

export const previewTravellers: Traveller[] = [
  traveller(1, "Ama Owusu", "ama.owusu", { mfa_enabled: true, bags: 2 }),
  traveller(2, "Kwame Mensah", null, { last_bag_activity: "2026-10-23T07:15:00Z" }),
  traveller(3, "Lena Fischer", "lena_f", {
    email_verified: false,
    bags: 0,
    last_sign_in: null,
    last_bag_activity: null,
  }),
  traveller(4, "Tomás Ruiz", null, { google: true, password: true, mfa_enabled: true }),
];

export const previewTravellerDetail = (id: string): TravellerDetail => {
  const person = previewTravellers.find((item) => item.id === id) ?? previewTravellers[0];
  const bag = "00000000-0000-4000-8000-0000000000d1";
  return {
    traveller: person,
    bags: person.bags
      ? [
          {
            id: bag,
            serial_number: "AMT-24-00017",
            model: "Carry-on 55",
            nickname: "Blue carry-on",
            status: "claimed",
            claimed_at: "2026-10-20T10:00:00Z",
            latitude: 51.4706,
            longitude: -0.4619,
            accuracy_m: 12,
            recorded_at: "2026-10-24T21:40:00Z",
          },
        ]
      : [],
    activity: person.bags
      ? [
          {
            id: 3,
            device_id: bag,
            kind: "moved",
            occurred_at: "2026-10-24T21:40:00Z",
            latitude: 51.4706,
            longitude: -0.4619,
            accuracy_m: 12,
            distance_m: 5_120_000,
          },
          {
            id: 2,
            device_id: bag,
            kind: "first_fix",
            occurred_at: "2026-10-24T13:05:00Z",
            latitude: 5.6052,
            longitude: -0.1668,
            accuracy_m: 20,
            distance_m: null,
          },
          {
            id: 1,
            device_id: bag,
            kind: "claimed",
            occurred_at: "2026-10-20T10:00:00Z",
            latitude: null,
            longitude: null,
            accuracy_m: null,
            distance_m: null,
          },
        ]
      : [],
    security: [
      {
        id: "00000000-0000-4000-8000-0000000000e1",
        occurred_at: "2026-10-24T18:02:00Z",
        actor_id: person.id,
        action: "login",
        outcome: "success",
        subject_type: null,
        subject_id: null,
        detail: person.google ? "google" : "password",
      },
    ],
  };
};

export const previewSentMessages: SentMessage[] = [
  {
    id: "00000000-0000-4000-8000-0000000000f1",
    audience: "all",
    recipient_id: null,
    recipient_email: null,
    sender_email: "ops@amortrav.example",
    title: "New: live flights on the map",
    body: "See the aircraft around you, and search any flight by airline or callsign.",
    recipients: 4,
    created_at: "2026-10-24T09:00:00Z",
  },
  {
    id: "00000000-0000-4000-8000-0000000000f2",
    audience: "traveller",
    recipient_id: "00000000-0000-4000-8000-0000000000c1",
    recipient_email: "ama.owusu@example.com",
    sender_email: "ops@amortrav.example",
    title: "Your bag is at Belt 4",
    body: "Our team at Heathrow T5 has your blue carry-on. Show this message at the desk.",
    recipients: 1,
    created_at: "2026-10-24T21:45:00Z",
  },
];

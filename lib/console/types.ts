export type StaffRole = "admin" | "manufacturer" | "support" | "operations" | "finance" | "read_only";

export interface User {
  id: string;
  email: string;
  email_verified: boolean;
  role: StaffRole | "user";
  created_at: string;
  mfa_enabled?: boolean;
  first_name?: string | null;
  last_name?: string | null;
  display_name?: string | null;
  /** The uploaded photo, relative to the API base; fetched through the gateway. */
  photo_path?: string | null;
  /** False for accounts that sign in only with Google. */
  has_password?: boolean;
}

export interface Device {
  id: string;
  serial_number: string;
  model: string;
  firmware_version: string;
  manufacturer_id: string;
  owner_id: string | null;
  nickname: string | null;
  status: "unclaimed" | "claimed" | "revoked";
  claimed_at: string | null;
  created_at: string;
  updated_at: string;
  public_key?: string | null;
  key_registered_at?: string | null;
  batch_id?: string | null;
}

export interface AuditEntry {
  id: string;
  device_id: string;
  actor_id: string;
  action: string;
  created_at: string;
}

export interface StoredFile {
  id: string;
  owner_id: string;
  filename: string;
  content_type: string;
  size_bytes: number;
  created_at: string;
}

export interface ProvisionedDevice {
  device: Device;
  claim_code: string;
  /** AMTRAV1:<serial>:<claim_code>, the text in the label QR code. */
  qr_payload?: string;
  /** The payload as an SVG QR code (high error correction, for the centred mark). */
  qr_svg?: string;
}

export interface JobReceipt {
  job_id: string;
  receipt: string;
  expires_in: number;
  poll_after_ms: number;
}

export interface JobResult {
  status: string;
  http_status: number | null;
  result: User | { error: string } | null;
}

export interface SessionInfo {
  id: string;
  method: "password" | "google";
  client: string | null;
  created_at: string;
  expires_at: string;
  current: boolean;
}

export interface SecurityEvent {
  id: string;
  occurred_at: string;
  actor_id: string | null;
  action: string;
  outcome: "success" | "denied";
  subject_type: "user" | "device" | "file" | "session" | null;
  subject_id: string | null;
  detail: string | null;
}

export interface PasskeySummary {
  id: string;
  name: string;
  created_at: string;
  last_used_at: string | null;
}

export interface MfaStatus {
  required: boolean;
  enabled: boolean;
  totp: boolean;
  passkeys: PasskeySummary[];
  recovery_codes_remaining: number;
  passkeys_available: boolean;
}

export interface TotpSetup {
  secret: string;
  otpauth_uri: string;
  qr_svg: string;
}

export interface DeviceBatch {
  id: string;
  manufacturer_id: string;
  created_by: string;
  model: string;
  firmware_version: string;
  device_count: number;
  created_at: string;
}

export interface BatchItem {
  device: Device;
  claim_code: string;
  qr_payload: string;
  qr_svg: string;
}

export interface ProvisionedBatch {
  batch: DeviceBatch;
  devices: BatchItem[];
}

export interface BatchSummary extends DeviceBatch {
  manufacturer_email: string;
  claimed_count: number;
  revoked_count: number;
  keyed_count: number;
}

/** A traveller account as administrators see it (`GET admin/travellers`). */
export interface Traveller {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  username: string | null;
  /** An uploaded photo, relative to the API (served through the console gateway). */
  photo_path?: string | null;
  /** Signs in with Google. */
  google: boolean;
  /** Has an email-and-password login. */
  password: boolean;
  email_verified: boolean;
  mfa_enabled: boolean;
  created_at: string;
  terms_accepted_at: string | null;
  adult_confirmed_at: string | null;
  bags: number;
  last_sign_in: string | null;
  last_bag_activity: string | null;
  /** Set while an administrator has suspended the account. */
  suspended_at?: string | null;
  suspended_reason?: string | null;
}

export interface TravellerPage {
  travellers: Traveller[];
  total: number;
}

export interface TravellerBag {
  id: string;
  serial_number: string;
  model: string;
  nickname: string | null;
  status: string;
  claimed_at: string | null;
  latitude: number | null;
  longitude: number | null;
  accuracy_m: number | null;
  recorded_at: string | null;
  lost_at?: string | null;
  lost_note?: string | null;
}

export interface BagActivity {
  id: number;
  device_id: string;
  /** Positions, lost/found, and the TRACE events: impact, weighed, tamper, journey_started… */
  kind: string;
  occurred_at: string;
  latitude: number | null;
  longitude: number | null;
  accuracy_m: number | null;
  distance_m: number | null;
  journey_id?: string | null;
  weight_g?: number | null;
  impact_g?: number | null;
  severity?: Severity | null;
  battery_pct?: number | null;
  detail?: string | null;
  /** The firmware that reported it. */
  firmware?: string | null;
  /** How the report reached the server. */
  via?: "cellular" | "wifi" | "phone" | null;
  /** Whether the bag was locked at the time. */
  locked?: boolean | null;
  /** Whether it had been opened since it was last locked. */
  tampered?: boolean | null;
}

export interface TravellerDetail {
  traveller: Traveller;
  bags: TravellerBag[];
  activity: BagActivity[];
  security: SecurityEvent[];
}

/** A message an administrator sent (`GET admin/messages`). */
export interface SentMessage {
  id: string;
  /** "traveller" (one person) or "all" (an announcement). */
  audience: "traveller" | "all";
  recipient_id: string | null;
  recipient_email: string | null;
  sender_email: string | null;
  title: string;
  body: string;
  recipients: number;
  created_at: string;
}

export interface SentPage {
  messages: SentMessage[];
  total: number;
}

export type Severity = "light" | "moderate" | "severe";

/** `GET admin/impacts`. */
export interface ImpactReview {
  id: number;
  device_id: string;
  serial_number: string;
  model: string;
  nickname: string | null;
  owner_email: string | null;
  occurred_at: string;
  impact_g: number | null;
  severity: Severity | null;
  orientation: string | null;
  latitude: number | null;
  longitude: number | null;
  journey_id: string | null;
}

export type AlertCategory =
  | "impact"
  | "tamper"
  | "separation"
  | "battery"
  | "theft"
  | "geofence"
  | "weight"
  | "journey"
  | "transfer"
  | "tracker";

/** `GET admin/alerts`: alerts sent to travellers. */
export interface AlertRecord {
  id: number;
  created_at: string;
  read_at: string | null;
  category: AlertCategory | null;
  title: string;
  body: string;
  device_id: string | null;
  serial_number: string | null;
  user_id: string;
  owner_email: string;
  /** The incident staff opened for it; absent until someone acknowledges it. */
  incident_id?: string | null;
  incident_status?: "acknowledged" | "resolved" | null;
  escalated?: boolean;
  assignee_email?: string | null;
}

export interface Incident {
  id: string;
  notification_id: number | null;
  device_id: string | null;
  device_serial: string | null;
  owner_id: string | null;
  owner_email: string | null;
  category: AlertCategory;
  title: string;
  body: string;
  alerted_at: string;
  status: "acknowledged" | "resolved";
  escalated: boolean;
  assignee_id: string | null;
  assignee_email: string | null;
  resolution: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
}

export interface IncidentDetail {
  incident: Incident;
  events: {
    action:
      | "acknowledged"
      | "assigned"
      | "unassigned"
      | "escalated"
      | "resolved"
      | "reopened"
      | "noted";
    note: string | null;
    actor_email: string | null;
    created_at: string;
  }[];
  requests: {
    id: string;
    reference: string;
    kind: string;
    subject: string;
    status: string;
    created_at: string;
  }[];
}

export interface DeviceHealth {
  device_id: string;
  serial_number: string;
  model: string;
  nickname: string | null;
  status: string;
  owner_email: string | null;
  firmware: string | null;
  registry_firmware: string;
  via: "cellular" | "wifi" | "phone" | null;
  last_seen_at: string | null;
  battery_pct: number | null;
  charging: boolean | null;
  calibrated_at: string | null;
  last_impact_at: string | null;
  theft_mode: boolean;
  journey_active: boolean;
}

/** `GET admin/fleet/health`. */
export interface FleetHealth {
  counts: {
    total: number;
    reporting: number;
    stale: number;
    low_battery: number;
    uncalibrated: number;
    theft_mode: number;
    on_journey: number;
  };
  devices: DeviceHealth[];
}

/** `GET admin/fleet/firmware`. */
export interface FirmwareVersion {
  firmware: string;
  devices: number;
  reporting: number;
  last_seen_at: string | null;
}

/** `GET/PATCH admin/devices/{id}/config`. */
export interface DeviceConfig {
  impact_light_g: number;
  impact_moderate_g: number;
  impact_severe_g: number;
  report_interval_s: number;
  separation_delay_s: number;
  low_battery_pct: number;
  /** Knocks closer together than this are one impact. */
  impact_merge_ms: number;
  /** A pulse longer than this is handling or vibration, not an impact. */
  impact_max_duration_ms: number;
  /** Consecutive trace samples over the light threshold an impact needs. */
  impact_min_samples: number;
  updated_at: string | null;
}

export type ImpactOutcome =
  "recorded" | "merged" | "below_threshold" | "filtered_glitch" | "filtered_sustained";

/** `GET admin/devices/{id}/impact-readings`: impacts as the bag reported them. */
export interface ImpactReading {
  id: number;
  event_id: string;
  activity_id: number | null;
  occurred_at: string;
  peak_g: number;
  duration_ms: number | null;
  orientation: string | null;
  trace: { sample_rate_hz: number; x_g: number[]; y_g: number[]; z_g: number[] } | null;
  outcome: ImpactOutcome;
  severity: Severity | null;
  firmware: string | null;
}

export type ReleaseStatus = "draft" | "active" | "paused" | "retired";

/** `GET admin/firmware/releases`. */
export interface FirmwareRelease {
  id: string;
  version: string;
  size_bytes: number;
  sha256: string;
  signature: string;
  notes: string | null;
  status: ReleaseStatus;
  rollout_percent: number;
  rollout_devices: string[];
  created_at: string;
  updated_at: string;
  offered: number;
  downloading: number;
  installed: number;
  failed: number;
  /** The rollout pauses itself once `min_failures` installs fail and failures reach this share. */
  max_failure_percent: number;
  min_failures: number;
  /** When it paused itself, and why. */
  auto_paused_at: string | null;
  pause_reason: string | null;
  /** Where bags running it go back to while it's paused. */
  rollback_release_id: string | null;
  rollback_version: string | null;
}

export interface FirmwareInstall {
  device_id: string;
  serial_number: string;
  model: string;
  status: "offered" | "downloading" | "installed" | "failed";
  detail: string | null;
  updated_at: string;
}

/** `GET admin/firmware/releases/{id}`. */
export interface FirmwareReleaseDetail {
  release: FirmwareRelease;
  installs: FirmwareInstall[];
}

/** `GET admin/firmware/signing-key`. */
export interface SigningKey {
  configured: boolean;
  public_key: string | null;
}

export interface DeviceState {
  last_seen_at: string | null;
  via: "cellular" | "wifi" | "phone" | null;
  firmware: string | null;
  battery_pct: number | null;
  charging: boolean | null;
  weight_g: number | null;
  weight_stable: boolean | null;
  weight_at: string | null;
  weight_error?: "unsettled" | "too_short" | "out_of_range" | null;
  weight_error_at?: string | null;
  locked: boolean | null;
  owner_nearby: boolean | null;
  moving: boolean | null;
  outside_geofence: boolean;
  last_impact_at: string | null;
  last_tamper_at: string | null;
  calibrated_at: string | null;
}

/** `GET devices/{id}/status`. */
export interface BagStatus {
  device_id: string;
  state: DeviceState | null;
  settings: {
    weight_unit: "kg" | "lb";
    weight_limit_g: number | null;
    impact_alerts: string;
    theft_mode: boolean;
    geofence: {
      latitude: number;
      longitude: number;
      radius_m: number;
      label: string | null;
    } | null;
    calibration_requested_at: string | null;
  };
  journey: { id: string; name: string | null; started_at: string } | null;
  ready: boolean;
  checks: { key: string; ok: boolean; label: string }[];
}

/** `GET admin/leads`: landing-page sign-ups and enquiries. */
export interface Lead {
  id: string;
  kind: "founding_traveller" | "investor" | "partner";
  name: string;
  email: string;
  company: string | null;
  country: string | null;
  product: "essential" | "flagship" | "pro" | "executive" | null;
  message: string | null;
  created_at: string;
}

// ---- Support and warranty ----

export type TicketKind =
  "question" | "damage" | "lost" | "tracker" | "order" | "warranty" | "other";
export type TicketStatus = "open" | "waiting" | "resolved" | "closed";
export type TicketPriority = "low" | "normal" | "high" | "urgent";
export type ClaimStatus =
  "submitted" | "approved" | "rejected" | "in_progress" | "completed";

export interface StaffTicket {
  id: string;
  reference: string;
  kind: TicketKind;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  owner_id: string;
  owner_email: string;
  owner_name: string | null;
  assignee_id: string | null;
  assignee_email: string | null;
  device_id: string | null;
  device_serial: string | null;
  device_name: string | null;
  activity_id: number | null;
  created_at: string;
  updated_at: string;
  last_message_at: string;
  preview: string | null;
  unread: boolean;
  claim_status: ClaimStatus | null;
}

export interface SupportAttachment {
  id: string;
  filename: string;
  content_type: string;
  size_bytes: number;
}

export interface SupportMessage {
  id: string;
  from_staff: boolean;
  internal: boolean;
  body: string;
  author: string | null;
  created_at: string;
  attachments: SupportAttachment[];
}

export interface WarrantyClaim {
  id: string;
  part: "tracker" | "shell" | "wheels" | "handle" | "zip" | "other";
  status: ClaimStatus;
  resolution: "repair" | "replace" | null;
  decision_note: string | null;
  decided_at: string | null;
  replacement_serial: string | null;
  created_at: string;
  updated_at: string;
}

export interface StaffTicketDetail {
  ticket: StaffTicket;
  messages: SupportMessage[];
  claim: WarrantyClaim | null;
}

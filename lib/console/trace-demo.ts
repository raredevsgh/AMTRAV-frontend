// Sample TRACE data for the signed-out console preview (/preview/admin/...).
import type {
  AlertRecord,
  DeviceHealth,
  FirmwareVersion,
  FleetHealth,
  ImpactReview,
  Lead,
} from "./types";

const hoursAgo = (hours: number) =>
  new Date(Date.parse("2026-10-20T12:00:00Z") - hours * 3_600_000).toISOString();

const devices: DeviceHealth[] = [
  {
    device_id: "11111111-1111-4111-8111-111111111111",
    serial_number: "AMT-CO55-0142",
    model: "Carry-On 55",
    nickname: "Tahoe",
    status: "claimed",
    owner_email: "ama@example.com",
    firmware: "1.4.2",
    registry_firmware: "1.4.0",
    via: "cellular",
    last_seen_at: hoursAgo(0.2),
    battery_pct: 82,
    charging: false,
    calibrated_at: hoursAgo(240),
    last_impact_at: hoursAgo(5),
    theft_mode: false,
    journey_active: true,
  },
  {
    device_id: "22222222-2222-4222-8222-222222222222",
    serial_number: "AMT-CI70-0031",
    model: "Check-In 70",
    nickname: "Blue check-in",
    status: "claimed",
    owner_email: "kofi@example.com",
    firmware: "1.4.2",
    registry_firmware: "1.4.2",
    via: "phone",
    last_seen_at: hoursAgo(30),
    battery_pct: 14,
    charging: false,
    calibrated_at: null,
    last_impact_at: null,
    theft_mode: true,
    journey_active: false,
  },
];

export const previewFleetHealth: FleetHealth = {
  counts: {
    total: 2,
    reporting: 1,
    stale: 1,
    low_battery: 1,
    uncalibrated: 1,
    theft_mode: 1,
    on_journey: 1,
  },
  devices,
};

export const previewFirmware: FirmwareVersion[] = [
  { firmware: "1.4.2", devices: 2, reporting: 1, last_seen_at: hoursAgo(0.2) },
];

export const previewImpacts: ImpactReview[] = [
  {
    id: 3,
    device_id: devices[0].device_id,
    serial_number: devices[0].serial_number,
    model: devices[0].model,
    nickname: devices[0].nickname,
    owner_email: devices[0].owner_email,
    occurred_at: hoursAgo(5),
    impact_g: 11.8,
    severity: "severe",
    orientation: "on_side",
    latitude: 5.6043,
    longitude: -0.169,
    journey_id: "33333333-3333-4333-8333-333333333333",
  },
  {
    id: 2,
    device_id: devices[0].device_id,
    serial_number: devices[0].serial_number,
    model: devices[0].model,
    nickname: devices[0].nickname,
    owner_email: devices[0].owner_email,
    occurred_at: hoursAgo(9),
    impact_g: 6.9,
    severity: "moderate",
    orientation: null,
    latitude: 51.4723,
    longitude: -0.4877,
    journey_id: "33333333-3333-4333-8333-333333333333",
  },
];

export const previewAlerts: AlertRecord[] = [
  {
    id: 7,
    created_at: hoursAgo(5),
    read_at: null,
    category: "impact",
    title: "Tahoe took a hard hit",
    body: "A severe impact of 11.8 g. It ended up on its side. Check the bag and what’s inside when you collect it.",
    device_id: devices[0].device_id,
    serial_number: devices[0].serial_number,
    user_id: "44444444-4444-4444-8444-444444444444",
    owner_email: "ama@example.com",
  },
  {
    id: 6,
    created_at: hoursAgo(30),
    read_at: hoursAgo(29),
    category: "battery",
    title: "Blue check-in’s battery is at 14%",
    body: "Charge it before your next trip so it keeps reporting where it is.",
    device_id: devices[1].device_id,
    serial_number: devices[1].serial_number,
    user_id: "55555555-5555-4555-8555-555555555555",
    owner_email: "kofi@example.com",
  },
];

export const previewLeads: Lead[] = [
  {
    id: "66666666-6666-4666-8666-666666666666",
    kind: "founding_traveller",
    name: "Efua Owusu",
    email: "efua@example.com",
    company: null,
    country: "Ghana",
    product: "flagship",
    message: null,
    created_at: hoursAgo(2),
  },
  {
    id: "77777777-7777-4777-8777-777777777777",
    kind: "partner",
    name: "Daniel Reyes",
    email: "daniel@example.com",
    company: "Northwind Luggage",
    country: "Portugal",
    product: null,
    message: "We’d like to fit the Smart Core to our 2027 range.",
    created_at: hoursAgo(26),
  },
];

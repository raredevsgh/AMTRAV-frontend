import {customerPresentation} from "./customer-design-fixtures";
import {alertPresentation} from "./alert-design-fixtures";
/**
 * Fictional presentation fixtures transcribed from the current Admin Console PNG
 * exports (section 2488:128, 2 Nov 2026). These are never live telemetry or auth.
 * Required transport fields absent from the design remain empty; the ISO times
 * for date-only pairing records are explicitly synthetic fixture values.
 */
import type { AlertRecord, CustomerDetail, Device, DeviceAudit, DeviceTelemetry, JourneyDetail } from "./api/types";
import { consoleUsers } from "./console-fixtures";

export const ADMIN_PREVIEW_TIME = "2026-11-01T11:48:00Z";
export type DesignConnectivity = "online" | "stale" | "offline" | "unknown";
export type DesignAttention = "none" | "theft_mode" | "tamper" | "severe_impact" | "separated" | "battery" | "calibration";
export type DesignPriority = "Critical" | "Warning" | "Attention";
export type DesignSource = "simulated" | "verified_example";
export type DesignDeviceProfile = {
  deviceId: string;
  serial: string;
  connectivity: DesignConnectivity;
  lastContactAt: string | null;
  attention: DesignAttention;
  priority: DesignPriority | null;
  battery: number | null;
  firmware: string;
  source: DesignSource;
  customerId: string | null;
};
export const designAttentionLabels: Record<DesignAttention, string> = {
  none: "None", theft_mode: "Theft Mode active", tamper: "Tamper event",
  severe_impact: "Severe impact", separated: "Separated", battery: "Low battery", calibration: "Calibration due",
};
const deviceId = (index: number) => `10000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`;
const customerId = (index: number) => `40000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`;

type DeviceSeed = readonly [serial: string, connectivity: DesignConnectivity, lastContactAt: string | null, attention: DesignAttention, priority: DesignPriority | null, battery: number | null, firmware: string, source: DesignSource];
const deviceSeeds: readonly DeviceSeed[] = [
  ["AMT-EX76-1A77C2", "online", "2026-11-01T11:47:00Z", "theft_mode", "Critical", 64, "1.4.2", "simulated"],
  ["AMT-FL68-0C19D4", "online", "2026-11-01T11:42:00Z", "tamper", "Critical", 71, "1.4.2", "simulated"],
  ["AMT-ES55-5A06B3", "offline", "2026-10-29T11:18:00Z", "tamper", "Critical", 41, "1.3.9", "simulated"],
  ["AMT-PR76-2B40E1", "online", "2026-11-01T11:36:00Z", "severe_impact", "Warning", 58, "1.4.2", "verified_example"],
  ["AMT-FL68-3D82A6", "stale", "2026-11-01T11:24:00Z", "separated", "Warning", 47, "1.4.2", "simulated"],
  ["AMT-ES55-00F3B4", "online", "2026-11-01T11:45:00Z", "battery", "Attention", 14, "1.4.1", "simulated"],
  ["AMT-PR68-4E11F9", "stale", "2026-11-01T11:10:00Z", "calibration", "Attention", 83, "1.4.2", "verified_example"],
  ["AMT-FL76-7F28C5", "online", "2026-11-01T11:48:00Z", "none", null, 92, "1.4.2", "simulated"],
  ["AMT-PR55-8B74E2", "online", "2026-11-01T11:46:00Z", "none", null, 76, "1.4.2", "simulated"],
  ["AMT-ES68-9D15A7", "online", "2026-11-01T11:39:00Z", "none", null, 88, "1.4.1", "simulated"],
  ["AMT-EX55-A042F8", "stale", "2026-11-01T10:48:00Z", "none", null, 69, "1.4.2", "verified_example"],
  ["AMT-EX68-6C93D0", "offline", "2026-10-23T08:30:00Z", "none", null, 22, "1.3.9", "simulated"],
  ["AMT-FL55-B3E6C1", "unknown", null, "none", null, null, "1.4.2", "simulated"],
];
export const designDeviceProfiles: readonly DesignDeviceProfile[] = deviceSeeds.map((seed, index) => ({
  deviceId: deviceId(index), serial: seed[0], connectivity: seed[1], lastContactAt: seed[2],
  attention: seed[3], priority: seed[4], battery: seed[5], firmware: seed[6], source: seed[7],
  customerId: index < 12 ? customerId(index) : null,
}));
const customerSeeds = [
  ["Tobi Okafor", "t.okafor@example.com", "2026-04-01"],
  ["Maria Reyes", "m.reyes@example.com", "2026-05-14"],
  ["Comfort Mensah", "c.mensah@example.com", "2026-03-03"],
  ["Joy Adeyemi", "j.adeyemi@example.com", "2026-06-22"],
  ["Layla Ibrahim", "l.ibrahim@example.com", "2026-07-30"],
  ["Sam Boateng", "s.boateng@example.com", "2026-08-16"],
  ["Nadia Haddad", "n.haddad@example.com", "2026-06-02"],
  ["Ana Silva", "a.silva@example.com", "2026-09-04"],
  ["Daniel Owusu", "d.owusu@example.com", "2026-08-19"],
  ["Rachel Kaplan", "r.kaplan@example.com", "2026-07-08"],
  ["Emmanuel Diallo", "e.diallo@example.com", "2026-07-07"],
  ["Phuong Nguyen", "p.nguyen@example.com", "2026-02-11"],
] as const;
// Pairing dates are from actual Figma account records. Except Comfort's exported
// 14:06 time, the required ISO time is a synthetic fixture value, not observed telemetry.
const claimDates = designDeviceProfiles.map((profile) => customerPresentation[profile.serial]?.pairings.find((record) => record.serial === profile.serial && record.event === "Paired"));
const models: Record<string, string> = { EX: "Executive", ES: "Essential", PR: "Pro", FL: "Flagship" };
export const designDevices: Device[] = designDeviceProfiles.map((profile, index) => ({
  id: profile.deviceId, serial_number: profile.serial, model: models[profile.serial.slice(4, 6)],
  firmware_version: profile.firmware, manufacturer_id: [3, 6, 8, 11].includes(index) ? consoleUsers[2].id : consoleUsers[1].id,
  owner_id: profile.customerId, nickname: null, status: index === 11 ? "revoked" : index === 12 ? "registered" : "claimed",
  claimed_at: claimDates[index] ? claimDates[index].pairedAt ?? `${claimDates[index].date}T09:00:00Z` : null,
  created_at: `${customerSeeds[index]?.[2] ?? "2026-11-01"}T08:00:00Z`, updated_at: ADMIN_PREVIEW_TIME,
}));
export const designTelemetry: DeviceTelemetry[] = designDeviceProfiles.flatMap((profile) => profile.battery === null || profile.lastContactAt === null ? [] : [{
  deviceId: profile.deviceId, serialNumber: profile.serial, batteryLevel: profile.battery,
  batteryState: profile.battery < 20 ? "critical" : "discharging", signalRssi: -72,
  signalQuality: profile.connectivity === "online" ? "good" : "poor", lockState: profile.attention === "tamper" ? "unlocked" : "locked",
  lastPing: profile.lastContactAt, firmwareVersion: profile.firmware,
  connectionType: profile.connectivity === "offline" ? "offline" : "cellular", tamperStatus: profile.attention === "tamper" ? "breached" : "secure",
}]);
export const designAudits: DeviceAudit[] = designDevices.map((device, index) => ({
  id: `20000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`, device_id: device.id,
  actor_id: consoleUsers[0].id, action: "registered", created_at: device.created_at,
}));

type JourneySeed = readonly [id: string, origin: string, destination: string, status: JourneyDetail["status"], deviceIndex: number, started: string, lastActivity: string];
const journeySeeds: readonly JourneySeed[] = [
  ["JRN-2318", "Accra", "Dubai", "in_transit", 0, "2026-11-01T11:05:00Z", "2026-11-01T11:47:00Z"],
  ["JRN-2315", "Madrid", "Bogotá", "in_transit", 1, "2026-11-01T07:30:00Z", "2026-11-01T11:42:00Z"],
  ["JRN-2312", "Lagos", "Abuja", "in_transit", 3, "2026-11-01T09:40:00Z", "2026-11-01T11:36:00Z"],
  ["JRN-2309", "Rome", "Cairo", "in_transit", 4, "2026-11-01T06:15:00Z", "2026-11-01T11:24:00Z"],
  ["JRN-2296", "Paris", "Nairobi", "scheduled", 6, "2026-10-30T18:20:00Z", "2026-10-31T06:10:00Z"],
  ["JRN-2301", "Berlin", "Rome", "arrived", 9, "2026-10-31T08:00:00Z", "2026-10-31T10:25:00Z"],
  ["JRN-2291", "London", "Lagos", "exception", 2, "2026-10-29T06:40:00Z", "2026-10-29T11:18:00Z"],
  ["JRN-2289", "Accra", "Doha", "arrived", 10, "2026-10-27T21:10:00Z", "2026-10-28T06:05:00Z"],
  ["JRN-2280", "Oslo", "Lisbon", "arrived", 7, "2026-10-24T07:15:00Z", "2026-10-24T12:05:00Z"],
  ["JRN-2204", "Lagos", "London", "arrived", 2, "2026-10-18T08:10:00Z", "2026-10-18T19:40:00Z"],
];
export const designJourneys: JourneyDetail[] = journeySeeds.map(([id, origin, destination, status, index, started, lastActivity]) => {
  const device = designDevices[index], customer = customerSeeds[index], telemetry = designTelemetry.find((item) => item.deviceId === device.id);
  return {
    id, trackingNumber: id, travelerId: customerId(index), travelerName: customer[0], travelerEmail: customer[1],
    deviceId: device.id, deviceSerial: device.serial_number, deviceModel: device.model, manufacturerId: device.manufacturer_id,
    status, origin, destination, originCode: "", destinationCode: "", departureDate: started, estimatedArrival: "",
    ...(status === "arrived" ? {actualArrival:lastActivity} : {}),
    flightNumber: id === "JRN-2291" ? "BA 75" : "", carrier: id === "JRN-2291" ? "BA" : "", lastScanTime: lastActivity, checkpointsCount: 0, flaggedIncidentsCount: 0,
    flightLegs: [], checkpoints: [],
    assignedDevice: { id: device.id, serial_number: device.serial_number, model: device.model, lockState: telemetry?.lockState ?? "locked", batteryPct: telemetry?.batteryLevel ?? 0, signalRssi: telemetry?.signalRssi ?? 0 },
    traveler: { id: customerId(index), name: customer[0], email: customer[1] },
  };
});
export const designCustomers: CustomerDetail[] = customerSeeds.map(([name, email, joined], index) => ({
  id: customerId(index), name, email, membershipTier: "standard", totalTrips: designJourneys.filter((journey) => journey.travelerId === customerId(index)).length,
  activeLuggageCount: index === 11 ? 0 : 1, joinedDate: `${joined}T08:00:00Z`,
  lastActiveDate: designDeviceProfiles[index].lastContactAt ?? ADMIN_PREVIEW_TIME, status: "active",
  devices: [designDevices[index]], recentJourneys: designJourneys.filter((journey) => journey.travelerId === customerId(index)), supportNotes: [],
}));

type AlertSeed = readonly [id: string, title: string, category: AlertRecord["category"], severity: AlertRecord["severity"], status: AlertRecord["status"], index: number, timestamp: string, journeyId?: string];
const alertSeeds: readonly AlertSeed[] = [
  ["ALT-5127", "Unexpected movement", "unauthorized_movement", "critical", "active", 0, "2026-11-01T11:47:00Z", "JRN-2318"],
  ["ALT-5126", "Tamper event", "tamper", "critical", "acknowledged", 1, "2026-11-01T11:42:00Z", "JRN-2315"],
  ["ALT-5124", "Severe impact", "impact", "high", "active", 3, "2026-11-01T11:36:00Z", "JRN-2312"],
  ["ALT-5122", "Separated from owner", "geofence", "high", "active", 4, "2026-11-01T11:24:00Z", "JRN-2309"],
  ["ALT-5119", "Low battery", "battery", "medium", "active", 5, "2026-11-01T10:05:00Z"],
  ["ALT-5106", "Calibration due", "calibration", "medium", "active", 6, "2026-10-31T18:00:00Z"],
  ["ALT-5098", "Tamper event", "tamper", "critical", "acknowledged", 2, "2026-10-29T11:02:00Z", "JRN-2291"],
  ["ALT-5097", "Severe impact", "impact", "critical", "acknowledged", 2, "2026-10-29T10:26:00Z", "JRN-2291"],
  ["ALT-5096", "Separated from owner", "geofence", "high", "acknowledged", 2, "2026-10-29T09:47:00Z", "JRN-2291"],
  ["ALT-4902", "Low battery", "battery", "medium", "resolved", 2, "2026-10-21T18:30:00Z"],
  ["ALT-4871", "Calibration due", "calibration", "medium", "resolved", 8, "2026-10-14T09:00:00Z"],
];
export const designAlerts: AlertRecord[] = alertSeeds.map(([id, title, category, severity, status, index, timestamp, journeyId]) => ({
  id, title, category, severity, status, timestamp, journeyId,
  deviceId: deviceId(index), deviceSerial: designDevices[index].serial_number, deviceModel: designDevices[index].model,
  manufacturerId: designDevices[index].manufacturer_id, message: title,
  location:alertPresentation[id]?.location, assignedTo:alertPresentation[id]?.assignedTo, outcome:alertPresentation[id]?.outcome, notes:alertPresentation[id]?.notes ?? [], activity:[],
}));

// Local console demo model. No production alert transport is connected.
export type AlertSeverity = "critical" | "high" | "medium" | "low";
export type AlertStatus = "active" | "acknowledged" | "resolved";
export type AlertCategory =
  | "tamper"
  | "geofence"
  | "battery"
  | "connectivity"
  | "impact"
  | "calibration"
  | "unauthorized_movement";

export interface AlertRecord {
  id: string;
  deviceId: string;
  deviceSerial: string;
  deviceModel: string;
  manufacturerId: string;
  severity: AlertSeverity;
  status: AlertStatus;
  category: AlertCategory;
  title: string;
  message: string;
  location?: string;
  airportCode?: string;
  timestamp: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolutionNotes?: string;
  journeyId?: string;
  notes?: AlertNote[];
  assignedTo?: string;
  outcome?: AlertOutcome;
  activity?: {timestamp:string;author:string;status:AlertStatus;outcome?:AlertOutcome}[];
}

export type AlertNote = {id:string;author:string;timestamp:string;text:string};
export type AlertOutcome = "no_tampering_found" | "charged" | "recalibrated" | "owner_reunited" | "reviewed";
export type AlertStatusChange = {status:AlertStatus;outcome?:AlertOutcome;note?:string};

export interface AlertFilterParams {
  severity?: AlertSeverity | "all";
  status?: AlertStatus | "all";
  category?: AlertCategory | "all";
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface AlertResolutionPayload {
  notes: string;
  resolutionAction:
    | "dismissed"
    | "inspected_safe"
    | "quarantined"
    | "escalated_to_security";
}

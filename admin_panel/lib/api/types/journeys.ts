export type JourneyStatus =
  | "scheduled"
  | "in_transit"
  | "delayed"
  | "arrived"
  | "exception";

export type CheckpointType =
  | "booking"
  | "check_in"
  | "security_cleared"
  | "baggage_induction"
  | "sorting_facility"
  | "aircraft_loaded"
  | "ramp_transfer"
  | "aircraft_unloaded"
  | "baggage_carousel"
  | "passenger_collected"
  | "tamper_incident";

export type CheckpointStatus =
  | "completed"
  | "in_progress"
  | "pending"
  | "flagged";

export interface JourneyCheckpoint {
  id: string;
  journeyId: string;
  type: CheckpointType;
  title: string;
  description: string;
  location: string;
  airportCode: string;
  timestamp: string;
  status: CheckpointStatus;
  scannerId?: string;
  telemetrySnapshot?: {
    batteryPct: number;
    signalRssi: number;
    lockState: "locked" | "unlocked";
    tamperDetected: boolean;
  };
}

export interface FlightLeg {
  carrier: string;
  flightNumber: string;
  originAirport: string;
  destinationAirport: string;
  departureTime: string;
  arrivalTime: string;
  gate?: string;
  carousel?: string;
}

export interface JourneyRecord {
  id: string;
  trackingNumber: string;
  travelerId: string;
  travelerName: string;
  travelerEmail: string;
  travelerPhone?: string;
  deviceId: string;
  deviceSerial: string;
  deviceModel: string;
  manufacturerId: string;
  status: JourneyStatus;
  origin: string;
  destination: string;
  originCode: string;
  destinationCode: string;
  departureDate: string;
  estimatedArrival: string;
  actualArrival?: string;
  flightNumber: string;
  carrier: string;
  currentLocation?: string;
  lastScanTime: string;
  checkpointsCount: number;
  flaggedIncidentsCount: number;
}

export interface JourneyDetail extends JourneyRecord {
  flightLegs: FlightLeg[];
  checkpoints: JourneyCheckpoint[];
  assignedDevice: {
    id: string;
    serial_number: string;
    model: string;
    lockState: "locked" | "unlocked";
    batteryPct: number;
    signalRssi: number;
  };
  traveler: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    frequentFlyerNumber?: string;
  };
}

export interface JourneyFilterParams {
  status?: JourneyStatus | "all";
  search?: string;
  origin?: string;
  destination?: string;
  manufacturerId?: string;
  page?: number;
  pageSize?: number;
}

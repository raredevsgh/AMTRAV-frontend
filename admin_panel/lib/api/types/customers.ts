import type { Device } from "./devices";
import type { JourneyRecord } from "./journeys";

export type MembershipTier = "standard" | "silver" | "gold" | "platinum";
export type CustomerStatus = "active" | "suspended";

export interface CustomerRecord {
  id: string;
  name: string;
  email: string;
  phone?: string;
  membershipTier: MembershipTier;
  totalTrips: number;
  activeLuggageCount: number;
  joinedDate: string;
  lastActiveDate: string;
  status: CustomerStatus;
  frequentFlyerNumber?: string;
}

export interface CustomerDetail extends CustomerRecord {
  devices: Device[];
  recentJourneys: JourneyRecord[];
  supportNotes: string[];
}

export interface CustomerFilterParams {
  search?: string;
  membershipTier?: MembershipTier | "all";
  status?: CustomerStatus | "all";
  page?: number;
  pageSize?: number;
}

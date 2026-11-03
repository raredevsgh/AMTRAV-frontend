export interface ManufacturerPartner {
  id: string;
  name: string;
  code: string;
  contactEmail: string;
  contactPhone: string;
  contractStatus: "active" | "pending" | "expired";
  totalAllocatedDevices: number;
  activeUnits: number;
  claimedRatePct: number;
  allowedChannels: string[];
  joinedDate: string;
  quotaPerQuarter: number;
}

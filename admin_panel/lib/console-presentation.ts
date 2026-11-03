import type { AlertRecord, JourneyStatus } from "./api/types";
import { ADMIN_PREVIEW_TIME, type DesignPriority } from "./admin-design-fixtures";

export const alertStatusLabels = { active: "New", acknowledged: "Investigating", resolved: "Closed" } as const;
export const journeyStatusLabels: Record<JourneyStatus, string> = {
  in_transit: "Active", arrived: "Completed", exception: "Interrupted", scheduled: "Incomplete", delayed: "Delayed",
};
export function alertPriority(alert: AlertRecord): DesignPriority {
  return alert.severity === "critical" ? "Critical" : alert.severity === "high" ? "Warning" : "Attention";
}
export function consoleDate(value: string | null | undefined, time = false, year = false): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", ...(year ? {year:"numeric"} : {}), timeZone:"UTC" }).replace("Sept", "Sep")
    + (time ? `, ${date.toLocaleTimeString("en-GB", {hour:"2-digit",minute:"2-digit",timeZone:"UTC"})}` : "");
}
export function relativeContact(value: string | null | undefined): string {
  if (!value) return "Never";
  const age = Math.max(0, Math.floor((Date.parse(ADMIN_PREVIEW_TIME) - Date.parse(value)) / 60_000));
  if (!Number.isFinite(age)) return "Unknown";
  return age === 0 ? "Just now" : age < 60 ? `${age} min ago` : age < 1440 ? `${Math.floor(age / 60)} hr ago` : `${Math.floor(age / 1440)} days ago`;
}

// The local mock lists expose page boundaries, not a server total count.
export async function loadConsolePages<T extends {id:string}>(load: (page: number, limit: number) => Promise<{items:T[];limit:number}>): Promise<T[]> {
  const records: T[] = [];
  const seen = new Set<string>();
  for (let page = 1; ; page++) {
    const result = await load(page, 100);
    if (!Number.isInteger(result.limit) || result.limit < 1 || result.items.some((item) => seen.has(item.id))) {
      throw new Error("Invalid or repeated console page");
    }
    result.items.forEach((item) => seen.add(item.id));
    records.push(...result.items);
    if (result.items.length < result.limit) return records;
  }
}

export function maskedName(value:string):string { return value.split(" ").map((part) => part ? `${part[0]}•••••` : "").join(" "); }
export function maskedEmail(value:string):string { const [local,domain] = value.split("@"); return `${local?.[0] ?? ""}•••••@•••••.${domain?.split(".").at(-1) ?? "com"}`; }

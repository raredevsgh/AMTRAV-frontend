import type { ReactNode } from "react";
import type { DesignConnectivity, DesignPriority, DesignSource } from "@/lib/admin-design-fixtures";

export function PriorityLabel({ priority, children }: { priority: DesignPriority; children: ReactNode }) {
  return <span className={`priority-label priority-${priority.toLowerCase()}`}><i aria-hidden="true" />{children}</span>;
}
export function ConnectivityLabel({ value }: { value: DesignConnectivity }) {
  return <span className={`connectivity connectivity-${value}`}><i aria-hidden="true" />{value[0].toUpperCase() + value.slice(1)}</span>;
}
export function SourceLabel({ source }: { source: DesignSource }) {
  return <span className="muted source-label" data-provenance="sample" title="Sample record; backend integration pending">{source === "verified_example" ? "Reference" : "Sample"}</span>;
}

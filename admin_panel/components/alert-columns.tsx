import Link from "next/link";
import { PriorityLabel } from "./console-data";
import type { ConsoleColumn } from "./console-table";
import type { AlertRecord } from "@/lib/api/types";
import { alertPriority, alertStatusLabels, consoleDate } from "@/lib/console-presentation";

export function alertColumns({ascending = false, onSort}: {ascending?:boolean;onSort?:()=>void} = {}): ConsoleColumn<AlertRecord>[] {
  return [
    {key:"alert",label:"Alert",width:280,render:(alert) => <Link href={`/alerts/${alert.id}`}><PriorityLabel priority={alertPriority(alert)}>{alert.title}</PriorityLabel></Link>},
    {key:"priority",label:"Priority",width:120,render:(alert) => alertPriority(alert)},
    {key:"sensor",label:"Sensor severity",width:136,render:(alert) => alert.category === "impact" ? "Severe" : "—"},
    {key:"time",label:"Time (UTC)",width:156,sort:ascending ? "ascending" : "descending",onSort,render:(alert) => consoleDate(alert.timestamp,true)},
    {key:"device",label:"Device",width:188,render:(alert) => <Link className="mono muted" href={`/devices/${alert.deviceId}`}>{alert.deviceSerial}</Link>},
    {key:"journey",label:"Journey",width:148,render:(alert) => alert.journeyId ? <Link className="mono muted" href={`/journeys/${alert.journeyId}`}>{alert.journeyId}</Link> : "—"},
    {key:"status",label:"Status",width:112,className:"cell-ink",render:(alert) => alertStatusLabels[alert.status]},
  ];
}

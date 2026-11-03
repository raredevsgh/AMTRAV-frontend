import Link from "next/link";
import type {JourneyEvent} from "@/lib/journey-design-fixtures";
import {FigmaIcon,type FigmaIconName} from "./figma-icon";
const symbols:Record<JourneyEvent["kind"],FigmaIconName>={start:"flag",weight:"weight",impact:"impact",separated:"link",tamper:"lock",contact:"clock",battery:"battery",location:"location",security:"warning"};
export function JourneyTimeline({events}:{events:readonly JourneyEvent[]}) {
  return <ol className="journey-timeline" aria-label="Event timeline">{events.map((event,index) => <li key={`${index}:${event.time}`}>
    <time className="mono">{event.time}</time><span className={`timeline-symbol ${event.priority ? `event-${event.priority.toLowerCase()}` : ""}`} aria-hidden="true"><FigmaIcon name={symbols[event.kind]} /></span>
    <details><summary><strong className={event.priority ? "event-alert-title" : ""}>{event.title}</strong><span>{event.detail}</span></summary>
      <div className="timeline-event-content"><p>{event.time} UTC{event.detail ? ` · ${event.detail}` : ""}</p>{event.alertId && <Link href={`/alerts/${event.alertId}`}>View alert {event.alertId} →</Link>}</div>
    </details>
  </li>)}</ol>;
}

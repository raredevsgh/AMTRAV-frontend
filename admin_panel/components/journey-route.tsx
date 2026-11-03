export function JourneyRoute({nodes,complete}:{nodes:readonly (readonly [string,string])[];complete:boolean}) {
  return <ol className={`journey-route ${complete ? "route-complete" : ""}`} aria-label="Route progress">{nodes.map(([place,time],index) => <li key={index}><i aria-hidden="true" /><strong>{place}</strong><span>{time}</span></li>)}</ol>;
}

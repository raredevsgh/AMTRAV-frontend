"use client";
import Link from "next/link";
import {FigmaIcon} from "@/components/figma-icon";
import {useCallback,useState} from "react";
import {useConsole,useResource} from "./console-context";
import {JourneyRoute} from "@/components/journey-route";
import {JourneyTimeline} from "@/components/journey-timeline";
import {LoadingState,ErrorState,EmptyState} from "@/components/console-ui";
import {journeyPresentation,type JourneyEvent} from "@/lib/journey-design-fixtures";
import {historicalJourneyReference} from "@/lib/device-design-fixtures";
import {journeyStatusLabels,consoleDate} from "@/lib/console-presentation";
import type {DeviceDetailView} from "./device-detail-model";

export function DeviceJourneys({view}:{view:DeviceDetailView}) {
  const api=useConsole();
  const journeys=[...view.journeys].sort((a,b) => Date.parse(b.departureDate)-Date.parse(a.departureDate));
  const [selected,setSelected]=useState(journeys[0]?.id ?? "");
  const historical=view.device.serial_number === "AMT-ES55-5A06B3" && selected === historicalJourneyReference.id;
  const load=useCallback(() => selected && selected !== historicalJourneyReference.id ? api.getJourneyById(selected) : Promise.resolve(null),[api,selected]);
  const {data,loading,error,retry}=useResource(load);
  const reference=data && journeyPresentation[data.id]?.serial === data.deviceSerial ? journeyPresentation[data.id] : null;
  const events:JourneyEvent[]=[...(reference?.events ?? []),...(data?.checkpoints ?? []).map((checkpoint) => ({time:new Date(checkpoint.timestamp).toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit",timeZone:"UTC"}),title:checkpoint.title,detail:checkpoint.location,kind:"location" as const}))];
  if(!journeys.length)return <EmptyState title="No journeys yet" />;
  return <div className="device-journeys"><nav aria-label="Device journeys"><h3>Journeys</h3>{journeys.map((journey) => <button key={journey.id} aria-current={selected === journey.id ? "true" : undefined} onClick={() => setSelected(journey.id)}><span>{journey.id}</span><span>{journey.status === "exception" ? journeyStatusLabels[journey.status] : consoleDate(journey.actualArrival ?? journey.lastScanTime)}{selected === journey.id && <i aria-hidden="true">›</i>}</span></button>)}{view.device.serial_number === "AMT-ES55-5A06B3" && <button aria-current={historical ? "true" : undefined} onClick={() => setSelected(historicalJourneyReference.id)}><span>{historicalJourneyReference.id}</span><span>{consoleDate(historicalJourneyReference.date)}</span></button>}</nav>
    <section aria-label="Selected journey">{loading ? <LoadingState label="Loading journey" /> : error ? <ErrorState error={error} retry={retry} /> : historical ? <><h2>{historicalJourneyReference.id}</h2><p className="muted">{historicalJourneyReference.note}</p><EmptyState title="No recorded timeline for this reference" /></> : data ? <>
      <div className="selected-journey-heading"><div><h2>{data.origin} to {data.destination}</h2><p>{data.id}{data.flightNumber ? `, ${data.flightNumber}` : ""}. {journeyStatusLabels[data.status]}</p></div><Link href={`/journeys/${data.id}`}>Open journey <FigmaIcon name="chevronRight" /></Link></div>
      {reference && <JourneyRoute nodes={reference.nodes} complete={data.status === "arrived"} />}<JourneyTimeline events={events} />
    </> : <EmptyState title="Select a journey" />}</section>
  </div>;
}

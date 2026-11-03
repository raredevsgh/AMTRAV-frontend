"use client";

import Link from "next/link";
import {FigmaIcon} from "@/components/figma-icon";
import {useCallback} from "react";
import {useConsole,useResource,useConsoleState} from "./console-context";
import {SectionPage,LoadingState,ErrorState,EmptyState} from "@/components/console-ui";
import {RecordHeader,DetailRows} from "@/components/record-detail";
import {PriorityLabel,SourceLabel} from "@/components/console-data";
import {journeyPresentation,type JourneyEvent} from "@/lib/journey-design-fixtures";
import {designDeviceProfiles} from "@/lib/admin-design-fixtures";
import {journeyStatusLabels,relativeContact,consoleDate,alertPriority,loadConsolePages} from "@/lib/console-presentation";
import {JourneyRoute} from "@/components/journey-route";
import {JourneyTimeline} from "@/components/journey-timeline";

export function JourneyDetailFeature({id}:{id:string}) {
  const api=useConsole();
  const {presentation}=useConsoleState();
  const load=useCallback(async () => {
    const journey=await api.getJourneyById(id);
    const alerts=await loadConsolePages((page,pageSize) => api.listAlerts({page,pageSize}));
    return {journey,alerts:alerts.filter((alert) => alert.journeyId === id && alert.status !== "resolved").sort((a,b) => Date.parse(b.timestamp)-Date.parse(a.timestamp))};
  },[api,id]);
  const {data,loading,error,retry}=useResource(load);
  if(loading)return <SectionPage title="Journey"><LoadingState label="Loading journey" /></SectionPage>;
  if(error)return <SectionPage title="Journey"><ErrorState error={error} retry={retry} /></SectionPage>;
  if(!data)return <SectionPage title="Journey"><EmptyState title="Journey not found" /></SectionPage>;
  const {journey,alerts}=data;
  const reference=journeyPresentation[id];
  const details=reference?.serial === journey.deviceSerial ? reference : undefined;
  const profile=designDeviceProfiles.find((profile) => profile.serial === journey.deviceSerial && profile.deviceId === journey.deviceId);
  const customerVisible=api.session.role === "admin" && presentation === "operations";
  const events:JourneyEvent[]=[...(details?.events ?? []),...journey.checkpoints.map((checkpoint) => ({time:new Date(checkpoint.timestamp).toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit",timeZone:"UTC"}),title:checkpoint.title,detail:checkpoint.location,kind:"location" as const}))];
  return <div className="record-page">
    <RecordHeader back="/journeys" backLabel="Journeys" title={`${journey.origin} to ${journey.destination}`}
      status={<><strong className={`journey-status journey-${journey.status}`}><i aria-hidden="true" />{journeyStatusLabels[journey.status]}</strong><span>{journey.status === "arrived" ? `Arrived ${consoleDate(journey.actualArrival,true)}` : `Last activity ${journey.status === "scheduled" ? consoleDate(journey.lastScanTime,true) : relativeContact(journey.lastScanTime)}`}</span></>}
      meta={<><span className="mono">{journey.id}</span><SourceLabel source={profile?.source ?? "simulated"} /><span>Times in UTC</span></>} />
    <div className="record-columns">
      <div className="record-primary">
        {details && <JourneyRoute nodes={details.nodes} complete={journey.status === "arrived"} />}
        <JourneyTimeline events={events} />
        {!events.length && <EmptyState title="No recorded journey events" />}
      </div>
      <aside className="record-secondary" aria-label="Journey context">
        <DetailRows title="Journey" rows={[
          {label:"Device",icon:<FigmaIcon name="firmware" />,value:<Link href={`/devices/${journey.deviceId}`}>{journey.deviceSerial}<span aria-hidden="true"><FigmaIcon name="chevronRight" /></span></Link>},
          {label:"Customer",icon:<FigmaIcon name="customer" />,value:customerVisible ? <Link href={`/customers/${journey.travelerId}`}>{journey.travelerEmail}<span aria-hidden="true"><FigmaIcon name="chevronRight" /></span></Link> : "Customer masked"},
          {label:"Weight",icon:<FigmaIcon name="weight" />,value:details ? `${details.weight.toFixed(1)} kg` : "Not recorded"},
          {label:"Impacts",icon:<FigmaIcon name="impact" />,value:details?.impacts ?? "Not recorded"},
          {label:"Alerts",icon:<FigmaIcon name="info" />,value:alerts.length ? `${alerts.length} open` : "None"},
        ]} />
        {alerts.length > 0 && <section className="context-alerts"><h2>{alerts.length} open {alerts.length === 1 ? "alert" : "alerts"}</h2>{alerts.map((alert) => <Link className="context-alert" key={alert.id} href={`/alerts/${alert.id}`}><div><PriorityLabel priority={alertPriority(alert)}>{alert.title}</PriorityLabel><p>{details?.events.find((event) => event.alertId === alert.id)?.detail ?? alert.location ?? "Location not recorded"}, {new Date(alert.timestamp).toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit",timeZone:"UTC"})}</p></div><span>{alertPriority(alert)}</span><span aria-hidden="true"><FigmaIcon name="chevronRight" /></span></Link>)}</section>}
      </aside>
    </div>
  </div>;
}

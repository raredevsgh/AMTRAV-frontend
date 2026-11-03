"use client";

import {useCallback,useState} from "react";
import {useConsole,useResource} from "./console-context";
import {SectionPage,LoadingState,ErrorState,EmptyState,ButtonLink} from "@/components/console-ui";
import {ConsoleTable,ConsolePagination,type ConsoleColumn} from "@/components/console-table";
import {consoleDate} from "@/lib/console-presentation";
import type {ManufacturerPartner} from "@/lib/api/types";

export function ManufacturersFeature() {
  const api=useConsole();
  const [search,setSearch]=useState(""),[page,setPage]=useState(0);
  const load=useCallback(() => api.listManufacturers(),[api]);
  const {data,loading,error,retry}=useResource(load);
  const query=search.trim().toLowerCase();
  const rows=(data ?? []).filter((partner) => `${partner.name} ${partner.code} ${partner.contactEmail}`.toLowerCase().includes(query));
  const columns:ConsoleColumn<ManufacturerPartner>[]=[
    {key:"partner",label:"Manufacturer",width:250,render:(partner) => <div className="cell-stack"><strong className="cell-ink">{partner.name}</strong><span>{partner.contactEmail}</span></div>},
    {key:"code",label:"Code",width:100,render:(partner) => <span className="mono">{partner.code}</span>},
    {key:"contract",label:"Contract",width:130,render:(partner) => partner.contractStatus[0].toUpperCase()+partner.contractStatus.slice(1)},
    {key:"quota",label:"Allocated units",width:130,render:(partner) => partner.totalAllocatedDevices.toLocaleString()},
    {key:"active",label:"Active units",width:110,render:(partner) => partner.activeUnits.toLocaleString()},
    {key:"claims",label:"Claim rate",width:100,render:(partner) => `${partner.claimedRatePct}%`},
    {key:"channels",label:"Channels",width:180,render:(partner) => partner.allowedChannels.join(", ")},
    {key:"joined",label:"Joined",width:140,render:(partner) => consoleDate(partner.joinedDate,false,true)},
  ];
  return <SectionPage title="Manufacturers" className="registry-page" actions={<><ButtonLink href="/users">Manage accounts</ButtonLink><ButtonLink href="/devices/new">Register device</ButtonLink></>}>
    <div className="registry-toolbar"><label className="registry-search"><span className="sr-only">Search manufacturers</span><input placeholder="Search manufacturers" value={search} onChange={(event) => {setSearch(event.target.value);setPage(0);}} /></label></div>
    {loading ? <LoadingState label="Loading manufacturers" /> : error ? <ErrorState error={error} retry={retry} /> : !rows.length ? <EmptyState title="No manufacturers found"><p>Try another search.</p></EmptyState> : <ConsoleTable label="Manufacturers" columns={columns} rows={rows.slice(page*50,(page+1)*50)} rowKey={(partner) => partner.id} />}
    {!loading && !error && <ConsolePagination page={page} limit={50} total={rows.length} onPage={setPage} />}
  </SectionPage>;
}

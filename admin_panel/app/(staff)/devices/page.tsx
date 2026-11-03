import { Suspense } from "react";
import { Devices } from "@/features/devices";
import { LoadingState } from "@/components/console-ui";
export const metadata = {title:"Devices"};
export default function DevicesPage(props:PageProps<"/devices">) {
  return <Suspense fallback={<LoadingState label="Loading devices" />}><FilteredDevices {...props} /></Suspense>;
}
async function FilteredDevices({searchParams}:PageProps<"/devices">) {
  const query=await searchParams;
  const connection=typeof query.connectivity === "string" && ["online","stale","offline","unknown","recent","offline_stale"].includes(query.connectivity) ? query.connectivity : "all";
  const attention=query.attention === "any" ? "any" : "all";
  return <Devices key={`${connection}:${attention}`} initialConnectivity={connection} initialAttention={attention} />;
}

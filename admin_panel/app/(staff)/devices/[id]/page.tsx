import { Suspense } from "react";
import { notFound } from "next/navigation";
import { DeviceDetail } from "@/features/device-detail";
import { sanitizeIdentifier } from "@/lib/admin-sections";
type Props = { params: Promise<{ id: string }> };
export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  return { title: `Device ${sanitizeIdentifier(id)}` };
}
async function Content({ params }: Props) {
  const { id } = await params;
  const safe = sanitizeIdentifier(id);
  if (!/^[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(safe)) notFound();
  return <DeviceDetail id={safe} />;
}
export default function DevicePage({ params }: Props) {
  return (
    <Suspense
      fallback={
        <p className="page-content" role="status">
          Loading device…
        </p>
      }
    >
      <Content params={params} />
    </Suspense>
  );
}

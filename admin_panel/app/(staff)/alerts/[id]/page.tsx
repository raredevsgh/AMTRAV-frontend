import { Suspense } from "react";
import { notFound } from "next/navigation";
import { AlertDetailFeature } from "@/features/alert-detail";
import { sanitizeIdentifier } from "@/lib/admin-sections";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  return { title: `Alert ${sanitizeIdentifier(id)}` };
}

async function Content({ params }: Props) {
  const { id } = await params;
  const safe = sanitizeIdentifier(id);
  if (!safe || safe.length > 64) notFound();
  return <AlertDetailFeature id={safe} />;
}

export default function AlertPage({ params }: Props) {
  return (
    <Suspense
      fallback={
        <p className="page-content" role="status">
          Loading incident triage file…
        </p>
      }
    >
      <Content params={params} />
    </Suspense>
  );
}

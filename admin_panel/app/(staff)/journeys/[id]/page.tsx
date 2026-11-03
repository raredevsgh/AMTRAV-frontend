import { Suspense } from "react";
import { notFound } from "next/navigation";
import { JourneyDetailFeature } from "@/features/journey-detail";
import { sanitizeIdentifier } from "@/lib/admin-sections";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  return { title: `Journey ${sanitizeIdentifier(id)}` };
}

async function Content({ params }: Props) {
  const { id } = await params;
  const safe = sanitizeIdentifier(id);
  if (!safe || safe.length > 64) notFound();
  return <JourneyDetailFeature id={safe} />;
}

export default function JourneyPage({ params }: Props) {
  return (
    <Suspense
      fallback={
        <p className="page-content" role="status">
          Loading journey details…
        </p>
      }
    >
      <Content params={params} />
    </Suspense>
  );
}

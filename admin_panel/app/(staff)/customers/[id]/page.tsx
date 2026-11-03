import { Suspense } from "react";
import { notFound } from "next/navigation";
import { CustomerDetailFeature } from "@/features/customer-detail";
import { sanitizeIdentifier } from "@/lib/admin-sections";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  return { title: `Customer ${sanitizeIdentifier(id)}` };
}

async function Content({ params }: Props) {
  const { id } = await params;
  const safe = sanitizeIdentifier(id);
  if (!safe || safe.length > 64) notFound();
  return <CustomerDetailFeature id={safe} />;
}

export default function CustomerPage({ params }: Props) {
  return (
    <Suspense
      fallback={
        <p className="page-content" role="status">
          Loading customer profile…
        </p>
      }
    >
      <Content params={params} />
    </Suspense>
  );
}

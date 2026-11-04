import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Workspace } from "@/components/console/workspace";
import { WorkspaceSkeleton } from "@/components/console/workspace-skeleton";
import { validSection } from "@/lib/console/routes";

async function Content({ params }: { params: Promise<{ section?: string[] }> }) {
  const { section = [] } = await params;
  if (!validSection(section)) notFound();
  return <Workspace section={section} />;
}

export default function Page(props: { params: Promise<{ section?: string[] }> }) {
  return (
    <Suspense fallback={<WorkspaceSkeleton />}>
      <Content {...props} />
    </Suspense>
  );
}

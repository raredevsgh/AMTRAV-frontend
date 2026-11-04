import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Workspace } from "@/components/console/workspace";
import { WorkspaceSkeleton } from "@/components/console/workspace-skeleton";
import { validSection } from "@/lib/console/routes";
import { isStaff } from "@/lib/console/policy";

async function Content({
  params,
}: {
  params: Promise<{ role: string; section?: string[] }>;
}) {
  const { role, section = [] } = await params;
  if (process.env.NODE_ENV === "production" || !isStaff(role) || !validSection(section))
    notFound();
  return <Workspace section={section} previewRole={role} />;
}

export default function Page(props: {
  params: Promise<{ role: string; section?: string[] }>;
}) {
  return (
    <Suspense fallback={<WorkspaceSkeleton label="Opening preview…" />}>
      <Content {...props} />
    </Suspense>
  );
}

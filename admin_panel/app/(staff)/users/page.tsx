import { Suspense } from "react";
import { Accounts } from "@/features/accounts";
import { requireConsoleSession } from "@/lib/console-session";
import { SectionPage, ButtonLink, Notice } from "@/components/console-ui";
export const metadata = { title: "Accounts" };
async function Content() {
  const session = await requireConsoleSession();
  if (session.role !== "admin")
    return (
      <SectionPage
        title="You don’t have access"
        description="This page is not available to your role."
      >
        <Notice title="Administrator access required" tone="warning">
          Return to Devices, or contact an administrator if your access seems
          incorrect.
        </Notice>
        <div>
          <ButtonLink href="/devices" secondary>
            Back to devices
          </ButtonLink>
        </div>
      </SectionPage>
    );
  return <Accounts />;
}
export default function UsersPage() {
  return (
    <Suspense
      fallback={
        <p className="page-content" role="status">
          Checking access…
        </p>
      }
    >
      <Content />
    </Suspense>
  );
}

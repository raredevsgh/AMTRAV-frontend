import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { sanitizeIdentifier } from "@/lib/admin-sections";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const safeId = sanitizeIdentifier(id);
  return {
    title: `Device ${safeId || "Details"}`,
    description: `AMTRAV device detail, firmware editing and audit history for ${
      safeId || "selected device"
    }.`,
  };
}

function DeviceDetailSkeleton() {
  const fallbackBreadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Devices", href: "/devices" },
    { label: "Loading..." },
  ];

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumbs items={fallbackBreadcrumbs} />
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
          Device Details
        </h1>
        <p className="max-w-2xl text-base text-zinc-600 dark:text-zinc-400">
          Loading device information...
        </p>
      </header>
      <div className="rounded-lg border border-dashed border-zinc-300 p-6 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
        Loading device details...
      </div>
    </div>
  );
}

async function DeviceDetailContent({ params }: Props) {
  const { id } = await params;
  const safeId = sanitizeIdentifier(id);

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Devices", href: "/devices" },
    { label: safeId || "Device Details" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumbs items={breadcrumbs} />

      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            Device Details
          </h1>
          <span className="rounded-md bg-zinc-100 px-2.5 py-1 font-mono text-xs font-medium text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
            {safeId || "Unknown ID"}
          </span>
        </div>
        <p className="max-w-2xl text-base text-zinc-600 dark:text-zinc-400">
          Inspection and administration view for device {safeId}.
        </p>
      </header>

      <div className="flex flex-col gap-6">
        <div className="rounded-lg border border-dashed border-zinc-300 p-6 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
          <p className="font-medium text-zinc-900 dark:text-zinc-100">
            Sprint F0 Route Skeleton: Device Detail
          </p>
          <p className="mt-1">
            Device details retrieval (GET /api/v1/devices/&#123;id&#125;),
            declared firmware editing (PATCH), claim code rotation and audit
            history (GET /api/v1/devices/&#123;id&#125;/audit) arrive in Sprint
            F3.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-zinc-200 p-5 dark:border-zinc-800">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Device Metadata (Planned F3)
            </h2>
            <dl className="mt-3 space-y-2 text-xs">
              <div>
                <dt className="text-zinc-500">Identifier:</dt>
                <dd className="font-mono text-zinc-900 dark:text-zinc-100">
                  {safeId}
                </dd>
              </div>
              <div>
                <dt className="text-zinc-500">Status:</dt>
                <dd className="text-zinc-600 dark:text-zinc-400">
                  StatusBadge (registered / claimed / revoked in F2)
                </dd>
              </div>
              <div>
                <dt className="text-zinc-500">Firmware Version:</dt>
                <dd className="text-zinc-600 dark:text-zinc-400">
                  Declared metadata (editable via PATCH in F3)
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-lg border border-zinc-200 p-5 dark:border-zinc-800">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Actions &amp; Audit (Planned F3)
            </h2>
            <ul className="mt-3 space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
              <li>• Claim code rotation (unclaimed devices only)</li>
              <li>• Revoke device registration (with confirmation)</li>
              <li>• Audit trail with limit/offset pagination</li>
            </ul>
          </div>
        </div>

        <div>
          <Link
            href="/devices"
            className="inline-flex items-center text-sm text-zinc-600 hover:text-zinc-950 hover:underline dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            ← Back to Devices
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function DeviceDetailPage({ params }: Props) {
  return (
    <main
      id="main-content"
      className="flex w-full max-w-5xl flex-col gap-6 px-6 py-8 sm:px-10"
    >
      <Suspense fallback={<DeviceDetailSkeleton />}>
        <DeviceDetailContent params={params} />
      </Suspense>
    </main>
  );
}

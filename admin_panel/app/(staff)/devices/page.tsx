import type { Metadata } from "next";
import Link from "next/link";
import { SectionPage } from "@/components/section-page";
import { adminSections } from "@/lib/admin-sections";

export const metadata: Metadata = {
  title: "Devices",
  description:
    "AMTRAV device registry, status tracking and claim code management.",
};

export default function DevicesPage() {
  const sampleDevices = [
    { id: "dev-001", model: "AMTRAV Bag Pro v1", status: "registered" },
    { id: "dev-002", model: "AMTRAV Carry-on v2", status: "claimed" },
    { id: "dev-003", model: "AMTRAV Bag Lite v1", status: "revoked" },
  ];

  return (
    <SectionPage section={adminSections.devices}>
      <div className="flex flex-col gap-6">
        <div className="rounded-lg border border-dashed border-zinc-300 p-6 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
          <p className="font-medium text-zinc-900 dark:text-zinc-100">
            Sprint F0 Route Skeleton: Devices
          </p>
          <p className="mt-1">
            Device list pagination (GET /api/v1/devices), registration, claim
            code reveal and status filtering arrive in Sprint F3.
          </p>
        </div>

        <section
          aria-labelledby="sample-devices-heading"
          className="flex flex-col gap-3"
        >
          <h2
            id="sample-devices-heading"
            className="text-sm font-semibold tracking-wide uppercase text-zinc-900 dark:text-zinc-100"
          >
            Sample Device Detail Routes
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Verify the dynamic{" "}
            <code className="rounded bg-zinc-100 px-1 py-0.5 font-mono dark:bg-zinc-800">
              /devices/[id]
            </code>{" "}
            route and breadcrumb trail:
          </p>
          <ul className="grid gap-2 sm:grid-cols-3">
            {sampleDevices.map((device) => (
              <li key={device.id}>
                <Link
                  href={`/devices/${device.id}`}
                  className="flex flex-col rounded-md border border-zinc-200 p-3 transition hover:border-zinc-400 hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:border-zinc-800 dark:hover:border-zinc-600 dark:hover:bg-zinc-900 dark:focus-visible:outline-zinc-50"
                >
                  <span className="font-mono text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {device.id}
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {device.model} ({device.status})
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </SectionPage>
  );
}

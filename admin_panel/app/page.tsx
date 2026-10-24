import type { Metadata } from "next";
import Link from "next/link";
import { adminSections } from "@/lib/admin-sections";

export const metadata: Metadata = {
  title: "Staff Portal",
  description: "AMTRAV administrative and manufacturer portal.",
};

export default function HomePage() {
  const sections = [
    {
      ...adminSections.devices,
      badge: "Administrator & Manufacturer",
    },
    {
      ...adminSections.users,
      badge: "Administrator",
    },
    {
      ...adminSections.files,
      badge: "Administrator & Manufacturer",
    },
  ];

  return (
    <main
      id="main-content"
      className="flex w-full max-w-5xl flex-col gap-8 px-6 py-10 sm:px-10"
    >
      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
              AMTRAV Staff Portal
            </h1>
            <p className="mt-1 text-base text-zinc-600 dark:text-zinc-400">
              Administrative controls, device registry and system assets.
            </p>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:focus-visible:outline-zinc-50"
          >
            Staff Sign In →
          </Link>
        </div>
      </header>

      <div className="rounded-lg border border-dashed border-zinc-300 p-6 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
        <p className="font-medium text-zinc-900 dark:text-zinc-100">
          Sprint F0 Foundation &amp; Route Hub
        </p>
        <p className="mt-1">
          In Sprint F0, all five core routes are wired as route skeletons. In
          Sprint F1, server-side session cookies (HttpOnly) will determine
          authentication state: unauthenticated visitors will be redirected to{" "}
          <Link
            href="/login"
            className="font-medium underline text-zinc-900 dark:text-zinc-100"
          >
            /login
          </Link>
          , and authenticated staff will be routed directly to{" "}
          <Link
            href="/devices"
            className="font-medium underline text-zinc-900 dark:text-zinc-100"
          >
            /devices
          </Link>
          .
        </p>
      </div>

      <section
        aria-labelledby="portal-sections-heading"
        className="flex flex-col gap-4"
      >
        <h2
          id="portal-sections-heading"
          className="text-lg font-medium text-zinc-950 dark:text-zinc-50"
        >
          Application Sections
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {sections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="flex flex-col justify-between rounded-lg border border-zinc-200 p-5 transition hover:border-zinc-400 hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:border-zinc-800 dark:hover:border-zinc-600 dark:hover:bg-zinc-900 dark:focus-visible:outline-zinc-50"
            >
              <div>
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  {section.badge}
                </span>
                <h3 className="mt-1 text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  {section.label}
                </h3>
                <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
                  {section.description}
                </p>
              </div>
              <span className="mt-4 text-xs font-medium text-zinc-900 underline dark:text-zinc-100">
                Open {section.label} →
              </span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

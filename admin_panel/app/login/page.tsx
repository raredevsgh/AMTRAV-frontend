import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to the AMTRAV Staff Portal.",
};

export default function LoginPage() {
  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Sign In" },
  ];

  return (
    <main
      id="main-content"
      className="flex min-h-[80vh] w-full flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8"
    >
      <div className="w-full max-w-md space-y-6">
        <Breadcrumbs items={breadcrumbs} />

        <div className="rounded-xl border border-zinc-200 bg-white p-8 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <header className="space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
              Staff Sign In
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Access the AMTRAV device registry and administration tools.
            </p>
          </header>

          <form
            aria-label="Staff Sign In Form"
            className="mt-6 space-y-4"
          >
            <div>
              <label
                htmlFor="staff-email"
                className="block text-xs font-medium text-zinc-700 dark:text-zinc-300"
              >
                Work Email
              </label>
              <input
                id="staff-email"
                type="email"
                disabled
                placeholder="name@company.com"
                aria-describedby="auth-f1-note"
                className="mt-1 block w-full rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-500 cursor-not-allowed dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
              />
            </div>

            <div>
              <label
                htmlFor="staff-password"
                className="block text-xs font-medium text-zinc-700 dark:text-zinc-300"
              >
                Password
              </label>
              <input
                id="staff-password"
                type="password"
                disabled
                placeholder="••••••••"
                aria-describedby="auth-f1-note"
                className="mt-1 block w-full rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-500 cursor-not-allowed dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
              />
            </div>

            <button
              type="button"
              disabled
              className="w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white opacity-60 cursor-not-allowed dark:bg-zinc-100 dark:text-zinc-900"
            >
              Sign In
            </button>
          </form>

          <div
            id="auth-f1-note"
            className="mt-6 rounded-md border border-dashed border-zinc-300 p-4 text-xs text-zinc-600 dark:border-zinc-700 dark:text-zinc-400"
          >
            <p className="font-medium text-zinc-900 dark:text-zinc-100">
              Sprint F0 Route Skeleton: Authentication
            </p>
            <p className="mt-1">
              POST /api/v1/auth/login, HttpOnly session cookie rotation and
              same-origin API proxy integration arrive in Sprint F1.
              Unauthenticated staff will be routed here automatically.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

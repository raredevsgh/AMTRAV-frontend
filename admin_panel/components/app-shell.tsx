"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { NavIcon } from "@/components/nav-icon";
import { RoleBadge } from "@/components/role-badge";
import { adminSections, type AdminRole, type AdminSection } from "@/lib/admin-sections";
import { mockAdminSession, type MockAdminSession } from "@/lib/mock-session";

type NavigableSection = AdminSection & {
  icon: NonNullable<AdminSection["icon"]>;
};

function isSectionActive(pathname: string, section: AdminSection) {
  return pathname === section.href || pathname.startsWith(`${section.href}/`);
}

function visibleSections(role: AdminRole): NavigableSection[] {
  const sections = Object.values(adminSections) as AdminSection[];
  return sections.filter(
    (section): section is NavigableSection =>
      Boolean(section.icon && section.roles?.includes(role)),
  );
}

function Brand() {
  return (
    <Link href="/" className="group inline-flex flex-col rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-500">
      <span className="text-lg font-bold tracking-[0.2em] text-slate-950 dark:text-white">AMORTRAV</span>
      <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Staff console</span>
    </Link>
  );
}

function Navigation({ sections, pathname, onNavigate }: { sections: readonly NavigableSection[]; pathname: string; onNavigate?: () => void }) {
  return (
    <nav aria-label="Staff portal navigation" className="flex flex-col gap-1">
      {sections.map((section) => {
        const active = isSectionActive(pathname, section);
        return (
          <Link
            key={section.href}
            href={section.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 ${
              active
                ? "bg-slate-950 text-white shadow-sm dark:bg-white dark:text-slate-950"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            }`}
          >
            <NavIcon icon={section.icon} />
            <span>{section.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function UserIdentity({ session }: { session: MockAdminSession }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-sky-100 text-xs font-bold text-sky-800 dark:bg-sky-950 dark:text-sky-200" aria-hidden="true">
        {session.initials}
      </div>
      <div className="hidden min-w-0 sm:block">
        <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">{session.displayName}</p>
        <p className="truncate text-xs text-slate-500 dark:text-slate-400">{session.email}</p>
      </div>
      <RoleBadge role={session.role} />
    </div>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return open ? (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  ) : (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const session = mockAdminSession;
  const sections = visibleSections(session.role);
  const activeSection = sections.find((section) => isSectionActive(pathname, section));

  useEffect(() => {
    if (!mobileOpen) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const drawer = drawerRef.current;
    const trigger = menuButtonRef.current;
    const focusable = drawer?.querySelectorAll<HTMLElement>("a, button, [tabindex]:not([tabindex='-1'])");
    focusable?.[0]?.focus();
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileOpen(false);
        return;
      }
      if (event.key !== "Tab" || !focusable?.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
      (previouslyFocused ?? trigger)?.focus();
    };
  }, [mobileOpen]);

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-white">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white px-4 py-6 lg:flex dark:border-slate-800 dark:bg-slate-900" aria-label="Staff portal navigation">
        <Brand />
        <div className="mt-10 flex-1">
          <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Workspace</p>
          <Navigation sections={sections} pathname={pathname} />
        </div>
        <div className="border-t border-slate-200 pt-5 dark:border-slate-800">
          <UserIdentity session={session} />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex min-h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-10 dark:border-slate-800 dark:bg-slate-900/95">
          <div className="flex min-w-0 items-center gap-3">
            <button
              ref={menuButtonRef}
              type="button"
              aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileOpen}
              aria-controls="mobile-navigation"
              onClick={() => setMobileOpen((open) => !open)}
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 lg:hidden dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <MenuIcon open={mobileOpen} />
            </button>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">{activeSection?.label ?? "Staff Portal"}</p>
              <p className="hidden truncate text-xs text-slate-500 sm:block dark:text-slate-400">AMORTRAV administration workspace</p>
            </div>
          </div>
          <UserIdentity session={session} />
        </header>

        <main id="main-content" className="min-w-0 flex-1 overflow-x-hidden">{children}</main>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" aria-label="Mobile navigation">
          <button type="button" aria-label="Close navigation menu" onClick={() => setMobileOpen(false)} className="absolute inset-0 bg-slate-950/40" />
          <aside id="mobile-navigation" ref={drawerRef} role="dialog" aria-modal="true" aria-labelledby="mobile-navigation-title" className="relative flex h-full w-[min(20rem,85vw)] flex-col bg-white px-4 py-6 shadow-2xl dark:bg-slate-900">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p id="mobile-navigation-title" className="sr-only">Staff portal navigation</p>
                <Brand />
              </div>
              <button type="button" onClick={() => setMobileOpen(false)} aria-label="Close navigation menu" className="inline-flex size-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 dark:border-slate-700 dark:text-slate-200">
                <MenuIcon open />
              </button>
            </div>
            <div className="mt-10 flex-1">
              <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Workspace</p>
              <Navigation sections={sections} pathname={pathname} onNavigate={() => setMobileOpen(false)} />
            </div>
            <div className="border-t border-slate-200 pt-5 dark:border-slate-800">
              <UserIdentity session={session} />
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

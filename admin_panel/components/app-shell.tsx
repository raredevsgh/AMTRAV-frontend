"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { NavIcon } from "./nav-icon";
import { RoleBadge } from "./role-badge";
import { Modal } from "./console-ui";
import {
  adminSections,
  toAdminRole,
  type AdminSection,
} from "@/lib/admin-sections";
import type { User } from "@/lib/api/types";
import { usePreviewControls } from "@/features/console-context";
import { leaveDemo } from "@/app/login/actions";

export function Brand() {
  return (
    <Link className="brand" href="/devices">
      AMORTRAV
    </Link>
  );
}
function Navigation({
  user,
  onNavigate,
}: {
  user: User;
  onNavigate?: () => void;
}) {
  const path = usePathname();
  const role = toAdminRole(user.role);
  return (
    <nav aria-label="Staff portal navigation" className="nav-list">
      {(Object.values(adminSections) as AdminSection[])
        .filter(
          (
            s,
          ): s is AdminSection & { icon: NonNullable<AdminSection["icon"]> } =>
            Boolean(s.icon) && Boolean(role && s.roles?.includes(role)),
        )
        .map((s) => (
          <Link
            key={s.href}
            href={s.href}
            onClick={onNavigate}
            aria-current={
              (
                s.href === "/devices"
                  ? path === "/devices" ||
                    (path.startsWith("/devices/") && path !== "/devices/new")
                  : path === s.href
              )
                ? "page"
                : undefined
            }
            className="nav-link"
          >
            <NavIcon icon={s.icon} />
            {s.label}
          </Link>
        ))}
    </nav>
  );
}
function Identity({ user }: { user: User }) {
  return (
    <div className="workspace">
      <span className="workspace-mark" aria-hidden="true">
        {user.role === "admin" ? "A" : "M"}
      </span>
      <div>
        <strong>{user.role === "admin" ? "Amortrav" : "Manufacturer"}</strong>
        <p className="role-pill">
          <RoleBadge role={toAdminRole(user.role) ?? "user"} />
        </p>
      </div>
    </div>
  );
}
export function AppShell({
  user,
  children,
}: {
  user: User;
  children: React.ReactNode;
}) {
  const path = usePathname();
  return (
    <Shell key={path} user={user}>
      {children}
    </Shell>
  );
}
function Shell({ user, children }: { user: User; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const { scenario, setScenario } = usePreviewControls();
  useEffect(() => {
    const m = matchMedia("(min-width:1024px)");
    const close = () => {
      if (m.matches) setOpen(false);
    };
    m.addEventListener("change", close);
    return () => m.removeEventListener("change", close);
  }, []);
  const footer = (
    <div className="account-footer">
      <p>{user.email}</p>
      <form action={leaveDemo}>
        <button className="btn btn-secondary" type="submit">
          Sign out of demo
        </button>
      </form>
    </div>
  );
  return (
    <div className="console-root">
      <aside className="sidebar" aria-label="Workspace sidebar">
        <Brand />
        <Identity user={user} />
        <Navigation user={user} />
        {footer}
      </aside>
      <div className="console-main">
        <div className="mobile-bar">
          <Brand />
          <button
            className="icon-btn"
            ref={menuButton}
            aria-label="Open navigation menu"
            aria-haspopup="dialog"
            aria-expanded={open}
            onClick={() => setOpen(true)}
          >
            ☰
          </button>
        </div>
        <div className="demo-banner">
          <strong>DEMO · Fictional data, no backend connection.</strong> This is
          not a signed-in production session.
          <details className="mt-1">
            <summary>Preview states (resets demo records)</summary>
            <label className="row mt-2">
              Data state
              <select
                aria-label="Preview data state"
                value={scenario}
                onChange={(e) => {
                  const value = e.target.value;
                  if (
                    value === "normal" ||
                    value === "empty" ||
                    value === "unavailable" ||
                    value === "rate_limit"
                  )
                    setScenario(value);
                }}
              >
                <option value="normal">Normal</option>
                <option value="empty">Empty</option>
                <option value="unavailable">Service unavailable</option>
                <option value="rate_limit">Rate limited</option>
              </select>
            </label>
          </details>
        </div>
        <main id="main-content">{children}</main>
      </div>
      {open && (
        <Modal
          title="Workspace navigation"
          restoreFocus={() => menuButton.current?.focus()}
          drawer
          onClose={() => setOpen(false)}
        >
          <Brand />
          <Identity user={user} />
          <Navigation user={user} onNavigate={() => setOpen(false)} />
          {footer}
        </Modal>
      )}
    </div>
  );
}

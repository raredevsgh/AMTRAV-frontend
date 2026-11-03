"use client";

import Link from "next/link";
import {FigmaIcon} from "@/components/figma-icon";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ConsoleBrand } from "./console-brand";
import { NavIcon } from "./nav-icon";
import { Modal } from "./console-ui";
import { adminSections, toAdminRole, type AdminSection, type AdminSectionKey } from "@/lib/admin-sections";
import type { User } from "@/lib/api/types";
import { useConsoleState, useResource } from "@/features/console-context";
import { loadConsolePages } from "@/lib/console-presentation";
import { leaveDemo } from "@/app/login/actions";

const primary: readonly AdminSectionKey[] = ["overview", "devices", "customers", "journeys", "alerts", "operations"];
const tools: readonly AdminSectionKey[] = ["register", "manufacturers", "files", "users"];

export function Brand() {
  return <Link className="brand" href="/" aria-label="AMORTRAV overview"><ConsoleBrand compact /></Link>;
}

function visibleSections(user: User, keys: readonly AdminSectionKey[]) {
  const role = toAdminRole(user.role);
  return keys.map((key) => adminSections[key] as AdminSection)
    .filter((section): section is AdminSection & { icon: NonNullable<AdminSection["icon"]> } =>
      Boolean(section.icon && role && section.roles?.includes(role)));
}

function Navigation({ user, onNavigate, keys = primary }: { user: User; onNavigate?: () => void; keys?: readonly AdminSectionKey[] }) {
  const path = usePathname();
  const {api,dataRevision} = useConsoleState();
  const load = useCallback(async () => {
    if (!keys.includes("alerts")) return null;
    const alerts = await loadConsolePages((page,pageSize) => api.listAlerts({page,pageSize}));
    return {revision:dataRevision,open:alerts.filter((alert) => alert.status !== "resolved").length};
  },[api,dataRevision,keys]);
  const {data} = useResource(load);
  return <nav aria-label={keys === primary ? "Staff portal navigation" : keys === tools ? "Workspace tools" : "Settings"} className="nav-list">
    {visibleSections(user, keys).map((section) => {
      const active = section.href === "/devices"
        ? path === "/devices" || (path.startsWith("/devices/") && path !== "/devices/new")
        : path === section.href || (section.href !== "/" && path.startsWith(`${section.href}/`));
      return <Link key={section.href} href={section.href} onClick={onNavigate}
        aria-current={active ? "page" : undefined} className="nav-link">
        <NavIcon icon={section.icon} /><span>{section.label}</span>
        {section.href === "/alerts" && data && <span className="nav-count" aria-label={`${data.open} open alerts`}>{data.open}</span>}
      </Link>;
    })}
  </nav>;
}

function Identity({ user }: { user: User }) {
  const {presentation} = useConsoleState();
  const engineering = user.role === "admin" && presentation === "engineering";
  return <div className="workspace" title={user.email}>
    <span className="workspace-mark" aria-hidden="true">{engineering ? "KA" : user.role === "admin" ? "AM" : "NC"}</span>
    <div className="workspace-meta"><strong>{engineering ? "Kofi Asante" : user.role === "admin" ? "Ama Mensah" : "Northline Cases"}</strong>
      <p>{engineering ? "Engineering" : user.role === "admin" ? "Operations · Admin" : "Manufacturer"}</p>
      <span className="sr-only">{user.email}</span>
    </div>
  </div>;
}

export function AppShell({ user, children }: { user: User; children: React.ReactNode }) {
  const path = usePathname();
  return <Shell key={path} user={user}>{children}</Shell>;
}

function Shell({ user, children }: { user: User; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const menuButton = useRef<HTMLButtonElement>(null);
  const searchButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const media = matchMedia("(min-width:1024px)");
    const close = () => { if (media.matches) setOpen(false); };
    media.addEventListener("change", close);
    return () => media.removeEventListener("change", close);
  }, []);
  const footer = <div className="account-footer"><Identity user={user} />
    <form action={leaveDemo}><button className="signout-button" type="submit" aria-label="Sign out" title="Sign out"><FigmaIcon name="signOut" /></button></form>
  </div>;
  const toolNavigation = <details className="workspace-tools"><summary>Workspace tools</summary><Navigation user={user} keys={tools} onNavigate={() => setOpen(false)} /></details>;
  const searchTrigger = <button ref={searchButton} className="global-search" onClick={() => setSearchOpen(true)} aria-haspopup="dialog"><span aria-hidden="true"><FigmaIcon name="search" /></span> Search</button>;
  const destinations = visibleSections(user, [...primary, ...tools, "settings"])
    .filter((section) => `${section.label} ${section.description}`.toLowerCase().includes(query.toLowerCase().trim()));
  return <div className="console-root">
    <aside className="sidebar" aria-label="Workspace sidebar">
      <Brand />{searchTrigger}<Navigation user={user} />
      <div className="sidebar-bottom">{toolNavigation}<Navigation user={user} keys={["settings"]} />{footer}</div>
    </aside>
    <div className="console-main">
      <div className="mobile-bar"><Brand />
        <button className="mobile-search" aria-label="Search workspace" onClick={() => setSearchOpen(true)}><FigmaIcon name="search" /></button>
        <button className="icon-btn" ref={menuButton} aria-label="Open navigation menu" aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(true)}>☰</button>
      </div>
      <main id="main-content">{children}</main>
    </div>
    {open && <Modal title="Workspace navigation" restoreFocus={() => menuButton.current?.focus()} drawer onClose={() => setOpen(false)}>
      <Brand /><Navigation user={user} onNavigate={() => setOpen(false)} />
      {toolNavigation}<Navigation user={user} keys={["settings"]} onNavigate={() => setOpen(false)} />{footer}
    </Modal>}
    {searchOpen && <Modal title="Search workspace" onClose={() => setSearchOpen(false)} restoreFocus={() => searchButton.current?.focus()}>
      <label className="field">Find a screen<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search screens and tools" /></label>
      <p className="small muted">Find a page or workspace tool.</p>
      <div className="workspace-search-results">{destinations.length ? destinations.map((section) =>
        <Link key={section.href} href={section.href} onClick={() => setSearchOpen(false)}><NavIcon icon={section.icon} /><span><strong>{section.label}</strong><small>{section.description}</small></span><span aria-hidden="true">→</span></Link>)
        : <p role="status">No matching screens.</p>}
      </div>
    </Modal>}
  </div>;
}

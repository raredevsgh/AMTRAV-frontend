"use client";

import Image from "next/image";
import { motion, MotionConfig } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useSyncExternalStore, type ReactElement, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowUpRight,
  Cpu,
  Factory,
  FolderOpen,
  Grid2X2,
  LayoutDashboard,
  LogOut,
  MapPinned,
  PanelLeftClose,
  PanelLeftOpen,
  Megaphone,
  PlusCircle,
  QrCode,
  ShieldCheck,
  Users,
  LifeBuoy,
  Gauge,
  Zap,
  BellRing,
  Inbox,
  ShoppingBag,
} from "lucide-react";
import { useConsole } from "./provider";
import { OfflineBanner, useOffline, wipeLocalData } from "./offline";
import { api, ApiError } from "@/lib/console/api";
import { useConsoleStore } from "@/stores/console-store";
import { themeIcons, themes, useTheme, type Theme } from "@/components/marketing/theme-switcher";
import { Avatar } from "./profile";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/** Whether the sidebar shows its labels: a choice kept on this computer, not the account. */
const SIDEBAR_KEY = "amortrav_console_sidebar";
const sidebarListeners = new Set<() => void>();

function readSidebarOpen() {
  try {
    return localStorage.getItem(SIDEBAR_KEY) === "open";
  } catch {
    return false;
  }
}

function useSidebarOpen() {
  const open = useSyncExternalStore(
    (onChange) => {
      sidebarListeners.add(onChange);
      window.addEventListener("storage", onChange);
      return () => {
        sidebarListeners.delete(onChange);
        window.removeEventListener("storage", onChange);
      };
    },
    readSidebarOpen,
    // The server doesn't know the choice; the rail starts closed and opens after hydration.
    () => false,
  );
  function setOpen(next: boolean) {
    try {
      localStorage.setItem(SIDEBAR_KEY, next ? "open" : "closed");
    } catch {
      // Storage can be off (private windows); the choice then lasts until the next load.
    }
    sidebarListeners.forEach((listener) => listener());
  }
  return [open, setOpen] as const;
}

/** A label beside a rail icon; off when the sidebar is open and the labels already show. */
function SidebarTooltip({
  label,
  children,
  off,
}: {
  label: string;
  children: ReactElement;
  off?: boolean;
}) {
  if (off) return children;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
}

const themeLabels: Record<Theme, string> = { system: "System", light: "Light", dark: "Dark" };

/**
 * System, Light and Dark as icons side by side, the current one raised. A column on the
 * closed rail; open, a row with "Theme" beside it. Each icon names itself in a tooltip.
 */
function ThemeSegments() {
  const [theme, choose] = useTheme();
  return (
    <div className="console-theme-row">
      <span className="nav-label" aria-hidden>
        Theme
      </span>
      <div className="console-theme" role="group" aria-label="Theme">
        {themes.map((value) => {
          const Icon = themeIcons[value];
          return (
            <SidebarTooltip key={value} label={`${themeLabels[value]} theme`}>
              <button type="button" aria-pressed={theme === value} onClick={() => choose(value)}>
                <Icon size={15} aria-hidden />
                <span className="sr-only">{themeLabels[value]}</span>
              </button>
            </SidebarTooltip>
          );
        })}
      </div>
    </div>
  );
}

export function ConsoleShell({
  children,
  section,
}: {
  children: ReactNode;
  section: string;
}) {
  const { user, preview, base } = useConsole();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [leaving, setLeaving] = useState(false);
  const [signOutError, setSignOutError] = useState("");
  const [confirmingSignOut, setConfirmingSignOut] = useState(false);
  // Edits made offline that haven't reached the server; signing out wipes them with the rest.
  const unsent = useOffline().queued.length;
  const [sidebarOpen, setSidebarOpen] = useSidebarOpen();
  const admin = user.role === "admin";
  // Grouped under small headings, as Clerk's dashboard sidebar; groups without items are dropped.
  const groups: { label?: string; items: { label: string; path: string; icon: typeof Cpu }[] }[] = [
    { items: [{ label: "Dashboard", path: "", icon: LayoutDashboard }] },
    {
      label: "Fleet",
      items: [
        { label: "Devices", path: "devices", icon: Grid2X2 },
        ...(admin
          ? [
              { label: "Fleet map", path: "map", icon: MapPinned },
              { label: "Fleet health", path: "fleet", icon: Gauge },
              { label: "Impact review", path: "impacts", icon: Zap },
              { label: "Alerts", path: "alerts", icon: BellRing },
            ]
          : []),
        { label: "Firmware", path: "firmware", icon: Cpu },
      ],
    },
    {
      label: "Provisioning",
      items: [
        { label: "Register device", path: "register", icon: PlusCircle },
        { label: "Bulk provisioning", path: "provision", icon: QrCode },
      ],
    },
    ...(admin
      ? [
          {
            label: "Customers",
            items: [
              { label: "Support", path: "support", icon: LifeBuoy },
              { label: "Travellers", path: "travellers", icon: Users },
              { label: "Messages", path: "messages", icon: Megaphone },
              { label: "Leads", path: "leads", icon: Inbox },
              { label: "Shop", path: "shop", icon: ShoppingBag },
            ],
          },
        ]
      : []),
    {
      label: "Organization",
      items: [
        ...(admin ? [{ label: "Manufacturers", path: "manufacturers", icon: Factory }] : []),
        { label: "Files", path: "files", icon: FolderOpen },
        { label: "Security", path: "security", icon: ShieldCheck },
      ],
    },
  ];
  const roleLabel = admin ? "Admin" : "Manufacturer";

  async function signOut() {
    setLeaving(true);
    setSignOutError("");
    if (!preview) {
      try {
        await api("auth/logout", { method: "POST" });
      } catch (error) {
        // An API error is returned after the gateway clears cookies. A network
        // failure may never reach the gateway, so keep the session visible.
        if (!(error instanceof ApiError)) {
          setSignOutError("Could not sign out. Check your connection and try again.");
          setLeaving(false);
          return;
        }
      }
    }
    // Previews never touch the signed-in account's saved data or queued edits.
    if (preview) queryClient.clear();
    else await wipeLocalData(queryClient);
    useConsoleStore.getState().reset();
    router.replace("/sign-in");
  }

  return (
    <div className="console-page" data-sidebar={sidebarOpen ? "open" : "closed"}>
      <a href="#workspace" className="skip-link">
        Skip to workspace
      </a>
      <div className="console-frame">
        <TooltipProvider delayDuration={200} skipDelayDuration={100}>
          <aside className="console-sidebar">
            {/* The workspace, as Clerk's app switcher: mark, name and role, and the collapse button. */}
            <div className="console-brand">
              <SidebarTooltip label="Amortrav home" off={sidebarOpen}>
                <Link href="/" aria-label="Amortrav home" className="console-brand-link">
                  <Image
                    src="/images/console-mark.png"
                    alt="Amortrav"
                    width={48}
                    height={48}
                  />
                  <span className="nav-label console-brand-text" aria-hidden>
                    <strong>
                      Amortrav
                      {preview ? <span className="console-env">Preview</span> : null}
                    </strong>
                    <small>{roleLabel} console</small>
                  </span>
                </Link>
              </SidebarTooltip>
              <SidebarTooltip label="Expand sidebar" off={sidebarOpen}>
                <button
                  type="button"
                  className="sidebar-toggle"
                  aria-controls="console-nav"
                  aria-expanded={sidebarOpen}
                  aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
                  title={sidebarOpen ? "Collapse sidebar" : undefined}
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                  {sidebarOpen ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={18} />}
                </button>
              </SidebarTooltip>
            </div>
            <nav id="console-nav" aria-label="Console navigation" className="console-nav">
              {groups
                .filter((group) => group.items.length)
                .map((group) => (
                  <div key={group.label ?? "home"} className="nav-group">
                    {group.label ? (
                      <p className="nav-group-label" aria-hidden>
                        {group.label}
                      </p>
                    ) : null}
                    {group.items.map(({ label, path, icon: Icon }) => (
                      <SidebarTooltip key={path} label={label} off={sidebarOpen}>
                        <Link
                          href={`${base}${path ? `/${path}` : ""}`}
                          aria-current={section === path ? "page" : undefined}
                        >
                          <Icon size={20} aria-hidden />
                          <span className="nav-label">{label}</span>
                        </Link>
                      </SidebarTooltip>
                    ))}
                  </div>
                ))}
            </nav>
            <div className="console-account">
              <ThemeSegments />
              <SidebarTooltip label="Sign out" off={sidebarOpen}>
                <button
                  type="button"
                  onClick={() => {
                    setSignOutError("");
                    setConfirmingSignOut(true);
                  }}
                  disabled={leaving}
                >
                  <LogOut size={20} aria-hidden />
                  <span className="nav-label">Sign out</span>
                </button>
              </SidebarTooltip>
              <SidebarTooltip label={`Your profile · ${user.email}`} off={sidebarOpen}>
                <Link
                  href={`${base}/profile`}
                  className="console-avatar-link"
                  aria-label={`Your profile (signed in as ${user.email})`}
                  aria-current={section === "profile" ? "page" : undefined}
                >
                  <Avatar user={user} size={40} />
                  <span className="nav-label console-user-text">
                    <strong>{user.email}</strong>
                    <small>{roleLabel}</small>
                  </span>
                </Link>
              </SidebarTooltip>
            </div>
          </aside>
        </TooltipProvider>
        <main className="console-main" id="workspace">
          {preview && (
            <div className="preview-notice">
              <span>
                <b>Design preview</b> Sample data. Changes are disabled.
              </span>
              <Link href={`/preview/${user.role === "admin" ? "manufacturer" : "admin"}`}>
                {user.role === "admin" ? "Manufacturer" : "Admin"} view{" "}
                <ArrowUpRight size={14} />
              </Link>
              <Link href="/sign-in">Sign in</Link>
            </div>
          )}
          <OfflineBanner />
          {/* Each page rises in as you move between sections (still for reduced motion). */}
          <MotionConfig reducedMotion="user">
            <motion.div
              key={section}
              className="console-view"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              {children}
            </motion.div>
          </MotionConfig>
        </main>
        <Dialog
          open={confirmingSignOut}
          onOpenChange={(open) => !open && !leaving && setConfirmingSignOut(false)}
        >
          <DialogContent className="console-dialog sign-out-dialog">
            <DialogHeader>
              <DialogTitle>Sign out?</DialogTitle>
              <DialogDescription>
                {preview
                  ? "You’ll leave the design preview and go to the sign-in page."
                  : `You’re signed in as ${user.email}. Signing out clears the console data saved on this computer, and you’ll need to sign in again to get back in.`}
              </DialogDescription>
            </DialogHeader>
            {unsent > 0 && !preview && (
              <p className="console-alert error" role="alert">
                {unsent === 1
                  ? "1 edit you made offline hasn’t been sent yet. Signing out now discards it."
                  : `${unsent} edits you made offline haven’t been sent yet. Signing out now discards them.`}
              </p>
            )}
            {signOutError && (
              <p className="console-alert error" role="alert">
                {signOutError}
              </p>
            )}
            <div className="console-actions">
              <button
                type="button"
                className="console-secondary"
                onClick={() => setConfirmingSignOut(false)}
                disabled={leaving}
              >
                Cancel
              </button>
              <button
                type="button"
                className={unsent > 0 && !preview ? "console-danger" : "console-button"}
                onClick={signOut}
                disabled={leaving}
              >
                <LogOut size={16} aria-hidden />
                {leaving ? "Signing out…" : "Sign out"}
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

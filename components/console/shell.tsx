"use client";

import Image from "next/image";
import { motion, MotionConfig } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactElement, type ReactNode } from "react";
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
  Megaphone,
  PlusCircle,
  QrCode,
  ShieldCheck,
  Users,
  Gauge,
  Zap,
  BellRing,
  Inbox,
  ShoppingBag,
} from "lucide-react";
import { useConsole } from "./provider";
import { OfflineBanner, wipeLocalData } from "./offline";
import { api, ApiError } from "@/lib/console/api";
import { useConsoleStore } from "@/stores/console-store";
import { ThemeSwitcher } from "@/components/marketing/theme-switcher";
import { Avatar } from "./profile";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function SidebarTooltip({ label, children }: { label: string; children: ReactElement }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
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
  const nav = [
    { label: "Dashboard", path: "", icon: LayoutDashboard },
    { label: "Devices", path: "devices", icon: Grid2X2 },
    ...(user.role === "admin"
      ? [
          { label: "Fleet map", path: "map", icon: MapPinned },
          { label: "Fleet health", path: "fleet", icon: Gauge },
          { label: "Impact review", path: "impacts", icon: Zap },
          { label: "Alerts", path: "alerts", icon: BellRing },
        ]
      : []),
    { label: "Firmware", path: "firmware", icon: Cpu },
    { label: "Register device", path: "register", icon: PlusCircle },
    { label: "Bulk provisioning", path: "provision", icon: QrCode },
    ...(user.role === "admin"
      ? [
          { label: "Travellers", path: "travellers", icon: Users },
          { label: "Messages", path: "messages", icon: Megaphone },
          { label: "Manufacturers", path: "manufacturers", icon: Factory },
          { label: "Leads", path: "leads", icon: Inbox },
          { label: "Shop", path: "shop", icon: ShoppingBag },
        ]
      : []),
    { label: "Files", path: "files", icon: FolderOpen },
    { label: "Security", path: "security", icon: ShieldCheck },
  ];

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
    <div className="console-page">
      <a href="#workspace" className="skip-link">
        Skip to workspace
      </a>
      <div className="console-frame">
        <TooltipProvider delayDuration={200} skipDelayDuration={100}>
          <aside className="console-sidebar">
            <SidebarTooltip label="Amortrav home">
              <Link href="/" aria-label="Amortrav home">
                <Image
                  src="/images/console-mark.png"
                  alt="Amortrav"
                  width={48}
                  height={48}
                />
              </Link>
            </SidebarTooltip>
            <nav aria-label="Console navigation" className="console-nav">
              {nav.map(({ label, path, icon: Icon }) => (
                <SidebarTooltip key={path} label={label}>
                  <Link
                    href={`${base}${path ? `/${path}` : ""}`}
                    aria-label={label}
                    aria-current={section === path ? "page" : undefined}
                  >
                    <Icon size={20} />
                    <span className="sr-only">{label}</span>
                  </Link>
                </SidebarTooltip>
              ))}
            </nav>
            <div className="console-account">
              <ThemeSwitcher />
              <SidebarTooltip label="Sign out">
                <button aria-label="Sign out" onClick={signOut} disabled={leaving}>
                  <LogOut size={20} />
                </button>
              </SidebarTooltip>
              <SidebarTooltip label={`Your profile · ${user.email}`}>
                <Link
                  href={`${base}/profile`}
                  className="console-avatar-link"
                  aria-label={`Your profile (signed in as ${user.email})`}
                  aria-current={section === "profile" ? "page" : undefined}
                >
                  <Avatar user={user} size={40} />
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
          {signOutError && (
            <p role="alert" className="console-alert error">
              {signOutError}
            </p>
          )}
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
      </div>
    </div>
  );
}

"use client";

import { ConsoleProvider } from "./provider";
import { ConsoleShell } from "./shell";
import { Dashboard } from "./dashboard";
import { RegisterDevicePage } from "./register-device";
import { ManufacturersPage } from "./manufacturers";
import { DeviceDetail } from "./device-detail";
import { FilesPage } from "./files";
import { FirmwarePage } from "./firmware";
import { LocationsPage } from "./locations-page";
import { SecurityPage } from "./security";
import { ProfilePage } from "./profile";
import { ProvisionPage } from "./provision";
import { BatchDetail } from "./batch-detail";
import { TravellerDetailPage, TravellersPage } from "./travellers";
import { MessagesPage } from "./messages";
import { AlertsPage, FleetHealthPage, ImpactsPage, LeadsPage } from "./trace";
import { ShopPage } from "./shop";
import type { StaffRole } from "@/lib/console/types";

export function Workspace({
  section = [],
  previewRole,
}: {
  section?: string[];
  previewRole?: StaffRole;
}) {
  const page = section[0] || "";
  const content =
    page === "map" ? (
      <LocationsPage />
    ) : page === "fleet" ? (
      <FleetHealthPage />
    ) : page === "impacts" ? (
      <ImpactsPage />
    ) : page === "alerts" ? (
      <AlertsPage />
    ) : page === "leads" ? (
      <LeadsPage />
    ) : page === "shop" ? (
      <ShopPage />
    ) : page === "register" ? (
      <RegisterDevicePage />
    ) : page === "manufacturers" ? (
      <ManufacturersPage />
    ) : page === "files" ? (
      <FilesPage />
    ) : page === "firmware" ? (
      <FirmwarePage />
    ) : page === "travellers" && section[1] ? (
      <TravellerDetailPage id={section[1]} />
    ) : page === "messages" ? (
      <MessagesPage />
    ) : page === "travellers" ? (
      <TravellersPage />
    ) : page === "security" ? (
      <SecurityPage />
    ) : page === "profile" ? (
      <ProfilePage />
    ) : page === "provision" && section[1] ? (
      <BatchDetail id={section[1]} />
    ) : page === "provision" ? (
      <ProvisionPage />
    ) : page === "devices" && section[1] ? (
      <DeviceDetail id={section[1]} />
    ) : (
      <Dashboard inventoryOnly={page === "devices"} />
    );
  return (
    <ConsoleProvider previewRole={previewRole}>
      <ConsoleShell section={page}>{content}</ConsoleShell>
    </ConsoleProvider>
  );
}

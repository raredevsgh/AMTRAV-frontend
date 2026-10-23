import type { Metadata } from "next";
import { SectionPage } from "@/components/section-page";
import { adminSections } from "@/lib/admin-sections";

const section = adminSections.dashboard;

export const metadata: Metadata = {
  title: section.label,
  description: section.description,
};

export default function DashboardPage() {
  return <SectionPage section={section} />;
}

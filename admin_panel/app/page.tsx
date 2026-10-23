import { redirect } from "next/navigation";
import { adminSections } from "@/lib/admin-sections";

export default function Home() {
  redirect(adminSections.dashboard.href);
}

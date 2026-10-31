import "server-only";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { mockUserForRole } from "./api";
import { consoleUsers } from "./console-fixtures";
import type { User } from "./api/types";

export async function demoEnabled() {
  await connection();
  return (
    process.env.AMTRAV_CONSOLE_DEMO === "1" &&
    process.env.VERCEL_ENV !== "production"
  );
}
export async function getDemoSession(): Promise<User | null> {
  if (!(await demoEnabled())) return null;
  const role = (await cookies()).get("amtrav_console_demo")?.value;
  if (role !== "admin" && role !== "manufacturer") return null;
  return (
    consoleUsers.find((user) => user.role === role) ?? mockUserForRole(role)
  );
}
export async function requireConsoleSession(): Promise<User> {
  const session = await getDemoSession();
  if (!session) redirect("/login?reason=session");
  return session;
}

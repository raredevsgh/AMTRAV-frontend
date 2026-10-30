"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { demoEnabled } from "@/lib/console-session";

// This switches fictional preview roles only. It never authenticates against the Rust API.
export async function enterDemo(role: string) {
  if (!(await demoEnabled()) || (role !== "admin" && role !== "manufacturer"))
    redirect("/login?reason=unavailable");
  (await cookies()).set("amtrav_console_demo", role, {
    httpOnly: true,
    sameSite: "strict",
    path: "/",
    maxAge: 3600,
    secure: process.env.AMTRAV_DEMO_HTTPS === "1",
  });
  redirect("/devices");
}
export async function leaveDemo() {
  (await cookies()).delete("amtrav_console_demo");
  redirect("/login");
}

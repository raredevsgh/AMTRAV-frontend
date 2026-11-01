import type { AdminRole } from "./admin-sections";

export type MockAdminSession = {
  displayName: string;
  email: string;
  initials: string;
  role: AdminRole;
};

// F0-3 display data only. F1 will replace this adapter with the server-backed session.
export const mockAdminSession: MockAdminSession = {
  displayName: "Ama Mensah",
  email: "ama.mensah@amortrav.com",
  initials: "AM",
  role: "administrator",
};

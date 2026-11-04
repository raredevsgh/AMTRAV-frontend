"use client";

import { create } from "zustand";

type ConsoleState = {
  search: string;
  status: string;
  setSearch: (search: string) => void;
  setStatus: (status: string) => void;
  reset: () => void;
};

// UI preferences only. Credentials never enter Zustand or browser storage.
export const useConsoleStore = create<ConsoleState>((set) => ({
  search: "",
  status: "all",
  setSearch: (search) => set({ search }),
  setStatus: (status) => set({ status }),
  reset: () => set({ search: "", status: "all" }),
}));

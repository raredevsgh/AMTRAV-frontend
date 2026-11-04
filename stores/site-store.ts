"use client";
import { create } from "zustand";
export type SiteDialog =
  "ios" | "android" | "contact" | "console" | "privacy" | "terms" | null;
type SiteState = {
  dialog: SiteDialog;
  motionPaused: boolean;
  openDialog: (dialog: SiteDialog) => void;
  setMotionPaused: (paused: boolean) => void;
};
export const useSiteStore = create<SiteState>((set) => ({
  dialog: null,
  motionPaused: false,
  openDialog: (dialog) => set({ dialog }),
  setMotionPaused: (motionPaused) => set({ motionPaused }),
}));

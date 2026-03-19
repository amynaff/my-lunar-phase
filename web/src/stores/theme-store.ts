"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type ThemeMode = "light" | "dark";

interface ThemeStore {
  mode: ThemeMode;
  toggle: () => void;
  setMode: (mode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      mode: "light",
      toggle: () =>
        set((state) => {
          const newMode = state.mode === "light" ? "dark" : "light";
          if (typeof document !== "undefined") {
            document.documentElement.classList.toggle("dark", newMode === "dark");
          }
          return { mode: newMode };
        }),
      setMode: (mode) => {
        if (typeof document !== "undefined") {
          document.documentElement.classList.toggle("dark", mode === "dark");
        }
        set({ mode });
      },
    }),
    {
      name: "luna-theme-storage",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state?.mode === "dark" && typeof document !== "undefined") {
          document.documentElement.classList.add("dark");
        }
      },
    }
  )
);

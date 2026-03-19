"use client";

import { Moon, Sun } from "lucide-react";
import { useThemeStore } from "@/stores/theme-store";

export function ThemeToggle() {
  const { mode, toggle } = useThemeStore();

  return (
    <button
      onClick={toggle}
      className="p-2 rounded-xl hover:bg-bg-secondary transition-colors"
      aria-label="Toggle theme"
    >
      {mode === "light" ? (
        <Moon className="h-5 w-5 text-text-secondary" />
      ) : (
        <Sun className="h-5 w-5 text-text-secondary" />
      )}
    </button>
  );
}

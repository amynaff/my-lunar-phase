"use client";

import Link from "next/link";
import { Moon, Sun, Menu, X, LogOut } from "lucide-react";
import { useThemeStore } from "@/stores/theme-store";
import { useSession } from "@/hooks/use-session";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { Sidebar } from "./sidebar";

export function Header() {
  const { mode, toggle } = useThemeStore();
  const { user } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 border-b border-border-light bg-bg-card-solid/95 backdrop-blur">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-xl hover:bg-bg-secondary"
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5 text-text-primary" />
          ) : (
            <Menu className="h-5 w-5 text-text-primary" />
          )}
        </button>

        <Link href="/dashboard" className="font-cormorant text-xl font-semibold text-text-primary">
          MyLunarPhase
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            className="p-2 rounded-xl hover:bg-bg-secondary"
          >
            {mode === "light" ? (
              <Moon className="h-5 w-5 text-text-secondary" />
            ) : (
              <Sun className="h-5 w-5 text-text-secondary" />
            )}
          </button>
          {user && (
            <button
              onClick={() => signOut({ callbackUrl: "/sign-in" })}
              className="p-2 rounded-xl hover:bg-bg-secondary"
            >
              <LogOut className="h-5 w-5 text-text-secondary" />
            </button>
          )}
        </div>
      </header>

      {/* Mobile sidebar overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-64 h-full">
            <Sidebar />
          </div>
        </div>
      )}
    </>
  );
}

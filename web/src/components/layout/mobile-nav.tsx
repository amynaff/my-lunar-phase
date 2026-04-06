"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Apple, Dumbbell, Smile, BookOpen } from "lucide-react";
import { cn } from "@/lib/cn";

const tabs = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/nutrition", label: "Nourish", icon: Apple },
  { href: "/log", label: "Log", icon: Smile },
  { href: "/movement", label: "Move", icon: Dumbbell },
  { href: "/journal", label: "Journal", icon: BookOpen },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around px-4 py-2 pb-[env(safe-area-inset-bottom,8px)] border-t border-border-light bg-[var(--tab-bar)] backdrop-blur">
      {tabs.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href || (href === "/log" && pathname === "/log-mood");
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors",
              isActive ? "text-accent-purple" : "text-text-muted"
            )}
          >
            <Icon className="h-5 w-5" />
            <span className="text-[10px] font-quicksand font-medium">
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

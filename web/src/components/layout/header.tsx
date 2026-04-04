"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Moon, Sun, Menu, X, LogOut, Home, Apple, Dumbbell, Heart, BookOpen, Sparkles, Calendar, MessageCircle, Users, FlaskConical, BarChart3, TrendingUp, GraduationCap, Lightbulb, Settings, CreditCard } from "lucide-react";
import { useThemeStore } from "@/stores/theme-store";
import { useSession } from "@/hooks/use-session";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { cn } from "@/lib/cn";

const mainNav = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/nutrition", label: "Nutrition", icon: Apple },
  { href: "/movement", label: "Movement", icon: Dumbbell },
  { href: "/selfcare", label: "Care", icon: Heart },
  { href: "/journal", label: "Journal", icon: BookOpen },
];

const secondaryNav = [
  { href: "/luna-ai", label: "Luna AI", icon: Sparkles },
  { href: "/log-mood", label: "Log Mood", icon: Moon },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/community", label: "Community", icon: MessageCircle },
  { href: "/partner", label: "Partner", icon: Users },
  { href: "/labs-guide", label: "Labs Guide", icon: FlaskConical },
  { href: "/journal?view=insights", label: "Insights", icon: BarChart3 },
  { href: "/cycle-history", label: "Cycle History", icon: TrendingUp },
  { href: "/hormonal-education", label: "Education", icon: GraduationCap },
];

const bottomNav = [
  { href: "/suggestions", label: "Suggest a Feature", icon: Lightbulb },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/settings/billing", label: "Billing", icon: CreditCard },
];

function MobileSidebar({ onNavigate }: { onNavigate: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full px-4 py-6">
      <Link href="/dashboard" onClick={onNavigate} className="flex items-center gap-2 px-3 mb-8">
        <Moon className="h-7 w-7 text-accent-purple" />
        <span className="font-cormorant text-2xl font-semibold text-text-primary">
          MyLunarPhase
        </span>
      </Link>

      <nav className="flex-1 flex flex-col gap-1">
        <p className="px-3 mb-2 text-xs uppercase tracking-wider text-text-muted font-quicksand font-semibold">
          Main
        </p>
        {mainNav.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-quicksand font-medium transition-colors",
              pathname === href
                ? "bg-accent-purple/15 text-accent-purple"
                : "text-text-secondary hover:bg-bg-secondary hover:text-text-primary"
            )}
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        ))}

        <p className="px-3 mt-6 mb-2 text-xs uppercase tracking-wider text-text-muted font-quicksand font-semibold">
          Features
        </p>
        {secondaryNav.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-quicksand font-medium transition-colors",
              pathname === href
                ? "bg-accent-purple/15 text-accent-purple"
                : "text-text-secondary hover:bg-bg-secondary hover:text-text-primary"
            )}
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="flex flex-col gap-1 pt-4 border-t border-border-light">
        {bottomNav.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-quicksand font-medium transition-colors",
              pathname === href
                ? "bg-accent-purple/15 text-accent-purple"
                : "text-text-secondary hover:bg-bg-secondary hover:text-text-primary"
            )}
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}

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
          <div className="relative w-64 h-full bg-bg-card-solid border-r border-border-light shadow-xl overflow-y-auto">
            <MobileSidebar onNavigate={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}

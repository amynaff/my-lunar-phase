"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Apple, Dumbbell, Heart, MessageCircle, Users, Settings, Sparkles, Moon, FlaskConical, CreditCard, BookOpen, Calendar, GraduationCap, TrendingUp, Lightbulb } from "lucide-react";
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
  { href: "/cycle-history", label: "Cycle History", icon: TrendingUp },
  { href: "/hormonal-education", label: "Education", icon: GraduationCap },
];

const bottomNav = [
  { href: "/suggestions", label: "Suggest a Feature", icon: Lightbulb },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/settings/billing", label: "Billing", icon: CreditCard },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 border-r border-border-light bg-bg-card-solid px-4 py-6">
      <Link href="/dashboard" className="flex items-center gap-2 px-3 mb-8">
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
    </aside>
  );
}

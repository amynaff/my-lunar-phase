"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, X } from "lucide-react";
import { useMoodStore } from "@/stores/mood-store";

export function LoggingNudge() {
  const [show, setShow] = useState(false);
  const entries = useMoodStore((s) => s.entries);

  useEffect(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    const dismissed = localStorage.getItem("luna-nudge-dismissed");
    const alreadyLogged = !!entries[todayStr];
    const hour = new Date().getHours();

    if (!alreadyLogged && hour >= 18 && dismissed !== todayStr) {
      setShow(true);
    }
  }, [entries]);

  function dismiss() {
    const todayStr = new Date().toISOString().split("T")[0];
    localStorage.setItem("luna-nudge-dismissed", todayStr);
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-[18px] border border-accent-purple/20 bg-accent-purple/5 mt-4">
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-accent-purple/15 flex-shrink-0">
        <Bell className="h-4 w-4 text-accent-purple" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-quicksand font-semibold text-text-primary leading-snug">
          Don&apos;t forget to log today 🌙
        </p>
        <p className="text-xs text-text-muted font-quicksand">
          Tracking consistently unlocks your patterns
        </p>
      </div>
      <Link
        href="/log-mood"
        className="text-xs font-quicksand font-semibold text-accent-purple hover:text-accent-purple/80 flex-shrink-0"
      >
        Log now
      </Link>
      <button
        onClick={dismiss}
        className="p-1 rounded-lg hover:bg-bg-secondary flex-shrink-0"
        aria-label="Dismiss"
      >
        <X className="h-3.5 w-3.5 text-text-muted" />
      </button>
    </div>
  );
}

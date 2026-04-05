"use client";

import { useEffect, useState } from "react";
import { X, Download } from "lucide-react";

const VISIT_COUNT_KEY = "mlp_visit_count";
const DISMISSED_KEY = "mlp_pwa_dismissed";
const REQUIRED_VISITS = 3;

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaInstallBanner() {
  const [show, setShow] = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Only show on mobile browsers
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (!isMobile) return;

    // Don't show if already dismissed
    if (localStorage.getItem(DISMISSED_KEY)) return;

    // Don't show if already installed (standalone mode)
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    // Increment visit count
    const visits = parseInt(localStorage.getItem(VISIT_COUNT_KEY) || "0") + 1;
    localStorage.setItem(VISIT_COUNT_KEY, String(visits));

    if (visits < REQUIRED_VISITS) return;

    // Listen for Chrome/Android install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // For iOS, show a manual instruction banner (no install event)
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isIOS) {
      setShow(true);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        dismiss();
      }
    }
  };

  const dismiss = () => {
    localStorage.setItem(DISMISSED_KEY, "1");
    setShow(false);
  };

  if (!show) return null;

  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

  return (
    <div
      className="fixed bottom-4 left-4 right-4 z-50 rounded-2xl p-4 flex items-start gap-3 shadow-lg"
      style={{
        background: "var(--card-bg, #1a0f2e)",
        border: "1px solid var(--border-color, rgba(157,132,237,0.2))",
      }}
    >
      <div className="text-2xl">🌙</div>
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-semibold mb-0.5"
          style={{ fontFamily: "var(--font-quicksand)", color: "var(--text-primary, #f0ebff)" }}
        >
          Add to home screen
        </p>
        <p
          className="text-xs opacity-70"
          style={{ fontFamily: "var(--font-quicksand)", color: "var(--text-primary, #f0ebff)" }}
        >
          {isIOS && !deferredPrompt
            ? 'Tap the share icon then "Add to Home Screen"'
            : "Install MyLunarPhase for quick access"}
        </p>
      </div>
      {deferredPrompt && (
        <button
          onClick={handleInstall}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold shrink-0"
          style={{
            background: "var(--accent-purple, #9d84ed)",
            color: "#fff",
            fontFamily: "var(--font-quicksand)",
          }}
        >
          <Download size={14} />
          Install
        </button>
      )}
      <button
        onClick={dismiss}
        className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
        aria-label="Dismiss"
      >
        <X size={16} style={{ color: "var(--text-primary, #f0ebff)" }} />
      </button>
    </div>
  );
}

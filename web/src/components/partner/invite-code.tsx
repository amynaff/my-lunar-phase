"use client";

import { useState } from "react";
import { Copy, Check, Users, RefreshCw } from "lucide-react";

export function InviteCode() {
  const [code, setCode] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  async function generateCode() {
    setLoading(true);
    try {
      const res = await fetch("/api/partner/invite", { method: "POST" });
      const data = await res.json();
      setCode(data.code);
      setExpiresAt(data.expiresAt);
    } catch {
      // Handle error silently
    } finally {
      setLoading(false);
    }
  }

  async function copyCode() {
    if (!code) return;
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-[20px] border border-border-light bg-bg-card p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-accent-purple/15">
          <Users className="h-5 w-5 text-accent-purple" />
        </div>
        <div>
          <h3 className="font-cormorant text-lg font-semibold text-text-primary">
            Partner Invite
          </h3>
          <p className="text-xs text-text-muted font-quicksand">
            Share your cycle data with a partner
          </p>
        </div>
      </div>

      {code ? (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex-1 px-4 py-3 rounded-xl bg-bg-secondary border border-border-light text-center font-mono text-2xl tracking-[0.3em] text-text-primary font-semibold">
              {code}
            </div>
            <button
              onClick={copyCode}
              className="p-3 rounded-xl border border-border-light hover:bg-bg-secondary"
            >
              {copied ? (
                <Check className="h-5 w-5 text-green-500" />
              ) : (
                <Copy className="h-5 w-5 text-text-secondary" />
              )}
            </button>
          </div>
          {expiresAt && (
            <p className="text-xs text-text-muted font-quicksand text-center">
              Expires {new Date(expiresAt).toLocaleString()}
            </p>
          )}
          <button
            onClick={generateCode}
            disabled={loading}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-border-light text-sm text-text-secondary font-quicksand hover:bg-bg-secondary"
          >
            <RefreshCw className="h-4 w-4" />
            Generate New Code
          </button>
        </div>
      ) : (
        <button
          onClick={generateCode}
          disabled={loading}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-accent-rose to-accent-purple text-white font-quicksand font-semibold"
        >
          {loading ? "Generating..." : "Generate Invite Code"}
        </button>
      )}
    </div>
  );
}

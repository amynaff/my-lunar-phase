"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Heart, Unlink, Loader2 } from "lucide-react";
import { InviteCode } from "@/components/partner/invite-code";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

// Phase meta + partner support tips
const PHASE_META: Record<string, {
  emoji: string;
  color: string;
  name: string;
  subtitle: string;
  supportTips: string[];
}> = {
  menstrual: {
    emoji: "🌑",
    color: "#be185d",
    name: "Menstrual Phase",
    subtitle: "Inner Winter — rest & restoration",
    supportTips: [
      "Offer warmth and quiet — low energy is normal right now",
      "Bring comfort foods or a hot water bottle",
      "Cancel plans guilt-free; cozy nights in are perfect",
      "Ask what they need instead of assuming",
    ],
  },
  follicular: {
    emoji: "🌒",
    color: "#ec4899",
    name: "Follicular Phase",
    subtitle: "Inner Spring — creativity & new beginnings",
    supportTips: [
      "Energy is rising — great time for new adventures together",
      "Encourage their ideas and projects",
      "Try a new restaurant, hike, or activity",
      "They're social and collaborative now; make plans!",
    ],
  },
  ovulatory: {
    emoji: "🌕",
    color: "#f9a8d4",
    name: "Ovulatory Phase",
    subtitle: "Inner Summer — peak energy & connection",
    supportTips: [
      "Peak social and communicative energy — quality time counts",
      "Great week for important conversations",
      "Plan date nights, social events, or shared workouts",
      "They feel their most confident and radiant",
    ],
  },
  luteal: {
    emoji: "🌘",
    color: "#9333ea",
    name: "Luteal Phase",
    subtitle: "Inner Autumn — introspection & slowdown",
    supportTips: [
      "Give extra space and patience — emotions may run higher",
      "Help reduce their to-do list and stress load",
      "Dark chocolate and magnesium-rich snacks are appreciated",
      "Don't take withdrawal personally — it's hormonal, not personal",
    ],
  },
};

interface PartnerStatus {
  hasPartner: boolean;
  partnerName?: string;
  connectedSince?: string;
}

interface PartnerData {
  currentPhase?: string;
  dayOfCycle?: number;
  daysUntilNextPeriod?: number;
  lifeStage?: string;
}

export default function PartnerPage() {
  const [acceptCode, setAcceptCode] = useState("");
  const [isAccepting, setIsAccepting] = useState(false);
  const [acceptError, setAcceptError] = useState("");
  const [status, setStatus] = useState<PartnerStatus | null>(null);
  const [partnerData, setPartnerData] = useState<PartnerData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDisconnect, setShowDisconnect] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  useEffect(() => {
    async function fetchStatus() {
      try {
        const res = await fetch("/api/partner/status");
        if (res.ok) {
          const data = await res.json();
          setStatus(data);
          if (data.hasPartner) {
            const partnerRes = await fetch("/api/partner/partner-data");
            if (partnerRes.ok) {
              setPartnerData(await partnerRes.json());
            }
          }
        }
      } catch {
        // Handle error silently
      } finally {
        setIsLoading(false);
      }
    }
    fetchStatus();
  }, []);

  async function handleAcceptInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!acceptCode.trim()) return;
    setAcceptError("");
    setIsAccepting(true);

    try {
      const res = await fetch("/api/partner/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: acceptCode }),
      });

      if (!res.ok) {
        const data = await res.json();
        setAcceptError(data.error || "Invalid invite code.");
        return;
      }

      window.location.reload();
    } catch {
      setAcceptError("Something went wrong. Please try again.");
    } finally {
      setIsAccepting(false);
    }
  }

  async function handleDisconnect() {
    setIsDisconnecting(true);
    try {
      const res = await fetch("/api/partner/disconnect", { method: "POST" });
      if (res.ok) {
        setStatus({ hasPartner: false });
        setPartnerData(null);
        setShowDisconnect(false);
      }
    } catch {
      // Handle error silently
    } finally {
      setIsDisconnecting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-6 w-6 animate-spin text-accent-purple" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 lg:px-8 py-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-accent-purple/15">
            <Users className="h-5 w-5 text-accent-purple" />
          </div>
          <div>
            <h1 className="font-cormorant text-3xl font-semibold text-text-primary">
              Partner
            </h1>
            <p className="text-sm text-text-secondary font-quicksand">
              Share your cycle insights with a partner
            </p>
          </div>
        </div>
      </motion.div>

      {status?.hasPartner ? (
        /* Connected State */
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[20px] border border-accent-purple/20 bg-accent-purple/5 p-6 text-center"
          >
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-accent-purple/15 mx-auto mb-4">
              <Heart className="h-7 w-7 text-accent-purple" />
            </div>
            <h2 className="font-cormorant text-2xl font-semibold text-text-primary">
              Connected with {status.partnerName || "Partner"}
            </h2>
            {status.connectedSince && (
              <p className="text-xs text-text-muted font-quicksand mt-1">
                Connected since {new Date(status.connectedSince).toLocaleDateString()}
              </p>
            )}
          </motion.div>

          {/* Partner Cycle Data */}
          {partnerData && (() => {
            const phase = partnerData.currentPhase?.toLowerCase();
            const meta = phase ? PHASE_META[phase] : null;
            return (
              <>
                {/* Phase banner */}
                {meta && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-[20px] border p-5"
                    style={{
                      borderColor: `${meta.color}30`,
                      background: `linear-gradient(135deg, ${meta.color}12, ${meta.color}06)`,
                    }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-3xl">{meta.emoji}</span>
                      <div>
                        <p className="font-cormorant text-lg font-semibold text-text-primary">
                          {meta.name}
                        </p>
                        <p className="text-xs text-text-muted font-quicksand">{meta.subtitle}</p>
                      </div>
                      {partnerData.dayOfCycle && (
                        <span
                          className="ml-auto text-xs font-quicksand font-semibold px-2.5 py-1 rounded-full"
                          style={{ backgroundColor: `${meta.color}20`, color: meta.color }}
                        >
                          Day {partnerData.dayOfCycle}
                        </span>
                      )}
                    </div>

                    {partnerData.daysUntilNextPeriod !== undefined && (
                      <p className="text-xs text-text-secondary font-quicksand mb-1">
                        Next period in <span className="font-semibold" style={{ color: meta.color }}>{partnerData.daysUntilNextPeriod} days</span>
                      </p>
                    )}
                  </motion.div>
                )}

                {/* Support tips */}
                {meta && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="rounded-[20px] border border-border-light bg-bg-card p-5"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Heart className="h-4 w-4 text-accent-pink" />
                      <h3 className="text-xs uppercase tracking-wider text-text-accent font-quicksand font-semibold">
                        How to Support Right Now
                      </h3>
                    </div>
                    <ul className="space-y-2">
                      {meta.supportTips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <span className="text-accent-pink mt-0.5 text-xs">✦</span>
                          <span className="text-sm font-quicksand text-text-secondary leading-relaxed">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}

                {/* Stats row */}
                {!meta && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-[20px] border border-border-light bg-bg-card p-5"
                  >
                    <h3 className="text-xs uppercase tracking-wider text-text-accent font-quicksand font-semibold mb-4">
                      Partner&apos;s Cycle
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {partnerData.dayOfCycle && (
                        <div className="p-3 rounded-[16px] bg-bg-secondary">
                          <p className="text-[10px] text-text-muted font-quicksand">Day of Cycle</p>
                          <p className="font-quicksand font-semibold text-sm text-text-primary mt-0.5">
                            Day {partnerData.dayOfCycle}
                          </p>
                        </div>
                      )}
                      {partnerData.daysUntilNextPeriod !== undefined && (
                        <div className="p-3 rounded-[16px] bg-bg-secondary">
                          <p className="text-[10px] text-text-muted font-quicksand">Next Period</p>
                          <p className="font-quicksand font-semibold text-sm text-text-primary mt-0.5">
                            {partnerData.daysUntilNextPeriod} days
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </>
            );
          })()}

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Button
              variant="outline"
              onClick={() => setShowDisconnect(true)}
              className="text-red-500 border-red-500/20 hover:bg-red-500/5"
            >
              <Unlink className="h-4 w-4" />
              Disconnect Partner
            </Button>
          </motion.div>
        </div>
      ) : (
        /* Not Connected State */
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <InviteCode />
          </motion.div>

          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-border-light" />
            <span className="text-xs text-text-muted font-quicksand">or accept an invite</span>
            <div className="flex-1 h-px bg-border-light" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-[20px] border border-border-light bg-bg-card p-6"
          >
            <h3 className="font-cormorant text-lg font-semibold text-text-primary mb-4">
              Accept an Invite
            </h3>

            <form onSubmit={handleAcceptInvite} className="space-y-3">
              {acceptError && (
                <p className="text-xs text-red-500 font-quicksand">{acceptError}</p>
              )}
              <Input
                value={acceptCode}
                onChange={(e) => setAcceptCode(e.target.value.toUpperCase())}
                placeholder="Enter invite code"
                className="font-mono text-center tracking-[0.2em] text-lg"
                maxLength={8}
              />
              <Button type="submit" disabled={isAccepting || !acceptCode.trim()} className="w-full">
                {isAccepting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  "Accept Invite"
                )}
              </Button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Disconnect Dialog */}
      <Dialog open={showDisconnect} onOpenChange={setShowDisconnect}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disconnect Partner</DialogTitle>
            <DialogDescription>
              Your partner will no longer be able to see your cycle data. You can reconnect anytime with a new invite code.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDisconnect(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDisconnect}
              disabled={isDisconnecting}
            >
              {isDisconnecting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Disconnecting...
                </>
              ) : (
                "Disconnect"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

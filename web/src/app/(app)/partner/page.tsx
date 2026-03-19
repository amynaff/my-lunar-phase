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
          {partnerData && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-[20px] border border-border-light bg-bg-card p-6"
            >
              <h3 className="text-xs uppercase tracking-wider text-text-accent font-quicksand font-semibold mb-4">
                Partner&apos;s Cycle
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {partnerData.currentPhase && (
                  <div className="p-3 rounded-[16px] bg-bg-secondary">
                    <p className="text-[10px] text-text-muted font-quicksand">Current Phase</p>
                    <p className="font-quicksand font-semibold text-sm text-text-primary capitalize mt-0.5">
                      {partnerData.currentPhase}
                    </p>
                  </div>
                )}
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
                {partnerData.lifeStage && (
                  <div className="p-3 rounded-[16px] bg-bg-secondary">
                    <p className="text-[10px] text-text-muted font-quicksand">Life Stage</p>
                    <p className="font-quicksand font-semibold text-sm text-text-primary capitalize mt-0.5">
                      {partnerData.lifeStage}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

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

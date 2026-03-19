"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Settings, Moon, Calendar, Trash2, CreditCard, Loader2 } from "lucide-react";
import Link from "next/link";
import { useCycleStore } from "@/stores/cycle-store";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { useThemeStore } from "@/stores/theme-store";
import { lifeStageInfo } from "@/lib/cycle/data";
import type { LifeStage } from "@/lib/cycle/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const lifeStages: LifeStage[] = ["regular", "perimenopause", "menopause", "postmenopause"];

export default function SettingsPage() {
  const {
    lifeStage,
    cycleLength,
    periodLength,
    lastPeriodStart,
    setLifeStage,
    setCycleLength,
    setPeriodLength,
    setLastPeriodStart,
  } = useCycleStore();
  const { mode } = useThemeStore();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  async function handleDeleteAccount() {
    if (deleteConfirmText !== "DELETE") return;
    setIsDeleting(true);

    try {
      const res = await fetch("/api/user/delete-account", { method: "DELETE" });
      if (res.ok) {
        window.location.href = "/";
      }
    } catch {
      // Handle error silently
    } finally {
      setIsDeleting(false);
    }
  }

  const lastPeriodDate = lastPeriodStart
    ? new Date(lastPeriodStart).toISOString().split("T")[0]
    : "";

  return (
    <div className="max-w-2xl mx-auto px-4 lg:px-8 py-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-accent-purple/15">
            <Settings className="h-5 w-5 text-accent-purple" />
          </div>
          <div>
            <h1 className="font-cormorant text-3xl font-semibold text-text-primary">
              Settings
            </h1>
            <p className="text-sm text-text-secondary font-quicksand">
              Customize your experience
            </p>
          </div>
        </div>
      </motion.div>

      <div className="space-y-6">
        {/* Life Stage */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-[20px] border border-border-light bg-bg-card p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Moon className="h-4 w-4 text-accent-purple" />
            <h2 className="text-xs uppercase tracking-wider text-text-accent font-quicksand font-semibold">
              Life Stage
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {lifeStages.map((stage) => {
              const info = lifeStageInfo[stage];
              const isSelected = lifeStage === stage;
              return (
                <button
                  key={stage}
                  onClick={() => setLifeStage(stage)}
                  className={`flex items-center gap-3 p-3 rounded-[16px] border transition-colors text-left ${
                    isSelected
                      ? "border-accent-purple bg-accent-purple/10"
                      : "border-border-light bg-bg-secondary/50 hover:bg-bg-secondary"
                  }`}
                >
                  <span className="text-xl">{info.emoji}</span>
                  <div>
                    <p className="font-quicksand font-semibold text-xs text-text-primary">
                      {info.name}
                    </p>
                    <p className="text-[10px] text-text-muted font-quicksand">
                      {info.ageRange}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Cycle Configuration */}
        {lifeStage === "regular" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-[20px] border border-border-light bg-bg-card p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-4 w-4 text-accent-pink" />
              <h2 className="text-xs uppercase tracking-wider text-text-accent font-quicksand font-semibold">
                Cycle Configuration
              </h2>
            </div>

            <div className="space-y-5">
              <div>
                <label className="text-xs text-text-secondary font-quicksand font-medium">
                  Last Period Start Date
                </label>
                <input
                  type="date"
                  value={lastPeriodDate}
                  onChange={(e) => setLastPeriodStart(new Date(e.target.value))}
                  max={new Date().toISOString().split("T")[0]}
                  className="w-full mt-1.5 px-4 py-3 rounded-2xl border border-border-light bg-bg-input text-text-primary font-quicksand text-sm focus:outline-none focus:border-accent-purple"
                />
              </div>

              <div>
                <label className="text-xs text-text-secondary font-quicksand font-medium">
                  Cycle Length: {cycleLength} days
                </label>
                <input
                  type="range"
                  min={21}
                  max={40}
                  value={cycleLength}
                  onChange={(e) => setCycleLength(Number(e.target.value))}
                  className="w-full mt-1.5 accent-accent-purple"
                />
                <div className="flex justify-between text-[10px] text-text-muted font-quicksand">
                  <span>21 days</span>
                  <span>40 days</span>
                </div>
              </div>

              <div>
                <label className="text-xs text-text-secondary font-quicksand font-medium">
                  Period Length: {periodLength} days
                </label>
                <input
                  type="range"
                  min={2}
                  max={10}
                  value={periodLength}
                  onChange={(e) => setPeriodLength(Number(e.target.value))}
                  className="w-full mt-1.5 accent-accent-pink"
                />
                <div className="flex justify-between text-[10px] text-text-muted font-quicksand">
                  <span>2 days</span>
                  <span>10 days</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Theme */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-[20px] border border-border-light bg-bg-card p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xs uppercase tracking-wider text-text-accent font-quicksand font-semibold">
                Appearance
              </h2>
              <p className="text-sm text-text-secondary font-quicksand mt-1">
                Currently using {mode} mode
              </p>
            </div>
            <ThemeToggle />
          </div>
        </motion.div>

        {/* Billing */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Link
            href="/settings/billing"
            className="flex items-center justify-between rounded-[20px] border border-border-light bg-bg-card p-6 hover:bg-bg-secondary/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-accent-purple" />
              <div>
                <p className="font-quicksand font-semibold text-sm text-text-primary">
                  Billing & Subscription
                </p>
                <p className="text-xs text-text-muted font-quicksand">
                  Manage your plan and payment method
                </p>
              </div>
            </div>
            <span className="text-text-muted text-sm">&rarr;</span>
          </Link>
        </motion.div>

        {/* Delete Account */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-[20px] border border-red-500/20 bg-red-500/5 p-6"
        >
          <div className="flex items-center gap-2 mb-2">
            <Trash2 className="h-4 w-4 text-red-500" />
            <h2 className="text-xs uppercase tracking-wider text-red-500 font-quicksand font-semibold">
              Danger Zone
            </h2>
          </div>
          <p className="text-sm text-text-secondary font-quicksand mb-4">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="h-4 w-4" />
            Delete Account
          </Button>
        </motion.div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription>
              This will permanently delete your account, all mood entries, cycle data, and community posts.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4">
            <label className="text-xs text-text-secondary font-quicksand font-medium">
              Type <span className="font-semibold text-red-500">DELETE</span> to confirm
            </label>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="DELETE"
              className="w-full mt-1.5 px-4 py-3 rounded-2xl border border-red-500/30 bg-bg-input text-text-primary font-quicksand text-sm focus:outline-none focus:border-red-500"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deleteConfirmText !== "DELETE" || isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Account"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

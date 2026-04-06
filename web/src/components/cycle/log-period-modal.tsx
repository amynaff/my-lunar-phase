"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Droplets } from "lucide-react";
import { useCycleStore } from "@/stores/cycle-store";
import { useMoodStore, type FlowIntensity } from "@/stores/mood-store";

interface LogPeriodModalProps {
  open: boolean;
  onClose: () => void;
}

const FLOW_OPTIONS: { value: FlowIntensity; label: string; dots: number }[] = [
  { value: "spotting", label: "Spotting", dots: 1 },
  { value: "light", label: "Light", dots: 2 },
  { value: "medium", label: "Medium", dots: 3 },
  { value: "heavy", label: "Heavy", dots: 4 },
];

export function LogPeriodModal({ open, onClose }: LogPeriodModalProps) {
  const { setLastPeriodStart } = useCycleStore();
  const { setEntry, getEntry } = useMoodStore();
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [flow, setFlow] = useState<FlowIntensity>("medium");
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setLastPeriodStart(new Date(startDate));

    // Also update today's mood entry with the flow data
    const today = new Date().toISOString().split("T")[0];
    if (startDate === today) {
      const existing = getEntry(today);
      setEntry({
        date: today,
        mood: existing?.mood ?? 3,
        energy: existing?.energy ?? 3,
        symptoms: existing?.symptoms ?? [],
        flow,
        notes: notes || existing?.notes,
        synced: false,
      });
    }

    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1200);
  }

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.95 }}
          className="w-full max-w-sm rounded-[20px] border border-border-light bg-bg-primary shadow-xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border-light">
            <button onClick={onClose} className="p-2 rounded-full hover:bg-bg-secondary">
              <X className="h-5 w-5 text-text-secondary" />
            </button>
            <div className="flex items-center gap-2">
              <Droplets className="h-4 w-4 text-accent-pink" />
              <span className="font-quicksand font-semibold text-text-primary">Log Period</span>
            </div>
            <div className="w-9" />
          </div>

          <div className="p-5 space-y-5">
            {/* Start date */}
            <div>
              <label className="text-xs uppercase tracking-wider text-text-accent font-quicksand font-semibold mb-2 block">
                Period Start Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-border-light bg-bg-card text-sm font-quicksand text-text-primary focus:outline-none focus:border-accent-pink"
                />
              </div>
            </div>

            {/* Quick buttons */}
            <div>
              <p className="text-xs text-text-muted font-quicksand mb-2">Quick select</p>
              <div className="flex gap-2">
                {[
                  { label: "Today", days: 0 },
                  { label: "Yesterday", days: 1 },
                  { label: "2 days ago", days: 2 },
                  { label: "3 days ago", days: 3 },
                ].map(({ label, days }) => {
                  const d = new Date();
                  d.setDate(d.getDate() - days);
                  const dateStr = d.toISOString().split("T")[0];
                  const isSelected = startDate === dateStr;
                  return (
                    <button
                      key={label}
                      onClick={() => setStartDate(dateStr)}
                      className={`flex-1 py-2 rounded-xl text-xs font-quicksand font-medium transition-colors ${
                        isSelected
                          ? "bg-accent-pink/15 text-accent-pink border border-accent-pink/30"
                          : "bg-bg-card border border-border-light text-text-secondary hover:bg-bg-secondary"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Flow intensity */}
            <div>
              <label className="text-xs uppercase tracking-wider text-text-accent font-quicksand font-semibold mb-2 block">
                Flow Intensity
              </label>
              <div className="flex gap-2">
                {FLOW_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setFlow(opt.value)}
                    className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border text-xs font-quicksand font-medium transition-colors ${
                      flow === opt.value
                        ? "bg-accent-pink/15 border-accent-pink/40 text-accent-pink"
                        : "bg-bg-card border-border-light text-text-muted hover:bg-bg-secondary"
                    }`}
                  >
                    <span className="flex gap-0.5">
                      {Array.from({ length: opt.dots }).map((_, i) => (
                        <span
                          key={i}
                          className={`w-1.5 h-1.5 rounded-full ${
                            flow === opt.value ? "bg-accent-pink" : "bg-text-muted"
                          }`}
                        />
                      ))}
                    </span>
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="text-xs uppercase tracking-wider text-text-accent font-quicksand font-semibold mb-2 block">
                Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any notes about this period..."
                rows={2}
                className="w-full px-4 py-3 rounded-2xl border border-border-light bg-bg-card text-sm font-quicksand text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-pink resize-none"
              />
            </div>

            {/* Save */}
            <button
              onClick={handleSave}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-accent-rose to-accent-purple text-white font-quicksand font-semibold transition-opacity hover:opacity-90"
            >
              {saved ? "Saved! ✓" : "Log Period Start"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

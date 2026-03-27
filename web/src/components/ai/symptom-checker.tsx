"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Activity, Send } from "lucide-react";
import {
  availableSymptoms,
  categoryNames,
  severityConfig,
  getSymptomsByCategory,
  getSymptomById,
  useSymptomStore,
  type SymptomCategory,
  type SymptomSeverity,
  type SymptomLog,
} from "@/stores/symptom-store";
import { useCycleData } from "@/hooks/use-cycle-data";

interface SymptomCheckerProps {
  open: boolean;
  onClose: () => void;
  onAnalyze: (summary: string) => void;
}

const categories: SymptomCategory[] = ["physical", "emotional", "energy", "digestive", "sleep", "skin", "other"];

export function SymptomChecker({ open, onClose, onAnalyze }: SymptomCheckerProps) {
  const { currentPhase, dayOfCycle, isRegular, currentMoonPhase } = useCycleData();
  const { logSymptoms } = useSymptomStore();

  const [activeCategory, setActiveCategory] = useState<SymptomCategory>("physical");
  const [selectedSymptoms, setSelectedSymptoms] = useState<SymptomLog[]>([]);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open) {
      setSelectedSymptoms([]);
      setNotes("");
      setActiveCategory("physical");
    }
  }, [open]);

  function toggleSymptom(symptomId: string) {
    setSelectedSymptoms((prev) => {
      const existing = prev.find((s) => s.symptomId === symptomId);
      if (existing) return prev.filter((s) => s.symptomId !== symptomId);
      return [...prev, { symptomId, severity: "moderate" as SymptomSeverity }];
    });
  }

  function setSeverity(symptomId: string, severity: SymptomSeverity) {
    setSelectedSymptoms((prev) =>
      prev.map((s) => (s.symptomId === symptomId ? { ...s, severity } : s))
    );
  }

  function handleAnalyze() {
    if (selectedSymptoms.length === 0) return;

    const today = new Date().toISOString().split("T")[0];
    logSymptoms(today, selectedSymptoms, isRegular ? currentPhase : null, isRegular ? dayOfCycle : null, notes);

    const symptomSummary = selectedSymptoms
      .map((s) => {
        const def = getSymptomById(s.symptomId);
        return `${def?.name || s.symptomId} (${s.severity})`;
      })
      .join(", ");

    const context = isRegular
      ? `I'm on day ${dayOfCycle} of my cycle (${currentPhase} phase)`
      : `Current moon phase: ${currentMoonPhase}`;

    const message = `I'm experiencing these symptoms: ${symptomSummary}. ${context}.${notes ? ` Additional notes: ${notes}` : ""} Can you help me understand what might be going on and what I can do to feel better?`;

    onAnalyze(message);
    onClose();
  }

  if (!open) return null;

  const categorySymptoms = getSymptomsByCategory(activeCategory);

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
          className="w-full max-w-lg max-h-[85vh] rounded-[20px] border border-border-light bg-bg-primary shadow-xl flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border-light shrink-0">
            <button onClick={onClose} className="p-2 rounded-full hover:bg-bg-secondary">
              <X className="h-5 w-5 text-text-secondary" />
            </button>
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-accent-pink" />
              <span className="font-quicksand font-semibold text-text-primary">Symptom Checker</span>
            </div>
            <button
              onClick={handleAnalyze}
              disabled={selectedSymptoms.length === 0}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-accent-purple text-white text-xs font-quicksand font-semibold disabled:opacity-40"
            >
              <Send className="h-3 w-3" />
              Analyze
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* Selected symptoms */}
            {selectedSymptoms.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-wider text-text-accent font-quicksand font-semibold mb-2">
                  Selected ({selectedSymptoms.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedSymptoms.map((s) => {
                    const def = getSymptomById(s.symptomId);
                    const sev = severityConfig[s.severity];
                    return (
                      <div key={s.symptomId} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border" style={{ borderColor: sev.color, backgroundColor: `${sev.color}15` }}>
                        <span className="text-sm">{def?.icon}</span>
                        <span className="text-xs font-quicksand font-medium" style={{ color: sev.color }}>{def?.name}</span>
                        <div className="flex gap-0.5 ml-1">
                          {(["mild", "moderate", "severe"] as SymptomSeverity[]).map((sev) => (
                            <button
                              key={sev}
                              onClick={() => setSeverity(s.symptomId, sev)}
                              className={`w-2 h-2 rounded-full transition-all ${
                                s.severity === sev ? "" : "opacity-30"
                              }`}
                              style={{ backgroundColor: severityConfig[sev].color }}
                              title={severityConfig[sev].label}
                            />
                          ))}
                        </div>
                        <button onClick={() => toggleSymptom(s.symptomId)} className="ml-1">
                          <X className="h-3 w-3 text-text-muted" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Category tabs */}
            <div className="flex gap-1 overflow-x-auto pb-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-quicksand font-medium whitespace-nowrap transition-colors ${
                    activeCategory === cat
                      ? "bg-accent-purple/15 text-accent-purple"
                      : "bg-bg-secondary text-text-muted hover:text-text-secondary"
                  }`}
                >
                  {categoryNames[cat]}
                </button>
              ))}
            </div>

            {/* Symptoms grid */}
            <div className="grid grid-cols-2 gap-2">
              {categorySymptoms.map((symptom) => {
                const isSelected = selectedSymptoms.some((s) => s.symptomId === symptom.id);
                return (
                  <button
                    key={symptom.id}
                    onClick={() => toggleSymptom(symptom.id)}
                    className={`flex items-center gap-2 px-3 py-3 rounded-xl border text-left transition-colors ${
                      isSelected
                        ? "bg-accent-purple/10 border-accent-purple/30"
                        : "bg-bg-card border-border-light hover:bg-bg-secondary/50"
                    }`}
                  >
                    <span className="text-lg">{symptom.icon}</span>
                    <span className={`text-xs font-quicksand ${isSelected ? "text-accent-purple font-semibold" : "text-text-secondary"}`}>
                      {symptom.name}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Notes */}
            <div>
              <p className="text-xs uppercase tracking-wider text-text-accent font-quicksand font-semibold mb-2">
                Additional Notes
              </p>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Anything else you'd like Luna to know..."
                rows={2}
                className="w-full px-4 py-3 rounded-2xl border border-border-light bg-bg-card text-sm font-quicksand text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-purple resize-none"
              />
            </div>

            {/* Severity legend */}
            <div className="flex items-center gap-4 pt-2">
              <span className="text-[10px] text-text-muted font-quicksand">Severity:</span>
              {(["mild", "moderate", "severe"] as SymptomSeverity[]).map((sev) => (
                <div key={sev} className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: severityConfig[sev].color }} />
                  <span className="text-[10px] text-text-muted font-quicksand">{severityConfig[sev].label}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

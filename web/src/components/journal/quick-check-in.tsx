"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Check } from "lucide-react";
import { useJournalStore, journalTags } from "@/stores/journal-store";
import { useCycleData } from "@/hooks/use-cycle-data";
import { phaseInfo } from "@/lib/cycle/data";

const moodEmojis = [
  { value: 1, emoji: "😢", label: "Sad" },
  { value: 2, emoji: "😕", label: "Low" },
  { value: 3, emoji: "😐", label: "Okay" },
  { value: 4, emoji: "🙂", label: "Good" },
  { value: 5, emoji: "😊", label: "Great" },
];

interface QuickCheckInProps {
  open: boolean;
  onClose: () => void;
}

export function QuickCheckIn({ open, onClose }: QuickCheckInProps) {
  const { currentPhase, dayOfCycle, isRegular } = useCycleData();
  const { addEntry } = useJournalStore();

  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);

  const maxChars = 280;

  useEffect(() => {
    if (open) {
      setSelectedMood(null);
      setNote("");
      setSelectedTags([]);
      setSaved(false);
    }
  }, [open]);

  function toggleTag(tagId: string) {
    setSelectedTags((prev) => (prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]));
  }

  function handleCheckIn() {
    if (!selectedMood && !note.trim() && selectedTags.length === 0) return;

    addEntry({
      date: new Date().toISOString(),
      content: note.trim() || `Quick check-in: feeling ${moodEmojis.find((m) => m.value === selectedMood)?.label || "okay"}`,
      mood: selectedMood || undefined,
      tags: selectedTags,
      cyclePhase: currentPhase,
      dayOfCycle,
    });

    setSaved(true);
    setTimeout(() => onClose(), 1000);
  }

  if (!open) return null;

  const phaseData = phaseInfo[currentPhase];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="w-full sm:max-w-md rounded-t-[24px] sm:rounded-[24px] border border-border-light bg-bg-primary shadow-xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Handle bar (mobile) */}
          <div className="flex justify-center pt-3 pb-1 sm:hidden">
            <div className="w-10 h-1 rounded-full bg-border-light" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3">
            <button onClick={onClose} className="p-2 rounded-full hover:bg-bg-secondary">
              <X className="h-5 w-5 text-text-secondary" />
            </button>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-accent-purple" />
              <span className="font-quicksand font-semibold text-text-primary">Quick Check-In</span>
            </div>
            <button
              onClick={handleCheckIn}
              disabled={saved}
              className="px-4 py-1.5 rounded-full bg-accent-purple text-white text-sm font-quicksand font-semibold disabled:opacity-50"
            >
              {saved ? "Saved!" : "Check In"}
            </button>
          </div>

          <div className="px-5 pb-6 space-y-5">
            {/* Phase badge */}
            {isRegular && (
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-quicksand font-medium"
                style={{ backgroundColor: `${phaseData?.color || "#9333ea"}20`, color: phaseData?.color || "#9333ea" }}
              >
                <span>{phaseData?.emoji}</span>
                <span>{phaseData?.name} Phase — Day {dayOfCycle}</span>
              </div>
            )}

            {/* Mood */}
            <div>
              <p className="text-sm font-quicksand font-semibold text-text-primary mb-3">How are you feeling?</p>
              <div className="flex justify-between p-3 rounded-2xl border border-border-light bg-bg-card">
                {moodEmojis.map((m) => (
                  <button
                    key={m.value}
                    onClick={() => setSelectedMood(selectedMood === m.value ? null : m.value)}
                    className="flex flex-col items-center gap-1 flex-1"
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all ${
                        selectedMood === m.value ? "bg-accent-purple/20 ring-2 ring-accent-purple" : ""
                      }`}
                    >
                      {m.emoji}
                    </div>
                    <span
                      className={`text-[10px] font-quicksand ${
                        selectedMood === m.value ? "text-accent-purple font-semibold" : "text-text-muted"
                      }`}
                    >
                      {m.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick note */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-quicksand font-semibold text-text-primary">Quick thought</p>
                <span className={`text-xs font-quicksand ${note.length > maxChars ? "text-red-500" : "text-text-muted"}`}>
                  {note.length}/{maxChars}
                </span>
              </div>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="What's on your mind?"
                rows={3}
                maxLength={300}
                className="w-full px-4 py-3 rounded-2xl border border-border-light bg-bg-card text-sm font-quicksand text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-purple resize-none"
              />
            </div>

            {/* Tags */}
            <div>
              <p className="text-sm font-quicksand font-semibold text-text-primary mb-3">Add tags</p>
              <div className="flex flex-wrap gap-2">
                {journalTags.map((tag) => {
                  const selected = selectedTags.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      onClick={() => toggleTag(tag.id)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-full border text-xs font-quicksand transition-colors ${
                        selected
                          ? "bg-accent-purple/15 border-accent-purple text-accent-purple font-semibold"
                          : "bg-bg-card border-border-light text-text-secondary"
                      }`}
                    >
                      <span>{tag.emoji}</span>
                      <span>{tag.label}</span>
                      {selected && <Check className="h-3 w-3" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useMoodStore, getMoodColor, getEnergyColor } from "@/stores/mood-store";
import { useCycleData } from "@/hooks/use-cycle-data";

const moodLabels = ["Very Low", "Low", "Neutral", "Good", "Great"];
const energyLabels = ["Exhausted", "Low", "Moderate", "High", "Energized"];

export function MoodEntryForm() {
  const [mood, setMood] = useState(3);
  const [energy, setEnergy] = useState(3);
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);
  const { setEntry } = useMoodStore();
  const { currentPhase, dayOfCycle } = useCycleData();

  const today = new Date().toISOString().split("T")[0];

  async function handleSave() {
    const entry = {
      date: today,
      mood,
      energy,
      notes: notes || undefined,
      cyclePhase: currentPhase,
      dayOfCycle,
      synced: false,
    };

    setEntry(entry);

    try {
      await fetch("/api/mood/entry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
      });
      setEntry({ ...entry, synced: true });
    } catch {
      // Stays in local cache, will sync later
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[20px] border border-border-light bg-bg-card p-6 space-y-6"
    >
      {/* Mood slider */}
      <div>
        <label className="text-xs uppercase tracking-wider text-text-accent font-quicksand font-semibold">
          Mood
        </label>
        <div className="flex items-center gap-4 mt-3">
          <input
            type="range"
            min={1}
            max={5}
            value={mood}
            onChange={(e) => setMood(Number(e.target.value))}
            className="flex-1 accent-accent-purple"
          />
          <span
            className="text-sm font-quicksand font-semibold min-w-[72px] text-center px-3 py-1 rounded-xl"
            style={{ backgroundColor: `${getMoodColor(mood)}20`, color: getMoodColor(mood) }}
          >
            {moodLabels[mood - 1]}
          </span>
        </div>
      </div>

      {/* Energy slider */}
      <div>
        <label className="text-xs uppercase tracking-wider text-text-accent font-quicksand font-semibold">
          Energy
        </label>
        <div className="flex items-center gap-4 mt-3">
          <input
            type="range"
            min={1}
            max={5}
            value={energy}
            onChange={(e) => setEnergy(Number(e.target.value))}
            className="flex-1 accent-accent-pink"
          />
          <span
            className="text-sm font-quicksand font-semibold min-w-[72px] text-center px-3 py-1 rounded-xl"
            style={{ backgroundColor: `${getEnergyColor(energy)}20`, color: getEnergyColor(energy) }}
          >
            {energyLabels[energy - 1]}
          </span>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="text-xs uppercase tracking-wider text-text-accent font-quicksand font-semibold">
          Notes (optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="How are you feeling today?"
          rows={3}
          className="w-full mt-3 px-4 py-3 rounded-2xl border border-border-light bg-bg-input text-text-primary font-quicksand text-sm placeholder:text-text-muted focus:outline-none focus:border-accent-purple resize-none"
        />
      </div>

      <button
        onClick={handleSave}
        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-accent-rose to-accent-purple text-white font-quicksand font-semibold transition-opacity hover:opacity-90"
      >
        {saved ? "Saved!" : "Save Entry"}
      </button>
    </motion.div>
  );
}

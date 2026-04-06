"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useMoodStore, getMoodColor, getEnergyColor, type FlowIntensity } from "@/stores/mood-store";
import { Moon, Droplets, Plus, Minus } from "lucide-react";
import { useCycleData } from "@/hooks/use-cycle-data";

const moodLabels = ["Very Low", "Low", "Neutral", "Good", "Great"];
const energyLabels = ["Exhausted", "Low", "Moderate", "High", "Energized"];

const SYMPTOM_GROUPS = [
  {
    label: "Physical",
    symptoms: [
      { id: "cramps", emoji: "🌀", label: "Cramps" },
      { id: "bloating", emoji: "💧", label: "Bloating" },
      { id: "headache", emoji: "🤕", label: "Headache" },
      { id: "migraine", emoji: "⚡", label: "Migraine" },
      { id: "tender_breasts", emoji: "💗", label: "Tender Breasts" },
      { id: "backache", emoji: "🔴", label: "Backache" },
      { id: "fatigue", emoji: "😴", label: "Fatigue" },
      { id: "nausea", emoji: "🤢", label: "Nausea" },
      { id: "acne", emoji: "✨", label: "Acne" },
      { id: "hot_flashes", emoji: "🔥", label: "Hot Flashes" },
      { id: "insomnia", emoji: "🌙", label: "Insomnia" },
      { id: "joint_pain", emoji: "🦴", label: "Joint Pain" },
      { id: "pelvic_pain", emoji: "🌺", label: "Pelvic Pain" },
      { id: "spotting", emoji: "🩷", label: "Spotting" },
    ],
  },
  {
    label: "Emotional",
    symptoms: [
      { id: "anxious", emoji: "😰", label: "Anxious" },
      { id: "irritable", emoji: "😤", label: "Irritable" },
      { id: "brain_fog", emoji: "🧠", label: "Brain Fog" },
      { id: "emotional", emoji: "😢", label: "Emotional" },
      { id: "calm", emoji: "🕊️", label: "Calm" },
      { id: "motivated", emoji: "⚡", label: "Motivated" },
      { id: "social", emoji: "💬", label: "Social" },
      { id: "low_libido", emoji: "🌸", label: "Low Libido" },
      { id: "high_libido", emoji: "💕", label: "High Libido" },
      { id: "stressed", emoji: "😮‍💨", label: "Stressed" },
      { id: "mood_swings", emoji: "🎭", label: "Mood Swings" },
      { id: "sad", emoji: "💙", label: "Sad" },
      { id: "focused", emoji: "🎯", label: "Focused" },
      { id: "creative", emoji: "🎨", label: "Creative" },
    ],
  },
  {
    label: "Sleep & Energy",
    symptoms: [
      { id: "good_sleep", emoji: "😴", label: "Good Sleep" },
      { id: "poor_sleep", emoji: "🌛", label: "Poor Sleep" },
      { id: "vivid_dreams", emoji: "💭", label: "Vivid Dreams" },
      { id: "oversleeping", emoji: "⏰", label: "Oversleeping" },
      { id: "high_energy", emoji: "🌟", label: "High Energy" },
      { id: "low_energy", emoji: "🔋", label: "Low Energy" },
    ],
  },
  {
    label: "Digestion",
    symptoms: [
      { id: "appetite_up", emoji: "🍎", label: "Increased Appetite" },
      { id: "appetite_down", emoji: "🥗", label: "Decreased Appetite" },
      { id: "cravings", emoji: "🍫", label: "Cravings" },
      { id: "constipation", emoji: "⚠️", label: "Constipation" },
      { id: "diarrhea", emoji: "💦", label: "Diarrhea" },
      { id: "indigestion", emoji: "😣", label: "Indigestion" },
    ],
  },
];

const FLOW_OPTIONS: { value: FlowIntensity; label: string; emoji: string; color: string }[] = [
  { value: "spotting", label: "Spotting", emoji: "💧", color: "#f9a8d4" },
  { value: "light", label: "Light", emoji: "🩸", color: "#fb7185" },
  { value: "medium", label: "Medium", emoji: "🩸", color: "#e11d48" },
  { value: "heavy", label: "Heavy", emoji: "🩸", color: "#9f1239" },
];

export function MoodEntryForm() {
  const [mood, setMood] = useState(3);
  const [energy, setEnergy] = useState(3);
  const [notes, setNotes] = useState("");
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [flow, setFlow] = useState<FlowIntensity | undefined>(undefined);
  const [sleepHours, setSleepHours] = useState<number | undefined>(undefined);
  const [waterGlasses, setWaterGlasses] = useState<number>(0);
  const [saved, setSaved] = useState(false);
  const { setEntry } = useMoodStore();
  const { currentPhase, dayOfCycle, isRegular } = useCycleData();

  const today = new Date().toISOString().split("T")[0];

  function toggleSymptom(id: string) {
    setSelectedSymptoms((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }

  async function handleSave() {
    const entry = {
      date: today,
      mood,
      energy,
      notes: notes || undefined,
      cyclePhase: currentPhase,
      dayOfCycle,
      symptoms: selectedSymptoms,
      flow,
      sleepHours,
      waterGlasses: waterGlasses > 0 ? waterGlasses : undefined,
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

      {/* Sleep & Water row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Sleep hours */}
        <div>
          <label className="text-xs uppercase tracking-wider text-text-accent font-quicksand font-semibold flex items-center gap-1.5">
            <Moon className="h-3.5 w-3.5" />
            Sleep
          </label>
          <div className="mt-3">
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={12}
                step={0.5}
                value={sleepHours ?? 0}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setSleepHours(val === 0 ? undefined : val);
                }}
                className="flex-1 accent-accent-purple"
              />
              <span className="text-sm font-quicksand font-bold text-accent-purple min-w-[44px] text-center">
                {sleepHours !== undefined ? `${sleepHours}h` : "–"}
              </span>
            </div>
            <p className="text-[10px] text-text-muted font-quicksand mt-1">hours last night</p>
          </div>
        </div>

        {/* Water glasses */}
        <div>
          <label className="text-xs uppercase tracking-wider text-text-accent font-quicksand font-semibold flex items-center gap-1.5">
            <Droplets className="h-3.5 w-3.5" />
            Water
          </label>
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setWaterGlasses((w) => Math.max(0, w - 1))}
              className="w-8 h-8 rounded-full border border-border-light bg-bg-secondary flex items-center justify-center text-text-secondary hover:bg-bg-card transition-colors"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <div className="flex-1 text-center">
              <span className="text-xl font-quicksand font-bold text-accent-purple">{waterGlasses}</span>
              <p className="text-[10px] text-text-muted font-quicksand">glasses</p>
            </div>
            <button
              type="button"
              onClick={() => setWaterGlasses((w) => Math.min(20, w + 1))}
              className="w-8 h-8 rounded-full border border-border-light bg-bg-secondary flex items-center justify-center text-text-secondary hover:bg-bg-card transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Flow (regular cycle users) */}
      {isRegular && (
        <div>
          <label className="text-xs uppercase tracking-wider text-text-accent font-quicksand font-semibold">
            Period Flow (if applicable)
          </label>
          <div className="flex gap-2 mt-3">
            {FLOW_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setFlow(flow === opt.value ? undefined : opt.value)}
                className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl border text-xs font-quicksand font-medium transition-colors ${
                  flow === opt.value
                    ? "border-accent-pink/50 bg-accent-pink/10 text-accent-pink"
                    : "border-border-light bg-bg-secondary text-text-muted hover:bg-bg-card"
                }`}
              >
                <span>{opt.emoji}</span>
                <span>{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Symptoms */}
      <div>
        <label className="text-xs uppercase tracking-wider text-text-accent font-quicksand font-semibold">
          Symptoms & Feelings
        </label>
        <div className="mt-3 space-y-3">
          {SYMPTOM_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="text-xs text-text-muted font-quicksand mb-2">{group.label}</p>
              <div className="flex flex-wrap gap-2">
                {group.symptoms.map((s) => {
                  const active = selectedSymptoms.includes(s.id);
                  return (
                    <button
                      key={s.id}
                      onClick={() => toggleSymptom(s.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-quicksand font-medium border transition-colors ${
                        active
                          ? "bg-accent-purple/15 border-accent-purple/40 text-accent-purple"
                          : "bg-bg-secondary border-border-light text-text-muted hover:bg-bg-card hover:text-text-secondary"
                      }`}
                    >
                      <span>{s.emoji}</span>
                      <span>{s.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
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
          placeholder="Anything else to note today?"
          rows={2}
          className="w-full mt-3 px-4 py-3 rounded-2xl border border-border-light bg-bg-input text-text-primary font-quicksand text-sm placeholder:text-text-muted focus:outline-none focus:border-accent-purple resize-none"
        />
      </div>

      <button
        onClick={handleSave}
        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-accent-rose to-accent-purple text-white font-quicksand font-semibold transition-opacity hover:opacity-90"
      >
        {saved ? "Saved! ✓" : "Save Entry"}
      </button>
    </motion.div>
  );
}

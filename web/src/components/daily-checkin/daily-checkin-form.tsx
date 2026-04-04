"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Zap,
  Moon,
  Droplets,
  Dumbbell,
  Coffee,
  Bed,
  Check,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Save,
} from "lucide-react";
import {
  useDailyCheckInStore,
  emptyLifestyle,
  triggerOptions,
  exerciseTypes,
  sleepQualityLabels,
  type TriggerId,
  type SleepQuality,
  type WaterIntake,
  type DailyCheckInEntry,
} from "@/stores/daily-checkin-store";
import {
  availableSymptoms,
  categoryNames,
  severityConfig,
  type SymptomCategory,
  type SymptomSeverity,
  type SymptomLog,
} from "@/stores/symptom-store";
import { useCycleData } from "@/hooks/use-cycle-data";
import { getMoonPhase } from "@/lib/cycle/moon-phase";
import { moonPhaseInfo, phaseInfo } from "@/lib/cycle/data";
import { getSuggestedSymptoms, getSuggestionLabel } from "@/lib/cycle/phase-symptoms";

const moodEmojis = [
  { value: 1, emoji: "😢", label: "Awful" },
  { value: 2, emoji: "😕", label: "Low" },
  { value: 3, emoji: "😐", label: "Okay" },
  { value: 4, emoji: "🙂", label: "Good" },
  { value: 5, emoji: "😊", label: "Great" },
];

const energyEmojis = [
  { value: 1, emoji: "🪫", label: "Exhausted" },
  { value: 2, emoji: "😴", label: "Low" },
  { value: 3, emoji: "😐", label: "Moderate" },
  { value: 4, emoji: "⚡", label: "Good" },
  { value: 5, emoji: "🔥", label: "Energized" },
];

const symptomCategories: SymptomCategory[] = [
  "physical",
  "emotional",
  "energy",
  "digestive",
  "sleep",
  "skin",
  "other",
];

interface DailyCheckInFormProps {
  date?: string; // YYYY-MM-DD, defaults to today
  onSaved?: () => void;
  existingEntry?: DailyCheckInEntry;
}

export function DailyCheckInForm({ date, onSaved, existingEntry }: DailyCheckInFormProps) {
  const { currentMoonPhase, currentPhase, lifeStage, isRegular, dayOfCycle, currentPhaseInfo } = useCycleData();
  const { saveCheckIn, getEntryByDate } = useDailyCheckInStore();

  const todayStr = useMemo(() => {
    if (date) return date;
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }, [date]);

  const existing = existingEntry || getEntryByDate(todayStr);

  // Form state
  const [symptoms, setSymptoms] = useState<SymptomLog[]>(existing?.symptoms || []);
  const [mood, setMood] = useState<number | null>(existing?.mood ?? null);
  const [energy, setEnergy] = useState<number | null>(existing?.energy ?? null);
  const [sleepQuality, setSleepQuality] = useState<SleepQuality | null>(
    existing?.lifestyle.sleepQuality ?? null
  );
  const [sleepHours, setSleepHours] = useState<number | null>(
    existing?.lifestyle.sleepHours ?? null
  );
  const [waterIntake, setWaterIntake] = useState<WaterIntake | null>(
    existing?.lifestyle.waterIntake ?? null
  );
  const [exerciseDone, setExerciseDone] = useState(existing?.lifestyle.exerciseDone ?? false);
  const [exerciseType, setExerciseType] = useState<string | null>(
    existing?.lifestyle.exerciseType ?? null
  );
  const [exerciseMinutes, setExerciseMinutes] = useState<number | null>(
    existing?.lifestyle.exerciseMinutes ?? null
  );
  const [triggers, setTriggers] = useState<TriggerId[]>(existing?.triggers || []);
  const [triggerNotes, setTriggerNotes] = useState(existing?.triggerNotes || "");
  const [reflection, setReflection] = useState(existing?.reflection || "");
  const [saved, setSaved] = useState(false);

  // Symptom category filter — "suggested" is a virtual tab
  const [activeCategory, setActiveCategory] = useState<SymptomCategory | "suggested">("suggested");

  // Get suggested symptoms for current phase/life stage
  const suggestedIds = useMemo(
    () => getSuggestedSymptoms(lifeStage, isRegular ? currentPhase : undefined),
    [lifeStage, isRegular, currentPhase]
  );
  const suggestionLabel = useMemo(
    () => getSuggestionLabel(lifeStage, isRegular ? currentPhase : undefined),
    [lifeStage, isRegular, currentPhase]
  );
  const suggestedSymptomDefs = useMemo(
    () => availableSymptoms.filter((s) => suggestedIds.includes(s.id)),
    [suggestedIds]
  );
  // Collapsible sections
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    symptoms: true,
    mood: true,
    lifestyle: true,
    triggers: false,
    reflection: false,
  });

  // Reset form when date changes
  useEffect(() => {
    const entry = getEntryByDate(todayStr);
    if (entry) {
      setSymptoms(entry.symptoms);
      setMood(entry.mood);
      setEnergy(entry.energy);
      setSleepQuality(entry.lifestyle.sleepQuality);
      setSleepHours(entry.lifestyle.sleepHours);
      setWaterIntake(entry.lifestyle.waterIntake);
      setExerciseDone(entry.lifestyle.exerciseDone);
      setExerciseType(entry.lifestyle.exerciseType);
      setExerciseMinutes(entry.lifestyle.exerciseMinutes);
      setTriggers(entry.triggers);
      setTriggerNotes(entry.triggerNotes);
      setReflection(entry.reflection);
    }
  }, [todayStr, getEntryByDate]);

  function toggleSection(key: string) {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function toggleSymptom(symptomId: string) {
    setSymptoms((prev) => {
      const exists = prev.find((s) => s.symptomId === symptomId);
      if (exists) return prev.filter((s) => s.symptomId !== symptomId);
      return [...prev, { symptomId, severity: "moderate" as SymptomSeverity }];
    });
  }

  function setSeverity(symptomId: string, severity: SymptomSeverity) {
    setSymptoms((prev) =>
      prev.map((s) => (s.symptomId === symptomId ? { ...s, severity } : s))
    );
  }

  function toggleTrigger(triggerId: TriggerId) {
    setTriggers((prev) =>
      prev.includes(triggerId) ? prev.filter((t) => t !== triggerId) : [...prev, triggerId]
    );
  }

  function handleSave() {
    const moonPhase = getMoonPhase();
    saveCheckIn({
      date: todayStr,
      symptoms,
      mood,
      energy,
      lifestyle: {
        sleepQuality,
        sleepHours,
        waterIntake,
        exerciseDone,
        exerciseType: exerciseDone ? exerciseType : null,
        exerciseMinutes: exerciseDone ? exerciseMinutes : null,
      },
      triggers,
      triggerNotes,
      reflection,
      moonPhase,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    onSaved?.();
  }

  const moonPhase = getMoonPhase();
  const moonInfo = moonPhaseInfo[moonPhase];

  const hasData =
    symptoms.length > 0 ||
    mood !== null ||
    energy !== null ||
    sleepQuality !== null ||
    waterIntake !== null ||
    exerciseDone ||
    triggers.length > 0 ||
    reflection.trim().length > 0;

  const displayDate = new Date(todayStr + "T12:00:00");

  return (
    <div className="space-y-4">
      {/* Date & Phase Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-cormorant text-xl font-semibold text-text-primary">
            {displayDate.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </h2>
          <div className="flex items-center gap-2 mt-1">
            {/* Cycle phase badge for regular users */}
            {isRegular && currentPhaseInfo && (
              <div
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-quicksand font-medium"
                style={{
                  backgroundColor: `${currentPhaseInfo.color}15`,
                  color: currentPhaseInfo.color,
                }}
              >
                <span>{currentPhaseInfo.emoji}</span>
                <span>{currentPhaseInfo.name} Phase — Day {dayOfCycle}</span>
              </div>
            )}
            {/* Moon phase badge */}
            <div
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-quicksand font-medium"
              style={{
                backgroundColor: `${moonInfo?.color || "#9333ea"}15`,
                color: moonInfo?.color || "#9333ea",
              }}
            >
              <span>{moonInfo?.emoji}</span>
              <span>{moonInfo?.name}</span>
            </div>
          </div>
        </div>
        {existing && (
          <span className="text-[10px] text-text-muted font-quicksand">
            Last updated {new Date(existing.updatedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
          </span>
        )}
      </div>

      {/* === SYMPTOMS SECTION === */}
      <SectionCard
        title="How's your body feeling?"
        icon={<Heart className="h-4 w-4" />}
        color="text-accent-pink"
        bgColor="bg-accent-pink/10"
        expanded={expandedSections.symptoms}
        onToggle={() => toggleSection("symptoms")}
        badge={symptoms.length > 0 ? `${symptoms.length} logged` : undefined}
      >
        {/* Category tabs */}
        <div className="flex gap-1 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
          {/* Suggested tab */}
          {suggestedIds.length > 0 && (
            <button
              onClick={() => setActiveCategory("suggested")}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-quicksand whitespace-nowrap transition-colors ${
                activeCategory === "suggested"
                  ? "bg-accent-purple/15 text-accent-purple font-semibold"
                  : "text-text-muted hover:text-text-secondary hover:bg-bg-secondary/50"
              }`}
            >
              <Sparkles className="h-3 w-3" />
              Suggested
              {(() => {
                const count = symptoms.filter((s) => suggestedIds.includes(s.symptomId)).length;
                return count > 0 ? (
                  <span className="w-4 h-4 rounded-full bg-accent-purple text-white text-[9px] flex items-center justify-center">
                    {count}
                  </span>
                ) : null;
              })()}
            </button>
          )}
          {symptomCategories.map((cat) => {
            const catSymptoms = availableSymptoms.filter((s) => s.category === cat);
            const activeCount = symptoms.filter((s) =>
              catSymptoms.some((cs) => cs.id === s.symptomId)
            ).length;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-quicksand whitespace-nowrap transition-colors ${
                  activeCategory === cat
                    ? "bg-accent-pink/15 text-accent-pink font-semibold"
                    : "text-text-muted hover:text-text-secondary hover:bg-bg-secondary/50"
                }`}
              >
                {categoryNames[cat]}
                {activeCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-accent-pink text-white text-[9px] flex items-center justify-center">
                    {activeCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Suggestion context label */}
        {activeCategory === "suggested" && (
          <p className="text-[10px] text-text-muted font-quicksand mt-1 mb-1 italic">
            {suggestionLabel}
          </p>
        )}

        {/* Symptom grid */}
        <div className="grid grid-cols-2 gap-2 mt-3">
          {(activeCategory === "suggested"
            ? suggestedSymptomDefs
            : availableSymptoms.filter((s) => s.category === activeCategory)
          ).map((symptom) => {
              const logged = symptoms.find((s) => s.symptomId === symptom.id);
              return (
                <div key={symptom.id}>
                  <button
                    onClick={() => toggleSymptom(symptom.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left text-xs font-quicksand transition-all ${
                      logged
                        ? "border-accent-pink/40 bg-accent-pink/10 text-text-primary font-medium"
                        : "border-border-light bg-bg-card text-text-secondary hover:border-accent-pink/20"
                    }`}
                  >
                    <span className="text-base">{symptom.icon}</span>
                    <span className="flex-1">{symptom.name}</span>
                    {logged && <Check className="h-3 w-3 text-accent-pink" />}
                  </button>
                  {/* Severity selector */}
                  {logged && (
                    <div className="flex gap-1 mt-1 pl-1">
                      {(["mild", "moderate", "severe"] as SymptomSeverity[]).map((sev) => (
                        <button
                          key={sev}
                          onClick={() => setSeverity(symptom.id, sev)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-quicksand transition-colors ${
                            logged.severity === sev
                              ? "font-semibold text-white"
                              : "text-text-muted hover:opacity-80"
                          }`}
                          style={{
                            backgroundColor:
                              logged.severity === sev
                                ? severityConfig[sev].color
                                : `${severityConfig[sev].color}20`,
                          }}
                        >
                          {severityConfig[sev].label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </SectionCard>

      {/* === MOOD & ENERGY SECTION === */}
      <SectionCard
        title="Mood & Energy"
        icon={<Sparkles className="h-4 w-4" />}
        color="text-accent-purple"
        bgColor="bg-accent-purple/10"
        expanded={expandedSections.mood}
        onToggle={() => toggleSection("mood")}
        badge={mood !== null ? `${moodEmojis[mood - 1]?.emoji}` : undefined}
      >
        {/* Mood */}
        <div className="mb-5">
          <p className="text-xs font-quicksand font-semibold text-text-secondary mb-2.5">
            Overall mood
          </p>
          <div className="flex justify-between gap-1">
            {moodEmojis.map((m) => (
              <button
                key={m.value}
                onClick={() => setMood(mood === m.value ? null : m.value)}
                className="flex flex-col items-center gap-1 flex-1"
              >
                <div
                  className={`w-11 h-11 rounded-full flex items-center justify-center text-xl transition-all ${
                    mood === m.value
                      ? "bg-accent-purple/20 ring-2 ring-accent-purple scale-110"
                      : "hover:bg-bg-secondary"
                  }`}
                >
                  {m.emoji}
                </div>
                <span
                  className={`text-[10px] font-quicksand ${
                    mood === m.value ? "text-accent-purple font-semibold" : "text-text-muted"
                  }`}
                >
                  {m.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Energy */}
        <div>
          <p className="text-xs font-quicksand font-semibold text-text-secondary mb-2.5">
            Energy level
          </p>
          <div className="flex justify-between gap-1">
            {energyEmojis.map((e) => (
              <button
                key={e.value}
                onClick={() => setEnergy(energy === e.value ? null : e.value)}
                className="flex flex-col items-center gap-1 flex-1"
              >
                <div
                  className={`w-11 h-11 rounded-full flex items-center justify-center text-xl transition-all ${
                    energy === e.value
                      ? "bg-amber-500/20 ring-2 ring-amber-500 scale-110"
                      : "hover:bg-bg-secondary"
                  }`}
                >
                  {e.emoji}
                </div>
                <span
                  className={`text-[10px] font-quicksand ${
                    energy === e.value ? "text-amber-600 font-semibold" : "text-text-muted"
                  }`}
                >
                  {e.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </SectionCard>

      {/* === LIFESTYLE SECTION === */}
      <SectionCard
        title="Lifestyle"
        icon={<Moon className="h-4 w-4" />}
        color="text-indigo-500"
        bgColor="bg-indigo-500/10"
        expanded={expandedSections.lifestyle}
        onToggle={() => toggleSection("lifestyle")}
        badge={
          [sleepQuality, waterIntake, exerciseDone].filter(Boolean).length > 0
            ? `${[sleepQuality, waterIntake, exerciseDone].filter(Boolean).length}/3`
            : undefined
        }
      >
        {/* Sleep quality */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-2.5">
            <Bed className="h-3.5 w-3.5 text-indigo-400" />
            <p className="text-xs font-quicksand font-semibold text-text-secondary">
              Sleep quality
            </p>
          </div>
          <div className="flex gap-2">
            {([1, 2, 3, 4, 5] as SleepQuality[]).map((q) => (
              <button
                key={q}
                onClick={() => setSleepQuality(sleepQuality === q ? null : q)}
                className={`flex flex-col items-center gap-1 flex-1 py-2 rounded-xl transition-all ${
                  sleepQuality === q
                    ? "bg-indigo-500/15 ring-1 ring-indigo-400"
                    : "hover:bg-bg-secondary"
                }`}
              >
                <span className="text-lg">{sleepQualityLabels[q].emoji}</span>
                <span
                  className={`text-[10px] font-quicksand ${
                    sleepQuality === q ? "text-indigo-500 font-semibold" : "text-text-muted"
                  }`}
                >
                  {sleepQualityLabels[q].label}
                </span>
              </button>
            ))}
          </div>
          {/* Sleep hours */}
          {sleepQuality !== null && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-text-muted font-quicksand">Hours slept:</span>
              <div className="flex gap-1">
                {[4, 5, 6, 7, 8, 9, 10].map((h) => (
                  <button
                    key={h}
                    onClick={() => setSleepHours(sleepHours === h ? null : h)}
                    className={`w-8 h-8 rounded-lg text-xs font-quicksand transition-colors ${
                      sleepHours === h
                        ? "bg-indigo-500 text-white font-semibold"
                        : "bg-bg-card border border-border-light text-text-secondary hover:border-indigo-300"
                    }`}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Water intake */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-2.5">
            <Droplets className="h-3.5 w-3.5 text-blue-400" />
            <p className="text-xs font-quicksand font-semibold text-text-secondary">
              Water intake (glasses)
            </p>
          </div>
          <div className="flex gap-1.5">
            {([0, 1, 2, 3, 4, 5, 6, 7, 8] as WaterIntake[]).map((w) => (
              <button
                key={w}
                onClick={() => setWaterIntake(waterIntake === w ? null : w)}
                className={`w-8 h-8 rounded-lg text-xs font-quicksand transition-colors ${
                  waterIntake !== null && w <= waterIntake
                    ? "bg-blue-500 text-white font-semibold"
                    : "bg-bg-card border border-border-light text-text-secondary hover:border-blue-300"
                }`}
              >
                {w}
              </button>
            ))}
          </div>
        </div>

        {/* Exercise */}
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <Dumbbell className="h-3.5 w-3.5 text-green-500" />
            <p className="text-xs font-quicksand font-semibold text-text-secondary">Exercise</p>
          </div>
          <div className="flex gap-2 mb-2">
            <button
              onClick={() => setExerciseDone(!exerciseDone)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-quicksand transition-all ${
                exerciseDone
                  ? "border-green-400/50 bg-green-500/10 text-green-600 font-semibold"
                  : "border-border-light text-text-secondary hover:border-green-300"
              }`}
            >
              {exerciseDone ? <Check className="h-3.5 w-3.5" /> : <Dumbbell className="h-3.5 w-3.5" />}
              {exerciseDone ? "Yes, I exercised!" : "Did you exercise?"}
            </button>
          </div>
          {exerciseDone && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-2"
            >
              <div className="flex flex-wrap gap-1.5">
                {exerciseTypes.map((ex) => (
                  <button
                    key={ex.id}
                    onClick={() => setExerciseType(exerciseType === ex.id ? null : ex.id)}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-quicksand transition-colors ${
                      exerciseType === ex.id
                        ? "bg-green-500/15 text-green-600 font-semibold ring-1 ring-green-400/30"
                        : "bg-bg-card border border-border-light text-text-secondary"
                    }`}
                  >
                    <span>{ex.icon}</span>
                    <span>{ex.label}</span>
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-muted font-quicksand">Minutes:</span>
                <div className="flex gap-1">
                  {[15, 30, 45, 60, 90].map((m) => (
                    <button
                      key={m}
                      onClick={() => setExerciseMinutes(exerciseMinutes === m ? null : m)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-quicksand transition-colors ${
                        exerciseMinutes === m
                          ? "bg-green-500 text-white font-semibold"
                          : "bg-bg-card border border-border-light text-text-secondary hover:border-green-300"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </SectionCard>

      {/* === TRIGGERS SECTION === */}
      <SectionCard
        title="Triggers & Factors"
        icon={<Coffee className="h-4 w-4" />}
        color="text-orange-500"
        bgColor="bg-orange-500/10"
        expanded={expandedSections.triggers}
        onToggle={() => toggleSection("triggers")}
        badge={triggers.length > 0 ? `${triggers.length}` : undefined}
      >
        <div className="flex flex-wrap gap-2 mb-3">
          {triggerOptions.map((trigger) => {
            const active = triggers.includes(trigger.id);
            return (
              <button
                key={trigger.id}
                onClick={() => toggleTrigger(trigger.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-quicksand transition-all ${
                  active
                    ? "border-orange-400/40 bg-orange-500/10 text-orange-600 font-semibold"
                    : "border-border-light bg-bg-card text-text-secondary hover:border-orange-300"
                }`}
              >
                <span>{trigger.icon}</span>
                <span>{trigger.label}</span>
                {active && <Check className="h-3 w-3" />}
              </button>
            );
          })}
        </div>
        <textarea
          value={triggerNotes}
          onChange={(e) => setTriggerNotes(e.target.value)}
          placeholder="Anything else that might have affected how you feel today..."
          rows={2}
          className="w-full px-3 py-2.5 rounded-xl border border-border-light bg-bg-card text-xs font-quicksand text-text-primary placeholder:text-text-muted focus:outline-none focus:border-orange-400 resize-none"
        />
      </SectionCard>

      {/* === REFLECTION SECTION === */}
      <SectionCard
        title="Reflection"
        icon={<Sparkles className="h-4 w-4" />}
        color="text-accent-purple"
        bgColor="bg-accent-purple/10"
        expanded={expandedSections.reflection}
        onToggle={() => toggleSection("reflection")}
        badge={reflection.trim() ? "written" : undefined}
      >
        <textarea
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          placeholder="How are you feeling overall? Any patterns you're noticing? Anything you want to remember about today..."
          rows={4}
          className="w-full px-3 py-2.5 rounded-xl border border-border-light bg-bg-card text-sm font-quicksand text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-purple resize-none leading-relaxed"
        />
      </SectionCard>

      {/* Save button */}
      <motion.div className="sticky bottom-4 z-10">
        <button
          onClick={handleSave}
          disabled={!hasData || saved}
          className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-quicksand font-semibold shadow-lg transition-all ${
            saved
              ? "bg-green-500 text-white"
              : hasData
              ? "bg-accent-purple text-white hover:opacity-90"
              : "bg-bg-secondary text-text-muted cursor-not-allowed"
          }`}
        >
          {saved ? (
            <>
              <Check className="h-4 w-4" />
              Saved!
            </>
          ) : existing ? (
            <>
              <Save className="h-4 w-4" />
              Update Check-In
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Check-In
            </>
          )}
        </button>
      </motion.div>
    </div>
  );
}

// Collapsible section card component
function SectionCard({
  title,
  icon,
  color,
  bgColor,
  expanded,
  onToggle,
  badge,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  expanded: boolean;
  onToggle: () => void;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      layout
      className="rounded-[20px] border border-border-light bg-bg-card overflow-hidden"
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4"
      >
        <div className="flex items-center gap-2.5">
          <div className={`flex items-center justify-center w-7 h-7 rounded-full ${bgColor}`}>
            <span className={color}>{icon}</span>
          </div>
          <span className="text-sm font-quicksand font-semibold text-text-primary">{title}</span>
          {badge && (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-quicksand font-medium ${bgColor} ${color}`}>
              {badge}
            </span>
          )}
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-text-muted" />
        ) : (
          <ChevronDown className="h-4 w-4 text-text-muted" />
        )}
      </button>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-5 pb-5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

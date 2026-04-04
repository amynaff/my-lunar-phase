"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Trash2,
  Heart,
  Zap,
  Bed,
  Droplets,
  Dumbbell,
  Coffee,
} from "lucide-react";
import {
  useDailyCheckInStore,
  sleepQualityLabels,
  triggerOptions,
  exerciseTypes,
  type DailyCheckInEntry,
} from "@/stores/daily-checkin-store";
import {
  getSymptomById,
  severityConfig,
} from "@/stores/symptom-store";

const moodEmojis = ["😢", "😕", "😐", "🙂", "😊"];
const energyEmojis = ["🪫", "😴", "😐", "⚡", "🔥"];
const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface CheckInHistoryProps {
  onEditDate?: (date: string) => void;
}

export function CheckInHistory({ onEditDate }: CheckInHistoryProps) {
  const entries = useDailyCheckInStore((s) => s.entries);
  const deleteCheckIn = useDailyCheckInStore((s) => s.deleteCheckIn);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Week navigation
  const weekDays = useMemo(() => {
    const start = new Date(selectedDate);
    start.setDate(start.getDate() - start.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [selectedDate]);

  function navigateWeek(dir: number) {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + dir * 7);
    setSelectedDate(d);
  }

  function dateStr(d: Date) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  // Get entries for current week
  const weekEntries = useMemo(() => {
    const startStr = dateStr(weekDays[0]);
    const endStr = dateStr(weekDays[6]);
    return entries
      .filter((e) => e.date >= startStr && e.date <= endStr)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [entries, weekDays]);

  const entryDates = useMemo(() => new Set(entries.map((e) => e.date)), [entries]);

  return (
    <div className="space-y-4">
      {/* Week strip */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => navigateWeek(-1)} className="p-1 rounded-lg hover:bg-bg-secondary">
            <ChevronLeft className="h-4 w-4 text-text-secondary" />
          </button>
          <span className="text-sm font-quicksand font-semibold text-text-primary">
            {selectedDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </span>
          <button onClick={() => navigateWeek(1)} className="p-1 rounded-lg hover:bg-bg-secondary">
            <ChevronRight className="h-4 w-4 text-text-secondary" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((day, i) => {
            const ds = dateStr(day);
            const isToday = day.toDateString() === new Date().toDateString();
            const isSelected = day.toDateString() === selectedDate.toDateString();
            const hasEntry = entryDates.has(ds);
            return (
              <button
                key={i}
                onClick={() => {
                  setSelectedDate(day);
                  if (hasEntry && onEditDate) onEditDate(ds);
                }}
                className={`flex flex-col items-center py-2 rounded-xl transition-colors ${
                  isSelected ? "bg-accent-purple/15" : isToday ? "bg-bg-secondary" : "hover:bg-bg-secondary/50"
                }`}
              >
                <span className="text-[10px] text-text-muted font-quicksand">{DAYS_SHORT[i]}</span>
                <span className={`text-sm font-quicksand font-semibold mt-0.5 ${isSelected ? "text-accent-purple" : "text-text-primary"}`}>
                  {day.getDate()}
                </span>
                {hasEntry ? (
                  <div className="w-1.5 h-1.5 rounded-full bg-accent-pink mt-1" />
                ) : (
                  <div className="w-1.5 h-1.5 mt-1" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Entry cards */}
      {weekEntries.length === 0 ? (
        <div className="rounded-[20px] border border-border-light bg-bg-card p-6 text-center">
          <p className="text-sm text-text-muted font-quicksand">No check-ins this week.</p>
          <p className="text-xs text-text-muted font-quicksand mt-1">
            Tap a day above or use the form to log your first check-in.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {weekEntries.map((entry, i) => (
            <CheckInCard
              key={entry.id}
              entry={entry}
              index={i}
              expanded={expandedId === entry.id}
              onToggle={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
              onEdit={() => onEditDate?.(entry.date)}
              onDelete={() => deleteCheckIn(entry.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CheckInCard({
  entry,
  index,
  expanded,
  onToggle,
  onEdit,
  onDelete,
}: {
  entry: DailyCheckInEntry;
  index: number;
  expanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const entryDate = new Date(entry.date + "T12:00:00");

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="rounded-[20px] border border-border-light bg-bg-card overflow-hidden"
    >
      {/* Summary row (always visible) */}
      <button onClick={onToggle} className="w-full px-5 py-4 flex items-center gap-3">
        <div className="flex-1 text-left">
          <p className="text-sm font-quicksand font-semibold text-text-primary">
            {entryDate.toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
          </p>
          <div className="flex items-center gap-3 mt-1 text-xs text-text-muted font-quicksand">
            {entry.mood && (
              <span className="flex items-center gap-1">
                {moodEmojis[entry.mood - 1]}
              </span>
            )}
            {entry.energy && (
              <span className="flex items-center gap-1">
                {energyEmojis[entry.energy - 1]}
              </span>
            )}
            {entry.symptoms.length > 0 && (
              <span className="flex items-center gap-1">
                <Heart className="h-3 w-3 text-accent-pink" />
                {entry.symptoms.length}
              </span>
            )}
            {entry.triggers.length > 0 && (
              <span className="flex items-center gap-1">
                <Coffee className="h-3 w-3 text-orange-400" />
                {entry.triggers.length}
              </span>
            )}
            {entry.lifestyle.exerciseDone && (
              <span className="flex items-center gap-1">
                <Dumbbell className="h-3 w-3 text-green-500" />
              </span>
            )}
          </div>
        </div>
        <ChevronRight
          className={`h-4 w-4 text-text-muted transition-transform ${expanded ? "rotate-90" : ""}`}
        />
      </button>

      {/* Expanded details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-5 pb-5 space-y-4 border-t border-border-light pt-4">
              {/* Symptoms */}
              {entry.symptoms.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-text-muted font-quicksand font-semibold mb-2">
                    Symptoms
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {entry.symptoms.map((s) => {
                      const sym = getSymptomById(s.symptomId);
                      if (!sym) return null;
                      return (
                        <span
                          key={s.symptomId}
                          className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-quicksand"
                          style={{
                            backgroundColor: `${severityConfig[s.severity].color}15`,
                            color: severityConfig[s.severity].color,
                          }}
                        >
                          {sym.icon} {sym.name}
                          <span className="opacity-70">({s.severity})</span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Lifestyle */}
              <div className="flex flex-wrap gap-3">
                {entry.lifestyle.sleepQuality && (
                  <div className="flex items-center gap-1.5 text-xs text-text-secondary font-quicksand">
                    <Bed className="h-3.5 w-3.5 text-indigo-400" />
                    Sleep: {sleepQualityLabels[entry.lifestyle.sleepQuality].emoji}{" "}
                    {sleepQualityLabels[entry.lifestyle.sleepQuality].label}
                    {entry.lifestyle.sleepHours && ` (${entry.lifestyle.sleepHours}h)`}
                  </div>
                )}
                {entry.lifestyle.waterIntake !== null && (
                  <div className="flex items-center gap-1.5 text-xs text-text-secondary font-quicksand">
                    <Droplets className="h-3.5 w-3.5 text-blue-400" />
                    Water: {entry.lifestyle.waterIntake} glasses
                  </div>
                )}
                {entry.lifestyle.exerciseDone && (
                  <div className="flex items-center gap-1.5 text-xs text-text-secondary font-quicksand">
                    <Dumbbell className="h-3.5 w-3.5 text-green-500" />
                    {entry.lifestyle.exerciseType
                      ? exerciseTypes.find((e) => e.id === entry.lifestyle.exerciseType)?.label
                      : "Exercise"}
                    {entry.lifestyle.exerciseMinutes && ` (${entry.lifestyle.exerciseMinutes}min)`}
                  </div>
                )}
              </div>

              {/* Triggers */}
              {entry.triggers.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-text-muted font-quicksand font-semibold mb-2">
                    Triggers
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {entry.triggers.map((t) => {
                      const trigger = triggerOptions.find((opt) => opt.id === t);
                      return trigger ? (
                        <span
                          key={t}
                          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-orange-500/10 text-orange-600 text-[11px] font-quicksand"
                        >
                          {trigger.icon} {trigger.label}
                        </span>
                      ) : null;
                    })}
                  </div>
                  {entry.triggerNotes && (
                    <p className="text-xs text-text-secondary font-quicksand mt-2 italic">
                      {entry.triggerNotes}
                    </p>
                  )}
                </div>
              )}

              {/* Reflection */}
              {entry.reflection && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-text-muted font-quicksand font-semibold mb-2">
                    Reflection
                  </p>
                  <p className="text-xs text-text-secondary font-quicksand leading-relaxed">
                    {entry.reflection}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={onEdit}
                  className="px-3 py-1.5 rounded-lg bg-accent-purple/10 text-accent-purple text-xs font-quicksand font-semibold hover:bg-accent-purple/20 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={onDelete}
                  className="px-3 py-1.5 rounded-lg hover:bg-red-50 text-text-muted hover:text-red-400 text-xs font-quicksand transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

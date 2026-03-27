"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { BookOpen, Plus, Flame, Sparkles, Trash2, Edit3, ChevronLeft, ChevronRight } from "lucide-react";
import { useJournalStore, journalPrompts, moonJournalPrompts, journalTags, type JournalEntry } from "@/stores/journal-store";
import { useCycleData } from "@/hooks/use-cycle-data";
import { JournalEntryModal } from "@/components/journal/journal-entry-modal";
import { QuickCheckIn } from "@/components/journal/quick-check-in";
import { phaseInfo } from "@/lib/cycle/data";

type ViewMode = "week" | "month" | "all";

const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function JournalPage() {
  const { currentPhase, currentMoonPhase, isRegular, dayOfCycle } = useCycleData();
  const entries = useJournalStore((s) => s.entries);
  const getEntriesByWeek = useJournalStore((s) => s.getEntriesByWeek);
  const getEntriesByMonth = useJournalStore((s) => s.getEntriesByMonth);
  const getStreakCount = useJournalStore((s) => s.getStreakCount);
  const getTotalEntries = useJournalStore((s) => s.getTotalEntries);
  const getEntriesThisWeek = useJournalStore((s) => s.getEntriesThisWeek);
  const deleteEntry = useJournalStore((s) => s.deleteEntry);

  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [showQuickCheckIn, setShowQuickCheckIn] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | undefined>();
  const [selectedPrompt, setSelectedPrompt] = useState<string | undefined>();

  const promptData = isRegular
    ? journalPrompts[currentPhase] || journalPrompts.follicular
    : moonJournalPrompts[currentMoonPhase] || moonJournalPrompts.new_moon;

  const displayedEntries = useMemo(() => {
    if (viewMode === "all") return entries;
    if (viewMode === "week") return getEntriesByWeek(selectedDate);
    return getEntriesByMonth(selectedDate.getFullYear(), selectedDate.getMonth());
  }, [viewMode, selectedDate, entries, getEntriesByWeek, getEntriesByMonth]);

  // Week strip days
  const weekDays = useMemo(() => {
    const start = new Date(selectedDate);
    const day = start.getDay();
    start.setDate(start.getDate() - day);
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push(d);
    }
    return days;
  }, [selectedDate]);

  function navigateWeek(dir: number) {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + dir * 7);
    setSelectedDate(d);
  }

  function navigateMonth(dir: number) {
    const d = new Date(selectedDate);
    d.setMonth(d.getMonth() + dir);
    setSelectedDate(d);
  }

  function handleEdit(entry: JournalEntry) {
    setEditingEntry(entry);
    setSelectedPrompt(undefined);
    setShowEntryModal(true);
  }

  function handlePromptSelect(prompt: string) {
    setSelectedPrompt(prompt);
    setEditingEntry(undefined);
    setShowEntryModal(true);
  }

  function handleNewEntry() {
    setEditingEntry(undefined);
    setSelectedPrompt(undefined);
    setShowEntryModal(true);
  }

  const streak = getStreakCount();
  const total = getTotalEntries();
  const thisWeek = getEntriesThisWeek();
  const phaseData = phaseInfo[currentPhase];

  return (
    <div className="max-w-4xl mx-auto px-4 lg:px-8 py-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-accent-purple/15">
              <BookOpen className="h-5 w-5 text-accent-purple" />
            </div>
            <div>
              <h1 className="font-cormorant text-3xl font-semibold text-text-primary">Journal</h1>
              <p className="text-sm text-text-secondary font-quicksand">Reflect, release, grow</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowQuickCheckIn(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-accent-pink/10 hover:bg-accent-pink/20 text-accent-pink text-xs font-quicksand font-semibold transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Check-In
            </button>
            <button
              onClick={handleNewEntry}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-accent-purple text-white text-xs font-quicksand font-semibold hover:opacity-90 transition-opacity"
            >
              <Plus className="h-3.5 w-3.5" />
              New Entry
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stats row */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="grid grid-cols-3 gap-3 mb-6">
        <div className="rounded-2xl border border-border-light bg-bg-card p-4 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Flame className="h-4 w-4 text-accent-pink" />
            <span className="text-xl font-cormorant font-semibold text-text-primary">{streak}</span>
          </div>
          <p className="text-[10px] text-text-muted font-quicksand uppercase tracking-wider">Day Streak</p>
        </div>
        <div className="rounded-2xl border border-border-light bg-bg-card p-4 text-center">
          <span className="text-xl font-cormorant font-semibold text-text-primary">{total}</span>
          <p className="text-[10px] text-text-muted font-quicksand uppercase tracking-wider">Total Entries</p>
        </div>
        <div className="rounded-2xl border border-border-light bg-bg-card p-4 text-center">
          <span className="text-xl font-cormorant font-semibold text-text-primary">{thisWeek}</span>
          <p className="text-[10px] text-text-muted font-quicksand uppercase tracking-wider">This Week</p>
        </div>
      </motion.div>

      {/* View mode tabs */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex gap-1 mb-4 p-1 rounded-xl bg-bg-secondary/50">
        {(["week", "month", "all"] as ViewMode[]).map((mode) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={`flex-1 py-2 rounded-lg text-xs font-quicksand font-semibold transition-colors capitalize ${
              viewMode === mode ? "bg-bg-card text-text-primary shadow-sm" : "text-text-muted hover:text-text-secondary"
            }`}
          >
            {mode}
          </button>
        ))}
      </motion.div>

      {/* Week strip */}
      {viewMode === "week" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
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
              const isToday = day.toDateString() === new Date().toDateString();
              const isSelected = day.toDateString() === selectedDate.toDateString();
              const hasEntry = entries.some((e) => e.date.split("T")[0] === day.toISOString().split("T")[0]);
              return (
                <button
                  key={i}
                  onClick={() => setSelectedDate(day)}
                  className={`flex flex-col items-center py-2 rounded-xl transition-colors ${
                    isSelected ? "bg-accent-purple/15" : isToday ? "bg-bg-secondary" : "hover:bg-bg-secondary/50"
                  }`}
                >
                  <span className="text-[10px] text-text-muted font-quicksand">{DAYS_SHORT[i]}</span>
                  <span className={`text-sm font-quicksand font-semibold mt-0.5 ${isSelected ? "text-accent-purple" : "text-text-primary"}`}>
                    {day.getDate()}
                  </span>
                  {hasEntry && <div className="w-1.5 h-1.5 rounded-full bg-accent-pink mt-1" />}
                </button>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Month navigation */}
      {viewMode === "month" && (
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigateMonth(-1)} className="p-1 rounded-lg hover:bg-bg-secondary">
            <ChevronLeft className="h-4 w-4 text-text-secondary" />
          </button>
          <span className="text-sm font-quicksand font-semibold text-text-primary">
            {selectedDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </span>
          <button onClick={() => navigateMonth(1)} className="p-1 rounded-lg hover:bg-bg-secondary">
            <ChevronRight className="h-4 w-4 text-text-secondary" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Entries */}
        <div className="lg:col-span-2 space-y-3">
          {displayedEntries.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-[20px] border border-border-light bg-bg-card p-8 text-center">
              <BookOpen className="h-8 w-8 text-text-muted mx-auto mb-3" />
              <p className="text-sm text-text-muted font-quicksand">No journal entries yet.</p>
              <button
                onClick={handleNewEntry}
                className="mt-3 px-4 py-2 rounded-xl bg-accent-purple/10 text-accent-purple text-sm font-quicksand font-semibold hover:bg-accent-purple/20 transition-colors"
              >
                Write your first entry
              </button>
            </motion.div>
          ) : (
            displayedEntries.map((entry, i) => {
              const entryDate = new Date(entry.date);
              const tagLabels = entry.tags
                .map((t) => journalTags.find((jt) => jt.id === t))
                .filter(Boolean);
              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-[20px] border border-border-light bg-bg-card p-5 group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      {entry.title && (
                        <h3 className="font-cormorant text-base font-semibold text-text-primary">{entry.title}</h3>
                      )}
                      <p className="text-xs text-text-muted font-quicksand">
                        {entryDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                        {entry.mood && ` · ${["😢", "😕", "😐", "🙂", "😊"][entry.mood - 1]}`}
                        {entry.cyclePhase && isRegular && ` · ${phaseInfo[entry.cyclePhase as keyof typeof phaseInfo]?.emoji || ""}`}
                      </p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(entry)} className="p-1.5 rounded-lg hover:bg-bg-secondary">
                        <Edit3 className="h-3.5 w-3.5 text-text-muted" />
                      </button>
                      <button onClick={() => deleteEntry(entry.id)} className="p-1.5 rounded-lg hover:bg-red-50">
                        <Trash2 className="h-3.5 w-3.5 text-text-muted hover:text-red-400" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-text-secondary font-quicksand leading-relaxed line-clamp-3">{entry.content}</p>
                  {tagLabels.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {tagLabels.map((tag) => (
                        <span key={tag!.id} className="text-[10px] px-2 py-0.5 rounded-full bg-accent-purple/10 text-accent-purple font-quicksand">
                          {tag!.emoji} {tag!.label}
                        </span>
                      ))}
                    </div>
                  )}
                  {entry.prompt && (
                    <p className="text-[10px] text-text-muted font-quicksand italic mt-2">
                      Prompt: &ldquo;{entry.prompt}&rdquo;
                    </p>
                  )}
                </motion.div>
              );
            })
          )}
        </div>

        {/* Prompts sidebar */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="space-y-4">
          <div className="rounded-[20px] border border-border-light bg-bg-card p-5">
            <p className="text-xs uppercase tracking-wider text-text-accent font-quicksand font-semibold mb-1">
              {promptData.theme}
            </p>
            <p className="text-[10px] text-text-muted font-quicksand mb-4">
              Journal prompts for your current {isRegular ? "phase" : "moon phase"}
            </p>
            <div className="space-y-2">
              {promptData.prompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handlePromptSelect(prompt)}
                  className="w-full text-left px-3 py-2.5 rounded-xl border border-border-light hover:bg-bg-secondary/50 hover:border-accent-purple/30 transition-colors"
                >
                  <p className="text-xs text-text-secondary font-quicksand italic leading-relaxed">
                    &ldquo;{prompt}&rdquo;
                  </p>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Modals */}
      <JournalEntryModal
        open={showEntryModal}
        onClose={() => { setShowEntryModal(false); setEditingEntry(undefined); setSelectedPrompt(undefined); }}
        editingEntry={editingEntry}
        initialPrompt={selectedPrompt}
      />
      <QuickCheckIn open={showQuickCheckIn} onClose={() => setShowQuickCheckIn(false)} />
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check } from "lucide-react";
import { useJournalStore, journalTags, type JournalEntry } from "@/stores/journal-store";
import { useCycleData } from "@/hooks/use-cycle-data";

interface JournalEntryModalProps {
  open: boolean;
  onClose: () => void;
  editingEntry?: JournalEntry;
  initialPrompt?: string;
}

export function JournalEntryModal({ open, onClose, editingEntry, initialPrompt }: JournalEntryModalProps) {
  const { currentPhase, dayOfCycle } = useCycleData();
  const { addEntry, updateEntry } = useJournalStore();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [mood, setMood] = useState<number | null>(null);

  const moodEmojis = [
    { value: 1, emoji: "😢", label: "Sad" },
    { value: 2, emoji: "😕", label: "Low" },
    { value: 3, emoji: "😐", label: "Okay" },
    { value: 4, emoji: "🙂", label: "Good" },
    { value: 5, emoji: "😊", label: "Great" },
  ];

  useEffect(() => {
    if (open) {
      if (editingEntry) {
        setTitle(editingEntry.title || "");
        setContent(editingEntry.content);
        setSelectedTags(editingEntry.tags);
        setMood(editingEntry.mood || null);
      } else {
        setTitle("");
        setContent(initialPrompt ? "" : "");
        setSelectedTags([]);
        setMood(null);
      }
    }
  }, [open, editingEntry, initialPrompt]);

  function toggleTag(tagId: string) {
    setSelectedTags((prev) => (prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]));
  }

  function handleSave() {
    if (!content.trim()) return;

    if (editingEntry) {
      updateEntry(editingEntry.id, { title: title || undefined, content, tags: selectedTags, mood: mood || undefined });
    } else {
      addEntry({
        date: new Date().toISOString(),
        title: title || undefined,
        content,
        prompt: initialPrompt,
        cyclePhase: currentPhase,
        dayOfCycle,
        mood: mood || undefined,
        tags: selectedTags,
      });
    }
    onClose();
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
          className="w-full max-w-lg rounded-[20px] border border-border-light bg-bg-primary shadow-xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border-light">
            <button onClick={onClose} className="p-2 rounded-full hover:bg-bg-secondary">
              <X className="h-5 w-5 text-text-secondary" />
            </button>
            <h2 className="font-cormorant text-lg font-semibold text-text-primary">
              {editingEntry ? "Edit Entry" : "New Entry"}
            </h2>
            <button
              onClick={handleSave}
              disabled={!content.trim()}
              className="px-4 py-1.5 rounded-full bg-accent-purple text-white text-sm font-quicksand font-semibold disabled:opacity-40"
            >
              Save
            </button>
          </div>

          <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
            {/* Prompt badge */}
            {initialPrompt && (
              <div className="px-3 py-2 rounded-xl bg-accent-purple/10 border border-accent-purple/20">
                <p className="text-xs text-accent-purple font-quicksand font-medium italic">
                  &ldquo;{initialPrompt}&rdquo;
                </p>
              </div>
            )}

            {/* Title */}
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title (optional)"
              className="w-full px-0 py-1 text-lg font-cormorant font-semibold text-text-primary bg-transparent border-none outline-none placeholder:text-text-muted"
            />

            {/* Content */}
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your thoughts..."
              rows={6}
              className="w-full px-0 py-1 text-sm font-quicksand text-text-primary bg-transparent border-none outline-none placeholder:text-text-muted resize-none leading-relaxed"
            />

            {/* Mood */}
            <div>
              <p className="text-xs uppercase tracking-wider text-text-accent font-quicksand font-semibold mb-3">
                How are you feeling?
              </p>
              <div className="flex justify-between p-3 rounded-2xl border border-border-light bg-bg-card">
                {moodEmojis.map((m) => (
                  <button
                    key={m.value}
                    onClick={() => setMood(mood === m.value ? null : m.value)}
                    className="flex flex-col items-center gap-1"
                  >
                    <div
                      className={`w-11 h-11 rounded-full flex items-center justify-center text-xl transition-all ${
                        mood === m.value ? "bg-accent-purple/20 ring-2 ring-accent-purple" : ""
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

            {/* Tags */}
            <div>
              <p className="text-xs uppercase tracking-wider text-text-accent font-quicksand font-semibold mb-3">
                Tags
              </p>
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

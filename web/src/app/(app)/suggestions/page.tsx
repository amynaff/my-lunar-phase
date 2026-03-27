"use client";

import { useState, useEffect } from "react";
import { Heart, Lightbulb, Send, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const categories = [
  { value: "feature", label: "New Feature", emoji: "✨" },
  { value: "improvement", label: "Improvement", emoji: "💡" },
  { value: "content", label: "Content / Education", emoji: "📚" },
  { value: "design", label: "Look & Feel", emoji: "🎨" },
  { value: "community", label: "Community", emoji: "💬" },
  { value: "other", label: "Other", emoji: "💜" },
];

interface Suggestion {
  id: string;
  name: string | null;
  category: string;
  title: string;
  detail: string;
  hearts: number;
  status: string;
  createdAt: string;
}

export default function SuggestionsPage() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("feature");
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");

  useEffect(() => {
    fetch("/api/suggestions")
      .then((r) => r.json())
      .then((data) => {
        setSuggestions(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const res = await fetch("/api/suggestions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, category, title, detail }),
    });

    if (res.ok) {
      const newSuggestion = await res.json();
      setSuggestions((prev) => [newSuggestion, ...prev]);
      setTitle("");
      setDetail("");
      setName("");
      setEmail("");
      setCategory("feature");
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 4000);
    }
    setSubmitting(false);
  }

  async function handleHeart(id: string) {
    const res = await fetch(`/api/suggestions/${id}/heart`, { method: "POST" });
    if (res.ok) {
      const { hearts } = await res.json();
      setSuggestions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, hearts } : s))
      );
    }
  }

  const categoryLabel = (value: string) =>
    categories.find((c) => c.value === value);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-24 lg:pb-8">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-accent-purple/10 rounded-full px-4 py-1.5 mb-4">
          <Lightbulb className="h-4 w-4 text-accent-purple" />
          <span className="text-xs font-quicksand font-semibold text-accent-purple uppercase tracking-wide">
            Shape the Future
          </span>
        </div>
        <h1 className="font-cormorant text-4xl font-semibold text-text-primary mb-3">
          Your Ideas Matter
        </h1>
        <p className="text-text-secondary font-quicksand text-[15px] max-w-md mx-auto leading-relaxed">
          MyLunarPhase is built by women, for women. Share what you&apos;d love
          to see and vote on ideas from the community.
        </p>
      </div>

      {/* Submit Form */}
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-bg-card rounded-[24px] border border-border-light p-6 mb-10 shadow-sm"
      >
        <h2 className="font-cormorant text-xl font-semibold text-text-primary mb-5 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-accent-purple" />
          Share Your Idea
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-quicksand font-semibold text-text-muted mb-1.5 uppercase tracking-wide">
              Name (optional)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="How you'd like to be called"
              className="w-full px-4 py-2.5 rounded-xl border border-border-light bg-bg-primary text-text-primary font-quicksand text-sm placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent-purple/30 focus:border-accent-purple/50"
            />
          </div>
          <div>
            <label className="block text-xs font-quicksand font-semibold text-text-muted mb-1.5 uppercase tracking-wide">
              Email (optional)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="If you'd like updates"
              className="w-full px-4 py-2.5 rounded-xl border border-border-light bg-bg-primary text-text-primary font-quicksand text-sm placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent-purple/30 focus:border-accent-purple/50"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-quicksand font-semibold text-text-muted mb-1.5 uppercase tracking-wide">
            Category
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                type="button"
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-quicksand font-semibold transition-all ${
                  category === cat.value
                    ? "bg-accent-purple text-white shadow-sm"
                    : "bg-bg-secondary text-text-secondary hover:bg-bg-secondary/80"
                }`}
              >
                {cat.emoji} {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-quicksand font-semibold text-text-muted mb-1.5 uppercase tracking-wide">
            Your Idea *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="A short summary of your suggestion"
            className="w-full px-4 py-2.5 rounded-xl border border-border-light bg-bg-primary text-text-primary font-quicksand text-sm placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent-purple/30 focus:border-accent-purple/50"
          />
        </div>

        <div className="mb-5">
          <label className="block text-xs font-quicksand font-semibold text-text-muted mb-1.5 uppercase tracking-wide">
            Tell Us More *
          </label>
          <textarea
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            required
            rows={4}
            placeholder="Describe what you'd love to see, why it matters to you, and how it would help your wellness journey..."
            className="w-full px-4 py-2.5 rounded-xl border border-border-light bg-bg-primary text-text-primary font-quicksand text-sm placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent-purple/30 focus:border-accent-purple/50 resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={submitting || !title || !detail}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-accent-rose to-accent-purple text-white font-quicksand font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
          {submitting ? "Sending..." : "Submit Suggestion"}
        </button>

        <AnimatePresence>
          {submitted && (
            <motion.p
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center text-sm text-accent-purple font-quicksand font-semibold mt-3"
            >
              Thank you for sharing your idea! We love hearing from you.
            </motion.p>
          )}
        </AnimatePresence>
      </motion.form>

      {/* Suggestions List */}
      <div>
        <h2 className="font-cormorant text-2xl font-semibold text-text-primary mb-5 flex items-center gap-2">
          <Heart className="h-5 w-5 text-accent-rose" />
          Community Ideas
        </h2>
        <p className="text-text-muted font-quicksand text-sm mb-6">
          Vote on ideas you love — the most-loved suggestions help shape what we build next.
        </p>

        {loading ? (
          <div className="text-center py-12 text-text-muted font-quicksand text-sm">
            Loading suggestions...
          </div>
        ) : suggestions.length === 0 ? (
          <div className="text-center py-12 bg-bg-card rounded-[20px] border border-border-light">
            <Sparkles className="h-8 w-8 text-accent-purple/40 mx-auto mb-3" />
            <p className="text-text-secondary font-quicksand font-medium">
              Be the first to share an idea!
            </p>
            <p className="text-text-muted font-quicksand text-sm mt-1">
              Your suggestion could shape the future of MyLunarPhase.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {suggestions.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex gap-4 bg-bg-card rounded-[18px] border border-border-light p-4"
              >
                <button
                  onClick={() => handleHeart(s.id)}
                  className="flex flex-col items-center gap-0.5 pt-0.5 group"
                >
                  <Heart className="h-5 w-5 text-accent-rose group-hover:fill-accent-rose transition-all" />
                  <span className="text-xs font-quicksand font-bold text-text-muted">
                    {s.hearts}
                  </span>
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-accent-purple/10 text-accent-purple font-quicksand font-semibold">
                      {categoryLabel(s.category)?.emoji}{" "}
                      {categoryLabel(s.category)?.label || s.category}
                    </span>
                    {s.name && (
                      <span className="text-xs text-text-muted font-quicksand">
                        by {s.name}
                      </span>
                    )}
                  </div>
                  <h3 className="font-quicksand font-semibold text-sm text-text-primary">
                    {s.title}
                  </h3>
                  <p className="text-xs text-text-secondary font-quicksand mt-1 leading-relaxed">
                    {s.detail}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

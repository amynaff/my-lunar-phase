"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Sparkles,
  Apple,
  Dumbbell,
  Heart,
  Moon,
  Brain,
  BookOpen,
  X,
  Settings,
} from "lucide-react";
import { useCycleStore } from "@/stores/cycle-store";
import { lifeStageInfo } from "@/lib/cycle/data";

const featureHighlights = [
  {
    icon: Apple,
    label: "Nutrition",
    desc: "Phase-matched meal guidance",
    href: "/nutrition",
    color: "#ec4899",
  },
  {
    icon: Dumbbell,
    label: "Movement",
    desc: "Workouts for your energy level",
    href: "/movement",
    color: "#9333ea",
  },
  {
    icon: Heart,
    label: "Self-Care",
    desc: "Rituals to honor your body",
    href: "/selfcare",
    color: "#f9a8d4",
  },
  {
    icon: Brain,
    label: "Luna AI",
    desc: "Your personal wellness guide",
    href: "/luna-ai",
    color: "#9d84ed",
  },
  {
    icon: BookOpen,
    label: "Journal",
    desc: "Reflect and track your journey",
    href: "/journal",
    color: "#f59e0b",
  },
];

export function WelcomeCard() {
  const lifeStage = useCycleStore((s) => s.lifeStage);
  const [dismissed, setDismissed] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Show welcome card if user hasn't dismissed it yet
    const wasDismissed = localStorage.getItem("luna-welcome-dismissed");
    if (!wasDismissed) {
      setShow(true);
    }
  }, []);

  function handleDismiss() {
    setDismissed(true);
    localStorage.setItem("luna-welcome-dismissed", "true");
  }

  if (!show || dismissed) return null;

  const stageInfo = lifeStageInfo[lifeStage];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="mb-8 rounded-[24px] border border-accent-purple/20 bg-gradient-to-br from-accent-purple/10 via-bg-card to-accent-pink/5 p-6 lg:p-8 relative overflow-hidden"
      >
        {/* Dismiss button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-bg-secondary/80 transition-colors text-text-muted hover:text-text-secondary"
          aria-label="Dismiss welcome card"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-accent-purple/15 flex-shrink-0">
            <Sparkles className="h-7 w-7 text-accent-purple" />
          </div>
          <div>
            <h2 className="font-cormorant text-2xl lg:text-3xl font-semibold text-text-primary">
              Welcome to MyLunarPhase
            </h2>
            <p className="text-sm text-text-secondary font-quicksand mt-1 leading-relaxed">
              Your personalized wellness journey starts now. Here&apos;s what&apos;s waiting for you.
            </p>
          </div>
        </div>

        {/* Life stage badge */}
        <div className="flex items-center gap-3 mb-6 p-3 rounded-2xl bg-bg-card/80 border border-border-light w-fit">
          <span className="text-2xl">{stageInfo.emoji}</span>
          <div>
            <p className="font-quicksand font-semibold text-sm text-text-primary">
              {stageInfo.name}
            </p>
            <p className="text-xs text-text-muted font-quicksand">
              {stageInfo.description}
            </p>
          </div>
          <Link
            href="/settings"
            className="ml-2 p-1.5 rounded-full hover:bg-bg-secondary/80 transition-colors text-text-muted hover:text-text-secondary"
            title="Change life stage"
          >
            <Settings className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Feature highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {featureHighlights.map(({ icon: Icon, label, desc, href, color }) => (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-2 p-4 rounded-[18px] border border-border-light bg-bg-card/80 hover:bg-bg-secondary/50 transition-all hover:scale-[1.02]"
            >
              <div
                className="flex items-center justify-center w-10 h-10 rounded-full"
                style={{ backgroundColor: `${color}15` }}
              >
                <Icon className="h-5 w-5" style={{ color }} />
              </div>
              <div className="text-center">
                <p className="font-quicksand font-semibold text-xs text-text-primary">
                  {label}
                </p>
                <p className="text-[10px] text-text-muted font-quicksand mt-0.5 leading-tight">
                  {desc}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* Moon accent */}
        <div className="absolute -bottom-6 -right-6 opacity-5">
          <Moon className="h-32 w-32 text-accent-purple" />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

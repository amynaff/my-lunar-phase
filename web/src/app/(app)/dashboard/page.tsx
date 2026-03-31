"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Sparkles, Apple, Dumbbell, Heart, Moon, Calendar, Droplets, BookOpen } from "lucide-react";
import { CycleWheel } from "@/components/cycle/cycle-wheel";
import { MoonPhaseCard } from "@/components/cycle/moon-phase-card";
import { PhaseInfoCard } from "@/components/cycle/phase-info-card";
import { CycleInsightsCard } from "@/components/cycle/cycle-insights-card";
import { LogPeriodModal } from "@/components/cycle/log-period-modal";
import { QuickCheckIn } from "@/components/journal/quick-check-in";
import { useCycleData } from "@/hooks/use-cycle-data";
import { useCycleStore } from "@/stores/cycle-store";
import { useRouter } from "next/navigation";

const quickActions = [
  { href: "/nutrition", label: "Nutrition", icon: Apple, color: "#ec4899" },
  { href: "/movement", label: "Movement", icon: Dumbbell, color: "#9333ea" },
  { href: "/selfcare", label: "Self-Care", icon: Heart, color: "#f9a8d4" },
  { href: "/luna-ai", label: "Luna AI", icon: Sparkles, color: "#9d84ed" },
];

const cycleAffirmations: Record<string, string[]> = {
  menstrual: [
    "I deserve rest and restoration",
    "My body knows what it needs",
    "I honor my inner winter",
  ],
  follicular: [
    "I am open to new possibilities",
    "My creativity flows freely",
    "I embrace fresh beginnings",
  ],
  ovulatory: [
    "I radiate confidence and warmth",
    "My voice deserves to be heard",
    "I am magnetic and powerful",
  ],
  luteal: [
    "I honor my need for rest and space",
    "My feelings are valid and temporary",
    "I trust my inner wisdom",
  ],
};

const moonAffirmations: Record<string, string[]> = {
  new_moon: [
    "I set intentions with clarity",
    "New beginnings flow to me",
    "I plant seeds of possibility",
  ],
  waxing_crescent: [
    "My intentions are taking root",
    "I trust the process of growth",
    "Each day I move closer to my vision",
  ],
  first_quarter: [
    "I take bold action with confidence",
    "Challenges strengthen my resolve",
    "I am building something beautiful",
  ],
  waxing_gibbous: [
    "I refine and polish my goals",
    "I trust the momentum I have built",
    "My patience is rewarded",
  ],
  full_moon: [
    "I celebrate how far I have come",
    "I release what no longer serves me",
    "My light shines fully and freely",
  ],
  waning_gibbous: [
    "I share my wisdom generously",
    "Gratitude fills my heart",
    "I reflect on my blessings",
  ],
  last_quarter: [
    "I let go with grace and ease",
    "Forgiveness sets me free",
    "I make space for what matters",
  ],
  waning_crescent: [
    "I surrender to stillness",
    "Rest is my greatest strength",
    "I honor my need for quiet renewal",
  ],
};

export default function DashboardPage() {
  const router = useRouter();
  const hasCompletedOnboarding = useCycleStore((s) => s.hasCompletedOnboarding);
  const [hydrated, setHydrated] = useState(false);
  const {
    lifeStage,
    currentPhase,
    currentMoonPhase,
    dayOfCycle,
    phaseProgress,
    daysUntilNextPeriod,
    isRegular,
    currentPhaseInfo,
    currentMoonInfo,
    currentLifeStageInfo,
    cycleLength,
  } = useCycleData();

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated && !hasCompletedOnboarding) {
      router.push("/onboarding");
    }
  }, [hydrated, hasCompletedOnboarding, router]);

  const [showPeriodLog, setShowPeriodLog] = useState(false);
  const [showQuickCheckIn, setShowQuickCheckIn] = useState(false);

  if (!hydrated || !hasCompletedOnboarding) return null;

  const activeAffirmations = isRegular
    ? (cycleAffirmations[currentPhase] || cycleAffirmations.follicular)
    : (moonAffirmations[currentMoonPhase] || moonAffirmations.new_moon);

  const affirmationColor = isRegular ? currentPhaseInfo.color : currentMoonInfo.color;

  return (
    <div className="max-w-4xl mx-auto px-4 lg:px-8 py-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="font-cormorant text-3xl font-semibold text-text-primary">
          Welcome Back
        </h1>
        <p className="text-sm text-text-secondary font-quicksand mt-1">
          {isRegular
            ? `Day ${dayOfCycle} of your cycle`
            : `Guided by the ${currentMoonInfo.name}`}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visualization */}
        <div className="flex flex-col items-center gap-6">
          {isRegular ? (
            <CycleWheel
              currentPhase={currentPhase}
              dayOfCycle={dayOfCycle}
              cycleLength={cycleLength}
              phaseProgress={phaseProgress}
            />
          ) : (
            <MoonPhaseCard moonPhaseInfo={currentMoonInfo} />
          )}
        </div>

        {/* Info cards */}
        <div className="space-y-4">
          {isRegular ? (
            <PhaseInfoCard
              phaseInfo={currentPhaseInfo}
              daysUntilNextPeriod={daysUntilNextPeriod}
            />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="rounded-[20px] border border-border-light bg-bg-card p-5"
            >
              <p className="text-sm text-text-secondary font-quicksand leading-relaxed">
                {currentLifeStageInfo.description}
              </p>
            </motion.div>
          )}

          {/* Period log button (regular users only) */}
          {isRegular && (
            <button
              onClick={() => setShowPeriodLog(true)}
              className="flex items-center gap-3 p-4 rounded-[20px] border border-accent-pink/20 bg-accent-pink/5 hover:bg-accent-pink/10 transition-colors text-left w-full"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-accent-pink/15">
                <Droplets className="h-5 w-5 text-accent-pink" />
              </div>
              <div>
                <p className="font-quicksand font-semibold text-text-primary text-sm">Log Period</p>
                <p className="text-xs text-text-muted font-quicksand">Period started? Tap to update Day 1</p>
              </div>
            </button>
          )}

          {/* Quick actions row */}
          <div className="flex gap-2">
            <Link
              href="/log-mood"
              className="flex-1 flex items-center gap-3 p-4 rounded-[20px] border border-border-light bg-bg-card hover:bg-bg-secondary/50 transition-colors"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-accent-rose/15">
                <Calendar className="h-5 w-5 text-accent-pink" />
              </div>
              <div>
                <p className="font-quicksand font-semibold text-text-primary text-sm">Log Mood</p>
                <p className="text-xs text-text-muted font-quicksand">Track mood & energy</p>
              </div>
            </Link>
            <button
              onClick={() => setShowQuickCheckIn(true)}
              className="flex-1 flex items-center gap-3 p-4 rounded-[20px] border border-border-light bg-bg-card hover:bg-bg-secondary/50 transition-colors text-left"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-accent-purple/15">
                <BookOpen className="h-5 w-5 text-accent-purple" />
              </div>
              <div>
                <p className="font-quicksand font-semibold text-text-primary text-sm">Journal</p>
                <p className="text-xs text-text-muted font-quicksand">Quick check-in</p>
              </div>
            </button>
          </div>

          {/* Cycle insights (regular users) */}
          <CycleInsightsCard />
        </div>
      </div>

      {/* Quick actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-8"
      >
        <p className="text-xs uppercase tracking-wider text-text-accent font-quicksand font-semibold mb-4">
          Quick Actions
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map(({ href, label, icon: Icon, color }) => (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-2 p-4 rounded-[20px] border border-border-light bg-bg-card hover:bg-bg-secondary/50 transition-colors"
            >
              <div
                className="flex items-center justify-center w-10 h-10 rounded-full"
                style={{ backgroundColor: `${color}15` }}
              >
                <Icon className="h-5 w-5" style={{ color }} />
              </div>
              <span className="text-sm font-quicksand font-medium text-text-secondary">
                {label}
              </span>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Affirmations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-8"
      >
        <p className="text-xs uppercase tracking-wider text-text-accent font-quicksand font-semibold mb-4">
          Daily Affirmations
        </p>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
          {activeAffirmations.map((text, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-56 p-4 rounded-[20px] border border-border-light"
              style={{
                background: `linear-gradient(135deg, ${affirmationColor}10, ${affirmationColor}05)`,
              }}
            >
              <Moon className="h-4 w-4 text-text-accent mb-2" />
              <p className="font-cormorant text-base text-text-primary italic leading-relaxed">
                "{text}"
              </p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Modals */}
      <LogPeriodModal open={showPeriodLog} onClose={() => setShowPeriodLog(false)} />
      <QuickCheckIn open={showQuickCheckIn} onClose={() => setShowQuickCheckIn(false)} />
    </div>
  );
}

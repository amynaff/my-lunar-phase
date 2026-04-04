"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Calendar, ArrowRight, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCycleStore } from "@/stores/cycle-store";
import { lifeStageInfo } from "@/lib/cycle/data";
import type { LifeStage } from "@/lib/cycle/types";
import { GradientBackground } from "@/components/shared/gradient-background";
import { Button } from "@/components/ui/button";

const lifeStages: { key: LifeStage; tagline: string }[] = [
  { key: "regular", tagline: "Track your cycle, optimize every phase" },
  { key: "perimenopause", tagline: "Navigate this powerful transition with confidence" },
  { key: "menopause", tagline: "Embrace your second spring with grace" },
  { key: "postmenopause", tagline: "Thrive in your wisdom years" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const {
    setLifeStage,
    setCycleLength,
    setPeriodLength,
    setLastPeriodStart,
    completeOnboarding,
  } = useCycleStore();

  const [step, setStep] = useState(1);
  const [selectedStage, setSelectedStage] = useState<LifeStage | null>(null);
  const [cycleLengthValue, setCycleLengthValue] = useState(28);
  const [periodLengthValue, setPeriodLengthValue] = useState(5);
  const [lastPeriodDate, setLastPeriodDate] = useState("");

  function handleStageSelect(stage: LifeStage) {
    setSelectedStage(stage);
  }

  async function saveToServer(data: Record<string, unknown>) {
    try {
      await fetch("/api/cycle-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } catch {
      // Local store still saves, server sync will catch up
    }
  }

  function handleNextFromStage() {
    if (!selectedStage) return;
    setLifeStage(selectedStage);

    if (selectedStage === "regular") {
      setStep(2);
    } else {
      // Non-cycling stages skip cycle config
      completeOnboarding();
      saveToServer({
        lifeStage: selectedStage,
        cycleLength: 28,
        periodLength: 5,
        hasCompletedOnboarding: true,
      });
      router.push("/dashboard");
    }
  }

  function handleFinish() {
    setCycleLength(cycleLengthValue);
    setPeriodLength(periodLengthValue);
    const lastPeriodISO = lastPeriodDate ? new Date(lastPeriodDate).toISOString() : null;
    if (lastPeriodDate) {
      setLastPeriodStart(new Date(lastPeriodDate));
    }
    completeOnboarding();
    saveToServer({
      lifeStage: selectedStage,
      cycleLength: cycleLengthValue,
      periodLength: periodLengthValue,
      lastPeriodStart: lastPeriodISO,
      hasCompletedOnboarding: true,
    });
    router.push("/dashboard");
  }

  return (
    <GradientBackground>
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="font-cormorant text-2xl font-semibold text-text-primary tracking-wide">
              MyLunarPhase
            </h1>
          </motion.div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Welcome + Stage Picker */}
                <div className="rounded-[24px] border border-border-light bg-bg-card p-8">
                  <div className="text-center mb-8">
                    <div className="flex items-center justify-center w-14 h-14 rounded-full bg-accent-purple/15 mx-auto mb-4">
                      <Sparkles className="h-7 w-7 text-accent-purple" />
                    </div>
                    <h2 className="font-cormorant text-3xl font-semibold text-text-primary mb-2">
                      Welcome to Your Journey
                    </h2>
                    <p className="text-sm text-text-secondary font-quicksand leading-relaxed">
                      Every woman&apos;s path is unique. Tell us where you are so we can
                      personalize everything just for you.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <Moon className="h-4 w-4 text-accent-purple" />
                    <span className="text-xs uppercase tracking-wider text-text-accent font-quicksand font-semibold">
                      What stage are you in?
                    </span>
                  </div>

                  <div className="space-y-3">
                    {lifeStages.map(({ key, tagline }) => {
                      const info = lifeStageInfo[key];
                      const isSelected = selectedStage === key;
                      return (
                        <button
                          key={key}
                          onClick={() => handleStageSelect(key)}
                          className={`w-full flex items-center gap-4 p-4 rounded-[18px] border transition-all text-left ${
                            isSelected
                              ? "border-accent-purple bg-accent-purple/10 shadow-sm"
                              : "border-border-light bg-bg-secondary/50 hover:bg-bg-secondary hover:border-border-medium"
                          }`}
                        >
                          <span className="text-3xl flex-shrink-0">{info.emoji}</span>
                          <div className="min-w-0">
                            <p className="font-quicksand font-bold text-sm text-text-primary">
                              {info.name}
                            </p>
                            <p className="text-xs text-text-muted font-quicksand mt-0.5">
                              {info.ageRange}
                            </p>
                            <p className="text-[11px] text-text-secondary font-quicksand mt-1 leading-relaxed">
                              {tagline}
                            </p>
                          </div>
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="ml-auto flex-shrink-0 w-6 h-6 rounded-full bg-accent-purple flex items-center justify-center"
                            >
                              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            </motion.div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <Button
                    onClick={handleNextFromStage}
                    disabled={!selectedStage}
                    className="w-full mt-6"
                  >
                    {selectedStage === "regular" ? (
                      <>
                        Next: Cycle Details
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </>
                    ) : (
                      <>
                        Get Started
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Cycle Configuration */}
                <div className="rounded-[24px] border border-border-light bg-bg-card p-8">
                  <div className="text-center mb-8">
                    <div className="flex items-center justify-center w-14 h-14 rounded-full bg-accent-pink/15 mx-auto mb-4">
                      <Calendar className="h-7 w-7 text-accent-pink" />
                    </div>
                    <h2 className="font-cormorant text-3xl font-semibold text-text-primary mb-2">
                      Your Cycle Details
                    </h2>
                    <p className="text-sm text-text-secondary font-quicksand leading-relaxed">
                      This helps us predict your phases and give you the right guidance
                      at the right time. You can always update this later.
                    </p>
                  </div>

                  <div className="space-y-6">
                    {/* Last Period */}
                    <div>
                      <label className="text-xs text-text-secondary font-quicksand font-semibold uppercase tracking-wider">
                        When did your last period start?
                      </label>
                      <input
                        type="date"
                        value={lastPeriodDate}
                        onChange={(e) => setLastPeriodDate(e.target.value)}
                        max={new Date().toISOString().split("T")[0]}
                        className="w-full mt-2 px-4 py-3.5 rounded-2xl border border-border-light bg-bg-input text-text-primary font-quicksand text-sm focus:outline-none focus:border-accent-purple transition-colors"
                      />
                      <p className="text-[10px] text-text-muted font-quicksand mt-1.5">
                        Your best estimate is fine!
                      </p>
                    </div>

                    {/* Cycle Length */}
                    <div>
                      <label className="text-xs text-text-secondary font-quicksand font-semibold uppercase tracking-wider">
                        Average cycle length
                      </label>
                      <div className="flex items-center gap-3 mt-2">
                        <input
                          type="range"
                          min={21}
                          max={40}
                          value={cycleLengthValue}
                          onChange={(e) => setCycleLengthValue(Number(e.target.value))}
                          className="flex-1 accent-accent-purple"
                        />
                        <span className="font-quicksand font-bold text-lg text-accent-purple min-w-[60px] text-center">
                          {cycleLengthValue} days
                        </span>
                      </div>
                      <div className="flex justify-between text-[10px] text-text-muted font-quicksand mt-1">
                        <span>21 days</span>
                        <span>28 is average</span>
                        <span>40 days</span>
                      </div>
                    </div>

                    {/* Period Length */}
                    <div>
                      <label className="text-xs text-text-secondary font-quicksand font-semibold uppercase tracking-wider">
                        Average period length
                      </label>
                      <div className="flex items-center gap-3 mt-2">
                        <input
                          type="range"
                          min={2}
                          max={10}
                          value={periodLengthValue}
                          onChange={(e) => setPeriodLengthValue(Number(e.target.value))}
                          className="flex-1 accent-accent-pink"
                        />
                        <span className="font-quicksand font-bold text-lg text-accent-pink min-w-[60px] text-center">
                          {periodLengthValue} days
                        </span>
                      </div>
                      <div className="flex justify-between text-[10px] text-text-muted font-quicksand mt-1">
                        <span>2 days</span>
                        <span>5 is average</span>
                        <span>10 days</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-8">
                    <Button
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleFinish}
                      className="flex-1"
                    >
                      Start My Journey
                      <Sparkles className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step indicator */}
          {selectedStage === "regular" && (
            <div className="flex justify-center gap-2 mt-6">
              {[1, 2].map((s) => (
                <div
                  key={s}
                  className={`h-1.5 rounded-full transition-all ${
                    s === step ? "w-8 bg-accent-purple" : "w-4 bg-border-medium"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </GradientBackground>
  );
}

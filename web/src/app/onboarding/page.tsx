"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Calendar, ArrowRight, Sparkles, Bell, BellOff, User, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCycleStore } from "@/stores/cycle-store";
import { lifeStageInfo } from "@/lib/cycle/data";
import type { LifeStage } from "@/lib/cycle/types";
import { GradientBackground } from "@/components/shared/gradient-background";
import { Button } from "@/components/ui/button";
import { usePushNotifications } from "@/hooks/use-push-notifications";

const lifeStages: { key: LifeStage; tagline: string }[] = [
  { key: "regular", tagline: "Track your cycle, optimize every phase" },
  { key: "perimenopause", tagline: "Navigate this powerful transition with confidence" },
  { key: "menopause", tagline: "Embrace your second spring with grace" },
  { key: "postmenopause", tagline: "Thrive in your wisdom years" },
];

// Step order:
// 0 = Welcome
// 1 = Life stage
// 2 = Profile (name, birth year — optional)
// 3 = Cycle config (regular only)
// 4 = Notification permission

type Step = 0 | 1 | 2 | 3 | 4;

export default function OnboardingPage() {
  const router = useRouter();
  const {
    setLifeStage,
    setProfile,
    setCycleLength,
    setPeriodLength,
    setLastPeriodStart,
    completeOnboarding,
  } = useCycleStore();

  const { subscribe: subscribePush } = usePushNotifications();
  const [step, setStep] = useState<Step>(0);
  const [selectedStage, setSelectedStage] = useState<LifeStage | null>(null);
  const [cycleLengthValue, setCycleLengthValue] = useState(28);
  const [periodLengthValue, setPeriodLengthValue] = useState(5);
  const [lastPeriodDate, setLastPeriodDate] = useState("");
  const [name, setName] = useState("");
  const [birthYear, setBirthYear] = useState("");

  const isRegular = selectedStage === "regular";
  // Steps for regular: 0,1,2,3,4 | for peri/meno: 0,1,2,4
  const totalSteps = isRegular ? 5 : 4;
  const visualStep = isRegular
    ? step
    : step === 3 ? 3 : step >= 4 ? 4 : step; // remap for display

  async function saveToServer(data: Record<string, unknown>) {
    try {
      await fetch("/api/cycle-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } catch {
      // Local store still saves; server sync will catch up
    }
  }

  async function finishOnboarding() {
    const birthYearNum = birthYear ? parseInt(birthYear) : null;
    setProfile(name.trim(), birthYearNum);

    if (isRegular) {
      setCycleLength(cycleLengthValue);
      setPeriodLength(periodLengthValue);
      if (lastPeriodDate) setLastPeriodStart(new Date(lastPeriodDate));
    }

    completeOnboarding();

    saveToServer({
      lifeStage: selectedStage,
      profileName: name.trim() || null,
      profileBirthYear: birthYearNum,
      cycleLength: isRegular ? cycleLengthValue : 28,
      periodLength: isRegular ? periodLengthValue : 5,
      lastPeriodStart: lastPeriodDate ? new Date(lastPeriodDate).toISOString() : null,
      hasCompletedOnboarding: true,
    });

    router.push("/dashboard");
  }

  async function handleNotificationStep(requestPermission: boolean) {
    if (requestPermission) {
      // Subscribe to push notifications (handles permission request internally)
      await subscribePush();
    }
    await finishOnboarding();
  }

  function goBack() {
    if (step === 0) return;
    if (step === 4 && !isRegular) {
      setStep(2);
    } else {
      setStep((s) => (s - 1) as Step);
    }
  }

  function handleStageNext() {
    if (!selectedStage) return;
    setLifeStage(selectedStage);
    setStep(2);
  }

  function handleProfileNext() {
    if (isRegular) {
      setStep(3);
    } else {
      setStep(4);
    }
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
              My Lunar Phase
            </h1>
          </motion.div>

          <AnimatePresence mode="wait">
            {/* ── Step 0: Welcome ── */}
            {step === 0 && (
              <motion.div
                key="step0"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <div className="rounded-[24px] border border-border-light bg-bg-card p-8 text-center">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                    className="flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-accent-pink/20 to-accent-purple/20 mx-auto mb-6"
                  >
                    <Moon className="h-10 w-10 text-accent-purple" />
                  </motion.div>
                  <h2 className="font-cormorant text-4xl font-semibold text-text-primary mb-3">
                    Your body, your rhythm
                  </h2>
                  <p className="text-sm text-text-secondary font-quicksand leading-relaxed mb-2">
                    My Lunar Phase helps you track your cycle, understand your phases, and build a wellness routine that works <em>with</em> your body — not against it.
                  </p>
                  <p className="text-xs text-text-muted font-quicksand mb-8">
                    Setup takes less than 2 minutes. Your data stays private.
                  </p>
                  <div className="space-y-3">
                    {[
                      "🌙 Phase-aware insights & self-care tips",
                      "📅 Cycle prediction & reminders",
                      "📓 Daily mood & symptom tracking",
                    ].map((item) => (
                      <div key={item} className="flex items-center gap-2 text-left px-2">
                        <span className="text-sm">{item.split(" ")[0]}</span>
                        <span className="text-xs text-text-secondary font-quicksand">{item.slice(3)}</span>
                      </div>
                    ))}
                  </div>
                  <Button onClick={() => setStep(1)} className="w-full mt-8">
                    Get Started
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* ── Step 1: Life Stage ── */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="rounded-[24px] border border-border-light bg-bg-card p-8">
                  <button onClick={goBack} className="flex items-center gap-1 text-text-muted hover:text-text-primary mb-6 transition-colors">
                    <ChevronLeft className="h-4 w-4" />
                    <span className="text-xs font-quicksand">Back</span>
                  </button>
                  <div className="text-center mb-8">
                    <div className="flex items-center justify-center w-14 h-14 rounded-full bg-accent-purple/15 mx-auto mb-4">
                      <Sparkles className="h-7 w-7 text-accent-purple" />
                    </div>
                    <h2 className="font-cormorant text-3xl font-semibold text-text-primary mb-2">
                      Where are you now?
                    </h2>
                    <p className="text-sm text-text-secondary font-quicksand leading-relaxed">
                      Every woman&apos;s path is unique. Tell us where you are so we can
                      personalize everything just for you.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {lifeStages.map(({ key, tagline }) => {
                      const info = lifeStageInfo[key];
                      const isSelected = selectedStage === key;
                      return (
                        <button
                          key={key}
                          onClick={() => setSelectedStage(key)}
                          className={`w-full flex items-center gap-4 p-4 rounded-[18px] border transition-all text-left ${
                            isSelected
                              ? "border-accent-purple bg-accent-purple/10 shadow-sm"
                              : "border-border-light bg-bg-secondary/50 hover:bg-bg-secondary hover:border-border-medium"
                          }`}
                        >
                          <span className="text-3xl flex-shrink-0">{info.emoji}</span>
                          <div className="min-w-0">
                            <p className="font-quicksand font-bold text-sm text-text-primary">{info.name}</p>
                            <p className="text-xs text-text-muted font-quicksand mt-0.5">{info.ageRange}</p>
                            <p className="text-[11px] text-text-secondary font-quicksand mt-1 leading-relaxed">{tagline}</p>
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

                  <Button onClick={handleStageNext} disabled={!selectedStage} className="w-full mt-6">
                    Continue
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* ── Step 2: Profile (optional) ── */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="rounded-[24px] border border-border-light bg-bg-card p-8">
                  <button onClick={goBack} className="flex items-center gap-1 text-text-muted hover:text-text-primary mb-6 transition-colors">
                    <ChevronLeft className="h-4 w-4" />
                    <span className="text-xs font-quicksand">Back</span>
                  </button>
                  <div className="text-center mb-8">
                    <div className="flex items-center justify-center w-14 h-14 rounded-full bg-accent-pink/15 mx-auto mb-4">
                      <User className="h-7 w-7 text-accent-pink" />
                    </div>
                    <h2 className="font-cormorant text-3xl font-semibold text-text-primary mb-2">
                      A little about you
                    </h2>
                    <p className="text-sm text-text-secondary font-quicksand leading-relaxed">
                      Both fields are optional — skip them if you prefer.
                    </p>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="text-xs text-text-secondary font-quicksand font-semibold uppercase tracking-wider">
                        Your name <span className="normal-case text-text-muted font-normal">(optional)</span>
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Luna"
                        maxLength={50}
                        className="w-full mt-2 px-4 py-3.5 rounded-2xl border border-border-light bg-bg-input text-text-primary font-quicksand text-sm focus:outline-none focus:border-accent-purple transition-colors placeholder:text-text-muted"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-text-secondary font-quicksand font-semibold uppercase tracking-wider">
                        Birth year <span className="normal-case text-text-muted font-normal">(optional)</span>
                      </label>
                      <input
                        type="number"
                        value={birthYear}
                        onChange={(e) => setBirthYear(e.target.value)}
                        placeholder="e.g. 1992"
                        min={1920}
                        max={new Date().getFullYear() - 10}
                        className="w-full mt-2 px-4 py-3.5 rounded-2xl border border-border-light bg-bg-input text-text-primary font-quicksand text-sm focus:outline-none focus:border-accent-purple transition-colors placeholder:text-text-muted"
                      />
                      <p className="text-[10px] text-text-muted font-quicksand mt-1.5">
                        Helps us tailor life stage insights as you grow.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-8">
                    <Button variant="outline" onClick={handleProfileNext} className="flex-1">
                      Skip
                    </Button>
                    <Button onClick={handleProfileNext} className="flex-1">
                      Continue
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── Step 3: Cycle Config (regular only) ── */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="rounded-[24px] border border-border-light bg-bg-card p-8">
                  <button onClick={goBack} className="flex items-center gap-1 text-text-muted hover:text-text-primary mb-6 transition-colors">
                    <ChevronLeft className="h-4 w-4" />
                    <span className="text-xs font-quicksand">Back</span>
                  </button>
                  <div className="text-center mb-8">
                    <div className="flex items-center justify-center w-14 h-14 rounded-full bg-accent-pink/15 mx-auto mb-4">
                      <Calendar className="h-7 w-7 text-accent-pink" />
                    </div>
                    <h2 className="font-cormorant text-3xl font-semibold text-text-primary mb-2">
                      Your Cycle Details
                    </h2>
                    <p className="text-sm text-text-secondary font-quicksand leading-relaxed">
                      This helps us predict your phases. You can always update this later.
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="text-xs text-text-secondary font-quicksand font-semibold uppercase tracking-wider">
                        When did your last period start? <span className="normal-case text-text-muted font-normal">(optional)</span>
                      </label>
                      <input
                        type="date"
                        value={lastPeriodDate}
                        onChange={(e) => setLastPeriodDate(e.target.value)}
                        max={new Date().toISOString().split("T")[0]}
                        className="w-full mt-2 px-4 py-3.5 rounded-2xl border border-border-light bg-bg-input text-text-primary font-quicksand text-sm focus:outline-none focus:border-accent-purple transition-colors"
                      />
                      <p className="text-[10px] text-text-muted font-quicksand mt-1.5">Your best estimate is fine!</p>
                    </div>

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

                  <Button onClick={() => setStep(4)} className="w-full mt-8">
                    Continue
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* ── Step 4: Notification Permission ── */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="rounded-[24px] border border-border-light bg-bg-card p-8">
                  <button onClick={goBack} className="flex items-center gap-1 text-text-muted hover:text-text-primary mb-6 transition-colors">
                    <ChevronLeft className="h-4 w-4" />
                    <span className="text-xs font-quicksand">Back</span>
                  </button>
                  <div className="text-center mb-8">
                    <div className="flex items-center justify-center w-14 h-14 rounded-full bg-accent-purple/15 mx-auto mb-4">
                      <Bell className="h-7 w-7 text-accent-purple" />
                    </div>
                    <h2 className="font-cormorant text-3xl font-semibold text-text-primary mb-2">
                      Stay in sync
                    </h2>
                    <p className="text-sm text-text-secondary font-quicksand leading-relaxed">
                      Get gentle reminders so you&apos;re never caught off guard.
                    </p>
                  </div>

                  <div className="space-y-3 mb-8">
                    {[
                      { icon: "🌸", text: "Period arriving in 3 days" },
                      { icon: "✨", text: "Ovulation window approaching" },
                      { icon: "🌙", text: "Daily log reminder (your time)" },
                      { icon: "🔄", text: "Phase change notifications" },
                    ].map(({ icon, text }) => (
                      <div key={text} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-bg-secondary/50">
                        <span className="text-lg">{icon}</span>
                        <span className="text-sm font-quicksand text-text-secondary">{text}</span>
                      </div>
                    ))}
                  </div>

                  <p className="text-[10px] text-text-muted font-quicksand text-center mb-5">
                    You can manage notifications anytime in Settings.
                  </p>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => handleNotificationStep(false)}
                      className="flex-1 gap-1.5"
                    >
                      <BellOff className="h-4 w-4" />
                      Skip
                    </Button>
                    <Button
                      onClick={() => handleNotificationStep(true)}
                      className="flex-1 gap-1.5"
                    >
                      <Bell className="h-4 w-4" />
                      Enable
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step indicator */}
          {step > 0 && (
            <div className="flex justify-center gap-2 mt-6">
              {Array.from({ length: totalSteps - 1 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i + 1 <= (isRegular ? step : visualStep)
                      ? "w-8 bg-accent-purple"
                      : "w-4 bg-border-medium"
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

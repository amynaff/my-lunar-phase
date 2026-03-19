"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Moon, ArrowRight, ArrowLeft, Sparkles } from "lucide-react";
import { LifeStagePicker } from "@/components/onboarding/life-stage-picker";
import { CycleConfig } from "@/components/onboarding/cycle-config";
import { useCycleStore } from "@/stores/cycle-store";
import type { LifeStage } from "@/lib/cycle/types";
import { Button } from "@/components/ui/button";

export default function OnboardingPage() {
  const router = useRouter();
  const {
    setLifeStage,
    setLastPeriodStart,
    setCycleLength,
    setPeriodLength,
    completeOnboarding,
  } = useCycleStore();

  const [step, setStep] = useState(1);
  const [selectedStage, setSelectedStage] = useState<LifeStage | null>(null);

  const totalSteps = selectedStage === "regular" ? 4 : 3;

  function handleStageSelect(stage: LifeStage) {
    setSelectedStage(stage);
    setLifeStage(stage);
  }

  function handleCycleComplete(data: {
    lastPeriodStart: Date;
    cycleLength: number;
    periodLength: number;
  }) {
    setLastPeriodStart(data.lastPeriodStart);
    setCycleLength(data.cycleLength);
    setPeriodLength(data.periodLength);
    setStep(4);
  }

  function handleFinish() {
    completeOnboarding();
    router.push("/dashboard");
  }

  function nextStep() {
    if (step === 2 && selectedStage !== "regular") {
      setStep(totalSteps);
    } else {
      setStep((s) => s + 1);
    }
  }

  function prevStep() {
    if (step === totalSteps && selectedStage !== "regular") {
      setStep(2);
    } else {
      setStep((s) => Math.max(1, s - 1));
    }
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center px-4 py-8">
      {/* Progress */}
      <div className="flex gap-2 mb-8">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i + 1 <= step ? "w-8 bg-accent-purple" : "w-4 bg-border-light"
            }`}
          />
        ))}
      </div>

      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          {/* Step 1: Welcome */}
          {step === 1 && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="text-center"
            >
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-accent-purple/15 mx-auto mb-6">
                <Moon className="h-10 w-10 text-accent-purple" />
              </div>
              <h1 className="font-cormorant text-4xl font-semibold text-text-primary mb-3">
                Welcome to MyLunarPhase
              </h1>
              <p className="text-sm text-text-secondary font-quicksand leading-relaxed max-w-sm mx-auto mb-8">
                Your personalized wellness companion that syncs with your cycle and the lunar phases.
                Get nutrition, movement, and self-care recommendations tailored to where you are in your cycle.
              </p>
              <Button onClick={nextStep} className="mx-auto">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>
          )}

          {/* Step 2: Life Stage */}
          {step === 2 && (
            <motion.div
              key="lifestage"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
            >
              <h2 className="font-cormorant text-2xl font-semibold text-text-primary text-center mb-2">
                What&apos;s Your Life Stage?
              </h2>
              <p className="text-sm text-text-secondary font-quicksand text-center mb-6">
                This helps us personalize your experience
              </p>

              <LifeStagePicker selected={selectedStage} onSelect={handleStageSelect} />

              <div className="flex items-center justify-between mt-8">
                <Button variant="ghost" onClick={prevStep}>
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                <Button onClick={nextStep} disabled={!selectedStage}>
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Cycle Config (only for regular) */}
          {step === 3 && selectedStage === "regular" && (
            <motion.div
              key="cycleconfig"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
            >
              <h2 className="font-cormorant text-2xl font-semibold text-text-primary text-center mb-2">
                Your Cycle Details
              </h2>
              <p className="text-sm text-text-secondary font-quicksand text-center mb-6">
                Help us calculate your current phase
              </p>

              <CycleConfig onComplete={handleCycleComplete} />

              <div className="flex items-center justify-start mt-4">
                <Button variant="ghost" onClick={prevStep}>
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              </div>
            </motion.div>
          )}

          {/* Final Step: Completion */}
          {step === totalSteps && (step !== 3 || selectedStage !== "regular") && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center"
            >
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-accent-purple/15 mx-auto mb-6">
                <Sparkles className="h-10 w-10 text-accent-purple" />
              </div>
              <h2 className="font-cormorant text-3xl font-semibold text-text-primary mb-3">
                You&apos;re All Set!
              </h2>
              <p className="text-sm text-text-secondary font-quicksand leading-relaxed max-w-sm mx-auto mb-8">
                Your personalized wellness dashboard is ready. Explore nutrition tips, movement suggestions,
                and self-care activities tailored just for you.
              </p>
              <Button onClick={handleFinish} size="lg">
                <Sparkles className="h-4 w-4" />
                Go to Dashboard
              </Button>

              <div className="mt-4">
                <Button variant="ghost" onClick={prevStep}>
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

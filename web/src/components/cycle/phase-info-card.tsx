"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import type { CyclePhase, PhaseInfo } from "@/lib/cycle/types";

interface PhaseBodyInfo {
  hormones: string;
  bodySignals: string[];
  tips: string[];
}

const PHASE_BODY_INFO: Partial<Record<CyclePhase, PhaseBodyInfo>> = {
  menstrual: {
    hormones: "Estrogen & progesterone are at their lowest",
    bodySignals: [
      "Uterine lining sheds — prostaglandins may cause cramps",
      "Energy dips; your body is doing real work",
      "Digestion can slow; warmth helps",
    ],
    tips: [
      "Iron-rich foods help replenish: leafy greens, lentils, dark chocolate",
      "Gentle movement (yoga, walks) eases cramps better than rest alone",
      "Heat packs on the lower belly reduce prostaglandin-driven pain",
    ],
  },
  follicular: {
    hormones: "Estrogen rises steadily, building your uterine lining",
    bodySignals: [
      "A dominant follicle matures in your ovaries",
      "Energy and mood lift as estrogen climbs",
      "Cervical mucus increases and becomes creamy/sticky",
    ],
    tips: [
      "Best time to start new projects — creativity and motivation are peaking",
      "Fermented foods (yogurt, kimchi) support estrogen metabolism",
      "Great phase for strength training and trying new workouts",
    ],
  },
  ovulatory: {
    hormones: "Estrogen peaks → LH surge → ovulation; testosterone briefly rises",
    bodySignals: [
      "Egg released from dominant follicle (~12–36 hrs after LH surge)",
      "Cervical mucus turns clear and stretchy ('egg white')",
      "Mild one-sided pelvic tug (mittelschmerz) is common",
    ],
    tips: [
      "Your most social, magnetic window — schedule important conversations",
      "Anti-inflammatory foods (berries, salmon, flaxseed) support ovulation",
      "Libido is naturally highest — this is by design",
    ],
  },
  luteal: {
    hormones: "Progesterone rises, then both estrogen & progesterone drop before period",
    bodySignals: [
      "Uterine lining thickens in case of implantation",
      "Body temperature rises ~0.5°C after ovulation",
      "PMS symptoms (bloating, mood shifts) intensify as hormones fall",
    ],
    tips: [
      "Magnesium (dark chocolate, pumpkin seeds) eases cramping & mood dips",
      "Complex carbs stabilise blood sugar and reduce cravings",
      "Pilates, yoga, and moderate cardio match your shifting energy",
    ],
  },
};

interface PhaseInfoCardProps {
  phaseInfo: PhaseInfo;
  currentPhase?: CyclePhase;
  daysUntilNextPeriod?: number;
}

export function PhaseInfoCard({ phaseInfo, currentPhase, daysUntilNextPeriod }: PhaseInfoCardProps) {
  const [expanded, setExpanded] = useState(false);
  const bodyInfo = currentPhase ? PHASE_BODY_INFO[currentPhase] : undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="rounded-[20px] border border-border-light bg-bg-card p-5"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div
          className="flex items-center justify-center w-10 h-10 rounded-full text-xl"
          style={{ backgroundColor: `${phaseInfo.color}20` }}
        >
          {phaseInfo.emoji}
        </div>
        <div>
          <h3 className="font-cormorant text-lg font-semibold text-text-primary">
            {phaseInfo.name} Phase
          </h3>
          <p className="text-xs text-text-accent font-quicksand font-medium">
            {phaseInfo.energy}
          </p>
        </div>
      </div>

      <p className="text-sm text-text-secondary font-quicksand leading-relaxed">
        {phaseInfo.description}
      </p>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-text-muted font-quicksand">
          Superpower: {phaseInfo.superpower}
        </span>
        {daysUntilNextPeriod !== undefined && daysUntilNextPeriod > 0 && (
          <span className="text-xs font-quicksand font-semibold text-accent-pink">
            {daysUntilNextPeriod}d until period
          </span>
        )}
      </div>

      {/* Expandable body education */}
      {bodyInfo && (
        <div className="mt-4 border-t border-border-light pt-3">
          <button
            onClick={() => setExpanded((e) => !e)}
            className="w-full flex items-center justify-between text-xs font-quicksand font-semibold text-text-accent uppercase tracking-wider hover:text-text-primary transition-colors"
          >
            <span>What&apos;s happening in your body</span>
            <ChevronDown
              className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`}
            />
          </button>

          <AnimatePresence initial={false}>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="pt-3 space-y-3">
                  {/* Hormones */}
                  <div
                    className="px-3 py-2 rounded-xl text-xs font-quicksand"
                    style={{ backgroundColor: `${phaseInfo.color}12` }}
                  >
                    <span className="font-semibold text-text-primary">Hormones: </span>
                    <span className="text-text-secondary">{bodyInfo.hormones}</span>
                  </div>

                  {/* Body signals */}
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-text-muted font-quicksand font-semibold mb-1.5">
                      Body signals
                    </p>
                    <ul className="space-y-1">
                      {bodyInfo.bodySignals.map((signal) => (
                        <li key={signal} className="flex items-start gap-2 text-xs font-quicksand text-text-secondary">
                          <span className="mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: phaseInfo.color }} />
                          {signal}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Tips */}
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-text-muted font-quicksand font-semibold mb-1.5">
                      Phase tips
                    </p>
                    <ul className="space-y-1">
                      {bodyInfo.tips.map((tip) => (
                        <li key={tip} className="flex items-start gap-2 text-xs font-quicksand text-text-secondary">
                          <span className="mt-0.5 text-[10px]">✦</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}

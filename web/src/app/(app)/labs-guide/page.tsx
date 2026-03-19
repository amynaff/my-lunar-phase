"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FlaskConical, ChevronDown, Info } from "lucide-react";

interface LabTest {
  name: string;
  description: string;
  purpose: string;
}

interface LabPanel {
  id: string;
  title: string;
  timing: string;
  description: string;
  emoji: string;
  color: string;
  tests: LabTest[];
}

const labPanels: LabPanel[] = [
  {
    id: "cycle-day-3",
    title: "Cycle Day 3 Panel",
    timing: "Day 2-4 of your cycle (during menstruation)",
    description:
      "This foundational panel measures your baseline hormone levels at the start of your cycle, providing insight into ovarian reserve and overall reproductive health.",
    emoji: "🩸",
    color: "#be185d",
    tests: [
      {
        name: "FSH (Follicle-Stimulating Hormone)",
        description: "Stimulates egg development in the ovaries",
        purpose: "Evaluates ovarian reserve. Elevated levels may indicate diminished reserve.",
      },
      {
        name: "LH (Luteinizing Hormone)",
        description: "Triggers ovulation when it surges mid-cycle",
        purpose: "Helps assess ovulatory function. The LH:FSH ratio can indicate PCOS.",
      },
      {
        name: "Estradiol (E2)",
        description: "The primary form of estrogen during reproductive years",
        purpose: "Baseline levels help interpret FSH results and assess follicular health.",
      },
      {
        name: "AMH (Anti-Mullerian Hormone)",
        description: "Produced by small follicles in the ovaries",
        purpose: "The most reliable marker of ovarian reserve. Can be tested any day of cycle.",
      },
    ],
  },
  {
    id: "ovulation",
    title: "Ovulation Panel",
    timing: "Mid-cycle, typically days 12-16",
    description:
      "Confirms whether ovulation is occurring and helps optimize timing for those trying to conceive or simply understanding their cycle patterns.",
    emoji: "🌕",
    color: "#f9a8d4",
    tests: [
      {
        name: "LH Surge Test",
        description: "A rapid rise in LH triggers egg release within 24-36 hours",
        purpose: "Confirms impending ovulation. Best tracked with daily testing.",
      },
      {
        name: "Estradiol Peak",
        description: "Estradiol peaks just before ovulation",
        purpose: "A rising estradiol level confirms healthy follicle development.",
      },
      {
        name: "Cervical Mucus Assessment",
        description: "Egg-white cervical mucus indicates peak fertility",
        purpose: "Non-invasive indicator of estrogen levels and fertility window.",
      },
    ],
  },
  {
    id: "thyroid",
    title: "Thyroid Panel",
    timing: "Any time (fasting morning is ideal)",
    description:
      "Thyroid health profoundly affects menstrual regularity, energy, mood, and metabolism. Even subclinical thyroid issues can disrupt your cycle.",
    emoji: "🦋",
    color: "#9333ea",
    tests: [
      {
        name: "TSH (Thyroid-Stimulating Hormone)",
        description: "The primary screening test for thyroid function",
        purpose: "Elevated TSH suggests hypothyroidism; low TSH suggests hyperthyroidism.",
      },
      {
        name: "Free T4 (Thyroxine)",
        description: "The inactive form of thyroid hormone converted to active T3",
        purpose: "Low Free T4 with elevated TSH confirms primary hypothyroidism.",
      },
      {
        name: "Free T3 (Triiodothyronine)",
        description: "The active thyroid hormone that regulates metabolism",
        purpose: "Helps identify conversion issues where T4 is normal but T3 is low.",
      },
      {
        name: "Thyroid Antibodies (TPO & TG)",
        description: "Antibodies that attack the thyroid gland",
        purpose: "Identifies autoimmune thyroid conditions like Hashimoto's or Graves' disease.",
      },
    ],
  },
  {
    id: "adrenal",
    title: "Adrenal Panel",
    timing: "Morning (cortisol is highest 6-8 AM), fasting",
    description:
      "Chronic stress affects your cycle through the HPA axis. Elevated cortisol can suppress progesterone and disrupt ovulation.",
    emoji: "⚡",
    color: "#f59e0b",
    tests: [
      {
        name: "Morning Cortisol",
        description: "The primary stress hormone produced by the adrenal glands",
        purpose: "Screens for adrenal insufficiency (low) or Cushing's (high). Best tested fasting at 8 AM.",
      },
      {
        name: "DHEA-S",
        description: "A precursor hormone made by the adrenal glands",
        purpose: "Elevated levels may indicate adrenal androgen excess or PCOS. Low levels indicate adrenal fatigue.",
      },
      {
        name: "4-Point Cortisol (Salivary)",
        description: "Measures cortisol at 4 times throughout the day",
        purpose: "Maps your cortisol curve to identify dysregulated patterns like flat or inverted curves.",
      },
      {
        name: "Testosterone (Total & Free)",
        description: "An androgen hormone present in all women in small amounts",
        purpose: "Elevated levels can cause acne, hair loss, or irregular cycles. Important for PCOS evaluation.",
      },
    ],
  },
];

export default function LabsGuidePage() {
  const [expandedPanel, setExpandedPanel] = useState<string | null>(null);

  function togglePanel(id: string) {
    setExpandedPanel(expandedPanel === id ? null : id);
  }

  return (
    <div className="max-w-3xl mx-auto px-4 lg:px-8 py-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-accent-purple/15">
            <FlaskConical className="h-5 w-5 text-accent-purple" />
          </div>
          <div>
            <h1 className="font-cormorant text-3xl font-semibold text-text-primary">
              Labs Guide
            </h1>
            <p className="text-sm text-text-secondary font-quicksand">
              Recommended hormone tests for your wellness journey
            </p>
          </div>
        </div>
      </motion.div>

      {/* Disclaimer */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-start gap-3 rounded-[20px] border border-accent-purple/20 bg-accent-purple/5 p-5 mb-8"
      >
        <Info className="h-5 w-5 text-accent-purple flex-shrink-0 mt-0.5" />
        <p className="text-xs text-text-secondary font-quicksand leading-relaxed">
          This guide is for educational purposes only and is not a substitute for medical advice.
          Always discuss lab testing with your healthcare provider, who can order and interpret results
          in the context of your full health history.
        </p>
      </motion.div>

      {/* Panels */}
      <div className="space-y-4">
        {labPanels.map((panel, index) => (
          <motion.div
            key={panel.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + index * 0.08 }}
            className="rounded-[20px] border border-border-light bg-bg-card overflow-hidden"
          >
            <button
              onClick={() => togglePanel(panel.id)}
              className="w-full flex items-center gap-4 p-5 text-left hover:bg-bg-secondary/30 transition-colors"
            >
              <div
                className="flex items-center justify-center w-12 h-12 rounded-full text-2xl flex-shrink-0"
                style={{ backgroundColor: `${panel.color}15` }}
              >
                {panel.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-cormorant text-xl font-semibold text-text-primary">
                  {panel.title}
                </h2>
                <p className="text-xs text-text-muted font-quicksand mt-0.5">
                  {panel.timing}
                </p>
              </div>
              <ChevronDown
                className={`h-5 w-5 text-text-muted transition-transform flex-shrink-0 ${
                  expandedPanel === panel.id ? "rotate-180" : ""
                }`}
              />
            </button>

            <AnimatePresence initial={false}>
              {expandedPanel === panel.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5 space-y-4">
                    <p className="text-sm text-text-secondary font-quicksand leading-relaxed">
                      {panel.description}
                    </p>

                    <div className="space-y-3">
                      {panel.tests.map((test) => (
                        <div
                          key={test.name}
                          className="rounded-[16px] border border-border-light bg-bg-secondary/50 p-4"
                        >
                          <h3 className="font-quicksand font-semibold text-sm text-text-primary">
                            {test.name}
                          </h3>
                          <p className="text-xs text-text-muted font-quicksand mt-1">
                            {test.description}
                          </p>
                          <div className="mt-2 flex items-start gap-1.5">
                            <span
                              className="text-[10px] font-quicksand font-semibold px-2 py-0.5 rounded-lg flex-shrink-0"
                              style={{
                                backgroundColor: `${panel.color}15`,
                                color: panel.color,
                              }}
                            >
                              Why test
                            </span>
                            <p className="text-xs text-text-secondary font-quicksand">
                              {test.purpose}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

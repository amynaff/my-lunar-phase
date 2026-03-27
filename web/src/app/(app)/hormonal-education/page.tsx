"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronDown, ChevronUp, BookOpen, Beaker, Heart, Brain, Moon, Sparkles } from "lucide-react";
import Link from "next/link";
import { useCycleData } from "@/hooks/use-cycle-data";

interface EducationSection {
  title: string;
  icon: React.ReactNode;
  color: string;
  content: string[];
}

const regularEducation: EducationSection[] = [
  {
    title: "Understanding Your Menstrual Cycle",
    icon: <Moon className="h-5 w-5" />,
    color: "#ec4899",
    content: [
      "Your menstrual cycle is a complex interplay of hormones that prepares your body each month. The average cycle lasts 28 days but can range from 21-35 days.",
      "Estrogen rises during the follicular phase, peaks at ovulation, and drops during the luteal phase. Progesterone rises after ovulation and drops before your period.",
      "Understanding these hormonal shifts helps you work WITH your body rather than against it — adjusting nutrition, exercise, and self-care to match each phase.",
    ],
  },
  {
    title: "The Four Phases",
    icon: <Sparkles className="h-5 w-5" />,
    color: "#9333ea",
    content: [
      "Menstrual (Days 1-5): Your inner winter. Estrogen and progesterone are at their lowest. Honor rest and reflection.",
      "Follicular (Days 6-13): Your inner spring. Estrogen rises, bringing renewed energy, creativity, and optimism. Great time to start new projects.",
      "Ovulatory (Days 14-17): Your inner summer. Estrogen peaks, testosterone surges. You're at your most social, confident, and communicative.",
      "Luteal (Days 18-28): Your inner autumn. Progesterone rises then falls. Focus on completion, organization, and preparing for rest.",
    ],
  },
  {
    title: "Key Hormones",
    icon: <Beaker className="h-5 w-5" />,
    color: "#f59e0b",
    content: [
      "Estrogen: Your growth hormone. Builds uterine lining, boosts mood and energy, supports bone health, and enhances cognitive function.",
      "Progesterone: Your calming hormone. Stabilizes mood, promotes sleep, reduces anxiety, and maintains pregnancy if conception occurs.",
      "Testosterone: Your vitality hormone. Peaks at ovulation, drives libido, motivation, and muscle strength.",
      "FSH & LH: Follicle-stimulating and luteinizing hormones regulate your cycle from the pituitary gland. LH surge triggers ovulation.",
    ],
  },
  {
    title: "Nutrition by Phase",
    icon: <Heart className="h-5 w-5" />,
    color: "#22c55e",
    content: [
      "Menstrual: Focus on iron-rich foods (red meat, leafy greens, lentils), anti-inflammatory foods (turmeric, ginger, omega-3s), and warming comfort foods.",
      "Follicular: Emphasize sprouted and fermented foods, lean proteins, and foods that support estrogen metabolism (broccoli, flaxseeds).",
      "Ovulatory: Choose light, fiber-rich foods, raw vegetables, and fruits. Support your liver with cruciferous vegetables.",
      "Luteal: Prioritize complex carbs (sweet potatoes, brown rice), magnesium-rich foods (dark chocolate, nuts), and B-vitamin foods for serotonin support.",
    ],
  },
  {
    title: "Movement by Phase",
    icon: <Brain className="h-5 w-5" />,
    color: "#6366f1",
    content: [
      "Menstrual: Gentle movement only — walking, stretching, restorative yoga, tai chi. Your body is in recovery mode.",
      "Follicular: Build up intensity — try dance cardio, hiking, Pilates, light strength training. Your body can handle more as estrogen rises.",
      "Ovulatory: Peak performance time — HIIT, running, group sports, challenging workouts. Take advantage of high energy and strength.",
      "Luteal: Moderate then taper — strength training early, switch to yoga, swimming, and walking as energy declines.",
    ],
  },
];

const perimenopauseEducation: EducationSection[] = [
  {
    title: "Understanding Perimenopause",
    icon: <Moon className="h-5 w-5" />,
    color: "#f59e0b",
    content: [
      "Perimenopause is the transition to menopause, typically beginning in your 40s but sometimes as early as mid-30s. It can last 4-10 years.",
      "During this time, estrogen and progesterone fluctuate unpredictably. Cycles may become irregular — shorter, longer, heavier, or lighter.",
      "This is a normal, natural transition. Your body is not broken — it's evolving into a new phase of life with its own wisdom and strengths.",
    ],
  },
  {
    title: "Common Changes",
    icon: <Sparkles className="h-5 w-5" />,
    color: "#ec4899",
    content: [
      "Hot flashes and night sweats are caused by fluctuating estrogen affecting your body's thermostat.",
      "Sleep disruptions often increase due to declining progesterone, your natural sleep hormone.",
      "Mood changes, brain fog, and memory lapses are related to estrogen's role in brain function — they're temporary.",
      "Weight redistribution, joint stiffness, and skin changes are all part of the hormonal shift.",
    ],
  },
  {
    title: "Supporting Your Body",
    icon: <Heart className="h-5 w-5" />,
    color: "#22c55e",
    content: [
      "Prioritize phytoestrogen-rich foods: soy, flaxseeds, chickpeas, and lentils can help buffer hormonal fluctuations.",
      "Calcium and Vitamin D become critical for bone health as estrogen declines. Aim for 1200mg calcium and 600-800 IU Vitamin D daily.",
      "Strength training helps maintain bone density and muscle mass. Weight-bearing exercise is especially important now.",
      "Adaptogenic herbs like ashwagandha, maca, and black cohosh may help manage symptoms. Always consult your healthcare provider.",
    ],
  },
  {
    title: "Recommended Lab Tests",
    icon: <Beaker className="h-5 w-5" />,
    color: "#9333ea",
    content: [
      "FSH levels: Elevated FSH (>25 mIU/mL) indicates declining ovarian function.",
      "Estradiol: Fluctuating levels confirm perimenopause. Below 30 pg/mL suggests approaching menopause.",
      "Thyroid panel (TSH, T3, T4): Thyroid issues can mimic perimenopause symptoms.",
      "Complete metabolic panel, lipid panel, and Vitamin D levels should be checked annually.",
    ],
  },
];

const menopauseEducation: EducationSection[] = [
  {
    title: "Life After Menopause",
    icon: <Sparkles className="h-5 w-5" />,
    color: "#8b5cf6",
    content: [
      "Menopause is confirmed after 12 consecutive months without a period. The average age is 51, but ranges from 45-55.",
      "Post-menopause is not an ending — it's a powerful new chapter. Many women report increased clarity, confidence, and freedom.",
      "Your body now operates with stable (though lower) hormone levels. The moon becomes a beautiful natural guide for your rhythms.",
    ],
  },
  {
    title: "Heart Health",
    icon: <Heart className="h-5 w-5" />,
    color: "#ef4444",
    content: [
      "Estrogen had a protective effect on your cardiovascular system. Post-menopause, heart disease risk increases to match men's rates.",
      "Focus on heart-healthy fats (olive oil, avocado, fatty fish), regular cardio exercise, and maintaining healthy blood pressure.",
      "Monitor cholesterol levels annually. LDL often rises after menopause while protective HDL may decrease.",
    ],
  },
  {
    title: "Bone Health",
    icon: <Brain className="h-5 w-5" />,
    color: "#f59e0b",
    content: [
      "Bone density decreases most rapidly in the first 5-7 years after menopause due to estrogen decline.",
      "Weight-bearing exercise (walking, dancing, strength training) is essential for maintaining bone density.",
      "Ensure adequate calcium (1200mg/day) and Vitamin D (800-1000 IU/day). Consider a DEXA scan to assess bone density.",
    ],
  },
  {
    title: "Brain & Cognitive Health",
    icon: <Brain className="h-5 w-5" />,
    color: "#6366f1",
    content: [
      "The brain fog of perimenopause typically resolves after menopause as hormones stabilize.",
      "Stay mentally active with puzzles, learning, social engagement, and creative pursuits.",
      "Omega-3 fatty acids, blueberries, and anti-inflammatory foods support long-term brain health.",
      "Quality sleep and stress management are crucial for cognitive function at every age.",
    ],
  },
  {
    title: "Connecting with the Moon",
    icon: <Moon className="h-5 w-5" />,
    color: "#9333ea",
    content: [
      "Without a menstrual cycle, the moon offers a beautiful natural rhythm to organize your energy and intentions.",
      "New Moon: Set intentions, plant seeds, rest and reflect. Full Moon: Celebrate, release, and let go.",
      "Many women find deep meaning in aligning their self-care practices with lunar phases — it connects us to nature's wisdom.",
    ],
  },
];

export default function HormonalEducationPage() {
  const { lifeStage, isRegular } = useCycleData();
  const [expandedSection, setExpandedSection] = useState<number | null>(0);

  const educationData =
    lifeStage === "perimenopause"
      ? perimenopauseEducation
      : lifeStage === "menopause" || lifeStage === "postmenopause"
        ? menopauseEducation
        : regularEducation;

  const stageTitle =
    lifeStage === "perimenopause"
      ? "Perimenopause Guide"
      : lifeStage === "menopause" || lifeStage === "postmenopause"
        ? "Menopause & Beyond"
        : "Cycle Education";

  return (
    <div className="max-w-2xl mx-auto px-4 lg:px-8 py-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Link href="/settings" className="p-2 rounded-full hover:bg-bg-secondary">
            <ChevronLeft className="h-5 w-5 text-text-secondary" />
          </Link>
          <div>
            <h1 className="font-cormorant text-3xl font-semibold text-text-primary">{stageTitle}</h1>
            <p className="text-sm text-text-secondary font-quicksand">
              Understanding your body&apos;s wisdom
            </p>
          </div>
        </div>
      </motion.div>

      {/* Intro card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="rounded-[20px] border border-border-light bg-gradient-to-br from-accent-purple/5 to-accent-pink/5 p-5 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="h-4 w-4 text-accent-purple" />
          <span className="text-xs uppercase tracking-wider text-text-accent font-quicksand font-semibold">
            Knowledge is Power
          </span>
        </div>
        <p className="text-sm text-text-secondary font-quicksand leading-relaxed">
          Understanding the hormonal changes in your body empowers you to make informed decisions about your health,
          nutrition, and lifestyle. This guide is personalized to your current life stage.
        </p>
      </motion.div>

      {/* Accordion sections */}
      <div className="space-y-3">
        {educationData.map((section, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            className="rounded-[20px] border border-border-light bg-bg-card overflow-hidden"
          >
            <button
              onClick={() => setExpandedSection(expandedSection === i ? null : i)}
              className="w-full flex items-center justify-between p-5 text-left"
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center w-10 h-10 rounded-full"
                  style={{ backgroundColor: `${section.color}15`, color: section.color }}
                >
                  {section.icon}
                </div>
                <span className="font-cormorant text-base font-semibold text-text-primary">{section.title}</span>
              </div>
              {expandedSection === i ? (
                <ChevronUp className="h-4 w-4 text-text-muted shrink-0" />
              ) : (
                <ChevronDown className="h-4 w-4 text-text-muted shrink-0" />
              )}
            </button>
            {expandedSection === i && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                className="px-5 pb-5"
              >
                <div className="space-y-3 pl-[52px]">
                  {section.content.map((text, j) => (
                    <p key={j} className="text-sm text-text-secondary font-quicksand leading-relaxed">
                      {text}
                    </p>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Labs guide link */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-6">
        <Link
          href="/labs-guide"
          className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-gradient-to-r from-accent-rose to-accent-purple text-white font-quicksand font-semibold transition-opacity hover:opacity-90"
        >
          <Beaker className="h-4 w-4" />
          View Recommended Lab Tests
        </Link>
      </motion.div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FlaskConical, ChevronDown, Info, Sparkles, AlertTriangle } from "lucide-react";
import { useCycleData } from "@/hooks/use-cycle-data";

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

interface ActionableInsight {
  marker: string;
  action: string;
}

/* ------------------------------------------------------------------ */
/*  REGULAR CYCLE PANELS                                                */
/* ------------------------------------------------------------------ */

const regularPanels: LabPanel[] = [
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

/* ------------------------------------------------------------------ */
/*  PERIMENOPAUSE PANELS                                                */
/* ------------------------------------------------------------------ */

const perimenopausePanels: LabPanel[] = [
  {
    id: "peri-essential",
    title: "Essential Starting Panel",
    timing: "Fasting morning draw (before 10 AM)",
    description:
      "This is your foundation — the most impactful, affordable tests that cover bone health, metabolism, energy, heart risk, and help rule out conditions that mimic menopause symptoms like thyroid issues. These tests directly inform which foods, supplements, and exercise adjustments will benefit you most.",
    emoji: "🧪",
    color: "#8b5cf6",
    tests: [
      {
        name: "Complete Blood Count (CBC)",
        description: "A broad snapshot of your blood cells — red, white, and platelets",
        purpose: "Screens for anemia, infection markers, and inflammation that can affect your energy levels and ability to recover from exercise.",
      },
      {
        name: "Comprehensive Metabolic Panel (CMP)",
        description: "Covers blood sugar, kidney and liver function, electrolytes, and total calcium",
        purpose: "Gives a baseline for metabolic health, hydration status, and basic bone insights. Helps ensure any supplements you take are safe for your liver and kidneys.",
      },
      {
        name: "Lipid Panel",
        description: "Measures total cholesterol, HDL, LDL, and triglycerides",
        purpose: "Heart disease risk rises during perimenopause as estrogen drops. Results guide whether you need more omega-3s, fiber, and heart-focused cardio.",
      },
      {
        name: "HbA1c (Hemoglobin A1c)",
        description: "Your average blood sugar over the past 2-3 months",
        purpose: "Screens for insulin resistance, which becomes more common with shifting hormones. Influences how you balance carbs, protein, and fiber — and whether to prioritize moderate cardio.",
      },
      {
        name: "TSH + Free T4 (Thyroid)",
        description: "The primary markers for thyroid function",
        purpose: "Thyroid issues closely mimic perimenopause — fatigue, weight changes, mood shifts, brain fog. Ruling this out (or catching it) changes your entire approach to energy and exercise.",
      },
      {
        name: "Vitamin D (25-Hydroxy)",
        description: "Measures your stored vitamin D levels",
        purpose: "Low levels are very common and directly affect bone density, mood, immune function, and muscle strength. One of the most actionable results — guides supplementation and outdoor activity.",
      },
      {
        name: "Ferritin (Iron Stores)",
        description: "How much iron your body has in reserve, beyond what's circulating",
        purpose: "Heavy or irregular periods during perimenopause can drain iron stores. Low ferritin causes fatigue, hair thinning, and poor exercise tolerance — even before anemia shows on a CBC.",
      },
    ],
  },
  {
    id: "peri-hormones",
    title: "Hormone & Transition Panel",
    timing: "Morning draw, ideally days 2-5 of cycle if still cycling",
    description:
      "These tests help confirm where you are in the perimenopause transition and provide insight into symptoms like hot flashes, mood changes, and energy shifts. Especially useful if you're considering hormone therapy or want to understand what's driving specific symptoms.",
    emoji: "🔬",
    color: "#ec4899",
    tests: [
      {
        name: "Estradiol (E2)",
        description: "Your primary estrogen — levels fluctuate significantly during perimenopause",
        purpose: "Helps gauge where you are in the transition. Declining or erratic levels correlate with hot flashes, sleep disruption, and mood shifts. Useful context if considering HRT.",
      },
      {
        name: "FSH (Follicle-Stimulating Hormone)",
        description: "Rises as your ovaries produce less estrogen",
        purpose: "Elevated FSH (typically above 25-30) alongside symptoms helps confirm perimenopause. Note: levels can fluctuate cycle to cycle during this stage.",
      },
      {
        name: "Progesterone",
        description: "Produced after ovulation — often the first hormone to decline",
        purpose: "Low progesterone contributes to irregular periods, anxiety, insomnia, and PMS-like symptoms. Tested mid-luteal (day 19-22) if still cycling.",
      },
      {
        name: "Testosterone (Total + Free)",
        description: "Supports muscle mass, energy, mood, and libido",
        purpose: "Declining testosterone affects your response to strength training, energy for workouts, and overall vitality. Helps guide whether adaptogen support or HRT adjustments could help.",
      },
      {
        name: "DHEA-S",
        description: "An adrenal precursor to both estrogen and testosterone",
        purpose: "Low DHEA-S can contribute to fatigue, low libido, and reduced stress resilience. Provides a fuller picture of your hormonal landscape.",
      },
      {
        name: "SHBG (Sex Hormone Binding Globulin)",
        description: "A protein that binds hormones and affects how much is available to your body",
        purpose: "High SHBG can make hormones less available even when levels look normal on paper. Helps interpret testosterone and estrogen results more accurately.",
      },
    ],
  },
  {
    id: "peri-nutrients",
    title: "Nutrient & Bone Health Panel",
    timing: "Fasting morning draw",
    description:
      "These tests reveal common nutritional gaps that affect sleep, mood, energy, and muscle function during perimenopause. Results directly guide which foods to prioritize and whether specific supplements are truly needed — or if you can skip them.",
    emoji: "🦴",
    color: "#22c55e",
    tests: [
      {
        name: "Magnesium (RBC)",
        description: "The more accurate test for magnesium status — measures what's inside your cells, not just blood",
        purpose: "Low magnesium is common and affects sleep, mood, muscle cramps, and anxiety. If low, it confirms the need for glycinate supplementation and magnesium-rich foods like almonds and leafy greens.",
      },
      {
        name: "Vitamin B12",
        description: "Essential for energy production, nerve function, and red blood cell formation",
        purpose: "Absorption can start declining during this stage. Low B12 causes fatigue, brain fog, and mood changes that overlap with perimenopause symptoms. Guides whether B12 supplementation is needed.",
      },
      {
        name: "Folate",
        description: "A B vitamin involved in cell repair, mood regulation, and heart health",
        purpose: "Works alongside B12 — low levels can affect mood and increase homocysteine (a heart risk marker). Leafy greens and legumes are your best food sources.",
      },
      {
        name: "Zinc",
        description: "A mineral involved in immune function, hormone production, and skin health",
        purpose: "Supports immune resilience and hormone balance. Low zinc can worsen hair thinning, skin issues, and slow recovery from exercise.",
      },
      {
        name: "Vitamin D (if not in Essential Panel)",
        description: "Recheck if already supplementing to ensure levels are in optimal range",
        purpose: "Target 40-60 ng/mL for bone and mood benefits. Retest after 3 months of supplementation to adjust dosing.",
      },
    ],
  },
  {
    id: "peri-inflammation",
    title: "Inflammation & Heart Risk Panel",
    timing: "Fasting morning draw",
    description:
      "These advanced markers provide a deeper look at cardiovascular risk and systemic inflammation — both of which tend to increase during perimenopause. Results help fine-tune your anti-inflammatory food choices and exercise intensity.",
    emoji: "❤️‍🔥",
    color: "#ef4444",
    tests: [
      {
        name: "hs-CRP (High-Sensitivity C-Reactive Protein)",
        description: "A sensitive marker of systemic inflammation throughout your body",
        purpose: "Elevated levels signal chronic inflammation — guiding you toward anti-inflammatory foods (fatty fish, berries, olive oil) and recovery-focused exercise rather than high-intensity training.",
      },
      {
        name: "Homocysteine",
        description: "An amino acid linked to heart and brain health when elevated",
        purpose: "High homocysteine increases cardiovascular and cognitive risk. B vitamins (B12, folate, B6) and leafy greens help bring it down.",
      },
      {
        name: "Fasting Insulin",
        description: "Measures how much insulin your body needs to manage blood sugar",
        purpose: "A more sensitive early marker of insulin resistance than glucose or HbA1c alone. Elevated insulin guides you toward more protein, fiber, and strength training to improve sensitivity.",
      },
      {
        name: "ApoB (if available)",
        description: "A more precise measure of heart-damaging cholesterol particles than standard LDL",
        purpose: "Provides a clearer cardiovascular risk picture, especially if your standard lipid panel looks borderline. Helpful for refining heart-health nutrition and exercise strategy.",
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  MENOPAUSE PANELS                                                    */
/* ------------------------------------------------------------------ */

const menopausePanels: LabPanel[] = [
  {
    id: "meno-essential",
    title: "Essential Starting Panel",
    timing: "Fasting morning draw (before 10 AM)",
    description:
      "Your priority panel for protecting bone density, heart health, and metabolic function after menopause. These tests are widely available, often insurance-covered, and give you the clearest action steps for food, supplements, and exercise adjustments.",
    emoji: "🧪",
    color: "#8b5cf6",
    tests: [
      {
        name: "Complete Blood Count (CBC)",
        description: "A comprehensive look at your blood cells and overall health status",
        purpose: "Screens for anemia and inflammation markers. Important baseline for understanding fatigue and your body's recovery capacity from exercise.",
      },
      {
        name: "Comprehensive Metabolic Panel (CMP)",
        description: "Covers blood sugar, kidney and liver function, electrolytes, and total calcium",
        purpose: "Monitors metabolic health, calcium status for bone density, and ensures supplement safety. Catching kidney or liver changes early matters for long-term wellness.",
      },
      {
        name: "Lipid Panel",
        description: "Total cholesterol, HDL, LDL, and triglycerides",
        purpose: "Heart disease becomes the leading health risk after menopause. Results guide your omega-3 intake, Mediterranean-style eating, and whether to emphasize more cardio.",
      },
      {
        name: "HbA1c (Hemoglobin A1c)",
        description: "Your 2-3 month average blood sugar snapshot",
        purpose: "Insulin resistance is common post-menopause. This guides how you balance protein, fiber, and carbs — and whether strength training for insulin sensitivity should be your top exercise priority.",
      },
      {
        name: "TSH + Free T4 (Thyroid)",
        description: "Thyroid function screening — especially important as thyroid issues increase with age",
        purpose: "Fatigue, weight gain, and brain fog can be thyroid-related rather than menopause alone. Getting clarity here can completely change your energy management strategy.",
      },
      {
        name: "Vitamin D (25-Hydroxy)",
        description: "Your vitamin D storage levels — the single most actionable nutrient test",
        purpose: "Critical for calcium absorption, bone density, mood, and muscle strength. Deficiency is extremely common post-menopause and directly guides your D3 + K2 supplementation dose.",
      },
      {
        name: "Ferritin (Iron Stores)",
        description: "Your body's iron reserves",
        purpose: "After periods stop, iron needs change. Ferritin helps determine if you still need iron-rich focus foods or if you can shift emphasis to other nutrients. Also rules out iron overload.",
      },
    ],
  },
  {
    id: "meno-bone-muscle",
    title: "Bone & Muscle Health Panel",
    timing: "Fasting morning draw",
    description:
      "Bone density loss accelerates in the first 5-7 years after menopause, and muscle mass declines without intentional effort. These tests help you target the right nutrients and confirm whether your strength training and calcium/D3 strategy is working.",
    emoji: "🦴",
    color: "#22c55e",
    tests: [
      {
        name: "Calcium (Ionized, if available)",
        description: "The biologically active form of calcium — more precise than total calcium in the CMP",
        purpose: "Directly shows whether your calcium intake (food + supplements) is adequate for bone protection. Guides whether to adjust dairy, fortified foods, or supplement dosing.",
      },
      {
        name: "Magnesium (RBC)",
        description: "Intracellular magnesium levels — the more reliable test for true status",
        purpose: "Magnesium supports bone matrix, muscle function, and sleep. Low levels are common and confirm the need for supplementation — especially if you experience cramps, restless sleep, or anxiety.",
      },
      {
        name: "Vitamin B12",
        description: "Absorption naturally declines with age",
        purpose: "Low B12 causes fatigue, cognitive fog, and nerve tingling that compounds menopause symptoms. Guides whether dietary sources are enough or supplementation is needed.",
      },
      {
        name: "Alkaline Phosphatase (ALP)",
        description: "An enzyme that can indicate bone turnover activity",
        purpose: "Elevated levels may signal increased bone breakdown. Usually included in CMP but worth flagging — pairs with a DEXA scan for a complete bone health picture.",
      },
      {
        name: "Testosterone (Total + Free)",
        description: "Supports muscle preservation, energy, and bone density",
        purpose: "Low testosterone makes it harder to build and maintain muscle even with consistent strength training. Results help determine if hormonal support or adaptogen supplements could help.",
      },
      {
        name: "DEXA Scan (Not Blood — But Essential)",
        description: "A low-radiation imaging scan that measures bone mineral density",
        purpose: "The gold standard for osteoporosis screening. Recommended for all women at menopause or age 65+. Results directly guide how aggressively to focus on weight-bearing exercise and calcium/D3/K2.",
      },
    ],
  },
  {
    id: "meno-heart-metabolic",
    title: "Heart & Metabolic Deep Dive",
    timing: "Fasting morning draw",
    description:
      "After menopause, cardiovascular risk increases significantly. These advanced markers go beyond a standard lipid panel to give you a clearer picture of inflammation, insulin health, and true heart risk — helping you fine-tune your nutrition and exercise intensity.",
    emoji: "❤️‍🔥",
    color: "#ef4444",
    tests: [
      {
        name: "hs-CRP (High-Sensitivity C-Reactive Protein)",
        description: "Measures low-grade systemic inflammation",
        purpose: "Chronic inflammation drives heart disease, joint pain, and metabolic issues. Elevated results mean doubling down on anti-inflammatory foods (berries, fatty fish, olive oil) and prioritizing recovery in your exercise routine.",
      },
      {
        name: "Fasting Insulin",
        description: "How hard your body is working to manage blood sugar",
        purpose: "A more sensitive early warning for insulin resistance than HbA1c alone. High insulin points to increasing protein and fiber, reducing refined carbs, and making strength training non-negotiable.",
      },
      {
        name: "Homocysteine",
        description: "An amino acid linked to cardiovascular and cognitive risk when elevated",
        purpose: "B vitamins (B12, folate, B6) and leafy greens help lower it. An important marker for brain health protection after menopause.",
      },
      {
        name: "ApoB",
        description: "Counts the actual number of potentially harmful cholesterol particles",
        purpose: "More predictive of heart disease than standard LDL. If elevated, it strengthens the case for omega-3 supplementation, Mediterranean eating, and consistent cardiovascular exercise.",
      },
      {
        name: "Lp(a) (Lipoprotein a)",
        description: "A genetically determined heart risk factor — only needs to be tested once",
        purpose: "If elevated, you have a higher baseline cardiovascular risk that diet and exercise alone may not fully address. Important information to share with your doctor for a complete prevention strategy.",
      },
    ],
  },
  {
    id: "meno-hormones",
    title: "Hormone Status Panel",
    timing: "Morning draw",
    description:
      "While hormone levels are expected to change after menopause, testing can still be valuable — especially if symptoms are persistent, you're considering or adjusting HRT, or you want to understand what's driving fatigue, mood changes, or low libido.",
    emoji: "🔬",
    color: "#ec4899",
    tests: [
      {
        name: "Estradiol (E2)",
        description: "Your primary estrogen — expected to be low post-menopause",
        purpose: "Confirms menopausal status and provides context for persistent symptoms. If you're on HRT, helps monitor whether your dose is appropriate.",
      },
      {
        name: "FSH (Follicle-Stimulating Hormone)",
        description: "Typically elevated post-menopause as ovaries are no longer responding",
        purpose: "FSH above 30-40 alongside low estradiol confirms menopause. Useful if there was any diagnostic uncertainty.",
      },
      {
        name: "Testosterone (Total + Free)",
        description: "Affects muscle mass, energy, mood, and libido",
        purpose: "Low testosterone post-menopause can make strength training less effective and contribute to fatigue. Results inform whether supplementation or HRT adjustments could help.",
      },
      {
        name: "DHEA-S",
        description: "An adrenal hormone that declines steadily with age",
        purpose: "Low DHEA-S can contribute to reduced stress resilience and energy. Some practitioners recommend supplementation based on levels, though evidence is mixed.",
      },
      {
        name: "Morning Cortisol",
        description: "Your primary stress hormone — should peak in the morning",
        purpose: "Abnormal cortisol patterns can drive sleep issues, weight gain, and poor exercise recovery. If stress and sleep are major concerns, this provides important context.",
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  ACTIONABLE INSIGHTS — HOW RESULTS GUIDE YOUR PLAN                  */
/* ------------------------------------------------------------------ */

const periInsights: ActionableInsight[] = [
  { marker: "Low Vitamin D", action: "Increase D3 + K2 supplement dose, prioritize outdoor walks and weight-bearing exercise for bone health" },
  { marker: "Low Ferritin", action: "Focus on iron-rich foods (red meat, spinach, lentils) with vitamin C for absorption. Consider supplementation only if confirmed low" },
  { marker: "High Lipids or hs-CRP", action: "Shift toward Mediterranean-style eating with more omega-3s, berries, and olive oil. Add consistent moderate cardio" },
  { marker: "Elevated HbA1c or Insulin", action: "Balance meals with protein and fiber first, reduce refined carbs. Strength training improves insulin sensitivity" },
  { marker: "Thyroid Abnormalities", action: "Work with your doctor — thyroid treatment can transform energy, mood, and weight management. Adjust exercise intensity accordingly" },
  { marker: "Low Magnesium or B12", action: "Targeted supplementation plus magnesium-rich foods (almonds, leafy greens) and B12 sources (eggs, fish, fortified foods)" },
];

const menoInsights: ActionableInsight[] = [
  { marker: "Low Vitamin D", action: "Adjust D3 + K2 dose to reach 40-60 ng/mL target. Combine with calcium-rich foods and weight-bearing exercise for maximum bone benefit" },
  { marker: "Low Bone Density (DEXA)", action: "Prioritize strength training and balance work. Ensure calcium intake reaches 1200mg/day and D3/K2 supplementation is adequate" },
  { marker: "Elevated Lipids or ApoB", action: "Double down on omega-3s (fish or supplement), fiber-rich whole grains, and consistent cardio. Discuss statin options with your doctor if needed" },
  { marker: "Insulin Resistance", action: "Protein and fiber at every meal, limit refined carbs and sugary drinks. Strength training is your most powerful tool for improving sensitivity" },
  { marker: "High hs-CRP", action: "Anti-inflammatory food focus — fatty fish, berries, turmeric, olive oil. Moderate your exercise intensity and prioritize recovery" },
  { marker: "Low Testosterone", action: "Strength training becomes even more critical. Discuss with your doctor whether hormonal support could help with muscle, energy, and mood" },
];

/* ------------------------------------------------------------------ */
/*  PRACTICAL TIPS                                                      */
/* ------------------------------------------------------------------ */

const labTips: string[] = [
  "Start with the Essential Panel — it's affordable, often insurance-covered, and gives you the most actionable information",
  "Fasted morning draws (before 10 AM) give the most accurate results for most tests",
  "You can order through your doctor (for insurance) or direct-to-consumer labs like Quest, Labcorp, or UltaLab for convenience",
  "Retest every 6-12 months, or 3 months after starting a new supplement, to track progress",
  "Bring your results to your doctor or a menopause-informed clinician for personalized interpretation",
  "Lifestyle changes (food, movement, sleep) often improve many markers without adding supplements",
  "Functional ranges are tighter than standard lab ranges — ask your provider about optimal vs. just normal",
];

/* ------------------------------------------------------------------ */
/*  MAIN PAGE                                                          */
/* ------------------------------------------------------------------ */

export default function LabsGuidePage() {
  const [expandedPanel, setExpandedPanel] = useState<string | null>(null);
  const { isRegular, lifeStage } = useCycleData();

  function togglePanel(id: string) {
    setExpandedPanel(expandedPanel === id ? null : id);
  }

  const isLifeStageUser = !isRegular;
  const isPeri = lifeStage === "perimenopause";
  const isMeno = lifeStage === "menopause" || lifeStage === "postmenopause";

  const panels = isLifeStageUser
    ? isPeri
      ? perimenopausePanels
      : isMeno
        ? menopausePanels
        : regularPanels
    : regularPanels;

  const insights = isPeri ? periInsights : isMeno ? menoInsights : null;

  const subtitle = isLifeStageUser
    ? isPeri
      ? "Lab tests tailored for your perimenopause journey"
      : "Lab tests tailored for your menopause wellness"
    : "Recommended hormone tests for your wellness journey";

  return (
    <div className="max-w-3xl mx-auto px-4 lg:px-8 py-6 pb-32">
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
              {subtitle}
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
        <div>
          <p className="text-xs text-text-secondary font-quicksand leading-relaxed">
            This guide is for educational purposes only and is not a substitute for medical advice.
            Always discuss lab testing with your healthcare provider, who can order and interpret results
            in the context of your full health history.
          </p>
          {isLifeStageUser && (
            <p className="text-xs text-text-secondary font-quicksand leading-relaxed mt-2">
              No supplement is a proven cure-all, and results vary by individual. Get bloodwork done before starting new supplements, and choose third-party tested brands (USP, NSF, or ConsumerLab verified) for quality.
            </p>
          )}
        </div>
      </motion.div>

      {/* Panels */}
      <div className="space-y-4">
        {panels.map((panel, index) => (
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

      {/* Actionable Insights — Life Stage Users Only */}
      {isLifeStageUser && insights && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <h2 className="font-cormorant text-xl font-semibold text-text-primary mb-4">
            How Results Guide Your Plan
          </h2>
          <div className="rounded-[20px] border border-border-light bg-bg-card p-5 space-y-4">
            {insights.map((insight) => (
              <div key={insight.marker} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full mt-1.5 shrink-0 bg-accent-purple" />
                <div>
                  <p className="font-quicksand font-semibold text-sm text-text-primary">
                    {insight.marker}
                  </p>
                  <p className="text-xs text-text-muted font-quicksand mt-0.5">
                    {insight.action}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Practical Tips — Life Stage Users Only */}
      {isLifeStageUser && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="mt-6"
        >
          <h2 className="font-cormorant text-xl font-semibold text-text-primary mb-4">
            Practical Tips
          </h2>
          <div className="rounded-[20px] border border-border-light bg-bg-card p-5 space-y-3">
            {labTips.map((tip, i) => (
              <div key={i} className="flex items-start gap-3">
                <Sparkles className="h-4 w-4 text-accent-pink shrink-0 mt-0.5" />
                <p className="text-sm text-text-secondary font-quicksand">{tip}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

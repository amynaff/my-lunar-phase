"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Apple,
  ShoppingCart,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Leaf,
  Sun,
  Pill,
  Sparkles,
  Lightbulb,
  Ban,
  Utensils,
} from "lucide-react";
import { useCycleData } from "@/hooks/use-cycle-data";
import { useCycleStore } from "@/stores/cycle-store";
import { phaseInfo, moonPhaseInfo, moonEnergyLabels } from "@/lib/cycle/data";
import { getMoonPhase, getMoonPhaseCycleEquivalent } from "@/lib/cycle/moon-phase";
import type { CyclePhase, LifeStage, MoonPhase } from "@/lib/cycle/types";

/* ------------------------------------------------------------------ */
/*  TYPES                                                              */
/* ------------------------------------------------------------------ */

interface NutrientSource {
  name: string;
  description: string;
}

interface KeyNutrient {
  name: string;
  dosage: string;
  description: string;
  icon: React.ElementType;
  iconColor: string;
  sources: NutrientSource[];
}

interface FoodItem {
  name: string;
  description: string;
}

interface HerbItem {
  name: string;
  description: string;
}

interface Supplement {
  name: string;
  dosage: string;
  description: string;
}

interface SeedCyclingWeek {
  label: string;
  phase: string;
  seeds: string;
  amount: string;
}

interface PhaseNutritionData {
  title: string;
  subtitle: string;
  days: string;
  description: string;
  keyNutrients: KeyNutrient[];
  foods: FoodItem[];
  herbs: HerbItem[];
  herbNotes: string[];
  supplements: Supplement[];
  seedCycling: SeedCyclingWeek[];
  tips: string[];
  avoid: string[];
}

/* ------------------------------------------------------------------ */
/*  DATA — All 4 cycle phases                                          */
/* ------------------------------------------------------------------ */

const phaseNutritionData: Record<CyclePhase, PhaseNutritionData> = {
  menstrual: {
    title: "Menstrual Phase",
    subtitle: "Replenish & Nourish",
    days: "Days 1-5",
    description:
      "Focus on iron replenishment due to blood loss. Warm, nourishing foods help restore energy and support your body during menstruation.",
    keyNutrients: [
      {
        name: "Iron",
        dosage: "15-18mg/day",
        description: "Replenish blood loss, prevent fatigue",
        icon: Pill,
        iconColor: "#ef4444",
        sources: [
          { name: "Red Meat", description: "Grass-fed beef for heme iron" },
          { name: "Fish & Poultry", description: "Easily absorbed iron and protein" },
          { name: "Leafy Greens", description: "Raw & cooked spinach, kale, chard" },
          { name: "Lentils & Beans", description: "Plant-based iron and protein" },
          { name: "Seaweed & Miso", description: "Iron and minerals" },
          { name: "Pumpkin Seeds", description: "Zinc and iron" },
          { name: "Molasses", description: "Concentrated iron source" },
        ],
      },
      {
        name: "Folic Acid",
        dosage: "800mcg/day",
        description: "Cell renewal and energy",
        icon: Leaf,
        iconColor: "#22c55e",
        sources: [
          { name: "Raw & Cooked Greens", description: "Leafy greens are folic acid powerhouses" },
          { name: "Cooked Beets", description: "Blood-building and folate rich" },
          { name: "Orange Juice", description: "Natural folate source" },
          { name: "Brewers Yeast", description: "B-vitamin complex" },
          { name: "Beans", description: "Plant-based folate" },
          { name: "Miso with Seaweed", description: "Fermented folate" },
          { name: "Avocado", description: "Creamy folate source" },
        ],
      },
      {
        name: "Vitamin C",
        dosage: "500-1000mg",
        description: "Helps iron absorption",
        icon: Sun,
        iconColor: "#f59e0b",
        sources: [
          { name: "Dark Greens", description: "Vitamin C with minerals" },
          { name: "Local Fruits", description: "Seasonal vitamin C" },
          { name: "Citrus Fruits", description: "Classic vitamin C source" },
          { name: "Apricots & Cherries", description: "With bioflavonoids" },
        ],
      },
    ],
    foods: [
      { name: "Red Meat", description: "Grass-fed beef for heme iron" },
      { name: "Fish & Poultry", description: "Easily absorbed iron and protein" },
      { name: "Leafy Greens", description: "Raw & cooked spinach, kale, chard" },
      { name: "Lentils & Beans", description: "Plant-based iron and protein" },
      { name: "Cooked Beets", description: "Blood-building nutrients & folic acid" },
      { name: "Seaweed & Miso", description: "Iron and minerals" },
      { name: "Pumpkin Seeds", description: "Zinc and iron" },
      { name: "Sesame Seeds", description: "Iron and calcium" },
      { name: "Sunflower Seeds", description: "Iron and vitamin E" },
      { name: "Millet & Garbanzos", description: "Iron-rich grains and legumes" },
      { name: "Molasses", description: "Concentrated iron source" },
      { name: "Raisins", description: "Natural iron and energy" },
      { name: "Orange Juice", description: "Vitamin C for iron absorption" },
      { name: "Avocado", description: "Folic acid and healthy fats" },
      { name: "Dark Greens & Citrus", description: "Vitamin C with bioflavonoids" },
      { name: "Apricots & Cherries", description: "Vitamin C and antioxidants" },
    ],
    herbs: [
      { name: "Raspberry Leaf", description: "Iron-rich, uterine tonic" },
      { name: "Mugwort", description: "Traditional menstrual support" },
      { name: "Nettles", description: "Iron and minerals" },
      { name: "Yellow Dock", description: "Iron absorption" },
      { name: "Rosehips", description: "Natural vitamin C" },
      { name: "Fenugreek Seeds", description: "Folic acid source" },
    ],
    herbNotes: [
      "Iron availability is blocked by caffeine - avoid coffee/tea with meals",
      "Cook in iron pots to increase iron content",
      "Extra rest and \"dream time\" is important during this phase",
    ],
    supplements: [
      { name: "Vitamin C", dosage: "500-1000mg", description: "Helps iron absorption" },
      { name: "Calcium", dosage: "200mg", description: "" },
      { name: "Magnesium Glycinate", dosage: "100mg", description: "For mood and sleep" },
    ],
    seedCycling: [
      { label: "Week 1-2", phase: "Follicular", seeds: "Pumpkin + Flax Seeds", amount: "1-2 tbsp each daily" },
      { label: "Week 3-4", phase: "Luteal", seeds: "Sunflower + Sesame Seeds", amount: "1-2 tbsp each daily" },
    ],
    tips: [
      "Food sources of iron are best absorbed - especially with vitamin C",
      "Cook in cast iron pots to boost iron intake",
      "Avoid caffeine around meals as it blocks iron absorption",
      "Extra rest and sleep supports your body during menstruation",
      "Stay hydrated with warm beverages and herbal teas",
    ],
    avoid: [
      "Caffeine with meals (blocks iron)",
      "Excessive alcohol",
      "Processed foods",
      "Too much salt",
    ],
  },

  follicular: {
    title: "Follicular Phase",
    subtitle: "Energize & Create",
    days: "Days 6-13",
    description:
      "Support rising estrogen with iodine for thyroid function, vitamin E for antioxidant protection, and omega-3s for reducing inflammation.",
    keyNutrients: [
      {
        name: "Iodine",
        dosage: "4mg/day",
        description: "Thyroid and estrogen metabolism",
        icon: Pill,
        iconColor: "#3b82f6",
        sources: [
          { name: "Fish", description: "Natural iodine from seafood" },
          { name: "Seaweed (Kelp, Dulse)", description: "Concentrated plant-based iodine" },
          { name: "Lemons", description: "Trace iodine with vitamin C" },
        ],
      },
      {
        name: "Vitamin E",
        dosage: "200-800 IU/day",
        description: "Antioxidant, hormone balance",
        icon: Sun,
        iconColor: "#f59e0b",
        sources: [
          { name: "Wheat Germ", description: "Richest natural source" },
          { name: "Whole Grains", description: "Sustained vitamin E" },
          { name: "Sweet Potatoes", description: "Beta-carotene + vitamin E" },
          { name: "Mixed Nuts", description: "Almonds, hazelnuts" },
        ],
      },
      {
        name: "Omega-3s",
        dosage: "1000-2000mg/day",
        description: "Anti-inflammatory support",
        icon: Leaf,
        iconColor: "#22c55e",
        sources: [
          { name: "Wild Salmon", description: "EPA and DHA rich" },
          { name: "Sardines", description: "Omega-3s plus calcium" },
          { name: "Walnuts", description: "Plant-based ALA" },
          { name: "Flaxseeds & Chia Seeds", description: "Fiber plus omega-3s" },
        ],
      },
      {
        name: "Protein",
        dosage: "50g/day minimum",
        description: "Build and repair tissues",
        icon: Utensils,
        iconColor: "#ec4899",
        sources: [
          { name: "Chicken & Tofu", description: "Lean complete protein" },
          { name: "Eggs", description: "Complete amino acid profile" },
          { name: "Legumes & Tahini", description: "Plant-based protein" },
          { name: "Greek Yogurt", description: "Protein plus probiotics" },
        ],
      },
    ],
    foods: [
      { name: "Fish", description: "Natural iodine and protein" },
      { name: "Seaweed (Kelp, Dulse)", description: "Concentrated iodine" },
      { name: "Lemons", description: "Vitamin C and trace minerals" },
      { name: "Wheat Germ", description: "Richest vitamin E source" },
      { name: "Whole Grains", description: "B vitamins and fiber" },
      { name: "Sweet Potatoes", description: "Beta-carotene and vitamin E" },
      { name: "Wild Salmon", description: "Omega-3s and protein" },
      { name: "Sardines", description: "Omega-3s and calcium" },
      { name: "Walnuts", description: "Plant-based omega-3s" },
      { name: "Flaxseeds", description: "Lignans and omega-3s" },
      { name: "Chia Seeds", description: "Fiber and omega-3s" },
      { name: "Chicken & Tofu", description: "Lean protein" },
      { name: "Eggs", description: "Complete protein" },
      { name: "Legumes", description: "Plant protein and fiber" },
      { name: "Tahini", description: "Calcium and protein" },
      { name: "Greek Yogurt", description: "Protein plus probiotics" },
      { name: "Spinach", description: "Iron and folate" },
      { name: "Sunflower Seeds", description: "Vitamin E and selenium" },
      { name: "Mixed Nuts", description: "Healthy fats and minerals" },
      { name: "Parsley & Dandelion", description: "Mineral-rich greens" },
    ],
    herbs: [
      { name: "Dong Quai", description: "Traditional hormone balancer" },
      { name: "Black Cohosh", description: "Estrogen support" },
      { name: "Nettles", description: "Mineral-rich tonic" },
      { name: "Sarsaparilla", description: "Hormone precursor support" },
      { name: "Parsley", description: "Digestive and mineral support" },
      { name: "Mustard Greens", description: "Detox and nutrition" },
      { name: "Irish Moss", description: "Thyroid support" },
      { name: "Alfalfa", description: "Mineral-dense superfood" },
      { name: "Dandelion Leaves", description: "Liver and digestion" },
    ],
    herbNotes: [
      "Dong Quai should not be used during pregnancy or heavy periods",
      "Black Cohosh should be used short-term (6 months max)",
      "Calcium dosing: 500-1000mg depending on dairy intake",
      "Omega-3 supplementation takes 2-3 months for full effect",
      "Limit dairy if estrogen-dominant; choose plant calcium instead",
    ],
    supplements: [
      { name: "Omega-3 Fish Oil", dosage: "1000-2000mg", description: "EPA/DHA for inflammation" },
      { name: "Extra Calcium", dosage: "500-1000mg", description: "Bone and hormone support" },
      { name: "Vitamin E", dosage: "200-800 IU", description: "Antioxidant protection" },
      { name: "Vitamin D", dosage: "2000 IU", description: "Calcium absorption" },
      { name: "B-Complex", dosage: "", description: "Energy and mood" },
    ],
    seedCycling: [
      { label: "Week 1-2", phase: "Follicular", seeds: "Pumpkin + Flax Seeds", amount: "1-2 tbsp each daily" },
      { label: "Week 3-4", phase: "Luteal", seeds: "Sunflower + Sesame Seeds", amount: "1-2 tbsp each daily" },
    ],
    tips: [
      "This is your celebration phase - energy is rising!",
      "If dairy-tolerant, calcium from yogurt and cheese is well absorbed",
      "Omega-3s from fish are more bioavailable than plant sources",
      "Consider calcium supplementation if you avoid dairy",
      "Eat fatty fish 2-3 times per week for optimal omega-3 intake",
      "Try adding microgreens and sprouts to meals for extra enzymes",
    ],
    avoid: [
      "Heavy greasy foods",
      "Excessive sugar",
      "Processed foods",
    ],
  },

  ovulatory: {
    title: "Ovulatory Phase",
    subtitle: "Light & Vibrant",
    days: "Days 13-15",
    description:
      "Peak fertility window. Support with B6 for hormone balance, zinc for fertility and immune function, and lighter, raw-friendly meals.",
    keyNutrients: [
      {
        name: "Vitamin B6",
        dosage: "50-100mg",
        description: "Hormone balance (destroyed by cooking)",
        icon: Pill,
        iconColor: "#8b5cf6",
        sources: [
          { name: "Fish (raw/lightly cooked)", description: "Best B6 retention" },
          { name: "Nuts & Avocado", description: "Raw B6 sources" },
          { name: "Banana", description: "Convenient B6 snack" },
          { name: "Sprouted Soybeans", description: "Enzyme-active B6" },
        ],
      },
      {
        name: "Zinc",
        dosage: "15-30mg/day",
        description: "Fertility and immune support",
        icon: Leaf,
        iconColor: "#22c55e",
        sources: [
          { name: "Pumpkin Seeds", description: "Top plant zinc source" },
          { name: "Chicken & Tuna", description: "Bioavailable zinc" },
          { name: "Cornmeal & Garlic", description: "Supporting zinc sources" },
          { name: "Tofu & Soybeans", description: "Plant-based zinc" },
        ],
      },
      {
        name: "Niacin",
        dosage: "As needed",
        description: "Energy and hormone metabolism",
        icon: Sun,
        iconColor: "#f59e0b",
        sources: [
          { name: "Sunflower Seeds", description: "Rich niacin source" },
          { name: "Peanut Butter", description: "Niacin and protein" },
          { name: "Spirulina", description: "Superfood niacin" },
          { name: "Chicken & Fish", description: "Complete protein with niacin" },
        ],
      },
      {
        name: "Manganese",
        dosage: "2-4mg/day",
        description: "Enzyme function, bone health",
        icon: Utensils,
        iconColor: "#ec4899",
        sources: [
          { name: "Walnuts", description: "Excellent manganese source" },
          { name: "Spinach", description: "Manganese plus iron" },
          { name: "Pumpkin Seeds", description: "Multi-mineral powerhouse" },
          { name: "Whole Grains", description: "Brown rice, oats" },
        ],
      },
    ],
    foods: [
      { name: "Fish (raw/lightly cooked)", description: "B6 and omega-3s" },
      { name: "Mixed Nuts", description: "B6, zinc, and healthy fats" },
      { name: "Avocado", description: "B6, folate, healthy fats" },
      { name: "Banana", description: "B6 and potassium" },
      { name: "Sprouted Soybeans", description: "Enzyme-active nutrition" },
      { name: "Chicken & Tuna", description: "Zinc and protein" },
      { name: "Pumpkin Seeds", description: "Zinc and manganese" },
      { name: "Cornmeal", description: "Niacin source" },
      { name: "Garlic", description: "Zinc and immune support" },
      { name: "Tofu & Soybeans", description: "Plant protein and zinc" },
      { name: "Sunflower Seeds", description: "Niacin and vitamin E" },
      { name: "Peanut Butter", description: "Niacin and protein" },
      { name: "Spirulina", description: "Superfood nutrition" },
      { name: "Walnuts", description: "Manganese and omega-3s" },
      { name: "Spinach", description: "Manganese and iron" },
      { name: "Kelp & Dandelion Greens", description: "Mineral-rich greens" },
      { name: "Parsley & Watercress", description: "Cleansing greens" },
      { name: "Blueberries", description: "Antioxidant powerhouse" },
      { name: "Sesame Seeds", description: "Calcium and lignans" },
    ],
    herbs: [
      { name: "Kelp", description: "Iodine and trace minerals" },
      { name: "Dandelion Greens", description: "Liver support" },
      { name: "Parsley", description: "Cleansing and mineral-rich" },
      { name: "Watercress", description: "Nutrient-dense green" },
      { name: "Rice Bran", description: "B vitamins and fiber" },
      { name: "Cayenne", description: "Circulation support" },
      { name: "Comfrey", description: "Traditional healing herb" },
      { name: "Fenugreek", description: "Hormone support" },
      { name: "Alfalfa", description: "Mineral-rich superfood" },
    ],
    herbNotes: [
      "B6 is destroyed by cooking - eat sources raw or lightly cooked when possible",
      "Vegetarians need 50% more zinc due to lower bioavailability from plants",
      "Take minerals in the evening for better absorption",
      "This is a time for gentle care - don't overdo intense workouts",
      "Estrogen drops after ovulation - be prepared for mood shifts",
    ],
    supplements: [
      { name: "Vitamin B6", dosage: "50-100mg", description: "Hormone balance" },
      { name: "Zinc", dosage: "15-30mg", description: "Fertility support" },
      { name: "Extra Calcium", dosage: "500mg", description: "Bone support" },
      { name: "Magnesium Glycinate", dosage: "200mg", description: "Take in the evening" },
      { name: "Potassium", dosage: "", description: "Take in the evening" },
    ],
    seedCycling: [
      { label: "Week 1-2", phase: "Follicular", seeds: "Pumpkin + Flax Seeds", amount: "1-2 tbsp each daily" },
      { label: "Week 3-4", phase: "Luteal", seeds: "Sunflower + Sesame Seeds", amount: "1-2 tbsp each daily" },
    ],
    tips: [
      "Eat raw or lightly cooked foods to preserve B6 and enzymes",
      "Vegetarians should consider zinc supplementation",
      "Take minerals in the evening for optimal absorption",
      "This is your peak fertility window - be aware of your body's signs",
      "Watch for cervical mucus changes (egg-white consistency)",
      "Basal body temperature rises slightly after ovulation",
    ],
    avoid: [
      "Heavy carbs",
      "Fried foods",
      "Overcooked foods (destroys B6)",
    ],
  },

  luteal: {
    title: "Luteal Phase",
    subtitle: "Stabilize & Comfort",
    days: "Days 16-28",
    description:
      "Progesterone rises and PMS symptoms may appear. Calcium is clinically proven to reduce PMS by 50%. Focus on magnesium, B vitamins, and omega-3s.",
    keyNutrients: [
      {
        name: "Calcium",
        dosage: "1000-1500mg/day",
        description: "Clinically proven to reduce PMS 50%",
        icon: Pill,
        iconColor: "#f0f0f0",
        sources: [
          { name: "Tofu & Dark Greens", description: "Plant-based calcium" },
          { name: "Seaweed (Hijiki, Kelp)", description: "Marine calcium" },
          { name: "Sesame Seeds & Tahini", description: "Rich plant calcium" },
          { name: "Yogurt & Cheese", description: "Dairy calcium" },
          { name: "Figs & Dried Apricots", description: "Fruit-based calcium" },
          { name: "Soybeans & Edamame", description: "Protein plus calcium" },
        ],
      },
      {
        name: "Magnesium",
        dosage: "400-600mg",
        description: "Reduces cramps, bloating, mood swings, headaches",
        icon: Sparkles,
        iconColor: "#8b5cf6",
        sources: [
          { name: "Dark Chocolate", description: "Satisfies cravings + magnesium" },
          { name: "Spinach", description: "Magnesium and iron" },
          { name: "Pumpkin Seeds", description: "Top magnesium source" },
          { name: "Bananas & Avocados", description: "Potassium and magnesium" },
          { name: "Mixed Nuts", description: "Cashews, almonds, walnuts" },
        ],
      },
      {
        name: "B Vitamins",
        dosage: "B6 50-100mg, B12 adequate",
        description: "Reduces mood swings, fatigue, irritability",
        icon: Leaf,
        iconColor: "#22c55e",
        sources: [
          { name: "Chicken & Turkey", description: "B6 and complete protein" },
          { name: "Sunflower Seeds", description: "B6 and vitamin E" },
          { name: "Eggs & Mushrooms", description: "B12 and vitamin D" },
          { name: "Potatoes & Sweet Potatoes", description: "B6 with complex carbs" },
        ],
      },
      {
        name: "Omega-3s",
        dosage: "1000-2000mg EPA/DHA",
        description: "Reduces inflammation, cramps, breast tenderness",
        icon: Sun,
        iconColor: "#0891b2",
        sources: [
          { name: "Wild Salmon & Sardines", description: "Highest EPA/DHA content" },
          { name: "Walnuts & Flaxseeds", description: "Plant-based omega-3s" },
          { name: "Chia Seeds", description: "ALA omega-3s plus fiber" },
          { name: "Fatty Fish", description: "Mackerel, herring, trout" },
        ],
      },
      {
        name: "Vitamin D",
        dosage: "2000-4000 IU",
        description: "Works with calcium, mood support",
        icon: Sun,
        iconColor: "#f59e0b",
        sources: [
          { name: "Fatty Fish", description: "Natural vitamin D" },
          { name: "Eggs", description: "Vitamin D in yolks" },
          { name: "Mushrooms", description: "Sun-exposed for vitamin D" },
          { name: "Fortified Foods", description: "Milk, cereals, orange juice" },
        ],
      },
    ],
    foods: [
      { name: "Tofu & Dark Greens", description: "Calcium and iron" },
      { name: "Seaweed (Hijiki, Kelp)", description: "Marine minerals" },
      { name: "Sesame Seeds & Tahini", description: "Calcium and healthy fats" },
      { name: "Soybeans & Edamame", description: "Protein and calcium" },
      { name: "Yogurt & Cheese", description: "Dairy calcium" },
      { name: "Figs & Dried Apricots", description: "Natural sweetness and calcium" },
      { name: "Dark Chocolate", description: "Magnesium and mood boost" },
      { name: "Spinach", description: "Iron and magnesium" },
      { name: "Pumpkin Seeds", description: "Zinc and magnesium" },
      { name: "Bananas", description: "Potassium and tryptophan" },
      { name: "Avocados", description: "Healthy fats and potassium" },
      { name: "Chicken & Turkey", description: "Tryptophan and B vitamins" },
      { name: "Sunflower Seeds", description: "Vitamin E and selenium" },
      { name: "Wild Salmon & Sardines", description: "Omega-3s and vitamin D" },
      { name: "Walnuts & Flaxseeds", description: "Plant omega-3s" },
      { name: "Eggs & Mushrooms", description: "B12 and vitamin D" },
      { name: "Sweet Potatoes", description: "Complex carbs and B6" },
      { name: "Dates", description: "Natural sweetness and iron" },
      { name: "Carrot Juice", description: "Beta-carotene and potassium" },
    ],
    herbs: [
      { name: "Chamomile", description: "Calming and anti-inflammatory" },
      { name: "Raspberry Leaves", description: "Uterine tonic" },
      { name: "Dandelion Root", description: "Reduces bloating" },
      { name: "Vitex (Chasteberry)", description: "Hormone balance for PMS" },
      { name: "Evening Primrose Oil", description: "GLA for breast tenderness" },
      { name: "Ginger", description: "Anti-nausea and warming" },
      { name: "Nettle Tea", description: "Mineral-rich hydration" },
      { name: "Lavender", description: "Calming and stress relief" },
    ],
    herbNotes: [
      "Calcium + vitamin D work synergistically - take together",
      "Magnesium glycinate is best absorbed - take at bedtime",
      "Omega-3 benefits take 2-3 months of consistent use",
      "Vitex needs 3+ months of consistent use for PMS relief",
      "Herbal teas (chamomile, nettle, dandelion) are excellent daily support",
    ],
    supplements: [
      { name: "Calcium", dosage: "1000-1500mg", description: "PMS reduction" },
      { name: "Magnesium Glycinate", dosage: "400-600mg", description: "Cramps and sleep" },
      { name: "Vitamin D3", dosage: "2000-4000 IU", description: "Calcium absorption" },
      { name: "B-Complex", dosage: "", description: "Mood and energy" },
      { name: "Omega-3 Fish Oil", dosage: "1000-2000mg", description: "Anti-inflammatory" },
    ],
    seedCycling: [
      { label: "Week 1-2", phase: "Follicular", seeds: "Pumpkin + Flax Seeds", amount: "1-2 tbsp each daily" },
      { label: "Week 3-4", phase: "Luteal", seeds: "Sunflower + Sesame Seeds", amount: "1-2 tbsp each daily" },
    ],
    tips: [
      "Regular exercise reduces PMS symptoms significantly",
      "Stress reduction is especially important this phase",
      "The PMS trifecta: Calcium + Magnesium + Vitamin D",
      "Eat fatty fish 2-3 times per week for omega-3 benefits",
      "Keep blood sugar stable with regular meals and complex carbs",
      "Prioritize sleep - aim for 8+ hours during luteal phase",
      "Track your symptoms to identify personal PMS patterns",
    ],
    avoid: [
      "Excessive salt (water retention)",
      "Caffeine (increases anxiety)",
      "Refined sugar (mood crashes)",
      "Alcohol (depletes B vitamins)",
    ],
  },
};

/* ------------------------------------------------------------------ */
/*  Perimenopause & Menopause data for moon-guided users               */
/* ------------------------------------------------------------------ */

interface LifeStageNutritionData {
  title: string;
  subtitle: string;
  description: string;
  foods: FoodItem[];
  herbs: HerbItem[];
  herbNotes: string[];
  supplements: Supplement[];
  focusAreas: Array<{ name: string; description: string }>;
  tips: string[];
  avoid: string[];
}

const lifeStageNutritionData: Record<string, LifeStageNutritionData> = {
  perimenopause: {
    title: "Perimenopause Nutrition",
    subtitle: "Balance & Support",
    description:
      "Support your body through hormonal transitions with anti-inflammatory foods, phytoestrogens, and targeted supplementation for bone, brain, and heart health.",
    foods: [
      { name: "Fatty Fish", description: "Salmon, mackerel for omega-3s" },
      { name: "Flaxseeds", description: "Phytoestrogens and fiber" },
      { name: "Leafy Greens", description: "Calcium and iron" },
      { name: "Cruciferous Veggies", description: "Broccoli, Brussels sprouts for estrogen metabolism" },
      { name: "Berries", description: "Antioxidants for brain health" },
      { name: "Nuts & Seeds", description: "Healthy fats and minerals" },
      { name: "Legumes", description: "Plant protein and fiber" },
      { name: "Whole Grains", description: "B vitamins and sustained energy" },
      { name: "Fermented Foods", description: "Gut health and nutrient absorption" },
      { name: "Eggs", description: "Complete protein and choline" },
      { name: "Greek Yogurt", description: "Calcium and probiotics" },
      { name: "Olive Oil", description: "Heart-healthy fats" },
      { name: "Sweet Potatoes", description: "Complex carbs and vitamin A" },
      { name: "Bone Broth", description: "Collagen and minerals" },
      { name: "Dark Chocolate", description: "Magnesium and mood boost" },
    ],
    herbs: [
      { name: "Black Cohosh", description: "Hot flash relief" },
      { name: "Vitex (Chasteberry)", description: "Hormone regulation" },
      { name: "Maca Root", description: "Energy and libido" },
      { name: "Ashwagandha", description: "Stress and cortisol" },
      { name: "Red Clover", description: "Isoflavones for symptoms" },
      { name: "Evening Primrose Oil", description: "GLA for breast tenderness" },
      { name: "Dong Quai", description: "Traditional menopause herb" },
      { name: "Sage", description: "Hot flash and night sweat relief" },
      { name: "Rhodiola", description: "Energy and mental clarity" },
      { name: "Valerian Root", description: "Sleep support" },
    ],
    herbNotes: [
      "Black Cohosh: use for 6 months max, then take a break",
      "Maca Root may take 6-8 weeks for full effect",
      "Consult a practitioner before combining herbs with HRT",
    ],
    supplements: [
      { name: "Magnesium Glycinate", dosage: "400mg", description: "Sleep and muscle relaxation" },
      { name: "Vitamin D3", dosage: "2000-4000 IU", description: "Bone health and mood" },
      { name: "B-Complex", dosage: "", description: "Energy and nervous system" },
      { name: "Omega-3", dosage: "1000-2000mg", description: "Heart and brain health" },
      { name: "Calcium", dosage: "1000mg", description: "Bone density preservation" },
      { name: "Vitamin K2", dosage: "100mcg", description: "Directs calcium to bones" },
      { name: "Vitamin E", dosage: "400 IU", description: "Hot flash reduction" },
      { name: "Iron", dosage: "If needed", description: "Only if blood tests indicate deficiency" },
    ],
    focusAreas: [
      { name: "Hot Flash Relief", description: "Phytoestrogens, sage, and cooling foods" },
      { name: "Bone Health", description: "Calcium, vitamin D, K2, and weight-bearing exercise" },
      { name: "Mood Support", description: "B vitamins, omega-3s, and adaptogens" },
      { name: "Sleep Quality", description: "Magnesium, valerian, and sleep hygiene" },
      { name: "Weight Management", description: "Protein priority, fiber, and strength training" },
    ],
    tips: [
      "Increase protein intake to preserve muscle mass",
      "Prioritize calcium from food first, supplement to fill gaps",
      "Phytoestrogens from soy and flax can help ease symptoms",
      "Stay hydrated - aim for 8+ glasses of water daily",
      "Strength training is essential for bone density",
    ],
    avoid: [
      "Spicy foods (can trigger hot flashes)",
      "Excessive caffeine",
      "Alcohol (disrupts sleep)",
      "Refined sugar",
      "Processed foods",
    ],
  },
  menopause: {
    title: "Menopause Nutrition",
    subtitle: "Nourish & Thrive",
    description:
      "Post-menopausal nutrition focuses on protecting bone density, heart health, brain function, and maintaining muscle mass through targeted nutrition.",
    foods: [
      { name: "Salmon & Sardines", description: "Omega-3s and vitamin D" },
      { name: "Leafy Greens", description: "Calcium, K, and folate" },
      { name: "Berries", description: "Brain-protective antioxidants" },
      { name: "Nuts & Seeds", description: "Heart-healthy fats" },
      { name: "Legumes", description: "Fiber and plant protein" },
      { name: "Whole Grains", description: "Fiber and B vitamins" },
      { name: "Olive Oil", description: "Heart-protective fats" },
      { name: "Eggs", description: "Protein, D, and choline" },
      { name: "Greek Yogurt", description: "Calcium and probiotics" },
      { name: "Tofu", description: "Isoflavones and protein" },
      { name: "Avocados", description: "Healthy fats and potassium" },
      { name: "Broccoli", description: "Calcium and fiber" },
      { name: "Oranges", description: "Vitamin C for collagen" },
    ],
    herbs: [
      { name: "Black Cohosh", description: "Symptom management" },
      { name: "Red Clover", description: "Isoflavone support" },
      { name: "Sage", description: "Hot flash and sweat relief" },
      { name: "Ginkgo Biloba", description: "Brain and memory" },
      { name: "St. John's Wort", description: "Mood support" },
      { name: "Ashwagandha", description: "Stress and vitality" },
      { name: "Turmeric/Curcumin", description: "Anti-inflammatory" },
      { name: "Ginger", description: "Digestion and circulation" },
      { name: "Milk Thistle", description: "Liver support" },
      { name: "Hawthorn", description: "Heart health" },
    ],
    herbNotes: [
      "St. John's Wort interacts with many medications - check with your doctor",
      "Turmeric absorbs best with black pepper and fat",
      "Ginkgo may thin blood - avoid before surgery",
    ],
    supplements: [
      { name: "Magnesium Glycinate", dosage: "400mg", description: "Sleep, mood, bones" },
      { name: "Calcium + D3", dosage: "1200mg + 2000 IU", description: "Bone density" },
      { name: "Vitamin K2", dosage: "100-200mcg", description: "Calcium utilization" },
      { name: "Omega-3", dosage: "1000-2000mg", description: "Heart and brain" },
      { name: "Vitamin B12", dosage: "1000mcg", description: "Energy and nerve health" },
      { name: "CoQ10", dosage: "100-200mg", description: "Heart and cellular energy" },
      { name: "Collagen Peptides", dosage: "10g", description: "Skin, joints, bones" },
      { name: "Probiotics", dosage: "10B CFU", description: "Gut and immune health" },
      { name: "Boron", dosage: "3mg", description: "Bone mineral retention" },
    ],
    focusAreas: [
      { name: "Bone Health", description: "Calcium, D3, K2, and weight-bearing exercise are essential" },
      { name: "Heart Health", description: "Omega-3s, olive oil, fiber, and regular cardio" },
      { name: "Brain Health", description: "Omega-3s, berries, nuts, and mental stimulation" },
      { name: "Muscle Maintenance", description: "30g+ protein per meal, strength training" },
      { name: "Skin Health", description: "Collagen, vitamin C, hydration, and healthy fats" },
    ],
    tips: [
      "Protein needs increase after menopause - aim for 1.2g per kg body weight",
      "Weight-bearing exercise is non-negotiable for bone health",
      "Mediterranean diet pattern is optimal for heart protection",
      "B12 absorption decreases with age - consider supplementation",
      "Stay socially active - it's as important as diet for longevity",
      "Focus on anti-inflammatory foods to manage joint discomfort",
    ],
    avoid: [
      "Excessive sodium (bone loss)",
      "Sugary drinks (inflammation)",
      "Trans fats (heart risk)",
      "Excessive alcohol",
      "Highly processed foods",
    ],
  },
};

/* ------------------------------------------------------------------ */
/*  COLLAPSIBLE SECTION COMPONENT                                      */
/* ------------------------------------------------------------------ */

function CollapsibleSection({
  title,
  subtitle,
  icon: Icon,
  iconColor,
  children,
  defaultOpen = false,
}: {
  title: string;
  subtitle: string;
  icon: React.ElementType;
  iconColor: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="rounded-[20px] border border-border-light bg-bg-card overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full p-5 text-left"
      >
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center w-10 h-10 rounded-full"
            style={{ backgroundColor: `${iconColor}20` }}
          >
            <Icon className="h-5 w-5" style={{ color: iconColor }} />
          </div>
          <div>
            <h3 className="font-quicksand font-semibold text-text-primary text-sm">
              {title}
            </h3>
            <p className="text-xs text-text-muted font-quicksand">{subtitle}</p>
          </div>
        </div>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-text-muted" />
        ) : (
          <ChevronDown className="h-5 w-5 text-text-muted" />
        )}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="border-t border-border-light px-5 pb-5 pt-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  NUTRIENT CARD (expandable with sources)                            */
/* ------------------------------------------------------------------ */

function NutrientCard({ nutrient }: { nutrient: KeyNutrient }) {
  const [isOpen, setIsOpen] = useState(false);
  const Icon = nutrient.icon;

  return (
    <div className="rounded-[20px] border border-border-light bg-bg-card overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full p-5 text-left"
      >
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center w-10 h-10 rounded-full"
            style={{ backgroundColor: `${nutrient.iconColor}20` }}
          >
            <Icon className="h-5 w-5" style={{ color: nutrient.iconColor }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-quicksand font-semibold text-text-primary text-sm">
                {nutrient.name}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-xs font-quicksand font-semibold bg-accent-pink/15 text-accent-pink">
                {nutrient.dosage}
              </span>
            </div>
            <p className="text-xs text-text-muted font-quicksand mt-0.5">
              {nutrient.description}
            </p>
          </div>
        </div>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-text-muted shrink-0" />
        ) : (
          <ChevronDown className="h-5 w-5 text-text-muted shrink-0" />
        )}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="border-t border-border-light px-5 pb-5 pt-3 space-y-3">
              {nutrient.sources.map((source) => (
                <div key={source.name} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full mt-1.5 shrink-0 bg-accent-pink" />
                  <div>
                    <p className="font-quicksand font-semibold text-sm text-text-primary">
                      {source.name}
                    </p>
                    <p className="text-xs text-text-muted font-quicksand">
                      {source.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  HELPERS for calendar                                               */
/* ------------------------------------------------------------------ */

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1; // Monday = 0
}

function getPhaseForDate(
  date: Date,
  lastPeriodStart: string | null,
  cycleLength: number,
  periodLength: number
): CyclePhase {
  if (!lastPeriodStart) return "follicular";
  const start = new Date(lastPeriodStart);
  const daysSince = Math.floor((date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const dayOfCycle = ((daysSince % cycleLength) + cycleLength) % cycleLength + 1;
  if (dayOfCycle <= periodLength) return "menstrual";
  if (dayOfCycle <= 13) return "follicular";
  if (dayOfCycle <= 17) return "ovulatory";
  return "luteal";
}

const phaseColors: Record<CyclePhase, string> = {
  menstrual: "#be185d",
  follicular: "#ec4899",
  ovulatory: "#f9a8d4",
  luteal: "#9333ea",
};

/* ------------------------------------------------------------------ */
/*  PHASE CALENDAR                                                     */
/* ------------------------------------------------------------------ */

function PhaseCalendar({
  isRegular,
  lifeStage,
  lastPeriodStart,
  cycleLength,
  periodLength,
  selectedPhase,
  onSelectPhase,
}: {
  isRegular: boolean;
  lifeStage?: LifeStage;
  lastPeriodStart: string | null;
  cycleLength: number;
  periodLength: number;
  selectedPhase: CyclePhase;
  onSelectPhase: (phase: CyclePhase) => void;
}) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const monthName = new Date(currentYear, currentMonth).toLocaleString("default", { month: "long" });

  const calendarDays = useMemo(() => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfWeek(currentYear, currentMonth);
    const days: Array<{
      date: Date | null;
      day: number;
      moonPhase: MoonPhase;
      moonEmoji: string;
      cyclePhase: CyclePhase;
      isToday: boolean;
    }> = [];

    for (let i = 0; i < firstDay; i++) {
      days.push({ date: null, day: 0, moonPhase: "new_moon", moonEmoji: "", cyclePhase: "follicular", isToday: false });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(currentYear, currentMonth, d);
      const moonPhase = getMoonPhase(date);
      const cyclePhase = isRegular
        ? getPhaseForDate(date, lastPeriodStart, cycleLength, periodLength)
        : (getMoonPhaseCycleEquivalent(moonPhase) as CyclePhase);
      const isToday = d === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();

      days.push({
        date,
        day: d,
        moonPhase,
        moonEmoji: moonPhaseInfo[moonPhase].emoji,
        cyclePhase,
        isToday,
      });
    }

    return days;
  }, [currentMonth, currentYear, isRegular, lastPeriodStart, cycleLength, periodLength]);

  function prevMonth() {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear((y) => y - 1); }
    else setCurrentMonth((m) => m - 1);
  }
  function nextMonth() {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear((y) => y + 1); }
    else setCurrentMonth((m) => m + 1);
  }

  return (
    <div className="rounded-[20px] border border-border-light bg-bg-card shadow-sm p-4 sm:p-6 mb-6">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="p-2 rounded-full hover:bg-bg-secondary transition-colors">
          <ChevronLeft className="h-5 w-5 text-text-secondary" />
        </button>
        <h2 className="font-cormorant text-xl font-semibold text-text-primary">{monthName} {currentYear}</h2>
        <button onClick={nextMonth} className="p-2 rounded-full hover:bg-bg-secondary transition-colors">
          <ChevronRight className="h-5 w-5 text-text-secondary" />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {WEEKDAYS.map((day, i) => (
          <div key={i} className="text-center text-xs font-quicksand font-semibold text-text-muted py-1">{day}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((cell, i) => {
          if (!cell.date) return <div key={`empty-${i}`} className="aspect-square" />;

          const isSelected = cell.cyclePhase === selectedPhase;

          return (
            <motion.button
              key={cell.day}
              whileTap={{ scale: 0.92 }}
              onClick={() => onSelectPhase(cell.cyclePhase)}
              className={`
                relative flex flex-col items-center justify-center aspect-square rounded-full
                transition-colors text-xs font-quicksand cursor-pointer
                ${cell.isToday ? "ring-2 ring-accent-purple" : ""}
                hover:bg-bg-secondary/60
              `}
              style={{
                backgroundColor: isSelected ? `${phaseColors[cell.cyclePhase]}15` : undefined,
              }}
            >
              <span
                className={`
                  text-[11px] font-medium leading-none
                  ${cell.isToday ? "text-accent-purple font-bold" : "text-text-secondary"}
                `}
              >
                {cell.day}
              </span>
              <span className="text-sm leading-none mt-0.5">{cell.moonEmoji}</span>
              {/* Phase dot */}
              <div
                className="absolute bottom-0.5 w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: phaseColors[cell.cyclePhase] }}
              />
            </motion.button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-3 justify-center">
        {(["menstrual", "follicular", "ovulatory", "luteal"] as CyclePhase[]).map((phase) => {
          const useMoonLabels = lifeStage === "menopause" || lifeStage === "postmenopause";
          const label = useMoonLabels ? moonEnergyLabels[phase].name : phase;
          return (
            <button
              key={phase}
              onClick={() => onSelectPhase(phase)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-colors ${
                selectedPhase === phase ? "bg-bg-secondary ring-1 ring-border-light" : "hover:bg-bg-secondary/50"
              }`}
            >
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: phaseColors[phase] }} />
              <span className="text-xs text-text-muted font-quicksand">{label}</span>
            </button>
          );
        })}
      </div>

      <p className="text-center text-xs text-text-muted font-quicksand mt-3">
        {lifeStage === "menopause" || lifeStage === "postmenopause"
          ? "Tap any day to see nutrition aligned with the moon\u2019s energy"
          : "Tap any day to see nutrition for that phase"}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  MAIN PAGE                                                          */
/* ------------------------------------------------------------------ */

export default function NutritionPage() {
  const { currentPhase, currentPhaseInfo, isRegular, currentMoonPhase, currentMoonInfo, lifeStage } =
    useCycleData();
  const { lastPeriodStart, cycleLength, periodLength, addPhaseGroceries } = useCycleStore();
  const [selectedPhase, setSelectedPhase] = useState<CyclePhase>(currentPhase);

  // Determine which data to use
  const isLifeStageUser = !isRegular;
  const lifeStageData = isLifeStageUser
    ? lifeStageNutritionData[lifeStage === "postmenopause" ? "menopause" : lifeStage] || lifeStageNutritionData.menopause
    : null;
  const phaseData = isRegular ? phaseNutritionData[selectedPhase] : null;

  const info = isRegular ? phaseInfo[selectedPhase] : moonPhaseInfo[currentMoonPhase];

  function handleAddAllToGroceryList() {
    const foods = isRegular && phaseData
      ? phaseData.foods
      : lifeStageData
        ? lifeStageData.foods
        : [];
    const items = foods.map((f) => ({ name: f.name, category: "Nutrition" }));
    addPhaseGroceries(selectedPhase, items);
  }

  // ---- LIFE STAGE VIEW (peri/menopause) ----
  if (isLifeStageUser && lifeStageData) {
    return (
      <div className="max-w-4xl mx-auto px-4 lg:px-8 py-6 pb-32">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-full" style={{ backgroundColor: `${info.color}20` }}>
              <Apple className="h-5 w-5" style={{ color: info.color }} />
            </div>
            <div>
              <h1 className="font-cormorant text-3xl font-semibold text-text-primary">Nutrition Guide</h1>
              <p className="text-sm text-text-secondary font-quicksand">{currentMoonInfo.name} - {currentMoonInfo.emoji} {currentMoonInfo.energy}</p>
            </div>
          </div>
        </motion.div>

        {/* Phase card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-[20px] border border-border-light bg-bg-card p-6 mb-6">
          <h2 className="font-cormorant text-xl font-semibold text-text-primary">{lifeStageData.title}</h2>
          <p className="text-sm text-accent-purple font-quicksand font-medium mt-1">{lifeStageData.subtitle}</p>
          <p className="text-sm text-text-secondary font-quicksand leading-relaxed mt-3">{lifeStageData.description}</p>
        </motion.div>

        {/* Focus Areas */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mb-6">
          <h2 className="font-cormorant text-xl font-semibold text-text-primary mb-4">Focus Areas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {lifeStageData.focusAreas.map((area) => (
              <div key={area.name} className="rounded-[16px] border border-border-light bg-bg-card p-4">
                <h3 className="font-quicksand font-semibold text-sm text-text-primary">{area.name}</h3>
                <p className="text-xs text-text-muted font-quicksand mt-1">{area.description}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Foods */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-cormorant text-xl font-semibold text-text-primary">Recommended Foods</h2>
            <button onClick={handleAddAllToGroceryList} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent-pink/10 text-accent-pink font-quicksand font-semibold text-xs hover:bg-accent-pink/20 transition-colors">
              <ShoppingCart className="h-3.5 w-3.5" />
              Add to List
            </button>
          </div>
          <CollapsibleSection title="Foods" subtitle={`${lifeStageData.foods.length} items`} icon={Utensils} iconColor="#22c55e" defaultOpen>
            <div className="space-y-3">
              {lifeStageData.foods.map((food) => (
                <div key={food.name} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full mt-1.5 shrink-0 bg-accent-pink" />
                  <div>
                    <p className="font-quicksand font-semibold text-sm text-text-primary">{food.name}</p>
                    <p className="text-xs text-text-muted font-quicksand">{food.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleSection>
        </motion.div>

        {/* Herbs */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="mb-6 space-y-4">
          <CollapsibleSection title="Supportive Herbs" subtitle={`${lifeStageData.herbs.length} herbs`} icon={Leaf} iconColor="#22c55e">
            <div className="space-y-3">
              {lifeStageData.herbs.map((herb) => (
                <div key={herb.name} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full mt-1.5 shrink-0 bg-accent-pink" />
                  <div>
                    <p className="font-quicksand font-semibold text-sm text-text-primary">{herb.name}</p>
                    <p className="text-xs text-text-muted font-quicksand">{herb.description}</p>
                  </div>
                </div>
              ))}
              {lifeStageData.herbNotes.length > 0 && (
                <div className="mt-4 rounded-xl bg-accent-purple/5 border border-accent-purple/15 p-4">
                  <p className="text-xs font-quicksand font-semibold text-accent-purple mb-2">Important Notes</p>
                  {lifeStageData.herbNotes.map((note, i) => (
                    <p key={i} className="text-xs text-text-secondary font-quicksand leading-relaxed">
                      &bull; {note}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </CollapsibleSection>

          {/* Supplements */}
          <CollapsibleSection title="Vitamins & Minerals" subtitle="Recommended supplementation" icon={Pill} iconColor="#8b5cf6">
            <div className="space-y-3">
              {lifeStageData.supplements.map((supp) => (
                <div key={supp.name} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full mt-1.5 shrink-0 bg-accent-pink" />
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-quicksand font-semibold text-sm text-text-primary">{supp.name}</p>
                    {supp.dosage && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-quicksand font-semibold bg-accent-purple/15 text-accent-purple">
                        {supp.dosage}
                      </span>
                    )}
                    {supp.description && (
                      <p className="text-xs text-text-muted font-quicksand w-full">{supp.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleSection>
        </motion.div>

        {/* Tips */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-6">
          <h2 className="font-cormorant text-xl font-semibold text-text-primary mb-4">Tips</h2>
          <div className="rounded-[20px] border border-border-light bg-bg-card p-5 space-y-3">
            {lifeStageData.tips.map((tip, i) => (
              <div key={i} className="flex items-start gap-3">
                <Lightbulb className="h-4 w-4 text-accent-pink shrink-0 mt-0.5" />
                <p className="text-sm text-text-secondary font-quicksand">{tip}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Avoid */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="mb-8">
          <h2 className="font-cormorant text-xl font-semibold text-text-primary mb-4">Best to Avoid</h2>
          <div className="flex flex-wrap gap-2">
            {lifeStageData.avoid.map((item) => (
              <span key={item} className="px-4 py-2 rounded-xl border border-accent-pink/20 bg-accent-pink/5 text-accent-pink font-quicksand text-sm">
                {item}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Add All Button */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <button
            onClick={handleAddAllToGroceryList}
            className="w-full py-4 rounded-[20px] bg-gradient-to-r from-accent-rose to-accent-purple text-white font-quicksand font-semibold text-base flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
          >
            <ShoppingCart className="h-5 w-5" />
            Add All to Grocery List
          </button>
        </motion.div>
      </div>
    );
  }

  // ---- REGULAR CYCLE VIEW ----
  if (!phaseData) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 lg:px-8 py-6 pb-32">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="flex items-center justify-center w-10 h-10 rounded-full"
            style={{ backgroundColor: `${info.color}20` }}
          >
            <Apple className="h-5 w-5" style={{ color: info.color }} />
          </div>
          <div>
            <h1 className="font-cormorant text-3xl font-semibold text-text-primary">
              Nutrition Guide
            </h1>
            <p className="text-sm text-text-secondary font-quicksand">
              Eat for Your Cycle
            </p>
          </div>
        </div>
      </motion.div>

      {/* Phase card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-[20px] border border-border-light bg-bg-card p-6 mb-6"
      >
        <h2 className="font-cormorant text-xl font-semibold text-text-primary">
          {phaseData.title}
        </h2>
        <p className="text-sm text-accent-purple font-quicksand font-medium mt-1">
          {phaseData.subtitle}
        </p>
        <p className="text-xs text-text-accent font-quicksand font-semibold mt-1">
          {phaseData.days}
        </p>
        <p className="text-sm text-text-secondary font-quicksand leading-relaxed mt-3">
          {phaseData.description}
        </p>
      </motion.div>

      {/* Key Nutrients */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mb-6"
      >
        <h2 className="font-cormorant text-xl font-semibold text-text-primary mb-4">
          Key Nutrients for {phaseData.days}
        </h2>
        <div className="space-y-3">
          {phaseData.keyNutrients.map((nutrient) => (
            <NutrientCard key={nutrient.name} nutrient={nutrient} />
          ))}
        </div>
      </motion.div>

      {/* All Recommended Foods */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-cormorant text-xl font-semibold text-text-primary">
            All Recommended Foods
          </h2>
          <button
            onClick={handleAddAllToGroceryList}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent-pink/10 text-accent-pink font-quicksand font-semibold text-xs hover:bg-accent-pink/20 transition-colors"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            Add to List
          </button>
        </div>

        <div className="space-y-4">
          {/* Foods */}
          <CollapsibleSection
            title="Foods"
            subtitle={`${phaseData.foods.length} items`}
            icon={Utensils}
            iconColor="#22c55e"
          >
            <div className="space-y-3">
              {phaseData.foods.map((food) => (
                <div key={food.name} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full mt-1.5 shrink-0 bg-accent-pink" />
                  <div>
                    <p className="font-quicksand font-semibold text-sm text-text-primary">
                      {food.name}
                    </p>
                    <p className="text-xs text-text-muted font-quicksand">
                      {food.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleSection>

          {/* Herbs */}
          <CollapsibleSection
            title="Supportive Herbs"
            subtitle={`${phaseData.herbs.length} herbs for this phase`}
            icon={Leaf}
            iconColor="#22c55e"
          >
            <div className="space-y-3">
              {phaseData.herbs.map((herb) => (
                <div key={herb.name} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full mt-1.5 shrink-0 bg-accent-pink" />
                  <div>
                    <p className="font-quicksand font-semibold text-sm text-text-primary">
                      {herb.name}
                    </p>
                    <p className="text-xs text-text-muted font-quicksand">
                      {herb.description}
                    </p>
                  </div>
                </div>
              ))}
              {phaseData.herbNotes.length > 0 && (
                <div className="mt-4 rounded-xl bg-accent-purple/5 border border-accent-purple/15 p-4">
                  <p className="text-xs font-quicksand font-semibold text-accent-purple mb-2">
                    Important Notes
                  </p>
                  {phaseData.herbNotes.map((note, i) => (
                    <p key={i} className="text-xs text-text-secondary font-quicksand leading-relaxed">
                      &bull; {note}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </CollapsibleSection>

          {/* Vitamins & Minerals */}
          <CollapsibleSection
            title="Vitamins & Minerals"
            subtitle="Recommended supplementation"
            icon={Pill}
            iconColor="#8b5cf6"
          >
            <div className="space-y-3">
              {phaseData.supplements.map((supp) => (
                <div key={supp.name} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full mt-1.5 shrink-0 bg-accent-pink" />
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-quicksand font-semibold text-sm text-text-primary">
                      {supp.name}
                    </p>
                    {supp.dosage && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-quicksand font-semibold bg-accent-purple/15 text-accent-purple">
                        {supp.dosage}
                      </span>
                    )}
                    {supp.description && (
                      <p className="text-xs text-text-muted font-quicksand w-full">
                        {supp.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleSection>

          {/* Seed Cycling */}
          <CollapsibleSection
            title="Seed Cycling Protocol"
            subtitle="4 seeds across cycle phases"
            icon={Sparkles}
            iconColor="#8b5cf6"
          >
            <div className="space-y-4">
              {phaseData.seedCycling.map((week) => (
                <div key={week.label} className="rounded-xl border border-border-light bg-bg-secondary/30 p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-quicksand font-semibold text-sm text-text-primary">
                      {week.label}
                    </span>
                    <span className="text-xs text-text-accent font-quicksand">
                      ({week.phase})
                    </span>
                  </div>
                  <p className="font-quicksand font-medium text-sm text-accent-purple">
                    {week.seeds}
                  </p>
                  <p className="text-xs text-text-muted font-quicksand mt-1">
                    {week.amount}
                  </p>
                </div>
              ))}
            </div>
          </CollapsibleSection>
        </div>
      </motion.div>

      {/* Tips */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="mb-6"
      >
        <h2 className="font-cormorant text-xl font-semibold text-text-primary mb-4">
          Tips
        </h2>
        <div className="rounded-[20px] border border-border-light bg-bg-card p-5 space-y-3">
          {phaseData.tips.map((tip, i) => (
            <div key={i} className="flex items-start gap-3">
              <Lightbulb className="h-4 w-4 text-accent-pink shrink-0 mt-0.5" />
              <p className="text-sm text-text-secondary font-quicksand">{tip}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Best to Avoid */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-8"
      >
        <h2 className="font-cormorant text-xl font-semibold text-text-primary mb-4">
          Best to Avoid
        </h2>
        <div className="flex flex-wrap gap-2">
          {phaseData.avoid.map((item) => (
            <span
              key={item}
              className="px-4 py-2 rounded-xl border border-accent-pink/20 bg-accent-pink/5 text-accent-pink font-quicksand text-sm"
            >
              {item}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Add All to Grocery List */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <button
          onClick={handleAddAllToGroceryList}
          className="w-full py-4 rounded-[20px] bg-gradient-to-r from-accent-rose to-accent-purple text-white font-quicksand font-semibold text-base flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
        >
          <ShoppingCart className="h-5 w-5" />
          Add All to Grocery List
        </button>
      </motion.div>
    </div>
  );
}

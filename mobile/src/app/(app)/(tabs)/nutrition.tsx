import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { ShoppingCart, Leaf, Sparkles, ChevronDown, ChevronUp, UtensilsCrossed, Heart, AlertCircle, Sun, Pill, Flower2, Beaker, Info, Moon } from 'lucide-react-native';
import { useCycleStore, phaseInfo, CyclePhase, lifeStageInfo, getMoonPhase, moonPhaseInfo, getMoonPhaseCycleEquivalent } from '@/lib/cycle-store';
import { MoonPhaseCard, moonCycleEducation } from '@/components/MoonPhaseCard';
import { useThemeStore, getTheme } from '@/lib/theme-store';
import { router } from 'expo-router';
import {
  useFonts,
  CormorantGaramond_400Regular,
  CormorantGaramond_600SemiBold,
} from '@expo-google-fonts/cormorant-garamond';
import {
  Quicksand_400Regular,
  Quicksand_500Medium,
  Quicksand_600SemiBold,
} from '@expo-google-fonts/quicksand';

interface NutritionItem {
  name: string;
  benefit: string;
}

interface NutrientCategory {
  nutrient: string;
  dailyAmount: string;
  purpose: string;
  foods: NutritionItem[];
}

interface HerbInfo {
  name: string;
  benefit: string;
}

interface PhaseNutritionData {
  focus: string;
  description: string;
  days: string;
  foods: NutritionItem[];
  nutrients?: NutrientCategory[];
  herbs?: HerbInfo[];
  herbNotes?: string[];
  supplements?: { name: string; amount: string; note?: string }[];
  avoid: string[];
  tips: string[];
  fertilityInfo?: {
    title: string;
    description: string;
    keyPoints: string[];
    contraceptionNote: string;
  };
}

// Regular cycle nutrition
const phaseNutrition: Record<CyclePhase, PhaseNutritionData> = {
  menstrual: {
    focus: 'Replenish & Nourish',
    description: 'Focus on iron-rich foods to replenish blood loss. Estrogen and progesterone are at their lowest. This is a time for rest, reflection, and gentle self-care.',
    days: 'Days 1-5',
    foods: [
      { name: 'Red Meat', benefit: 'Grass-fed beef for heme iron' },
      { name: 'Fish & Poultry', benefit: 'Easily absorbed iron and protein' },
      { name: 'Leafy Greens', benefit: 'Raw & cooked spinach, kale, chard' },
      { name: 'Lentils & Beans', benefit: 'Plant-based iron and protein' },
      { name: 'Cooked Beets', benefit: 'Blood-building nutrients & folic acid' },
      { name: 'Seaweed & Miso', benefit: 'Iron and minerals' },
      { name: 'Pumpkin Seeds', benefit: 'Zinc and iron' },
      { name: 'Sesame Seeds', benefit: 'Iron and calcium' },
      { name: 'Sunflower Seeds', benefit: 'Iron and vitamin E' },
      { name: 'Millet & Garbanzos', benefit: 'Iron-rich grains and legumes' },
      { name: 'Molasses', benefit: 'Concentrated iron source' },
      { name: 'Raisins', benefit: 'Natural iron and energy' },
      { name: 'Orange Juice', benefit: 'Vitamin C for iron absorption' },
      { name: 'Avocado', benefit: 'Folic acid and healthy fats' },
      { name: 'Dark Greens & Citrus', benefit: 'Vitamin C with bioflavonoids' },
      { name: 'Apricots & Cherries', benefit: 'Vitamin C and antioxidants' },
    ],
    nutrients: [
      {
        nutrient: 'Iron',
        dailyAmount: '15-18mg/day',
        purpose: 'Replenish blood loss, prevent fatigue',
        foods: [
          { name: 'Meat, Fish, Poultry', benefit: 'Heme iron - best absorbed' },
          { name: 'Seaweed', benefit: 'Marine minerals and iron' },
          { name: 'Pumpkin Seeds', benefit: 'Plant-based iron' },
          { name: 'Sesame Seeds', benefit: 'Iron and calcium' },
          { name: 'Sunflower Seeds', benefit: 'Iron and vitamin E' },
          { name: 'Miso & Garbanzos', benefit: 'Fermented iron sources' },
          { name: 'Millet & Lentils', benefit: 'Whole grain and legume iron' },
          { name: 'Molasses & Raisins', benefit: 'Concentrated natural iron' },
        ],
      },
      {
        nutrient: 'Folic Acid',
        dailyAmount: '800mcg/day',
        purpose: 'Cell renewal and energy',
        foods: [
          { name: 'Raw & Cooked Greens', benefit: 'Leafy greens are folic acid powerhouses' },
          { name: 'Cooked Beets', benefit: 'Blood-building and folate rich' },
          { name: 'Orange Juice', benefit: 'Natural folate source' },
          { name: 'Brewers Yeast', benefit: 'B-vitamin complex' },
          { name: 'Beans', benefit: 'Plant-based folate' },
          { name: 'Miso with Seaweed', benefit: 'Fermented folate' },
          { name: 'Avocado', benefit: 'Creamy folate source' },
        ],
      },
      {
        nutrient: 'Vitamin C',
        dailyAmount: '500-1000mg',
        purpose: 'Helps iron absorption',
        foods: [
          { name: 'Dark Greens', benefit: 'Vitamin C with minerals' },
          { name: 'Local Fruits', benefit: 'Seasonal vitamin C' },
          { name: 'Citrus Fruits', benefit: 'Classic vitamin C source' },
          { name: 'Apricots & Cherries', benefit: 'With bioflavonoids' },
        ],
      },
    ],
    supplements: [
      { name: 'Vitamin C', amount: '500-1000mg', note: 'Helps iron absorption' },
      { name: 'Calcium', amount: '200mg' },
      { name: 'Magnesium Glycinate', amount: '100mg', note: 'For mood and sleep' },
    ],
    herbs: [
      { name: 'Raspberry Leaf', benefit: 'Iron-rich, uterine tonic' },
      { name: 'Mugwort', benefit: 'Traditional menstrual support' },
      { name: 'Nettles', benefit: 'Iron and minerals' },
      { name: 'Yellow Dock', benefit: 'Iron absorption' },
      { name: 'Rosehips', benefit: 'Natural vitamin C' },
      { name: 'Fenugreek Seeds', benefit: 'Folic acid source' },
    ],
    herbNotes: [
      'Iron availability is blocked by caffeine - avoid coffee/tea with meals',
      'Cook in iron pots to increase iron content',
      'Extra rest and "dream time" is important during this phase',
    ],
    avoid: ['Caffeine with meals (blocks iron)', 'Excessive alcohol', 'Processed foods', 'Too much salt'],
    tips: [
      'Food sources of iron are best absorbed - especially with vitamin C',
      'Cook in cast iron pots to boost iron intake',
      'Avoid caffeine around meals as it blocks iron absorption',
      'Extra rest and sleep supports your body during menstruation',
      'Stay hydrated with warm beverages and herbal teas',
    ],
  },
  follicular: {
    focus: 'Energize & Create',
    description: 'Estrogen is rising! This is the celebration phase. Light, fresh foods and quality protein support your increasing energy. Best days to eat dairy.',
    days: 'Days 6-13',
    foods: [
      // Iodine sources
      { name: 'Fish', benefit: 'Iodine and protein' },
      { name: 'Seaweed', benefit: 'Rich iodine source' },
      { name: 'Kelp', benefit: '1 tsp daily for iodine' },
      { name: 'Dulse', benefit: '2oz for iodine' },
      { name: 'Lemons', benefit: 'Iodine and vitamin C' },
      // Vitamin E sources
      { name: 'Wheat Germ', benefit: 'Vitamin E powerhouse' },
      { name: 'Whole Grains', benefit: 'Vitamin E and fiber' },
      { name: 'Greens', benefit: 'Vitamin E and minerals' },
      { name: 'Sweet Potatoes', benefit: 'Vitamin E and complex carbs' },
      { name: 'Seeds & Nuts', benefit: 'Vitamin E and healthy fats' },
      // Omega-3 sources (anti-inflammatory)
      { name: 'Wild Salmon', benefit: 'Omega-3s - anti-inflammatory' },
      { name: 'Sardines', benefit: 'Omega-3s and calcium' },
      { name: 'Walnuts', benefit: 'Omega-3s and plant protein' },
      { name: 'Flaxseeds', benefit: 'Omega-3s and fiber' },
      { name: 'Chia Seeds', benefit: 'Omega-3s and minerals' },
      // Protein sources
      { name: 'Meat & Fish', benefit: '50g protein/day minimum' },
      { name: 'Tofu', benefit: 'Plant protein' },
      { name: 'Eggs', benefit: 'Complete protein' },
      { name: 'Legumes', benefit: 'Protein and fiber' },
      { name: 'Tahini', benefit: 'Protein and calcium' },
      { name: 'Greek Yogurt', benefit: 'Best days for dairy - calcium' },
      // B vitamins
      { name: 'Spinach', benefit: 'B vitamins and magnesium' },
      { name: 'Sunflower Seeds', benefit: 'B vitamins and vitamin E' },
    ],
    nutrients: [
      {
        nutrient: 'Iodine',
        dailyAmount: '4mg/day',
        purpose: 'Supports thyroid and estrogen metabolism',
        foods: [
          { name: 'Fish', benefit: 'Natural iodine source' },
          { name: 'Seaweed', benefit: 'Concentrated iodine' },
          { name: 'Kelp', benefit: '1 tsp daily' },
          { name: 'Dulse', benefit: '2oz serving' },
          { name: 'Lemons', benefit: 'Iodine with vitamin C' },
        ],
      },
      {
        nutrient: 'Vitamin E',
        dailyAmount: '200-800 IU/day',
        purpose: 'Antioxidant, supports hormone balance',
        foods: [
          { name: 'Wheat Germ', benefit: 'Richest vitamin E source' },
          { name: 'Whole Grains', benefit: 'Natural vitamin E' },
          { name: 'Greens', benefit: 'Vitamin E with minerals' },
          { name: 'Sweet Potatoes', benefit: 'Vitamin E and beta-carotene' },
          { name: 'Seeds & Nuts', benefit: 'Vitamin E and healthy fats' },
        ],
      },
      {
        nutrient: 'Omega-3s',
        dailyAmount: '1000-2000mg/day',
        purpose: 'Anti-inflammatory, supports mood and hormone balance',
        foods: [
          { name: 'Wild Salmon', benefit: 'Best source of EPA/DHA' },
          { name: 'Sardines', benefit: 'Omega-3s with calcium' },
          { name: 'Walnuts', benefit: 'Plant-based omega-3s (ALA)' },
          { name: 'Flaxseeds', benefit: 'High in ALA omega-3s' },
          { name: 'Chia Seeds', benefit: 'Omega-3s and fiber' },
        ],
      },
      {
        nutrient: 'Protein',
        dailyAmount: '50g/day minimum',
        purpose: 'Building blocks for hormones and tissues',
        foods: [
          { name: 'Meat & Fish', benefit: 'Complete proteins' },
          { name: 'Grains + Legumes', benefit: 'Complimentary protein combo' },
          { name: 'Tofu & Eggs', benefit: 'Versatile proteins' },
          { name: 'Seeds & Tahini', benefit: 'Plant proteins' },
          { name: 'Greens', benefit: 'Surprising protein source' },
        ],
      },
    ],
    supplements: [
      { name: 'Omega-3 Fish Oil', amount: '1000-2000mg/day', note: 'Anti-inflammatory, supports mood' },
      { name: 'Calcium', amount: 'Extra', note: 'Take extra calcium in the first week' },
      { name: 'Vitamin E', amount: '200-800 IU/day' },
      { name: 'Vitamin D', amount: '2000-4000 IU', note: 'Supports calcium absorption and mood' },
      { name: 'B-Complex', amount: 'Daily', note: 'Energy and hormone metabolism' },
    ],
    herbs: [
      { name: 'Dong Quai (Don Quai)', benefit: 'Chinese root tonic - high iron, B12, vitamin E - take for 8 days' },
      { name: 'Black Cohosh', benefit: 'Balances and regulates estrogen' },
      { name: 'Nettles', benefit: 'Iodine source' },
      { name: 'Sarsaparilla', benefit: 'Iodine and hormone support' },
      { name: 'Parsley', benefit: 'Iodine and minerals' },
      { name: 'Mustard Greens', benefit: 'Iodine source' },
      { name: 'Irish Moss', benefit: 'Iodine-rich seaweed' },
      { name: 'Alfalfa', benefit: 'Vitamin E source' },
      { name: 'Dandelion Leaves', benefit: 'Vitamin E and liver support' },
    ],
    herbNotes: [
      'Take Dong Quai for 8 days during this phase (high in iron, B12, vitamin E)',
      'Black Cohosh helps balance and regulate estrogen levels',
      'In the first week, take extra calcium',
      'Omega-3s help reduce inflammation and support mood',
      'Best days to eat dairy products for calcium',
    ],
    avoid: ['Heavy, greasy foods', 'Excessive sugar', 'Processed foods'],
    tips: [
      'This is the celebration phase - energy is rising!',
      'Best days to eat dairy products for calcium',
      'Focus on omega-3 rich foods for anti-inflammatory support',
      'Take extra calcium in the first week of this phase',
      'Include fatty fish 2-3x weekly for omega-3s',
      'Sprouts and microgreens are excellent additions',
    ],
  },
  ovulatory: {
    focus: 'Light & Vibrant',
    description: 'Peak energy and fertility! This is ovulation - your most fertile time. Estrogen peaks then drops. Support with B6, zinc, and niacin. Be gentle with yourself.',
    days: 'Days 13-15',
    foods: [
      // Vitamin B6 sources (destroyed by cooking - eat raw when possible)
      { name: 'Fish (raw/light cook)', benefit: 'B6 - destroyed by cooking' },
      { name: 'Nuts', benefit: 'B6 and healthy fats' },
      { name: 'Avocado', benefit: 'B6 and healthy fats' },
      { name: 'Banana', benefit: 'B6 and potassium' },
      { name: 'Sprouted Soybeans', benefit: 'B6 and plant protein' },
      // Zinc sources
      { name: 'Chicken', benefit: 'Zinc and protein' },
      { name: 'Tuna', benefit: 'Zinc and omega-3s' },
      { name: 'Pumpkin Seeds', benefit: 'Zinc powerhouse' },
      { name: 'White Cornmeal', benefit: 'Zinc source' },
      { name: 'Paprika', benefit: 'Zinc and flavor' },
      { name: 'Garlic', benefit: 'Zinc and immune support' },
      // Niacin sources
      { name: 'Tofu', benefit: 'Niacin and plant protein' },
      { name: 'Soybeans', benefit: 'Niacin and protein' },
      { name: 'Sunflower Seeds', benefit: 'Niacin - seed cycling switch' },
      { name: 'Peanut Butter', benefit: 'Niacin and protein' },
      { name: 'Spirulina', benefit: 'Niacin superfood' },
      // Manganese sources
      { name: 'Walnuts', benefit: 'Manganese and omega-3s' },
      { name: 'Spinach', benefit: 'Manganese and iron' },
      { name: 'Alfalfa', benefit: 'Manganese source' },
      // Kelp & greens
      { name: 'Kelp', benefit: 'Iodine and minerals' },
      { name: 'Dandelion Greens', benefit: 'Liver support' },
      { name: 'Parsley', benefit: 'Minerals and freshness' },
      { name: 'Watercress', benefit: 'Nutrient dense' },
      { name: 'Blueberries', benefit: 'Antioxidants' },
      // Evening minerals
      { name: 'Calcium-rich foods', benefit: 'Extra calcium needed' },
      { name: 'Sesame Seeds', benefit: 'Seed cycling - add now' },
    ],
    nutrients: [
      {
        nutrient: 'Vitamin B6',
        dailyAmount: '50-100mg',
        purpose: 'Hormone balance - destroyed by cooking',
        foods: [
          { name: 'Fish', benefit: 'Best eaten raw or lightly cooked' },
          { name: 'Nuts', benefit: 'Raw for maximum B6' },
          { name: 'Avocado', benefit: 'Raw and creamy' },
          { name: 'Banana', benefit: 'Easy raw snack' },
          { name: 'Sprouted Soybeans', benefit: 'Living B6 source' },
        ],
      },
      {
        nutrient: 'Zinc',
        dailyAmount: '15-30mg/day',
        purpose: 'Fertility and immune support',
        foods: [
          { name: 'Chicken', benefit: 'Lean zinc source' },
          { name: 'Tuna', benefit: 'Zinc with omega-3s' },
          { name: 'Pumpkin Seeds', benefit: 'Plant-based zinc' },
          { name: 'White Cornmeal', benefit: 'Grain zinc source' },
          { name: 'Paprika & Garlic', benefit: 'Flavorful zinc' },
        ],
      },
      {
        nutrient: 'Niacin',
        dailyAmount: 'As needed',
        purpose: 'Energy and hormone metabolism',
        foods: [
          { name: 'Chicken', benefit: 'Complete niacin source' },
          { name: 'Tofu & Soybeans', benefit: 'Plant niacin' },
          { name: 'Sunflower Seeds', benefit: 'Seed cycling switch' },
          { name: 'Peanut Butter', benefit: 'Creamy niacin' },
          { name: 'Spirulina', benefit: 'Superfood niacin' },
        ],
      },
      {
        nutrient: 'Manganese',
        dailyAmount: '2-4mg/day',
        purpose: 'Enzyme function and bone health',
        foods: [
          { name: 'Walnuts', benefit: 'Rich manganese source' },
          { name: 'Spinach', benefit: 'Greens for manganese' },
          { name: 'Alfalfa', benefit: 'Sprouted manganese' },
        ],
      },
    ],
    supplements: [
      { name: 'Vitamin B6', amount: '50-100mg', note: 'Important for hormone balance' },
      { name: 'Zinc', amount: '15-30mg/day', note: 'Vegetarians especially need supplementation' },
      { name: 'Calcium', amount: 'Extra', note: 'Need extra calcium during estrogen drop' },
      { name: 'Magnesium Glycinate', amount: 'Evening', note: 'For mood and sleep - take P.M.' },
      { name: 'Potassium', amount: 'Evening', note: 'Take in the evening (P.M.)' },
    ],
    herbs: [
      { name: 'Kelp', benefit: 'Iodine and trace minerals' },
      { name: 'Dandelion Greens', benefit: 'Liver and hormone support' },
      { name: 'Parsley', benefit: 'Minerals and cleansing' },
      { name: 'Watercress', benefit: 'Nutrient powerhouse' },
      { name: 'Rice Bran', benefit: 'B vitamins' },
      { name: 'Cayenne', benefit: 'Niacin and circulation' },
      { name: 'Comfrey', benefit: 'Niacin source' },
      { name: 'Fenugreek', benefit: 'Niacin and hormone support' },
      { name: 'Alfalfa', benefit: 'Manganese and minerals' },
    ],
    herbNotes: [
      'Vitamin B6 is destroyed by cooking - eat foods raw when possible',
      'Vegetarians need zinc supplements during this phase',
      'Take calcium, magnesium, and potassium in the evening',
      'Be gentle with yourself during fertility cycles',
      'Estrogen drops after ovulation - extra calcium helps',
    ],
    avoid: ['Heavy carbs', 'Fried foods', 'Overcooked foods (destroys B6)'],
    tips: [
      'Focus on raw and lightly cooked foods to preserve B6',
      'Vegetarians should supplement zinc (15-30mg/day)',
      'Take calcium, magnesium, potassium in the evening',
      'This is peak fertility - be aware of your fertile signs',
      'Cervical mucus is stretchy, wet, and egg-white-like',
      'Temperature will peak about 3 days after ovulation',
    ],
    fertilityInfo: {
      title: 'Fertility Awareness',
      description: 'Ovulation is your most fertile time. An egg is released and can be fertilized for 12-24 hours. Sperm may live as long as 5 days.',
      keyPoints: [
        'Peak fertility occurs 1-2 days before and on ovulation day',
        'Sperm can survive up to 5 days in fertile cervical mucus',
        'Your fertile window is approximately 5-6 days long',
        'Cervical mucus becomes stretchy, slippery, very wet, lubricative',
        'Cervix is higher, softer, and cervical OS is open',
        'Temperature peaks about 3 days after ovulation',
      ],
      contraceptionNote: 'To avoid pregnancy, use contraception during your fertile window (5 days before through ovulation day).',
    },
  },
  luteal: {
    focus: 'Stabilize & Comfort',
    description: 'Progesterone rises as estrogen drops. Focus on calcium, vitamin D, magnesium, and B vitamins to ease PMS symptoms. Omega-3s help reduce inflammation. Eat light and honor your body\'s needs.',
    days: 'Days 16-28',
    foods: [
      // Calcium sources (PMS essential)
      { name: 'Tofu', benefit: 'Excellent calcium source' },
      { name: 'Dark Greens', benefit: 'Calcium and minerals' },
      { name: 'Seaweed (Hijiki)', benefit: 'High calcium sea vegetable' },
      { name: 'Seeds', benefit: 'Sesame for calcium' },
      { name: 'Soybeans', benefit: 'Plant calcium' },
      { name: 'Tahini', benefit: 'Calcium from sesame' },
      { name: 'Greek Yogurt', benefit: 'Calcium and probiotics' },
      { name: 'Cheese', benefit: 'Dairy calcium' },
      // Magnesium sources (PMS essential)
      { name: 'Figs', benefit: 'Magnesium and fiber' },
      { name: 'Apricots', benefit: 'Magnesium and potassium' },
      { name: 'Kelp', benefit: 'Magnesium from the sea' },
      { name: 'Blackstrap Molasses', benefit: 'Concentrated magnesium' },
      { name: 'Dates', benefit: 'Natural magnesium' },
      { name: 'Dark Chocolate (70%+)', benefit: 'Magnesium and mood boost' },
      { name: 'Spinach', benefit: 'Magnesium and B vitamins' },
      { name: 'Pumpkin Seeds', benefit: 'Magnesium powerhouse' },
      // B vitamin sources (PMS essential)
      { name: 'Bananas', benefit: 'B6 and potassium' },
      { name: 'Avocados', benefit: 'B vitamins and healthy fats' },
      { name: 'Chicken', benefit: 'B vitamins and protein' },
      { name: 'Sunflower Seeds', benefit: 'B vitamins - seed cycling' },
      { name: 'Sesame Seeds', benefit: 'B vitamins - seed cycling' },
      // Omega-3 sources (anti-inflammatory for PMS)
      { name: 'Wild Salmon', benefit: 'Omega-3s reduce inflammation' },
      { name: 'Sardines', benefit: 'Omega-3s and calcium' },
      { name: 'Walnuts', benefit: 'Omega-3s and magnesium' },
      { name: 'Flaxseeds', benefit: 'Omega-3s and fiber' },
      // Vitamin D sources
      { name: 'Fatty Fish', benefit: 'Vitamin D and omega-3s' },
      { name: 'Eggs', benefit: 'Vitamin D and protein' },
      { name: 'Mushrooms (UV-exposed)', benefit: 'Plant-based vitamin D' },
      // Potassium sources
      { name: 'Potatoes', benefit: 'Potassium-rich comfort food' },
      { name: 'Fresh Carrot Juice', benefit: 'Potassium and vitamins' },
    ],
    nutrients: [
      {
        nutrient: 'Calcium',
        dailyAmount: '1000-1500mg/day',
        purpose: 'Clinically proven to reduce PMS symptoms by 50%',
        foods: [
          { name: 'Greek Yogurt', benefit: 'Calcium with probiotics' },
          { name: 'Dark Greens & Tofu', benefit: 'Plant-based calcium' },
          { name: 'Seaweed (Hijiki)', benefit: 'Sea vegetable calcium' },
          { name: 'Sesame Seeds & Tahini', benefit: 'High calcium seeds' },
          { name: 'Cheese', benefit: 'Dairy calcium source' },
          { name: 'Sardines with Bones', benefit: 'Calcium and omega-3s' },
        ],
      },
      {
        nutrient: 'Magnesium',
        dailyAmount: '400-600mg',
        purpose: 'Reduces cramps, bloating, mood swings, and headaches',
        foods: [
          { name: 'Dark Chocolate (70%+)', benefit: 'Magnesium and antioxidants' },
          { name: 'Pumpkin Seeds', benefit: 'Magnesium powerhouse' },
          { name: 'Spinach', benefit: 'Magnesium with B vitamins' },
          { name: 'Figs & Dates', benefit: 'Natural magnesium' },
          { name: 'Kelp', benefit: 'Sea vegetable magnesium' },
          { name: 'Blackstrap Molasses', benefit: 'Concentrated source' },
        ],
      },
      {
        nutrient: 'B Vitamins',
        dailyAmount: 'B6: 50-100mg, B12: adequate',
        purpose: 'Reduces mood swings, fatigue, and irritability',
        foods: [
          { name: 'Bananas', benefit: 'B6 and potassium' },
          { name: 'Avocados', benefit: 'B vitamins and healthy fats' },
          { name: 'Chicken & Fish', benefit: 'B12 and B6' },
          { name: 'Sunflower Seeds', benefit: 'B vitamins and vitamin E' },
          { name: 'Leafy Greens', benefit: 'Folate (B9)' },
        ],
      },
      {
        nutrient: 'Omega-3s',
        dailyAmount: '1000-2000mg EPA/DHA',
        purpose: 'Reduces inflammation, cramps, and breast tenderness',
        foods: [
          { name: 'Wild Salmon', benefit: 'Best omega-3 source' },
          { name: 'Sardines', benefit: 'Omega-3s and calcium' },
          { name: 'Walnuts', benefit: 'Plant-based omega-3s' },
          { name: 'Flaxseeds', benefit: 'ALA omega-3s' },
          { name: 'Chia Seeds', benefit: 'Omega-3s and fiber' },
        ],
      },
      {
        nutrient: 'Vitamin D',
        dailyAmount: '2000-4000 IU',
        purpose: 'Works with calcium, supports mood and reduces PMS',
        foods: [
          { name: 'Fatty Fish', benefit: 'Vitamin D with omega-3s' },
          { name: 'Eggs', benefit: 'Vitamin D in yolks' },
          { name: 'UV-Exposed Mushrooms', benefit: 'Plant vitamin D' },
          { name: 'Fortified Foods', benefit: 'Added vitamin D' },
        ],
      },
    ],
    supplements: [
      { name: 'Calcium', amount: '1000-1500mg/day', note: 'Clinically proven to reduce PMS by 50%' },
      { name: 'Magnesium Glycinate', amount: '400-600mg', note: 'Best absorbed form - take evening for sleep' },
      { name: 'Vitamin D3', amount: '2000-4000 IU', note: 'Works with calcium - take together' },
      { name: 'B-Complex', amount: 'Daily', note: 'Especially B6 for mood and energy' },
      { name: 'Omega-3 Fish Oil', amount: '1000-2000mg', note: 'EPA/DHA reduces inflammation and cramps' },
    ],
    herbs: [
      { name: 'Chamomile', benefit: 'Calming and reduces cramps' },
      { name: 'Raspberry Leaves', benefit: 'Uterine tonic - steep in milk' },
      { name: 'Dandelion Root', benefit: 'Reduces bloating and water retention' },
      { name: 'Vitex (Chasteberry)', benefit: 'Balances progesterone, reduces PMS' },
      { name: 'Evening Primrose Oil', benefit: 'GLA for breast tenderness' },
      { name: 'Ginger', benefit: 'Reduces cramps and nausea' },
      { name: 'Nettle Tea', benefit: 'Minerals and water balance' },
      { name: 'Lavender', benefit: 'Stress relief and sleep support' },
    ],
    herbNotes: [
      'Calcium + Vitamin D together is the most researched PMS treatment',
      'Magnesium glycinate before bed helps with sleep and cramps',
      'Omega-3s take 2-3 months to show full anti-inflammatory benefits',
      'Vitex works best taken consistently over several cycles',
      'Drink nettle or dandelion tea for water retention',
    ],
    avoid: ['Excessive salt (causes water retention)', 'Caffeine (worsens anxiety)', 'Refined sugar (causes mood crashes)', 'Alcohol (depletes B vitamins)'],
    tips: [
      'Exercise helps: even gentle walking reduces PMS symptoms',
      'Stress reduction is key: try yoga, meditation, or deep breathing',
      'Calcium + D + Magnesium is the PMS relief trifecta',
      'Eat fatty fish 2-3x weekly for omega-3 anti-inflammatory benefits',
      'Keep blood sugar stable with protein at each meal',
      'Sleep is crucial - prioritize 7-9 hours during this phase',
      'Track your symptoms to identify personal triggers',
    ],
  },
};

// Perimenopause nutrition
const perimenopauseNutrition = {
  focus: 'Balance & Support',
  description: 'During perimenopause, focus on foods that support hormone balance, bone health, and help manage symptoms like hot flashes and mood changes.',
  foods: [
    { name: 'Fatty Fish', benefit: 'Salmon, mackerel - omega-3s for mood and hot flashes' },
    { name: 'Flaxseeds', benefit: 'Phytoestrogens to ease symptoms' },
    { name: 'Leafy Greens', benefit: 'Calcium and magnesium for bones' },
    { name: 'Cruciferous Veggies', benefit: 'Broccoli, kale - hormone metabolism' },
    { name: 'Berries', benefit: 'Antioxidants for brain health' },
    { name: 'Nuts & Seeds', benefit: 'Healthy fats and minerals' },
    { name: 'Legumes', benefit: 'Plant protein and fiber' },
    { name: 'Whole Grains', benefit: 'Steady energy and fiber' },
    { name: 'Fermented Foods', benefit: 'Gut health and nutrient absorption' },
    { name: 'Eggs', benefit: 'Protein and vitamin D' },
    { name: 'Greek Yogurt', benefit: 'Calcium and probiotics' },
    { name: 'Olive Oil', benefit: 'Heart-healthy fats' },
    { name: 'Sweet Potatoes', benefit: 'Complex carbs and vitamins' },
    { name: 'Bone Broth', benefit: 'Collagen and minerals' },
    { name: 'Dark Chocolate', benefit: '70%+ for mood and magnesium' },
  ],
  herbs: [
    { name: 'Black Cohosh', benefit: 'Reduces hot flashes and night sweats - most studied herb for menopause' },
    { name: 'Vitex (Chasteberry)', benefit: 'Balances progesterone, helps irregular cycles' },
    { name: 'Maca Root', benefit: 'Supports hormone balance, energy, and libido' },
    { name: 'Ashwagandha', benefit: 'Adaptogen for stress, mood, and adrenal support' },
    { name: 'Red Clover', benefit: 'Phytoestrogens for hot flashes and bone health' },
    { name: 'Evening Primrose Oil', benefit: 'GLA for hot flashes and breast tenderness' },
    { name: 'Dong Quai', benefit: 'Traditional Chinese herb for hormone balance' },
    { name: 'Sage', benefit: 'Reduces excessive sweating and hot flashes' },
    { name: 'Rhodiola', benefit: 'Adaptogen for energy, focus, and stress resilience' },
    { name: 'Valerian Root', benefit: 'Natural sleep support without grogginess' },
  ],
  herbNotes: [
    'Start with one herb at a time to assess your response',
    'Black Cohosh is most effective for hot flashes - give it 8-12 weeks',
    'Avoid Black Cohosh if you have liver conditions',
    'Vitex works best taken in the morning on an empty stomach',
    'Adaptogens like Ashwagandha and Rhodiola help your body handle stress',
  ],
  supplements: [
    { name: 'Magnesium Glycinate', amount: '300-400mg', note: 'Best for mood and sleep - highly absorbable, calming form' },
    { name: 'Vitamin D3', amount: '2000-4000 IU', note: 'Critical for bone health, mood, and immune function - test levels yearly' },
    { name: 'B-Complex', amount: 'Daily', note: 'Supports energy, mood, and hormone metabolism - especially B6, B12, folate' },
    { name: 'Omega-3 (EPA/DHA)', amount: '1000-2000mg', note: 'Reduces inflammation, supports mood, heart, and brain' },
    { name: 'Calcium', amount: '1000-1200mg', note: 'Split doses for better absorption - take with D3 and K2' },
    { name: 'Vitamin K2 (MK-7)', amount: '100-200mcg', note: 'Directs calcium to bones, not arteries - take with D3' },
    { name: 'Vitamin E', amount: '400 IU', note: 'Natural form (d-alpha) for hot flashes and skin health' },
    { name: 'Iron', amount: 'If needed', note: 'Only supplement if deficient - heavy periods can cause low iron' },
  ],
  focusAreas: [
    { title: 'Hot Flash Relief', foods: 'Cold water, cooling foods like cucumber, avoid spicy foods, limit caffeine and alcohol' },
    { title: 'Bone Health', foods: 'Calcium-rich foods, vitamin D, leafy greens, sardines with bones' },
    { title: 'Mood Support', foods: 'Omega-3 rich fish, complex carbs, foods with B vitamins' },
    { title: 'Sleep Quality', foods: 'Tart cherries, magnesium-rich foods, chamomile tea, limit evening caffeine' },
    { title: 'Weight Management', foods: 'High protein, fiber-rich foods, limit refined carbs and sugar' },
  ],
  avoid: ['Spicy foods (trigger hot flashes)', 'Excessive caffeine', 'Alcohol', 'Refined sugar', 'Processed foods', 'High-sodium foods'],
  tips: [
    'Eat protein at every meal to maintain muscle mass',
    'Include phytoestrogen foods like flax, soy, and legumes',
    'Stay hydrated - aim for 8+ glasses of water daily',
    'Consider smaller, more frequent meals to stabilize energy',
    'Keep a food diary to identify hot flash triggers',
  ],
};

// Menopause nutrition
const menopauseNutrition = {
  focus: 'Nourish & Thrive',
  description: 'Post-menopause, nutrition focuses on maintaining bone density, heart health, brain function, and healthy weight. Your body has new needs - embrace them!',
  foods: [
    { name: 'Salmon & Fatty Fish', benefit: 'Omega-3s for heart and brain' },
    { name: 'Sardines with Bones', benefit: 'Calcium and vitamin D' },
    { name: 'Leafy Greens', benefit: 'Calcium, vitamin K for bones' },
    { name: 'Berries', benefit: 'Antioxidants for brain health' },
    { name: 'Nuts', benefit: 'Almonds, walnuts - heart healthy' },
    { name: 'Seeds', benefit: 'Flax, chia, pumpkin - minerals' },
    { name: 'Legumes', benefit: 'Protein, fiber, phytoestrogens' },
    { name: 'Whole Grains', benefit: 'Fiber and B vitamins' },
    { name: 'Olive Oil', benefit: 'Heart-healthy monounsaturated fats' },
    { name: 'Eggs', benefit: 'Protein and vitamin D' },
    { name: 'Greek Yogurt', benefit: 'Calcium, protein, probiotics' },
    { name: 'Tofu & Tempeh', benefit: 'Plant protein and isoflavones' },
    { name: 'Avocados', benefit: 'Healthy fats and potassium' },
    { name: 'Broccoli', benefit: 'Calcium and fiber' },
    { name: 'Oranges', benefit: 'Vitamin C for collagen' },
  ],
  herbs: [
    { name: 'Black Cohosh', benefit: 'Continues to help with any lingering hot flashes' },
    { name: 'Red Clover', benefit: 'Isoflavones support bone density and heart health' },
    { name: 'Sage', benefit: 'Reduces night sweats and supports cognitive function' },
    { name: 'Ginkgo Biloba', benefit: 'Improves circulation, memory, and cognitive clarity' },
    { name: 'St. John\'s Wort', benefit: 'Natural mood support - do not combine with antidepressants' },
    { name: 'Ashwagandha', benefit: 'Reduces cortisol, supports thyroid and energy' },
    { name: 'Turmeric/Curcumin', benefit: 'Powerful anti-inflammatory for joints and heart' },
    { name: 'Ginger', benefit: 'Digestive support and anti-inflammatory' },
    { name: 'Milk Thistle', benefit: 'Liver support for hormone metabolism' },
    { name: 'Hawthorn', benefit: 'Heart tonic - supports cardiovascular health' },
  ],
  herbNotes: [
    'Continue adaptogens like Ashwagandha for ongoing stress support',
    'Turmeric absorbs better with black pepper and fat',
    'St. John\'s Wort interacts with many medications - check with your doctor',
    'Ginkgo may thin blood - stop before surgery',
    'Hawthorn is excellent for long-term heart health support',
  ],
  supplements: [
    { name: 'Magnesium Glycinate', amount: '300-400mg', note: 'Best for mood and sleep - highly absorbable, gentle on digestion' },
    { name: 'Calcium + Vitamin D3', amount: '1200mg Ca\n2000-4000 IU D3', note: 'Essential duo for bone health - split calcium into 2 doses' },
    { name: 'Vitamin K2 (MK-7)', amount: '100-200mcg', note: 'Ensures calcium goes to bones, not arteries - take with D3' },
    { name: 'Omega-3 (EPA/DHA)', amount: '1000-2000mg', note: 'Heart, brain, joints, and mood - wild-caught fish oil or algae' },
    { name: 'Vitamin B12', amount: '1000-2500mcg', note: 'Absorption decreases with age - sublingual or methylcobalamin best' },
    { name: 'CoQ10', amount: '100-200mg', note: 'Heart health and cellular energy - especially if on statins' },
    { name: 'Collagen Peptides', amount: '10-15g', note: 'Supports skin elasticity, joints, and bone matrix' },
    { name: 'Probiotics', amount: 'Multi-strain', note: 'Gut health affects hormone metabolism and immunity' },
    { name: 'Boron', amount: '3mg', note: 'Trace mineral that helps calcium and magnesium absorption' },
  ],
  focusAreas: [
    { title: 'Bone Health', foods: 'Calcium-rich foods (dairy, leafy greens, fortified foods), vitamin D, vitamin K' },
    { title: 'Heart Health', foods: 'Omega-3s, olive oil, nuts, fiber-rich foods, limit saturated fat' },
    { title: 'Brain Health', foods: 'Fatty fish, berries, leafy greens, nuts, olive oil (Mediterranean diet)' },
    { title: 'Muscle Maintenance', foods: 'Protein at every meal (25-30g), leucine-rich foods' },
    { title: 'Skin Health', foods: 'Vitamin C, collagen-supporting foods, healthy fats, hydration' },
  ],
  avoid: ['Excessive sodium', 'Saturated and trans fats', 'Added sugars', 'Processed foods', 'Excessive alcohol', 'Very low calorie diets'],
  tips: [
    'Prioritize protein - aim for 1g per pound of ideal body weight',
    'Calcium needs increase to 1200mg daily after menopause',
    'Vitamin D is essential - consider supplementation',
    'Eat the rainbow - colorful foods provide diverse antioxidants',
    'Strength training + protein helps maintain muscle and bone',
    'Mediterranean diet is well-researched for post-menopausal health',
  ],
};

interface CollapsibleSectionProps {
  title: string;
  icon: React.ReactNode;
  items: NutritionItem[];
  theme: ReturnType<typeof getTheme>;
  iconBgColor: string;
  defaultExpanded?: boolean;
}

function CollapsibleSection({ title, icon, items, theme, iconBgColor, defaultExpanded = false }: CollapsibleSectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <View
      className="rounded-2xl border overflow-hidden mb-4"
      style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light }}
    >
      <Pressable
        onPress={() => setExpanded(!expanded)}
        className="flex-row items-center justify-between p-4"
      >
        <View className="flex-row items-center flex-1">
          <View
            className="w-10 h-10 rounded-full items-center justify-center mr-3"
            style={{ backgroundColor: iconBgColor }}
          >
            {icon}
          </View>
          <View className="flex-1">
            <Text
              style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
              className="text-base"
            >
              {title}
            </Text>
            <Text
              style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.tertiary }}
              className="text-xs"
            >
              {items.length} items
            </Text>
          </View>
        </View>
        {expanded ? (
          <ChevronUp size={20} color={theme.text.tertiary} />
        ) : (
          <ChevronDown size={20} color={theme.text.tertiary} />
        )}
      </Pressable>

      {expanded && (
        <View className="px-4 pb-4">
          <View className="h-px mb-3" style={{ backgroundColor: theme.border.light }} />
          {items.map((item, index) => (
            <View key={item.name} className={`flex-row items-start ${index > 0 ? 'mt-3' : ''}`}>
              <View className="w-2 h-2 rounded-full mt-1.5 mr-3" style={{ backgroundColor: theme.accent.pink }} />
              <View className="flex-1">
                <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }} className="text-sm">
                  {item.name}
                </Text>
                <Text style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.tertiary }} className="text-xs mt-0.5">
                  {item.benefit}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

interface FocusAreasSectionProps {
  focusAreas: { title: string; foods: string }[];
  theme: ReturnType<typeof getTheme>;
  accentColor: string;
}

function FocusAreasSection({ focusAreas, theme, accentColor }: FocusAreasSectionProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View
      className="rounded-2xl border overflow-hidden mb-4"
      style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light }}
    >
      <Pressable
        onPress={() => setExpanded(!expanded)}
        className="flex-row items-center justify-between p-4"
      >
        <View className="flex-row items-center flex-1">
          <View className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{ backgroundColor: `${accentColor}15` }}>
            <Heart size={18} color={accentColor} />
          </View>
          <View className="flex-1">
            <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }} className="text-base">
              Focus Areas
            </Text>
            <Text style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.tertiary }} className="text-xs">
              Targeted nutrition guidance
            </Text>
          </View>
        </View>
        {expanded ? <ChevronUp size={20} color={theme.text.tertiary} /> : <ChevronDown size={20} color={theme.text.tertiary} />}
      </Pressable>

      {expanded && (
        <View className="px-4 pb-4">
          <View className="h-px mb-3" style={{ backgroundColor: theme.border.light }} />
          {focusAreas.map((area, index) => (
            <View key={area.title} className={`${index > 0 ? 'mt-4' : ''}`}>
              <View className="flex-row items-center mb-1">
                <View className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: accentColor }} />
                <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }} className="text-sm">
                  {area.title}
                </Text>
              </View>
              <Text style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.secondary }} className="text-xs leading-5 ml-4">
                {area.foods}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function SeedCyclingSection({ theme }: { theme: ReturnType<typeof getTheme> }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View
      className="rounded-2xl border overflow-hidden mb-4"
      style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light }}
    >
      <Pressable onPress={() => setExpanded(!expanded)} className="flex-row items-center justify-between p-4">
        <View className="flex-row items-center flex-1">
          <View className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{ backgroundColor: `${theme.accent.purple}15` }}>
            <Sparkles size={18} color={theme.accent.purple} />
          </View>
          <View className="flex-1">
            <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }} className="text-base">
              Seed Cycling Protocol
            </Text>
            <Text style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.tertiary }} className="text-xs">
              4 seeds across cycle phases
            </Text>
          </View>
        </View>
        {expanded ? <ChevronUp size={20} color={theme.text.tertiary} /> : <ChevronDown size={20} color={theme.text.tertiary} />}
      </Pressable>

      {expanded && (
        <View className="px-4 pb-4">
          <View className="h-px mb-3" style={{ backgroundColor: theme.border.light }} />
          <View className="mb-4">
            <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.accent.pink }} className="text-xs mb-2">
              Week 1-2 (Follicular)
            </Text>
            <Text style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.secondary }} className="text-sm">
              Pumpkin Seeds + Flax Seeds (1-2 tbsp each daily)
            </Text>
          </View>
          <View>
            <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.accent.purple }} className="text-xs mb-2">
              Week 3-4 (Luteal)
            </Text>
            <Text style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.secondary }} className="text-sm">
              Sunflower Seeds + Sesame Seeds (1-2 tbsp each daily)
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

// Nutrient Categories Section (supports any phase nutrients)
function NutrientCategoriesSection({ nutrients, phase, theme }: { nutrients: NutrientCategory[]; phase: CyclePhase; theme: ReturnType<typeof getTheme> }) {
  const [expandedNutrient, setExpandedNutrient] = useState<string | null>(null);

  const getNutrientColor = (nutrient: string) => {
    switch (nutrient) {
      case 'Iron': return '#be185d';
      case 'Folic Acid': return '#059669';
      case 'Vitamin C': return '#f59e0b';
      case 'Iodine': return '#0891b2';
      case 'Vitamin E': return '#84cc16';
      case 'Linoleic Acid': return '#f97316';
      case 'Protein': return '#ec4899';
      default: return theme.accent.pink;
    }
  };

  const getNutrientIcon = (nutrient: string) => {
    switch (nutrient) {
      case 'Iron': return <Beaker size={18} color={getNutrientColor(nutrient)} />;
      case 'Folic Acid': return <Leaf size={18} color={getNutrientColor(nutrient)} />;
      case 'Vitamin C': return <Sun size={18} color={getNutrientColor(nutrient)} />;
      case 'Iodine': return <Beaker size={18} color={getNutrientColor(nutrient)} />;
      case 'Vitamin E': return <Sparkles size={18} color={getNutrientColor(nutrient)} />;
      case 'Linoleic Acid': return <Heart size={18} color={getNutrientColor(nutrient)} />;
      case 'Protein': return <UtensilsCrossed size={18} color={getNutrientColor(nutrient)} />;
      default: return <Pill size={18} color={getNutrientColor(nutrient)} />;
    }
  };

  const getPhaseTitle = () => {
    switch (phase) {
      case 'menstrual': return 'Key Nutrients for Days 1-5';
      case 'follicular': return 'Key Nutrients for Days 6-13';
      case 'ovulatory': return 'Key Nutrients for Days 13-15';
      case 'luteal': return 'Key Nutrients for Days 16-28';
      default: return 'Key Nutrients';
    }
  };

  return (
    <View className="mb-4">
      <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }} className="text-base mb-3">
        {getPhaseTitle()}
      </Text>
      {nutrients.map((nutrient) => {
        const color = getNutrientColor(nutrient.nutrient);
        const isExpanded = expandedNutrient === nutrient.nutrient;

        return (
          <View
            key={nutrient.nutrient}
            className="rounded-2xl border overflow-hidden mb-3"
            style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light }}
          >
            <Pressable
              onPress={() => setExpandedNutrient(isExpanded ? null : nutrient.nutrient)}
              className="flex-row items-center justify-between p-4"
            >
              <View className="flex-row items-center flex-1">
                <View
                  className="w-10 h-10 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: `${color}15` }}
                >
                  {getNutrientIcon(nutrient.nutrient)}
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center">
                    <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }} className="text-base">
                      {nutrient.nutrient}
                    </Text>
                    <View className="ml-2 px-2 py-0.5 rounded-full" style={{ backgroundColor: `${color}15` }}>
                      <Text style={{ fontFamily: 'Quicksand_500Medium', color }} className="text-xs">
                        {nutrient.dailyAmount}
                      </Text>
                    </View>
                  </View>
                  <Text style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.tertiary }} className="text-xs">
                    {nutrient.purpose}
                  </Text>
                </View>
              </View>
              {isExpanded ? <ChevronUp size={20} color={theme.text.tertiary} /> : <ChevronDown size={20} color={theme.text.tertiary} />}
            </Pressable>

            {isExpanded && (
              <View className="px-4 pb-4">
                <View className="h-px mb-3" style={{ backgroundColor: theme.border.light }} />
                {nutrient.foods.map((food, index) => (
                  <View key={food.name} className={`flex-row items-start ${index > 0 ? 'mt-3' : ''}`}>
                    <View className="w-2 h-2 rounded-full mt-1.5 mr-3" style={{ backgroundColor: color }} />
                    <View className="flex-1">
                      <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }} className="text-sm">
                        {food.name}
                      </Text>
                      <Text style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.tertiary }} className="text-xs mt-0.5">
                        {food.benefit}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

// Herbs Section
function HerbsSection({ herbs, herbNotes, theme }: { herbs: HerbInfo[]; herbNotes?: string[]; theme: ReturnType<typeof getTheme> }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View
      className="rounded-2xl border overflow-hidden mb-4"
      style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light }}
    >
      <Pressable onPress={() => setExpanded(!expanded)} className="flex-row items-center justify-between p-4">
        <View className="flex-row items-center flex-1">
          <View className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{ backgroundColor: '#16a34a15' }}>
            <Flower2 size={18} color="#16a34a" />
          </View>
          <View className="flex-1">
            <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }} className="text-base">
              Supportive Herbs
            </Text>
            <Text style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.tertiary }} className="text-xs">
              {herbs.length} herbs for this phase
            </Text>
          </View>
        </View>
        {expanded ? <ChevronUp size={20} color={theme.text.tertiary} /> : <ChevronDown size={20} color={theme.text.tertiary} />}
      </Pressable>

      {expanded && (
        <View className="px-4 pb-4">
          <View className="h-px mb-3" style={{ backgroundColor: theme.border.light }} />
          {herbs.map((herb, index) => (
            <View key={herb.name} className={`flex-row items-start ${index > 0 ? 'mt-3' : ''}`}>
              <View className="w-2 h-2 rounded-full mt-1.5 mr-3" style={{ backgroundColor: '#16a34a' }} />
              <View className="flex-1">
                <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }} className="text-sm">
                  {herb.name}
                </Text>
                <Text style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.tertiary }} className="text-xs mt-0.5">
                  {herb.benefit}
                </Text>
              </View>
            </View>
          ))}

          {herbNotes && herbNotes.length > 0 && (
            <View className="mt-4 p-3 rounded-xl" style={{ backgroundColor: '#fef3c715', borderWidth: 1, borderColor: '#fcd34d30' }}>
              <View className="flex-row items-center mb-2">
                <Info size={14} color="#f59e0b" />
                <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: '#f59e0b' }} className="text-xs ml-2">
                  Important Notes
                </Text>
              </View>
              {herbNotes.map((note, index) => (
                <Text key={index} style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.secondary }} className="text-xs leading-5 mt-1">
                  • {note}
                </Text>
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
}

// Supplements Section
function SupplementsSection({ supplements, theme }: { supplements: { name: string; amount: string; note?: string }[]; theme: ReturnType<typeof getTheme> }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View
      className="rounded-2xl border overflow-hidden mb-4"
      style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light }}
    >
      <Pressable onPress={() => setExpanded(!expanded)} className="flex-row items-center justify-between p-4">
        <View className="flex-row items-center flex-1">
          <View className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{ backgroundColor: '#8b5cf615' }}>
            <Pill size={18} color="#8b5cf6" />
          </View>
          <View className="flex-1">
            <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }} className="text-base">
              Vitamins & Minerals
            </Text>
            <Text style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.tertiary }} className="text-xs">
              Recommended supplementation
            </Text>
          </View>
        </View>
        {expanded ? <ChevronUp size={20} color={theme.text.tertiary} /> : <ChevronDown size={20} color={theme.text.tertiary} />}
      </Pressable>

      {expanded && (
        <View className="px-4 pb-4">
          <View className="h-px mb-3" style={{ backgroundColor: theme.border.light }} />
          {supplements.map((supp, index) => (
            <View key={supp.name} className={`flex-row items-start ${index > 0 ? 'mt-3' : ''}`}>
              <View className="w-2 h-2 rounded-full mt-1.5 mr-3" style={{ backgroundColor: '#8b5cf6' }} />
              <View className="flex-1">
                <View className="flex-row items-center">
                  <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }} className="text-sm">
                    {supp.name}
                  </Text>
                  <View className="ml-2 px-2 py-0.5 rounded-full" style={{ backgroundColor: '#8b5cf615' }}>
                    <Text style={{ fontFamily: 'Quicksand_500Medium', color: '#8b5cf6' }} className="text-xs">
                      {supp.amount}
                    </Text>
                  </View>
                </View>
                {supp.note && (
                  <Text style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.tertiary }} className="text-xs mt-0.5">
                    {supp.note}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function FertilityInfoSection({ fertilityInfo, theme }: { fertilityInfo: NonNullable<PhaseNutritionData['fertilityInfo']>; theme: ReturnType<typeof getTheme> }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View className="rounded-2xl border overflow-hidden mb-4" style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light }}>
      <Pressable onPress={() => setExpanded(!expanded)} className="flex-row items-center justify-between p-4">
        <View className="flex-row items-center flex-1">
          <View className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{ backgroundColor: '#F472B615' }}>
            <Heart size={18} color="#F472B6" />
          </View>
          <View className="flex-1">
            <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }} className="text-base">
              {fertilityInfo.title}
            </Text>
            <Text style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.tertiary }} className="text-xs">
              Important fertility window info
            </Text>
          </View>
        </View>
        {expanded ? <ChevronUp size={20} color={theme.text.tertiary} /> : <ChevronDown size={20} color={theme.text.tertiary} />}
      </Pressable>

      {expanded && (
        <View className="px-4 pb-4">
          <View className="h-px mb-3" style={{ backgroundColor: theme.border.light }} />
          <Text style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.secondary }} className="text-sm leading-5 mb-4">
            {fertilityInfo.description}
          </Text>
          {fertilityInfo.keyPoints.map((point, index) => (
            <View key={index} className={`flex-row items-start ${index > 0 ? 'mt-2' : ''}`}>
              <View className="w-2 h-2 rounded-full mt-1.5 mr-3" style={{ backgroundColor: '#F472B6' }} />
              <Text style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.secondary }} className="text-sm flex-1">
                {point}
              </Text>
            </View>
          ))}
          <View className="mt-4 p-3 rounded-xl flex-row" style={{ backgroundColor: '#FEF3C715', borderWidth: 1, borderColor: '#FCD34D30' }}>
            <AlertCircle size={16} color="#F59E0B" style={{ marginTop: 2 }} />
            <Text style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.secondary }} className="text-xs flex-1 ml-2 leading-5">
              {fertilityInfo.contraceptionNote}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

export default function NutritionScreen() {
  const insets = useSafeAreaInsets();
  const getCurrentPhase = useCycleStore(s => s.getCurrentPhase);
  const addPhaseGroceries = useCycleStore(s => s.addPhaseGroceries);
  const addLifeStageGroceries = useCycleStore(s => s.addLifeStageGroceries);
  const lifeStage = useCycleStore(s => s.lifeStage);
  const themeMode = useThemeStore(s => s.mode);
  const theme = getTheme(themeMode);

  const [fontsLoaded] = useFonts({
    CormorantGaramond_400Regular,
    CormorantGaramond_600SemiBold,
    Quicksand_400Regular,
    Quicksand_500Medium,
    Quicksand_600SemiBold,
  });

  if (!fontsLoaded) return null;

  const currentPhase = getCurrentPhase();
  const info = phaseInfo[currentPhase];
  const stageInfo = lifeStageInfo[lifeStage];

  // Get accent color based on life stage
  const getAccentColor = () => {
    switch (lifeStage) {
      case 'perimenopause': return '#f59e0b';
      case 'menopause': return '#8b5cf6';
      default: return theme.accent.purple;
    }
  };
  const accentColor = getAccentColor();

  const handleAddToGrocery = () => {
    if (lifeStage === 'regular') {
      addPhaseGroceries(currentPhase);
    } else {
      addLifeStageGroceries(lifeStage);
    }
    router.push('/(tabs)/grocery');
  };

  // Render content based on life stage
  const renderLifeStageContent = () => {
    if (lifeStage === 'regular') {
      const nutrition = phaseNutrition[currentPhase];
      return (
        <>
          {/* Phase Card */}
          <Animated.View entering={FadeInUp.delay(200).duration(600)} className="mx-6 mt-6">
            <View className="rounded-2xl p-4 border" style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light }}>
              <View className="flex-row items-center mb-3">
                <View className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{ backgroundColor: `${info.color}20` }}>
                  <Text className="text-xl">{info.emoji}</Text>
                </View>
                <View className="flex-1">
                  <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }} className="text-base">
                    {info.name} Phase
                  </Text>
                  <View className="flex-row items-center">
                    <Text style={{ fontFamily: 'Quicksand_500Medium', color: theme.text.accent }} className="text-sm">
                      {nutrition.focus}
                    </Text>
                    <View className="ml-2 px-2 py-0.5 rounded-full" style={{ backgroundColor: `${theme.accent.purple}15` }}>
                      <Text style={{ fontFamily: 'Quicksand_500Medium', color: theme.accent.purple }} className="text-xs">
                        {nutrition.days}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
              <Text style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.secondary }} className="text-sm leading-5">
                {nutrition.description}
              </Text>
            </View>
          </Animated.View>

          {/* Fertility Info */}
          {nutrition.fertilityInfo && (
            <Animated.View entering={FadeInUp.delay(250).duration(600)} className="mx-6 mt-6">
              <FertilityInfoSection fertilityInfo={nutrition.fertilityInfo} theme={theme} />
            </Animated.View>
          )}

          {/* Nutrient Categories for phases with nutrient data */}
          {nutrition.nutrients && (
            <Animated.View entering={FadeInUp.delay(280).duration(600)} className="mx-6 mt-6">
              <NutrientCategoriesSection nutrients={nutrition.nutrients} phase={currentPhase} theme={theme} />
            </Animated.View>
          )}

          {/* Foods */}
          <Animated.View entering={FadeInUp.delay(300).duration(600)} className="mx-6 mt-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }} className="text-lg">
                {nutrition.nutrients ? 'All Recommended Foods' : 'Phase Nutrition'}
              </Text>
              <Pressable onPress={handleAddToGrocery} className="flex-row items-center px-3 py-2 rounded-full" style={{ backgroundColor: `${theme.accent.pink}15` }}>
                <ShoppingCart size={14} color={theme.accent.pink} />
                <Text style={{ fontFamily: 'Quicksand_500Medium', color: theme.accent.pink }} className="text-xs ml-2">
                  Add to List
                </Text>
              </Pressable>
            </View>

            <CollapsibleSection
              title="Foods"
              icon={<UtensilsCrossed size={18} color="#22C55E" />}
              items={nutrition.foods}
              theme={theme}
              iconBgColor="#22C55E15"
              defaultExpanded={!nutrition.nutrients}
            />

            {/* Herbs & Supplements for phases with data */}
            {nutrition.herbs && (
              <HerbsSection herbs={nutrition.herbs} herbNotes={nutrition.herbNotes} theme={theme} />
            )}

            {nutrition.supplements && (
              <SupplementsSection supplements={nutrition.supplements} theme={theme} />
            )}

            <SeedCyclingSection theme={theme} />
          </Animated.View>

          {/* Tips & Avoid */}
          <Animated.View entering={FadeInUp.delay(400).duration(600)} className="mx-6 mt-4">
            <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }} className="text-lg mb-4">
              Tips
            </Text>
            <View className="rounded-2xl p-4 border" style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light }}>
              {nutrition.tips.map((tip, index) => (
                <View key={tip} className={`flex-row items-start ${index > 0 ? 'mt-3' : ''}`}>
                  <View className="w-6 h-6 rounded-full items-center justify-center mr-3" style={{ backgroundColor: `${theme.accent.pink}15` }}>
                    <Leaf size={12} color={theme.accent.pink} />
                  </View>
                  <Text style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.secondary }} className="text-sm flex-1 leading-5">
                    {tip}
                  </Text>
                </View>
              ))}
            </View>
          </Animated.View>

          {/* Avoid */}
          <Animated.View entering={FadeInUp.delay(500).duration(600)} className="mx-6 mt-6">
            <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }} className="text-lg mb-4">
              Best to Avoid
            </Text>
            <View className="flex-row flex-wrap">
              {nutrition.avoid.map((item) => (
                <View key={item} className="rounded-full px-4 py-2 mr-2 mb-2 border" style={{ backgroundColor: `${theme.accent.blush}10`, borderColor: `${theme.accent.blush}30` }}>
                  <Text style={{ fontFamily: 'Quicksand_500Medium', color: theme.accent.blush }} className="text-xs">
                    {item}
                  </Text>
                </View>
              ))}
            </View>
          </Animated.View>
        </>
      );
    } else if (lifeStage === 'perimenopause') {
      const currentMoon = getMoonPhase();
      const moonInfo = moonPhaseInfo[currentMoon];
      const moonCyclePhase = getMoonPhaseCycleEquivalent(currentMoon);
      const moonCycleInfo = phaseInfo[moonCyclePhase];
      const moonPhaseNutrition = phaseNutrition[moonCyclePhase];

      return (
        <>
          {/* Moon Phase Guidance Card */}
          <Animated.View entering={FadeInUp.delay(200).duration(600)} className="mx-6 mt-6">
            <MoonPhaseCard compact showEducation={false} />
          </Animated.View>

          {/* Moon-Based Nutrition */}
          <Animated.View entering={FadeInUp.delay(250).duration(600)} className="mx-6 mt-4">
            <View
              className="rounded-2xl p-4 border"
              style={{ backgroundColor: `${moonInfo.color}10`, borderColor: `${moonInfo.color}30` }}
            >
              <View className="flex-row items-center mb-2">
                <Moon size={16} color={accentColor} />
                <Text
                  style={{ fontFamily: 'Quicksand_600SemiBold', color: accentColor }}
                  className="text-xs uppercase tracking-wider ml-2"
                >
                  Eating with the Moon
                </Text>
              </View>
              <Text
                style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.secondary }}
                className="text-sm leading-5"
              >
                During the {moonInfo.name.toLowerCase()}, align your nutrition with nature's rhythm.
                The foods below support your body's needs while addressing perimenopause wellness.
              </Text>
            </View>
          </Animated.View>

          {/* Moon Phase Nutrition (from cycle phases) */}
          <Animated.View entering={FadeInUp.delay(300).duration(600)} className="mx-6 mt-6">
            <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }} className="text-lg mb-2">
              {moonInfo.emoji} {moonInfo.name} Nutrition
            </Text>
            <Text style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.tertiary }} className="text-xs mb-4">
              Foods for lunar alignment
            </Text>

            <CollapsibleSection
              title="Foods for Lunar Alignment"
              icon={<UtensilsCrossed size={18} color={moonCycleInfo.color} />}
              items={moonPhaseNutrition.foods.slice(0, 10)}
              theme={theme}
              iconBgColor={`${moonCycleInfo.color}15`}
              defaultExpanded={false}
            />
          </Animated.View>

          {/* Perimenopause-Specific Foods */}
          <Animated.View entering={FadeInUp.delay(350).duration(600)} className="mx-6 mt-4">
            <View className="flex-row items-center justify-between mb-4">
              <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }} className="text-lg">
                Perimenopause Essentials
              </Text>
              <Pressable onPress={handleAddToGrocery} className="flex-row items-center px-3 py-2 rounded-full" style={{ backgroundColor: `${accentColor}15` }}>
                <ShoppingCart size={14} color={accentColor} />
                <Text style={{ fontFamily: 'Quicksand_500Medium', color: accentColor }} className="text-xs ml-2">
                  Add to List
                </Text>
              </Pressable>
            </View>

            <CollapsibleSection
              title="Hormone Support Foods"
              icon={<UtensilsCrossed size={18} color="#22C55E" />}
              items={perimenopauseNutrition.foods}
              theme={theme}
              iconBgColor="#22C55E15"
              defaultExpanded={false}
            />

            <FocusAreasSection focusAreas={perimenopauseNutrition.focusAreas} theme={theme} accentColor={accentColor} />

            {/* Herbs for Perimenopause */}
            <HerbsSection herbs={perimenopauseNutrition.herbs} herbNotes={perimenopauseNutrition.herbNotes} theme={theme} />

            {/* Supplements for Perimenopause */}
            <SupplementsSection supplements={perimenopauseNutrition.supplements} theme={theme} />
          </Animated.View>

          {/* Tips */}
          <Animated.View entering={FadeInUp.delay(400).duration(600)} className="mx-6 mt-4">
            <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }} className="text-lg mb-4">
              Tips for This Stage
            </Text>
            <View className="rounded-2xl p-4 border" style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light }}>
              {perimenopauseNutrition.tips.map((tip, index) => (
                <View key={tip} className={`flex-row items-start ${index > 0 ? 'mt-3' : ''}`}>
                  <View className="w-6 h-6 rounded-full items-center justify-center mr-3" style={{ backgroundColor: `${accentColor}15` }}>
                    <Leaf size={12} color={accentColor} />
                  </View>
                  <Text style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.secondary }} className="text-sm flex-1 leading-5">
                    {tip}
                  </Text>
                </View>
              ))}
            </View>
          </Animated.View>

          {/* Avoid */}
          <Animated.View entering={FadeInUp.delay(500).duration(600)} className="mx-6 mt-6">
            <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }} className="text-lg mb-4">
              Best to Avoid
            </Text>
            <View className="flex-row flex-wrap">
              {perimenopauseNutrition.avoid.map((item) => (
                <View key={item} className="rounded-full px-4 py-2 mr-2 mb-2 border" style={{ backgroundColor: `${accentColor}10`, borderColor: `${accentColor}30` }}>
                  <Text style={{ fontFamily: 'Quicksand_500Medium', color: accentColor }} className="text-xs">
                    {item}
                  </Text>
                </View>
              ))}
            </View>
          </Animated.View>
        </>
      );
    } else {
      // Menopause
      const currentMoon = getMoonPhase();
      const moonInfo = moonPhaseInfo[currentMoon];
      const moonCyclePhase = getMoonPhaseCycleEquivalent(currentMoon);
      const moonCycleInfo = phaseInfo[moonCyclePhase];
      const moonPhaseNutrition = phaseNutrition[moonCyclePhase];

      return (
        <>
          {/* Moon Phase Guidance Card */}
          <Animated.View entering={FadeInUp.delay(200).duration(600)} className="mx-6 mt-6">
            <MoonPhaseCard compact showEducation={false} />
          </Animated.View>

          {/* Moon-Based Nutrition Explanation */}
          <Animated.View entering={FadeInUp.delay(250).duration(600)} className="mx-6 mt-4">
            <LinearGradient
              colors={['rgba(139, 92, 246, 0.12)', 'rgba(196, 181, 253, 0.08)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(139, 92, 246, 0.25)' }}
            >
              <View className="flex-row items-center mb-2">
                <Sparkles size={16} color="#8b5cf6" />
                <Text
                  style={{ fontFamily: 'Quicksand_600SemiBold', color: '#8b5cf6' }}
                  className="text-xs uppercase tracking-wider ml-2"
                >
                  Lunar Nutrition Guide
                </Text>
              </View>
              <Text
                style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.secondary }}
                className="text-sm leading-5"
              >
                Without a menstrual cycle, the moon becomes your guide for nutrition rhythms. During the {moonInfo.name.toLowerCase()},
                nourish your body with foods that align with nature's cycles - this creates a beautiful connection with the lunar rhythm.
              </Text>
            </LinearGradient>
          </Animated.View>

          {/* Moon Phase Nutrition */}
          <Animated.View entering={FadeInUp.delay(300).duration(600)} className="mx-6 mt-6">
            <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }} className="text-lg mb-2">
              {moonInfo.emoji} {moonInfo.name} Nutrition
            </Text>
            <Text style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.tertiary }} className="text-xs mb-4">
              Foods for lunar alignment
            </Text>

            <CollapsibleSection
              title="Foods for Lunar Alignment"
              icon={<UtensilsCrossed size={18} color={moonCycleInfo.color} />}
              items={moonPhaseNutrition.foods.slice(0, 10)}
              theme={theme}
              iconBgColor={`${moonCycleInfo.color}15`}
              defaultExpanded={false}
            />
          </Animated.View>

          {/* Menopause-Specific Foods */}
          <Animated.View entering={FadeInUp.delay(350).duration(600)} className="mx-6 mt-4">
            <View className="flex-row items-center justify-between mb-4">
              <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }} className="text-lg">
                Menopause Essentials
              </Text>
              <Pressable onPress={handleAddToGrocery} className="flex-row items-center px-3 py-2 rounded-full" style={{ backgroundColor: `${accentColor}15` }}>
                <ShoppingCart size={14} color={accentColor} />
                <Text style={{ fontFamily: 'Quicksand_500Medium', color: accentColor }} className="text-xs ml-2">
                  Add to List
                </Text>
              </Pressable>
            </View>

            <CollapsibleSection
              title="Recommended Foods"
              icon={<UtensilsCrossed size={18} color="#22C55E" />}
              items={menopauseNutrition.foods}
              theme={theme}
              iconBgColor="#22C55E15"
              defaultExpanded={false}
            />

            <FocusAreasSection focusAreas={menopauseNutrition.focusAreas} theme={theme} accentColor={accentColor} />

            {/* Herbs for Menopause */}
            <HerbsSection herbs={menopauseNutrition.herbs} herbNotes={menopauseNutrition.herbNotes} theme={theme} />

            {/* Supplements for Menopause */}
            <SupplementsSection supplements={menopauseNutrition.supplements} theme={theme} />
          </Animated.View>

          {/* Tips */}
          <Animated.View entering={FadeInUp.delay(400).duration(600)} className="mx-6 mt-4">
            <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }} className="text-lg mb-4">
              Tips for Thriving
            </Text>
            <View className="rounded-2xl p-4 border" style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light }}>
              {menopauseNutrition.tips.map((tip, index) => (
                <View key={tip} className={`flex-row items-start ${index > 0 ? 'mt-3' : ''}`}>
                  <View className="w-6 h-6 rounded-full items-center justify-center mr-3" style={{ backgroundColor: `${accentColor}15` }}>
                    <Leaf size={12} color={accentColor} />
                  </View>
                  <Text style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.secondary }} className="text-sm flex-1 leading-5">
                    {tip}
                  </Text>
                </View>
              ))}
            </View>
          </Animated.View>

          {/* Avoid */}
          <Animated.View entering={FadeInUp.delay(500).duration(600)} className="mx-6 mt-6">
            <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }} className="text-lg mb-4">
              Best to Limit
            </Text>
            <View className="flex-row flex-wrap">
              {menopauseNutrition.avoid.map((item) => (
                <View key={item} className="rounded-full px-4 py-2 mr-2 mb-2 border" style={{ backgroundColor: `${accentColor}10`, borderColor: `${accentColor}30` }}>
                  <Text style={{ fontFamily: 'Quicksand_500Medium', color: accentColor }} className="text-xs">
                    {item}
                  </Text>
                </View>
              ))}
            </View>
          </Animated.View>
        </>
      );
    }
  };

  // Get title based on life stage
  const getTitle = () => {
    switch (lifeStage) {
      case 'perimenopause': return 'Eat with the Moon';
      case 'menopause': return 'Lunar Nourishment';
      default: return 'Eat for Your Cycle';
    }
  };

  return (
    <View className="flex-1">
      <LinearGradient colors={theme.gradient} locations={[0, 0.25, 0.5, 0.75, 1]} style={{ flex: 1 }}>
        <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <Animated.View entering={FadeInDown.delay(100).duration(600)} style={{ paddingTop: insets.top + 16 }} className="px-6">
            <Text style={{ fontFamily: 'CormorantGaramond_400Regular', color: theme.text.muted }} className="text-sm tracking-widest uppercase">
              Nutrition Guide
            </Text>
            <Text style={{ fontFamily: 'CormorantGaramond_600SemiBold', color: theme.text.primary }} className="text-3xl mt-1">
              {getTitle()}
            </Text>
          </Animated.View>

          {renderLifeStageContent()}

          {/* CTA - Add to Grocery List */}
          <Animated.View entering={FadeInUp.delay(600).duration(600)} className="mx-6 mt-8">
            <Pressable onPress={handleAddToGrocery} className="overflow-hidden rounded-2xl">
              <LinearGradient
                colors={lifeStage === 'perimenopause' ? ['#f59e0b', '#fbbf24'] : lifeStage === 'menopause' ? ['#8b5cf6', '#a78bfa'] : ['#f9a8d4', '#c4b5fd']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
              >
                <ShoppingCart size={20} color="#fff" />
                <Text style={{ fontFamily: 'Quicksand_600SemiBold' }} className="text-white text-base ml-3">
                  Add All to Grocery List
                </Text>
              </LinearGradient>
            </Pressable>
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { ShoppingCart, Leaf, Sparkles, ChevronDown, ChevronUp, UtensilsCrossed, Heart, AlertCircle, Sun, Pill, Flower2, Beaker, Info } from 'lucide-react-native';
import { useCycleStore, phaseInfo, CyclePhase, lifeStageInfo } from '@/lib/cycle-store';
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
      { name: 'Magnesium', amount: '100mg', note: 'For cramps and relaxation' },
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
      { name: 'Wheat Germ Oil', benefit: 'Vitamin E powerhouse' },
      { name: 'Whole Grains', benefit: 'Vitamin E and fiber' },
      { name: 'Greens', benefit: 'Vitamin E and minerals' },
      { name: 'Sweet Potatoes', benefit: 'Vitamin E and complex carbs' },
      { name: 'Seeds & Nuts', benefit: 'Vitamin E and healthy fats' },
      // Linoleic acid sources
      { name: 'Raw Safflower Oil', benefit: '3 tsp/day for linoleic acid' },
      { name: 'Fertile Egg Yolks', benefit: 'Linoleic acid and choline' },
      { name: 'Liver', benefit: 'Linoleic acid and B vitamins' },
      { name: 'Walnuts', benefit: 'Linoleic acid and omega-3s' },
      { name: 'Sunflower Seeds', benefit: 'Linoleic acid' },
      { name: 'Pumpkin Seeds', benefit: 'Linoleic acid and zinc' },
      // Protein sources
      { name: 'Meat & Fish', benefit: '50g protein/day minimum' },
      { name: 'Tofu', benefit: 'Plant protein' },
      { name: 'Eggs', benefit: 'Complete protein' },
      { name: 'Legumes', benefit: 'Protein and fiber' },
      { name: 'Tahini', benefit: 'Protein and calcium' },
      { name: 'Greek Yogurt', benefit: 'Best days for dairy' },
      // Lecithin
      { name: 'Lecithin', benefit: '1 TBS = 12g linoleic acid, 250mg choline' },
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
          { name: 'Wheat Germ Oil', benefit: 'Richest vitamin E source' },
          { name: 'Whole Grains', benefit: 'Natural vitamin E' },
          { name: 'Greens', benefit: 'Vitamin E with minerals' },
          { name: 'Sweet Potatoes', benefit: 'Vitamin E and beta-carotene' },
          { name: 'Seeds & Nuts', benefit: 'Vitamin E and healthy fats' },
        ],
      },
      {
        nutrient: 'Linoleic Acid',
        dailyAmount: '3 tsp oils/day',
        purpose: 'Essential fatty acid for hormone production',
        foods: [
          { name: 'Raw Unrefined Oils', benefit: 'Safflower oil is ideal' },
          { name: 'Fertile Egg Yolks', benefit: 'Rich in linoleic acid' },
          { name: 'Liver', benefit: 'Concentrated source' },
          { name: 'Mayo (homemade)', benefit: 'From quality oils' },
          { name: 'Walnuts', benefit: 'Plant-based source' },
          { name: 'Sunflower & Pumpkin Seeds', benefit: 'Seeds are excellent' },
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
      { name: 'Lecithin', amount: '1 TBS/day', note: '= 12g linoleic acid, 250mg choline, 250mg inositol' },
      { name: 'Calcium', amount: 'Extra', note: 'Take extra calcium in the first week' },
      { name: 'Vitamin E', amount: '200-800 IU/day' },
      { name: 'Iodine', amount: '4mg/day', note: 'If not getting from food' },
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
      { name: 'Comfrey Leaves', benefit: 'Vitamin E source' },
      { name: 'Fenugreek Seeds', benefit: 'Lecithin source' },
    ],
    herbNotes: [
      'Take Dong Quai for 8 days during this phase (high in iron, B12, vitamin E)',
      'Black Cohosh helps balance and regulate estrogen levels',
      'In the first week, take extra calcium',
      'This is the "flex point" that regulates fertility',
      'Best days to eat dairy products',
    ],
    avoid: ['Heavy, greasy foods', 'Excessive sugar', 'Processed foods'],
    tips: [
      'This is the celebration phase - energy is rising!',
      'Best days to eat dairy products',
      'Focus on complimentary protein combinations (grains + legumes)',
      'Take extra calcium in the first week of this phase',
      'Raw unrefined oils are essential - try 3 tsp safflower oil daily',
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
      { name: 'Magnesium', amount: 'Evening', note: 'Take in the evening (P.M.)' },
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
    description: 'Progesterone rises as estrogen drops. This is the time for calcium, magnesium, and potassium. Eat light, honor cravings wisely. Be gentle with yourself, daughter of the moon goddess.',
    days: 'Days 16-28',
    foods: [
      // Calcium sources
      { name: 'Tofu', benefit: 'Excellent calcium source' },
      { name: 'Dark Greens', benefit: 'Calcium and minerals' },
      { name: 'Carob', benefit: 'Calcium-rich chocolate alternative' },
      { name: 'Seaweed (Hijiki)', benefit: 'High calcium sea vegetable' },
      { name: 'Seeds', benefit: 'Sesame for calcium' },
      { name: 'Soybeans', benefit: 'Plant calcium' },
      { name: 'Tahini', benefit: 'Calcium from sesame' },
      { name: 'Spirulina', benefit: 'Calcium superfood' },
      { name: 'Yogurt & Cheese', benefit: 'Dairy calcium' },
      { name: 'Brewers Yeast', benefit: 'Calcium and B vitamins' },
      // Magnesium sources
      { name: 'Figs', benefit: 'Magnesium and fiber' },
      { name: 'Apricots', benefit: 'Magnesium and potassium' },
      { name: 'Kelp', benefit: 'Magnesium from the sea' },
      { name: 'Blackstrap Molasses', benefit: 'Concentrated magnesium' },
      { name: 'Dates', benefit: 'Natural magnesium' },
      // Phosphorus sources (2:1 ratio with calcium)
      { name: 'Animal Protein', benefit: 'Phosphorus - 50g/day protein' },
      { name: 'Lecithin', benefit: 'Phosphorus and brain support' },
      { name: 'Nuts & Seeds', benefit: 'Phosphorus and healthy fats' },
      { name: 'Wheat Germ', benefit: 'Phosphorus and vitamin E' },
      // Potassium sources (interdependent with B6)
      { name: 'Greens', benefit: 'Potassium powerhouse' },
      { name: 'Bananas', benefit: 'Potassium classic' },
      { name: 'Avocados', benefit: 'Potassium and healthy fats' },
      { name: 'Potatoes', benefit: 'Potassium-rich comfort food' },
      { name: 'Fresh Carrot Juice', benefit: 'Potassium and vitamins' },
      { name: 'Sunflower Seeds', benefit: 'Potassium - seed cycling' },
      { name: 'Sesame Seeds', benefit: 'Seed cycling continues' },
    ],
    nutrients: [
      {
        nutrient: 'Calcium',
        dailyAmount: '150-1500mg/day',
        purpose: 'Bone health, muscle function, PMS relief',
        foods: [
          { name: 'Tofu', benefit: 'Plant-based calcium champion' },
          { name: 'Dark Greens & Grains', benefit: 'Whole food calcium' },
          { name: 'Seaweed (Hijiki)', benefit: 'Sea vegetable calcium' },
          { name: 'Seeds & Soybeans', benefit: 'Plant calcium sources' },
          { name: 'Tahini & Spirulina', benefit: 'Concentrated calcium' },
          { name: 'Yogurt & Cheese', benefit: 'Dairy calcium' },
          { name: 'Brewers Yeast', benefit: 'Calcium with B vitamins' },
        ],
      },
      {
        nutrient: 'Magnesium',
        dailyAmount: '600mg-1g',
        purpose: 'Cramp relief, mood stabilization, sleep',
        foods: [
          { name: 'Carob', benefit: 'Chocolate alternative with magnesium' },
          { name: 'Tofu', benefit: 'Plant-based magnesium' },
          { name: 'Figs & Apricots', benefit: 'Fruit magnesium' },
          { name: 'Kelp', benefit: 'Sea vegetable magnesium' },
          { name: 'Blackstrap Molasses', benefit: 'Concentrated source' },
          { name: 'Dates', benefit: 'Sweet magnesium' },
        ],
      },
      {
        nutrient: 'Phosphorus',
        dailyAmount: '2:1 ratio (50g protein/day)',
        purpose: 'Works with calcium for bones and energy',
        foods: [
          { name: 'Animal Products', benefit: 'Complete phosphorus' },
          { name: 'Lecithin', benefit: 'Brain and nerve support' },
          { name: 'Yeast', benefit: 'B vitamins with phosphorus' },
          { name: 'Nuts & Seeds', benefit: 'Plant phosphorus' },
          { name: 'Wheat Germ', benefit: 'Nutrient-dense phosphorus' },
        ],
      },
      {
        nutrient: 'Potassium',
        dailyAmount: 'As needed',
        purpose: 'Interdependent with B6 - need increases this phase',
        foods: [
          { name: 'Greens', benefit: 'Potassium with minerals' },
          { name: 'Spirulina', benefit: 'Superfood potassium' },
          { name: 'Bananas & Avocados', benefit: 'Classic potassium sources' },
          { name: 'Potatoes', benefit: 'Comfort food potassium' },
          { name: 'Fresh Carrot Juice', benefit: 'Liquid potassium' },
          { name: 'Sunflower Seeds', benefit: 'Seed cycling potassium' },
        ],
      },
    ],
    supplements: [
      { name: 'Calcium', amount: '150-1500mg/day', note: 'Extra needed as estrogen drops' },
      { name: 'Magnesium', amount: '600mg-1g', note: 'For cramps, mood, and sleep' },
      { name: 'Vitamin B6', amount: '50mg', note: 'Can do B6 injection if severe PMS' },
      { name: 'Zinc', amount: '15mg/day', note: 'Helps absorb B6' },
    ],
    herbs: [
      { name: 'Alfalfa', benefit: 'Calcium source' },
      { name: 'Borage', benefit: 'Calcium and GLA for PMS' },
      { name: 'Chamomile', benefit: 'Calcium and calming' },
      { name: 'Comfrey', benefit: 'Calcium herb' },
      { name: 'Raspberry Leaves', benefit: 'Magnesium - steep in milk' },
      { name: 'Dandelion Root', benefit: 'Potassium and liver support' },
      { name: 'Fennel Seeds', benefit: 'Potassium and digestion' },
      { name: 'Licorice Root', benefit: 'Potassium and adrenal support' },
      { name: 'Mint', benefit: 'Potassium and soothing' },
      { name: 'Nettle Tea', benefit: 'Minerals and water balance' },
    ],
    herbNotes: [
      'First time in cycle to consider light fasting - eat light, veg broths, juices',
      'Wild yam cream massage can help with PMS symptoms',
      'Regular aerobic exercise helps balance hormones',
      'Drink nettle or dandelion tea for water retention',
      'Massage ankles to help with water retention',
      'Cut down on salt to reduce bloating',
      'No caffeine during this phase',
      'Fats make calcium more available - don\'t avoid healthy fats',
    ],
    avoid: ['Excessive salt (causes water retention)', 'Caffeine', 'Refined sugar', 'Alcohol'],
    tips: [
      'This is a good time for light eating - broths, juices, light meals',
      'Estrogen drops twice - extra calcium helps both times',
      'Potassium needs increase because B6 needs increase',
      'Massage wild yam cream into body for PMS relief',
      'Regular aerobic exercise helps balance this phase',
      'Be gentle with yourself - you are a lunar primate!',
      'Herbs, minerals, and B vitamins support you throughout your cycle',
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
  const [expanded, setExpanded] = useState(true);

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
  const [expandedNutrient, setExpandedNutrient] = useState<string | null>(nutrients[0]?.nutrient || null);

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
    addPhaseGroceries(currentPhase);
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
            <View className="rounded-3xl p-5 border" style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light }}>
              <View className="flex-row items-center mb-3">
                <View className="w-12 h-12 rounded-full items-center justify-center mr-3" style={{ backgroundColor: `${info.color}20` }}>
                  <Text className="text-2xl">{info.emoji}</Text>
                </View>
                <View className="flex-1">
                  <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }} className="text-lg">
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
      return (
        <>
          {/* Stage Card */}
          <Animated.View entering={FadeInUp.delay(200).duration(600)} className="mx-6 mt-6">
            <LinearGradient
              colors={['rgba(251, 191, 36, 0.15)', 'rgba(245, 158, 11, 0.1)']}
              style={{ borderRadius: 24, padding: 20, borderWidth: 1, borderColor: 'rgba(245, 158, 11, 0.3)' }}
            >
              <View className="flex-row items-center mb-3">
                <View className="w-12 h-12 rounded-full items-center justify-center mr-3" style={{ backgroundColor: 'rgba(245, 158, 11, 0.2)' }}>
                  <Text className="text-2xl">{stageInfo.emoji}</Text>
                </View>
                <View className="flex-1">
                  <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }} className="text-lg">
                    {perimenopauseNutrition.focus}
                  </Text>
                  <Text style={{ fontFamily: 'Quicksand_400Regular', color: '#92400e' }} className="text-xs">
                    Nutrition for your transition
                  </Text>
                </View>
              </View>
              <Text style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.secondary }} className="text-sm leading-5">
                {perimenopauseNutrition.description}
              </Text>
            </LinearGradient>
          </Animated.View>

          {/* Foods & Focus Areas */}
          <Animated.View entering={FadeInUp.delay(300).duration(600)} className="mx-6 mt-6">
            <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }} className="text-lg mb-4">
              Perimenopause Nutrition
            </Text>

            <CollapsibleSection
              title="Recommended Foods"
              icon={<UtensilsCrossed size={18} color="#22C55E" />}
              items={perimenopauseNutrition.foods}
              theme={theme}
              iconBgColor="#22C55E15"
              defaultExpanded={true}
            />

            <FocusAreasSection focusAreas={perimenopauseNutrition.focusAreas} theme={theme} accentColor={accentColor} />
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
      return (
        <>
          {/* Stage Card */}
          <Animated.View entering={FadeInUp.delay(200).duration(600)} className="mx-6 mt-6">
            <LinearGradient
              colors={['rgba(139, 92, 246, 0.15)', 'rgba(167, 139, 250, 0.1)']}
              style={{ borderRadius: 24, padding: 20, borderWidth: 1, borderColor: 'rgba(139, 92, 246, 0.3)' }}
            >
              <View className="flex-row items-center mb-3">
                <View className="w-12 h-12 rounded-full items-center justify-center mr-3" style={{ backgroundColor: 'rgba(139, 92, 246, 0.2)' }}>
                  <Sun size={24} color="#8b5cf6" />
                </View>
                <View className="flex-1">
                  <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }} className="text-lg">
                    {menopauseNutrition.focus}
                  </Text>
                  <Text style={{ fontFamily: 'Quicksand_400Regular', color: '#5b21b6' }} className="text-xs">
                    Nutrition for your new chapter
                  </Text>
                </View>
              </View>
              <Text style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.secondary }} className="text-sm leading-5">
                {menopauseNutrition.description}
              </Text>
            </LinearGradient>
          </Animated.View>

          {/* Foods & Focus Areas */}
          <Animated.View entering={FadeInUp.delay(300).duration(600)} className="mx-6 mt-6">
            <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }} className="text-lg mb-4">
              Menopause Nutrition
            </Text>

            <CollapsibleSection
              title="Recommended Foods"
              icon={<UtensilsCrossed size={18} color="#22C55E" />}
              items={menopauseNutrition.foods}
              theme={theme}
              iconBgColor="#22C55E15"
              defaultExpanded={true}
            />

            <FocusAreasSection focusAreas={menopauseNutrition.focusAreas} theme={theme} accentColor={accentColor} />
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
      case 'perimenopause': return 'Eat for Your Transition';
      case 'menopause': return 'Nourish Your Body';
      default: return 'Eat for Your Cycle';
    }
  };

  return (
    <View className="flex-1">
      <LinearGradient colors={theme.gradient} locations={[0, 0.25, 0.5, 0.75, 1]} style={{ flex: 1 }}>
        <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
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

          {/* CTA - Only for regular cycle */}
          {lifeStage === 'regular' && (
            <Animated.View entering={FadeInUp.delay(600).duration(600)} className="mx-6 mt-8">
              <Pressable onPress={handleAddToGrocery} className="overflow-hidden rounded-2xl">
                <LinearGradient
                  colors={['#f9a8d4', '#c4b5fd']}
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
          )}
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

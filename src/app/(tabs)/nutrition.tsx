import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { ShoppingCart, Leaf, Sparkles, Pill, ChevronDown, ChevronUp, UtensilsCrossed, Heart, AlertCircle } from 'lucide-react-native';
import { useCycleStore, phaseInfo, CyclePhase } from '@/lib/cycle-store';
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

interface PhaseNutritionData {
  focus: string;
  description: string;
  days: string;
  foods: NutritionItem[];
  herbs: NutritionItem[];
  supplements: NutritionItem[];
  avoid: string[];
  tips: string[];
  fertilityInfo?: {
    title: string;
    description: string;
    keyPoints: string[];
    contraceptionNote: string;
  };
}

const phaseNutrition: Record<CyclePhase, PhaseNutritionData> = {
  menstrual: {
    focus: 'Replenish & Nourish',
    description: 'Focus on iron-rich foods to replenish blood loss. Warm, comforting foods support your body during this restorative time.',
    days: 'Days 1-5',
    foods: [
      { name: 'Red Meat', benefit: 'Grass-fed beef, organ meats (liver, heart)' },
      { name: 'Leafy Greens', benefit: 'Organic spinach, kale, Swiss chard' },
      { name: 'Lentils', benefit: 'Brown, green, or red lentils' },
      { name: 'Ginger', benefit: 'Fresh ginger root for tea' },
      { name: 'Dark Chocolate', benefit: '85% cacao or higher' },
      { name: 'Blueberries', benefit: 'Fresh or frozen' },
      { name: 'Bone Broth', benefit: 'Homemade or high-quality store-bought' },
      { name: 'Turmeric', benefit: 'Fresh root or powder' },
      { name: 'Pumpkin Seeds', benefit: 'Raw or roasted' },
      { name: 'Warming Foods', benefit: 'Soups, stews, cooked meals' },
      { name: 'Anti-Inflammatory Foods', benefit: 'Salmon, sardines, walnuts' },
      { name: 'Seaweed', benefit: 'Nori, kelp, dulse' },
      { name: 'Sesame Seeds', benefit: 'For seed cycling' },
      { name: 'Molasses', benefit: 'Blackstrap molasses for iron' },
      { name: 'Raisins', benefit: 'Iron-rich dried fruit' },
    ],
    herbs: [
      { name: 'Raspberry Leaf', benefit: 'Uterine tonic' },
      { name: 'Mugwort', benefit: 'Menstrual support' },
      { name: 'Nettles', benefit: 'Iron and minerals' },
      { name: 'Yellow Dock', benefit: 'Iron absorption' },
      { name: 'Chamomile', benefit: 'Calming, anti-inflammatory' },
      { name: 'Ginger', benefit: 'Pain relief, warming' },
      { name: 'Turmeric', benefit: 'Anti-inflammatory' },
      { name: 'Cramp Bark', benefit: 'Muscle relaxation' },
      { name: 'Rose', benefit: 'Self-love, comfort' },
    ],
    supplements: [
      { name: 'Iron', benefit: '18-27mg (with Vitamin C for absorption)' },
      { name: 'Magnesium Glycinate', benefit: '400mg (reduces cramps)' },
      { name: 'Vitamin D3', benefit: '2000 IU (mood support)' },
      { name: 'Omega-3 Fish Oil', benefit: '1000mg EPA/DHA (anti-inflammatory)' },
      { name: 'Vitamin C', benefit: 'Liposomal form (enhances iron absorption)' },
      { name: 'Vitamin K', benefit: 'Supports blood clotting' },
      { name: 'B-Complex', benefit: 'Energy support' },
    ],
    avoid: ['Excessive caffeine', 'Alcohol', 'Processed foods', 'Too much salt'],
    tips: ['Stay hydrated with warm beverages', 'Eat smaller, more frequent meals', 'Include warming spices like turmeric'],
  },
  follicular: {
    focus: 'Energize & Create',
    description: 'Estrogen is rising! Light, fresh foods support your increasing energy. Great time for trying new recipes and vibrant produce.',
    days: 'Days 6-13',
    foods: [
      { name: 'Eggs', benefit: 'Pasture-raised, organic' },
      { name: 'Wild Salmon', benefit: 'Fresh or canned' },
      { name: 'Organic Chicken', benefit: 'Breast or thighs' },
      { name: 'Broccoli', benefit: 'Fresh, steamed or roasted' },
      { name: 'Kale', benefit: 'Raw or cooked' },
      { name: 'Quinoa', benefit: 'Complete protein grain' },
      { name: 'Steel-Cut Oats', benefit: 'Complex carbs' },
      { name: 'Avocados', benefit: 'Healthy fats' },
      { name: 'Raw Almonds', benefit: 'Vitamin E' },
      { name: 'Kimchi or Sauerkraut', benefit: 'Fermented foods' },
      { name: 'Brussels Sprouts', benefit: 'Cruciferous vegetable' },
      { name: 'Cauliflower', benefit: 'Estrogen metabolism' },
      { name: 'Brown Rice', benefit: 'Fiber and B-vitamins' },
      { name: 'Tofu', benefit: 'Small amounts, organic' },
      { name: 'Pumpkin Seeds', benefit: 'For seed cycling (continue)' },
      { name: 'Flax Seeds', benefit: 'Ground, for seed cycling' },
      { name: 'Tahini', benefit: 'Sesame seed paste' },
      { name: 'Greek Yogurt', benefit: 'Probiotics' },
    ],
    herbs: [
      { name: 'Nettles', benefit: 'Nutrient-dense' },
      { name: 'Parsley', benefit: 'Fresh, high in vitamins' },
      { name: 'Mustard Greens', benefit: 'Cruciferous support' },
      { name: 'Sarsaparilla', benefit: 'Hormonal balance' },
      { name: 'Irish Moss', benefit: 'Iodine source' },
      { name: 'Alfalfa', benefit: 'Vitamin E' },
      { name: 'Dandelion', benefit: 'Liver support' },
      { name: 'Comfrey', benefit: 'Tissue building' },
      { name: 'Maca', benefit: 'Energy and hormone balance' },
      { name: 'Ashwagandha', benefit: 'Adaptogen for energy' },
      { name: 'Holy Basil', benefit: 'Stress support' },
    ],
    supplements: [
      { name: 'B-Complex Vitamins', benefit: '50-100mg (energy & hormone support)' },
      { name: 'Vitamin E', benefit: '400 IU (follicle health)' },
      { name: 'Probiotics', benefit: '10-50 billion CFU (gut health)' },
      { name: 'Zinc', benefit: '15-30mg (hormone production)' },
      { name: 'CoQ10', benefit: '100-200mg (cellular energy)' },
      { name: 'Adaptogenic Herbs', benefit: 'Maca, Ashwagandha capsules' },
      { name: 'Vitamin D', benefit: 'Continue 2000 IU' },
    ],
    avoid: ['Heavy, greasy foods', 'Excessive sugar'],
    tips: ['Try raw salads and fresh vegetables', 'Experiment with new healthy recipes', 'Sprouts and microgreens are excellent'],
  },
  ovulatory: {
    focus: 'Light & Vibrant',
    description: 'Peak energy time! Support your body with fiber-rich foods that help metabolize the estrogen surge. Light proteins keep you energized.',
    days: 'Days 14-16',
    foods: [
      { name: 'Mixed Berries', benefit: 'Blueberries, strawberries, raspberries' },
      { name: 'Oysters', benefit: 'Fresh or canned (zinc-rich)' },
      { name: 'Wild-Caught Fish', benefit: 'Salmon, mackerel, sardines' },
      { name: 'Walnuts', benefit: 'Omega-3s and vitamin E' },
      { name: 'Bell Peppers', benefit: 'All colors (antioxidants)' },
      { name: 'Carrots', benefit: 'Beta-carotene' },
      { name: 'Whole Grain Bread', benefit: 'Fiber-rich' },
      { name: 'Chia Seeds', benefit: 'Omega-3s and fiber' },
      { name: 'Dark Leafy Greens', benefit: 'Spinach, arugula, kale' },
      { name: 'Colorful Vegetables', benefit: 'Rainbow variety' },
      { name: 'Pumpkin Seeds', benefit: 'Zinc' },
      { name: 'Hemp Seeds', benefit: 'Complete protein' },
      { name: 'Sunflower Seeds', benefit: 'For seed cycling (switch to these)' },
      { name: 'Sesame Seeds', benefit: 'For seed cycling (continue)' },
      { name: 'Legumes', benefit: 'Lentils, chickpeas, black beans' },
      { name: 'Whole Grains', benefit: 'Barley, farro, bulgur' },
    ],
    herbs: [
      { name: 'Paprika', benefit: 'Zinc source' },
      { name: 'Garlic', benefit: 'Immune support' },
      { name: 'Cayenne', benefit: 'Circulation' },
      { name: 'Comfrey', benefit: 'Tissue support' },
      { name: 'Fenugreek', benefit: 'Niacin source' },
      { name: 'Alfalfa', benefit: 'Manganese source' },
      { name: 'Chaste Tree Berry (Vitex)', benefit: 'Progesterone support' },
      { name: 'Ginkgo Biloba', benefit: 'Circulation' },
      { name: 'Green Tea', benefit: 'Antioxidants' },
    ],
    supplements: [
      { name: 'Zinc', benefit: '30mg (CRITICAL for ovulation)' },
      { name: 'Vitamin E', benefit: '400 IU (protects egg)' },
      { name: 'B6', benefit: '50-100mg (supports progesterone production)' },
      { name: 'Omega-3 EPA/DHA', benefit: '1000mg (hormone production)' },
      { name: 'CoQ10', benefit: '200-300mg (egg quality)' },
      { name: 'Vitamin C', benefit: 'Antioxidant support' },
      { name: 'Evening Primrose Oil', benefit: '1000mg (cervical mucus quality)' },
    ],
    avoid: ['Heavy carbs', 'Fried foods', 'Excess dairy'],
    tips: ['Focus on raw and lightly cooked foods', 'Great time for smoothies and juices', 'Stay well hydrated'],
    fertilityInfo: {
      title: 'Fertility Awareness',
      description: 'Ovulation is your most fertile time. An egg is released and can be fertilized for 12-24 hours. Understanding this window is essential whether you\'re trying to conceive or avoid pregnancy.',
      keyPoints: [
        'Peak fertility occurs 1-2 days before and on ovulation day',
        'Sperm can survive up to 5 days in fertile cervical mucus',
        'Your fertile window is approximately 6 days long',
        'Cervical mucus becomes clear, stretchy, and egg-white-like',
        'Basal body temperature rises slightly after ovulation',
      ],
      contraceptionNote: 'To avoid pregnancy, use contraception consistently during your fertile window (5 days before ovulation through ovulation day). Fertility awareness methods require daily tracking and are most effective when combined with barrier methods during fertile days.',
    },
  },
  luteal: {
    focus: 'Stabilize & Comfort',
    description: 'Progesterone rises, cravings may appear. Complex carbs and magnesium-rich foods help stabilize mood and energy.',
    days: 'Days 17-28',
    foods: [
      { name: 'Sweet Potatoes', benefit: 'Complex carbs, B6' },
      { name: 'Bananas', benefit: 'Potassium, B6, mood support' },
      { name: 'Greek Yogurt', benefit: 'Calcium, probiotics' },
      { name: 'Raw Almonds', benefit: 'Magnesium' },
      { name: 'Baby Spinach', benefit: 'Magnesium, calcium' },
      { name: 'Brown Rice', benefit: 'Complex carbs, fiber' },
      { name: 'Dark Chocolate', benefit: '70%+ (magnesium)' },
      { name: 'Chickpeas', benefit: 'Protein, fiber' },
      { name: 'Pumpkin Seeds', benefit: 'Magnesium' },
      { name: 'Cheese', benefit: 'Calcium-rich' },
      { name: 'Sardines', benefit: 'Calcium and omega-3s' },
      { name: 'Milk', benefit: 'Dairy or fortified alternatives' },
      { name: 'Brussels Sprouts', benefit: 'Fiber' },
      { name: 'Beets', benefit: 'Blood sugar support' },
      { name: 'White Beans', benefit: 'Potassium' },
      { name: 'Cantaloupe', benefit: 'Potassium' },
      { name: 'Sunflower Seeds', benefit: 'Continue seed cycling' },
      { name: 'Sesame Seeds', benefit: 'Continue seed cycling' },
      { name: 'Bok Choy', benefit: 'Calcium and potassium' },
      { name: 'Swiss Chard', benefit: 'Magnesium' },
      { name: 'Avocado', benefit: 'Healthy fats' },
    ],
    herbs: [
      { name: 'Raspberry Leaf Tea', benefit: 'Uterine support' },
      { name: 'Rooibos Tea', benefit: 'Magnesium' },
      { name: 'Lavender', benefit: 'Calming' },
      { name: 'Vanilla', benefit: 'Comfort' },
      { name: 'Cinnamon', benefit: 'Blood sugar stability' },
      { name: 'Vitex/Chasteberry', benefit: 'Progesterone support, PMS relief' },
      { name: 'Dong Quai', benefit: 'Hormone balance' },
      { name: 'Evening Primrose', benefit: 'PMS symptoms' },
      { name: 'Dandelion Root', benefit: 'Liver detox' },
      { name: 'St. John\'s Wort', benefit: 'Mood support (check medication interactions)' },
      { name: 'Saffron', benefit: 'Mood support' },
      { name: 'Fenugreek', benefit: 'Satiety' },
    ],
    supplements: [
      { name: 'Magnesium', benefit: '400-500mg (CRITICAL for PMS, cramps, anxiety, sleep)' },
      { name: 'B6', benefit: '50-100mg (neurotransmitter support, mood)' },
      { name: 'Calcium', benefit: '1000mg (with Vitamin D3 2000 IU)' },
      { name: 'Evening Primrose Oil', benefit: '1000-1500mg (breast tenderness, PMS)' },
      { name: 'Chasteberry/Vitex', benefit: 'Standardized extract (reduces PMS)' },
      { name: 'L-Theanine', benefit: '200mg (calming, reduces irritability)' },
      { name: 'Inositol', benefit: 'Supports insulin sensitivity' },
      { name: 'Chromium', benefit: 'Blood sugar stability (with Cinnamon)' },
    ],
    avoid: ['Excessive salt', 'Refined sugar', 'Caffeine', 'Alcohol'],
    tips: ['Honor cravings with healthy alternatives', 'Eat regularly to stabilize blood sugar', 'Warm, cooked foods are comforting'],
  },
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
          <View
            className="h-px mb-3"
            style={{ backgroundColor: theme.border.light }}
          />
          {items.map((item, index) => (
            <View
              key={item.name}
              className={`flex-row items-start ${index > 0 ? 'mt-3' : ''}`}
            >
              <View
                className="w-2 h-2 rounded-full mt-1.5 mr-3"
                style={{ backgroundColor: theme.accent.pink }}
              />
              <View className="flex-1">
                <Text
                  style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
                  className="text-sm"
                >
                  {item.name}
                </Text>
                <Text
                  style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.tertiary }}
                  className="text-xs mt-0.5"
                >
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

interface SeedCyclingSectionProps {
  theme: ReturnType<typeof getTheme>;
  defaultExpanded?: boolean;
}

interface FertilityInfoSectionProps {
  fertilityInfo: NonNullable<PhaseNutritionData['fertilityInfo']>;
  theme: ReturnType<typeof getTheme>;
}

function FertilityInfoSection({ fertilityInfo, theme }: FertilityInfoSectionProps) {
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
          <View
            className="w-10 h-10 rounded-full items-center justify-center mr-3"
            style={{ backgroundColor: '#F472B615' }}
          >
            <Heart size={18} color="#F472B6" />
          </View>
          <View className="flex-1">
            <Text
              style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
              className="text-base"
            >
              {fertilityInfo.title}
            </Text>
            <Text
              style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.tertiary }}
              className="text-xs"
            >
              Important fertility window info
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
          <View
            className="h-px mb-3"
            style={{ backgroundColor: theme.border.light }}
          />

          {/* Description */}
          <Text
            style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.secondary }}
            className="text-sm leading-5 mb-4"
          >
            {fertilityInfo.description}
          </Text>

          {/* Key Points */}
          <Text
            style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
            className="text-sm mb-3"
          >
            Key Facts
          </Text>
          {fertilityInfo.keyPoints.map((point, index) => (
            <View
              key={index}
              className={`flex-row items-start ${index > 0 ? 'mt-2' : ''}`}
            >
              <View
                className="w-2 h-2 rounded-full mt-1.5 mr-3"
                style={{ backgroundColor: '#F472B6' }}
              />
              <Text
                style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.secondary }}
                className="text-sm flex-1 leading-5"
              >
                {point}
              </Text>
            </View>
          ))}

          {/* Contraception Note */}
          <View
            className="mt-4 p-3 rounded-xl flex-row"
            style={{ backgroundColor: '#FEF3C715', borderWidth: 1, borderColor: '#FCD34D30' }}
          >
            <AlertCircle size={16} color="#F59E0B" style={{ marginTop: 2 }} />
            <Text
              style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.secondary }}
              className="text-xs flex-1 ml-2 leading-5"
            >
              {fertilityInfo.contraceptionNote}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

function SeedCyclingSection({ theme, defaultExpanded = false }: SeedCyclingSectionProps) {
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
            style={{ backgroundColor: `${theme.accent.purple}15` }}
          >
            <Sparkles size={18} color={theme.accent.purple} />
          </View>
          <View className="flex-1">
            <Text
              style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
              className="text-base"
            >
              Seed Cycling Protocol
            </Text>
            <Text
              style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.tertiary }}
              className="text-xs"
            >
              4 seeds across cycle phases
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
          <View
            className="h-px mb-3"
            style={{ backgroundColor: theme.border.light }}
          />

          {/* Week 1-2: Follicular Phase */}
          <View className="mb-4">
            <View className="flex-row items-center mb-3">
              <View
                className="px-3 py-1 rounded-full mr-2"
                style={{ backgroundColor: `${theme.accent.pink}15` }}
              >
                <Text
                  style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.accent.pink }}
                  className="text-xs"
                >
                  Week 1-2
                </Text>
              </View>
              <Text
                style={{ fontFamily: 'Quicksand_500Medium', color: theme.text.secondary }}
                className="text-xs"
              >
                Follicular Phase
              </Text>
            </View>

            <View className="flex-row mb-2">
              <View className="flex-1 flex-row items-center">
                <View
                  className="w-10 h-10 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: '#F9731615' }}
                >
                  <Text className="text-lg">🎃</Text>
                </View>
                <View className="flex-1">
                  <Text
                    style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
                    className="text-sm"
                  >
                    Pumpkin Seeds
                  </Text>
                  <Text
                    style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.tertiary }}
                    className="text-xs"
                  >
                    1-2 tbsp ground daily
                  </Text>
                </View>
              </View>
            </View>

            <View className="flex-row">
              <View className="flex-1 flex-row items-center">
                <View
                  className="w-10 h-10 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: '#A1620715' }}
                >
                  <Text className="text-lg">🌾</Text>
                </View>
                <View className="flex-1">
                  <Text
                    style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
                    className="text-sm"
                  >
                    Flax Seeds
                  </Text>
                  <Text
                    style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.tertiary }}
                    className="text-xs"
                  >
                    1-2 tbsp ground daily
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Divider */}
          <View
            className="h-px mb-4"
            style={{ backgroundColor: theme.border.light }}
          />

          {/* Week 3-4: Ovulation & Luteal Phase */}
          <View>
            <View className="flex-row items-center mb-3">
              <View
                className="px-3 py-1 rounded-full mr-2"
                style={{ backgroundColor: `${theme.accent.purple}15` }}
              >
                <Text
                  style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.accent.purple }}
                  className="text-xs"
                >
                  Week 3-4
                </Text>
              </View>
              <Text
                style={{ fontFamily: 'Quicksand_500Medium', color: theme.text.secondary }}
                className="text-xs"
              >
                Ovulation & Luteal Phase
              </Text>
            </View>

            <View className="flex-row mb-2">
              <View className="flex-1 flex-row items-center">
                <View
                  className="w-10 h-10 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: '#EAB30815' }}
                >
                  <Text className="text-lg">🌻</Text>
                </View>
                <View className="flex-1">
                  <Text
                    style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
                    className="text-sm"
                  >
                    Sunflower Seeds
                  </Text>
                  <Text
                    style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.tertiary }}
                    className="text-xs"
                  >
                    1-2 tbsp ground daily
                  </Text>
                </View>
              </View>
            </View>

            <View className="flex-row">
              <View className="flex-1 flex-row items-center">
                <View
                  className="w-10 h-10 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: '#D4A57415' }}
                >
                  <Text className="text-lg">🫘</Text>
                </View>
                <View className="flex-1">
                  <Text
                    style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
                    className="text-sm"
                  >
                    Sesame Seeds
                  </Text>
                  <Text
                    style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.tertiary }}
                    className="text-xs"
                  >
                    1-2 tbsp ground daily
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Tip */}
          <Text
            style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.tertiary }}
            className="text-xs mt-4 text-center italic"
          >
            Grind seeds fresh for maximum nutrient absorption
          </Text>
        </View>
      )}
    </View>
  );
}

export default function NutritionScreen() {
  const insets = useSafeAreaInsets();
  const getCurrentPhase = useCycleStore(s => s.getCurrentPhase);
  const addPhaseGroceries = useCycleStore(s => s.addPhaseGroceries);
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
  const nutrition = phaseNutrition[currentPhase];

  const handleAddToGrocery = () => {
    addPhaseGroceries(currentPhase);
    router.push('/(tabs)/grocery');
  };

  return (
    <View className="flex-1">
      <LinearGradient
        colors={theme.gradient}
        locations={[0, 0.25, 0.5, 0.75, 1]}
        style={{ flex: 1 }}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View
            entering={FadeInDown.delay(100).duration(600)}
            style={{ paddingTop: insets.top + 16 }}
            className="px-6"
          >
            <Text
              style={{ fontFamily: 'CormorantGaramond_400Regular', color: theme.text.muted }}
              className="text-sm tracking-widest uppercase"
            >
              Nutrition Guide
            </Text>
            <Text
              style={{ fontFamily: 'CormorantGaramond_600SemiBold', color: theme.text.primary }}
              className="text-3xl mt-1"
            >
              Eat for Your Cycle
            </Text>
          </Animated.View>

          {/* Phase Card */}
          <Animated.View
            entering={FadeInUp.delay(200).duration(600)}
            className="mx-6 mt-6"
          >
            <View
              className="rounded-3xl p-5 border"
              style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light }}
            >
              <View className="flex-row items-center mb-3">
                <View
                  className="w-12 h-12 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: `${info.color}20` }}
                >
                  <Text className="text-2xl">{info.emoji}</Text>
                </View>
                <View className="flex-1">
                  <Text
                    style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
                    className="text-lg"
                  >
                    {info.name} Phase
                  </Text>
                  <View className="flex-row items-center">
                    <Text
                      style={{ fontFamily: 'Quicksand_500Medium', color: theme.text.accent }}
                      className="text-sm"
                    >
                      {nutrition.focus}
                    </Text>
                    <View
                      className="ml-2 px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: `${theme.accent.purple}15` }}
                    >
                      <Text
                        style={{ fontFamily: 'Quicksand_500Medium', color: theme.accent.purple }}
                        className="text-xs"
                      >
                        {nutrition.days}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
              <Text
                style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.secondary }}
                className="text-sm leading-5"
              >
                {nutrition.description}
              </Text>
            </View>
          </Animated.View>

          {/* Fertility Awareness Section - Only shown during Ovulatory phase */}
          {nutrition.fertilityInfo && (
            <Animated.View
              entering={FadeInUp.delay(250).duration(600)}
              className="mx-6 mt-6"
            >
              <FertilityInfoSection
                fertilityInfo={nutrition.fertilityInfo}
                theme={theme}
              />
            </Animated.View>
          )}

          {/* Collapsible Sections */}
          <Animated.View
            entering={FadeInUp.delay(300).duration(600)}
            className="mx-6 mt-8"
          >
            <View className="flex-row items-center justify-between mb-4">
              <Text
                style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
                className="text-lg"
              >
                Phase Nutrition
              </Text>
              <Pressable
                onPress={handleAddToGrocery}
                className="flex-row items-center px-3 py-2 rounded-full"
                style={{ backgroundColor: `${theme.accent.pink}15` }}
              >
                <ShoppingCart size={14} color={theme.accent.pink} />
                <Text
                  style={{ fontFamily: 'Quicksand_500Medium', color: theme.accent.pink }}
                  className="text-xs ml-2"
                >
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
              defaultExpanded={true}
            />

            <SeedCyclingSection theme={theme} />

            <CollapsibleSection
              title="Herbs"
              icon={<Leaf size={18} color="#10B981" />}
              items={nutrition.herbs}
              theme={theme}
              iconBgColor="#10B98115"
            />

            <CollapsibleSection
              title="Supplements"
              icon={<Pill size={18} color="#8B5CF6" />}
              items={nutrition.supplements}
              theme={theme}
              iconBgColor="#8B5CF615"
            />
          </Animated.View>

          {/* Tips Section */}
          <Animated.View
            entering={FadeInUp.delay(500).duration(600)}
            className="mx-6 mt-4"
          >
            <Text
              style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
              className="text-lg mb-4"
            >
              Nutrition Tips
            </Text>
            <View
              className="rounded-2xl p-4 border"
              style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light }}
            >
              {nutrition.tips.map((tip, index) => (
                <View
                  key={tip}
                  className={`flex-row items-start ${index > 0 ? 'mt-3' : ''}`}
                >
                  <View
                    className="w-6 h-6 rounded-full items-center justify-center mr-3 mt-0.5"
                    style={{ backgroundColor: `${theme.accent.pink}15` }}
                  >
                    <Leaf size={12} color={theme.accent.pink} />
                  </View>
                  <Text
                    style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.secondary }}
                    className="text-sm flex-1 leading-5"
                  >
                    {tip}
                  </Text>
                </View>
              ))}
            </View>
          </Animated.View>

          {/* Avoid Section */}
          <Animated.View
            entering={FadeInUp.delay(600).duration(600)}
            className="mx-6 mt-6"
          >
            <Text
              style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
              className="text-lg mb-4"
            >
              Best to Avoid
            </Text>
            <View className="flex-row flex-wrap">
              {nutrition.avoid.map((item) => (
                <View
                  key={item}
                  className="rounded-full px-4 py-2 mr-2 mb-2 border"
                  style={{ backgroundColor: `${theme.accent.blush}10`, borderColor: `${theme.accent.blush}30` }}
                >
                  <Text
                    style={{ fontFamily: 'Quicksand_500Medium', color: theme.accent.blush }}
                    className="text-xs"
                  >
                    {item}
                  </Text>
                </View>
              ))}
            </View>
          </Animated.View>

          {/* CTA */}
          <Animated.View
            entering={FadeInUp.delay(700).duration(600)}
            className="mx-6 mt-8"
          >
            <Pressable
              onPress={handleAddToGrocery}
              className="overflow-hidden rounded-2xl"
            >
              <LinearGradient
                colors={['#f9a8d4', '#c4b5fd']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
              >
                <ShoppingCart size={20} color="#fff" />
                <Text
                  style={{ fontFamily: 'Quicksand_600SemiBold' }}
                  className="text-white text-base ml-3"
                >
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

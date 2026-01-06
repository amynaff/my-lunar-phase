import React from 'react';
import { View, Text, ScrollView, Pressable, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Apple, Salad, Fish, Cookie, ShoppingCart, ChevronRight, Leaf } from 'lucide-react-native';
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

interface FoodRecommendation {
  name: string;
  benefit: string;
  category: string;
  image: string;
}

const phaseNutrition: Record<CyclePhase, {
  focus: string;
  description: string;
  foods: FoodRecommendation[];
  avoid: string[];
  tips: string[];
}> = {
  menstrual: {
    focus: 'Replenish & Nourish',
    description: 'Focus on iron-rich foods to replenish blood loss. Warm, comforting foods support your body during this restorative time.',
    foods: [
      { name: 'Dark Leafy Greens', benefit: 'Iron & magnesium to reduce cramps', category: 'Vegetables', image: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=200' },
      { name: 'Red Meat or Lentils', benefit: 'Replenish iron stores', category: 'Protein', image: 'https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=200' },
      { name: 'Dark Chocolate', benefit: 'Magnesium & mood boost', category: 'Treats', image: 'https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=200' },
      { name: 'Salmon', benefit: 'Omega-3s reduce inflammation', category: 'Protein', image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=200' },
      { name: 'Ginger Tea', benefit: 'Soothes cramps & nausea', category: 'Beverages', image: 'https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2?w=200' },
      { name: 'Beets', benefit: 'Natural blood builder', category: 'Vegetables', image: 'https://images.unsplash.com/photo-1593105544559-ecb03bf76f82?w=200' },
    ],
    avoid: ['Excessive caffeine', 'Alcohol', 'Processed foods', 'Too much salt'],
    tips: ['Stay hydrated with warm beverages', 'Eat smaller, more frequent meals', 'Include warming spices like turmeric'],
  },
  follicular: {
    focus: 'Energize & Create',
    description: 'Estrogen is rising! Light, fresh foods support your increasing energy. Great time for trying new recipes and vibrant produce.',
    foods: [
      { name: 'Fresh Berries', benefit: 'Antioxidants for cell renewal', category: 'Fruits', image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=200' },
      { name: 'Avocado', benefit: 'Healthy fats for hormone production', category: 'Healthy Fats', image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=200' },
      { name: 'Eggs', benefit: 'Protein & B vitamins', category: 'Protein', image: 'https://images.unsplash.com/photo-1518569656558-1f25e69d93d7?w=200' },
      { name: 'Fermented Foods', benefit: 'Support gut health', category: 'Probiotics', image: 'https://images.unsplash.com/photo-1589927986089-35812388d1f4?w=200' },
      { name: 'Broccoli', benefit: 'Estrogen metabolism support', category: 'Vegetables', image: 'https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?w=200' },
      { name: 'Citrus Fruits', benefit: 'Vitamin C for energy', category: 'Fruits', image: 'https://images.unsplash.com/photo-1547514701-42782101795e?w=200' },
    ],
    avoid: ['Heavy, greasy foods', 'Excessive sugar'],
    tips: ['Try raw salads and fresh vegetables', 'Experiment with new healthy recipes', 'Sprouts and microgreens are excellent'],
  },
  ovulatory: {
    focus: 'Light & Vibrant',
    description: 'Peak energy time! Support your body with fiber-rich foods that help metabolize the estrogen surge. Light proteins keep you energized.',
    foods: [
      { name: 'Raw Vegetables', benefit: 'Fiber to process excess estrogen', category: 'Vegetables', image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200' },
      { name: 'Quinoa', benefit: 'Complete protein & fiber', category: 'Grains', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200' },
      { name: 'Light Fish', benefit: 'Lean protein for sustained energy', category: 'Protein', image: 'https://images.unsplash.com/photo-1510130387422-82bed34b37e9?w=200' },
      { name: 'Almonds', benefit: 'Vitamin E for skin glow', category: 'Nuts', image: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=200' },
      { name: 'Coconut Water', benefit: 'Natural hydration', category: 'Beverages', image: 'https://images.unsplash.com/photo-1536591375623-7f1ea71ec76e?w=200' },
      { name: 'Asparagus', benefit: 'Natural detoxifier', category: 'Vegetables', image: 'https://images.unsplash.com/photo-1515471209610-dae1c92d8777?w=200' },
    ],
    avoid: ['Heavy carbs', 'Fried foods', 'Excess dairy'],
    tips: ['Focus on raw and lightly cooked foods', 'Great time for smoothies and juices', 'Stay well hydrated'],
  },
  luteal: {
    focus: 'Stabilize & Comfort',
    description: 'Progesterone rises, cravings may appear. Complex carbs and magnesium-rich foods help stabilize mood and energy.',
    foods: [
      { name: 'Sweet Potato', benefit: 'Complex carbs for serotonin', category: 'Vegetables', image: 'https://images.unsplash.com/photo-1518977676601-b53f82ber8f3?w=200' },
      { name: 'Pumpkin Seeds', benefit: 'Magnesium for PMS relief', category: 'Seeds', image: 'https://images.unsplash.com/photo-1509622905150-fa66d3906e09?w=200' },
      { name: 'Turkey', benefit: 'Tryptophan for calm mood', category: 'Protein', image: 'https://images.unsplash.com/photo-1574672280600-4accfa5b6f98?w=200' },
      { name: 'Cauliflower', benefit: 'Supports liver detox', category: 'Vegetables', image: 'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?w=200' },
      { name: 'Bananas', benefit: 'Potassium reduces bloating', category: 'Fruits', image: 'https://images.unsplash.com/photo-1481349518771-20055b2a7b24?w=200' },
      { name: 'Chamomile Tea', benefit: 'Calming & anti-inflammatory', category: 'Beverages', image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=200' },
    ],
    avoid: ['Excessive salt', 'Refined sugar', 'Caffeine', 'Alcohol'],
    tips: ['Honor cravings with healthy alternatives', 'Eat regularly to stabilize blood sugar', 'Warm, cooked foods are comforting'],
  },
};

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
                <View>
                  <Text
                    style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
                    className="text-lg"
                  >
                    {info.name} Phase
                  </Text>
                  <Text
                    style={{ fontFamily: 'Quicksand_500Medium', color: theme.text.accent }}
                    className="text-sm"
                  >
                    {nutrition.focus}
                  </Text>
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

          {/* Foods Section */}
          <Animated.View
            entering={FadeInUp.delay(300).duration(600)}
            className="mt-8"
          >
            <View className="px-6 flex-row items-center justify-between mb-4">
              <Text
                style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
                className="text-lg"
              >
                Recommended Foods
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

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 24 }}
              style={{ flexGrow: 0 }}
            >
              {nutrition.foods.map((food, index) => (
                <Animated.View
                  key={food.name}
                  entering={FadeInUp.delay(400 + index * 50).duration(500)}
                  className="mr-4"
                  style={{ width: 160 }}
                >
                  <View
                    className="rounded-2xl overflow-hidden border"
                    style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light }}
                  >
                    <Image
                      source={{ uri: food.image }}
                      className="w-full h-24"
                      style={{ backgroundColor: theme.bg.secondary }}
                    />
                    <View className="p-3">
                      <Text
                        style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
                        className="text-sm"
                        numberOfLines={1}
                      >
                        {food.name}
                      </Text>
                      <Text
                        style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.tertiary }}
                        className="text-xs mt-1"
                        numberOfLines={2}
                      >
                        {food.benefit}
                      </Text>
                      <View
                        className="mt-2 self-start px-2 py-1 rounded-full"
                        style={{ backgroundColor: `${theme.accent.purple}15` }}
                      >
                        <Text style={{ color: theme.accent.purple }} className="text-xs">
                          {food.category}
                        </Text>
                      </View>
                    </View>
                  </View>
                </Animated.View>
              ))}
            </ScrollView>
          </Animated.View>

          {/* Tips Section */}
          <Animated.View
            entering={FadeInUp.delay(600).duration(600)}
            className="mx-6 mt-8"
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
            entering={FadeInUp.delay(700).duration(600)}
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
            entering={FadeInUp.delay(800).duration(600)}
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

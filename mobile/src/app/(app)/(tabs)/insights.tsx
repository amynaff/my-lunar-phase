import React, { useMemo } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import {
  Sparkles, Brain, FlaskConical, ChevronRight,
  Salad, Dumbbell, Heart, TrendingUp
} from 'lucide-react-native';
import { useThemeStore, getTheme } from '@/lib/theme-store';
import { useCycleStore, phaseInfo, CyclePhase } from '@/lib/cycle-store';
import { useSymptomStore, availableSymptoms } from '@/lib/symptom-store';
import { useSubscriptionStore } from '@/lib/subscription-store';
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

// ── Phase-specific content ────────────────────────────────────────────────────

const phaseNutritionTips: Record<CyclePhase, { focus: string; tips: string[]; topFoods: string[] }> = {
  menstrual: {
    focus: 'Replenish & Nourish',
    tips: [
      'Eat iron-rich foods to replenish blood loss',
      'Pair iron with vitamin C for better absorption',
      'Avoid caffeine around meals — it blocks iron',
      'Warm, cooked foods are easier to digest now',
    ],
    topFoods: ['Leafy greens', 'Lentils & beans', 'Pumpkin seeds', 'Salmon', 'Avocado', 'Dark chocolate'],
  },
  follicular: {
    focus: 'Energize & Build',
    tips: [
      'Increase protein to support rising energy',
      'Include omega-3s to reduce inflammation',
      'Fresh, raw foods complement your rising vitality',
      'Complex carbs fuel new-phase energy',
    ],
    topFoods: ['Wild salmon', 'Eggs', 'Flaxseeds', 'Sweet potato', 'Mixed nuts', 'Fermented foods'],
  },
  ovulatory: {
    focus: 'Support Peak Energy',
    tips: [
      'Stay well-hydrated — body temperature rises slightly',
      'Light, fresh meals complement your high energy',
      'Antioxidant-rich foods support egg health',
      'Anti-inflammatory foods keep your peak feeling great',
    ],
    topFoods: ['Berries', 'Leafy greens', 'Quinoa', 'Tomatoes', 'Bell peppers', 'Watermelon'],
  },
  luteal: {
    focus: 'Balance & Soothe',
    tips: [
      'Complex carbs maintain serotonin as progesterone rises',
      'Magnesium-rich foods ease PMS symptoms',
      'Reduce sodium to minimize bloating',
      'Calcium helps with mood swings',
    ],
    topFoods: ['Sweet potato', 'Dark chocolate', 'Chickpeas', 'Brown rice', 'Almonds', 'Chamomile tea'],
  },
};

const phaseMovementTips: Record<CyclePhase, { recommendation: string; tips: string[]; workouts: string[] }> = {
  menstrual: {
    recommendation: 'Rest & Restore',
    tips: [
      'Honor your body — gentle movement only',
      'Heat helps: warm baths before stretching',
      'Complete rest days are perfectly valid',
    ],
    workouts: ['Restorative yoga', 'Gentle stretching', 'Short walks', 'Breathwork'],
  },
  follicular: {
    recommendation: 'Build & Explore',
    tips: [
      'Great time to try new workouts',
      'Your muscles recover faster now',
      'Push intensity — your energy is rising',
    ],
    workouts: ['Strength training', 'HIIT', 'Running', 'Dance classes'],
  },
  ovulatory: {
    recommendation: 'Peak Performance',
    tips: [
      'Your highest-intensity window — go for it',
      'You\'re stronger and more coordinated now',
      'Great time for group fitness or sports',
    ],
    workouts: ['Heavy lifting', 'Cycling', 'Competitive sports', 'Circuit training'],
  },
  luteal: {
    recommendation: 'Steady & Focused',
    tips: [
      'Strength training pays off — muscles repair well',
      'Reduce cardio intensity as PMS approaches',
      'Pilates and yoga keep energy stable',
    ],
    workouts: ['Pilates', 'Strength training', 'Hiking', 'Yoga'],
  },
};

const phaseSelfCareTips: Record<CyclePhase, { theme: string; practices: string[] }> = {
  menstrual: {
    theme: 'Rest & Reflection',
    practices: [
      'Warm bath with Epsom salts',
      'Journaling and quiet reflection',
      'Castor oil pack on lower abdomen',
      'Reduce screen time before bed',
      'Give yourself permission to cancel plans',
    ],
  },
  follicular: {
    theme: 'Renewal & Creativity',
    practices: [
      'Start a new creative project',
      'Update your goals and intentions',
      'Book social plans — your energy is rising',
      'Try a new recipe or activity',
      'Declutter a space for fresh energy',
    ],
  },
  ovulatory: {
    theme: 'Connection & Expression',
    practices: [
      'Schedule important conversations',
      'Connect with friends and community',
      'Express yourself — speak up, create',
      'Enjoy outdoor activities',
      'Prioritize intimacy if it feels right',
    ],
  },
  luteal: {
    theme: 'Completion & Nourishment',
    practices: [
      'Finish projects rather than starting new ones',
      'Reduce obligations in your calendar',
      'Prioritize sleep — aim for 8+ hours',
      'Journaling helps process emotions',
      'Magnesium bath before bed',
    ],
  },
};

// ── Symptom Trend Chart ───────────────────────────────────────────────────────

function SymptomTrendChart({ accentColor, theme }: { accentColor: string; theme: ReturnType<typeof getTheme> }) {
  const getRecentEntries = useSymptomStore(s => s.getRecentEntries);
  const getMostCommonSymptoms = useSymptomStore(s => s.getMostCommonSymptoms);

  const chartData = useMemo(() => {
    const entries = getRecentEntries(30);
    if (entries.length === 0) return null;

    // Build a 30-day grid (days with/without logs)
    const today = new Date();
    const days: { hasLog: boolean; count: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const entry = entries.find(e => e.date === dateStr);
      days.push({ hasLog: !!entry, count: entry?.symptoms.length ?? 0 });
    }

    // Top 4 symptoms from last 30 days
    const topRaw = getMostCommonSymptoms(4);
    const topSymptoms = topRaw
      .map(({ symptomId }) => availableSymptoms.find(s => s.id === symptomId))
      .filter(Boolean) as typeof availableSymptoms;

    // Frequency counts as percentages of logged days
    const symptomFrequency = topRaw.map(({ symptomId, count }) => ({
      id: symptomId,
      count,
      pct: entries.length > 0 ? Math.round((count / entries.length) * 100) : 0,
    }));

    return { days, topSymptoms, symptomFrequency, totalLogged: entries.length };
  }, [getRecentEntries, getMostCommonSymptoms]);

  if (!chartData || chartData.totalLogged === 0) {
    return (
      <View
        className="rounded-2xl p-5 border items-center"
        style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light }}
      >
        <TrendingUp size={28} color={theme.text.muted} style={{ marginBottom: 8 }} />
        <Text
          style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.secondary }}
          className="text-sm text-center"
        >
          Log symptoms for 7+ days to see your trends
        </Text>
      </View>
    );
  }

  return (
    <View
      className="rounded-2xl p-5 border"
      style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light }}
    >
      {/* 30-day dot grid */}
      <View className="flex-row flex-wrap mb-4" style={{ gap: 3 }}>
        {chartData.days.map((day, i) => (
          <View
            key={i}
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: day.hasLog
                ? day.count > 3 ? accentColor : `${accentColor}70`
                : `${accentColor}18`,
            }}
          />
        ))}
      </View>
      <Text
        style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.tertiary, fontSize: 11 }}
        className="mb-4"
      >
        {chartData.totalLogged} log{chartData.totalLogged !== 1 ? 's' : ''} in the last 30 days
      </Text>

      {/* Top symptom frequency bars */}
      {chartData.topSymptoms.length > 0 && (
        <>
          <Text
            style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
            className="text-sm mb-3"
          >
            Most frequent symptoms
          </Text>
          {chartData.symptomFrequency.map((item, i) => {
            const sym = chartData.topSymptoms[i];
            if (!sym) return null;
            return (
              <View key={item.id} className="mb-2.5">
                <View className="flex-row items-center justify-between mb-1">
                  <Text
                    style={{ fontFamily: 'Quicksand_500Medium', color: theme.text.secondary, fontSize: 12 }}
                  >
                    {sym.icon} {sym.name}
                  </Text>
                  <Text
                    style={{ fontFamily: 'Quicksand_600SemiBold', color: accentColor, fontSize: 11 }}
                  >
                    {item.pct}%
                  </Text>
                </View>
                <View
                  className="rounded-full overflow-hidden"
                  style={{ height: 5, backgroundColor: `${accentColor}18` }}
                >
                  <View
                    style={{
                      height: 5,
                      width: `${item.pct}%`,
                      backgroundColor: accentColor,
                      borderRadius: 9999,
                    }}
                  />
                </View>
              </View>
            );
          })}
        </>
      )}
    </View>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function InsightsScreen() {
  const insets = useSafeAreaInsets();
  const themeMode = useThemeStore(s => s.mode);
  const theme = getTheme(themeMode);
  const getCurrentPhase = useCycleStore(s => s.getCurrentPhase);
  const getDayOfCycle = useCycleStore(s => s.getDayOfCycle);
  const isPremium = useSubscriptionStore(s => s.tier === 'premium');

  const [fontsLoaded] = useFonts({
    CormorantGaramond_400Regular,
    CormorantGaramond_600SemiBold,
    Quicksand_400Regular,
    Quicksand_500Medium,
    Quicksand_600SemiBold,
  });

  const currentPhase = getCurrentPhase();
  const info = phaseInfo[currentPhase];
  const dayOfCycle = getDayOfCycle();
  const nutrition = phaseNutritionTips[currentPhase];
  const movement = phaseMovementTips[currentPhase];
  const selfCare = phaseSelfCareTips[currentPhase];

  if (!fontsLoaded) return null;

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={theme.gradient}
        locations={[0, 0.25, 0.5, 0.75, 1]}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 140 }}
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
              Your cycle data
            </Text>
            <Text
              style={{ fontFamily: 'CormorantGaramond_600SemiBold', color: theme.text.primary }}
              className="text-3xl mt-1"
            >
              Insights
            </Text>
          </Animated.View>

          {/* Phase Summary Card */}
          <Animated.View
            entering={FadeInUp.delay(200).duration(600)}
            className="mx-6 mt-5"
          >
            <LinearGradient
              colors={[`${info.color}30`, `${info.color}15`]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ borderRadius: 24, padding: 24, borderWidth: 1, borderColor: `${info.color}30` }}
            >
              <View className="flex-row items-center mb-3">
                <View
                  className="w-14 h-14 rounded-full items-center justify-center mr-4"
                  style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                >
                  <Text className="text-3xl">{info.emoji}</Text>
                </View>
                <View className="flex-1">
                  <Text
                    style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
                    className="text-lg"
                  >
                    {info.name} Phase
                  </Text>
                  <Text
                    style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.secondary }}
                    className="text-sm"
                  >
                    Day {dayOfCycle} of your cycle
                  </Text>
                </View>
                <View
                  className="px-3 py-1.5 rounded-full"
                  style={{ backgroundColor: `${info.color}25` }}
                >
                  <Text
                    style={{ fontFamily: 'Quicksand_600SemiBold', color: info.color }}
                    className="text-xs"
                  >
                    {info.energy}
                  </Text>
                </View>
              </View>
              <Text
                style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.secondary }}
                className="text-sm leading-5"
              >
                {info.description}
              </Text>
              <View className="mt-4 pt-4 border-t" style={{ borderTopColor: `${info.color}30` }}>
                <View className="flex-row items-center">
                  <Sparkles size={14} color={info.color} />
                  <Text
                    style={{ fontFamily: 'Quicksand_500Medium', color: theme.text.primary }}
                    className="text-xs ml-2"
                  >
                    Superpower: {info.superpower}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Nutrition Tips */}
          <Animated.View entering={FadeInUp.delay(280).duration(600)} className="mx-6 mt-5">
            <View className="flex-row items-center mb-3">
              <Salad size={16} color={theme.accent.pink} />
              <Text
                style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
                className="text-base ml-2"
              >
                Nutrition — {nutrition.focus}
              </Text>
            </View>
            <View
              className="rounded-2xl p-5 border"
              style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light }}
            >
              {nutrition.tips.map((tip, i) => (
                <View key={i} className="flex-row mb-2.5">
                  <Text style={{ color: theme.accent.pink, fontSize: 13 }}>•  </Text>
                  <Text
                    style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.secondary, flex: 1 }}
                    className="text-sm leading-5"
                  >
                    {tip}
                  </Text>
                </View>
              ))}
              <View className="mt-3 pt-3 border-t flex-row flex-wrap" style={{ borderTopColor: theme.border.light, gap: 6 }}>
                {nutrition.topFoods.map(food => (
                  <View
                    key={food}
                    className="px-2.5 py-1 rounded-full"
                    style={{ backgroundColor: `${theme.accent.pink}15` }}
                  >
                    <Text
                      style={{ fontFamily: 'Quicksand_500Medium', color: theme.accent.pink, fontSize: 11 }}
                    >
                      {food}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </Animated.View>

          {/* Movement Tips */}
          <Animated.View entering={FadeInUp.delay(340).duration(600)} className="mx-6 mt-5">
            <View className="flex-row items-center mb-3">
              <Dumbbell size={16} color={info.color} />
              <Text
                style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
                className="text-base ml-2"
              >
                Movement — {movement.recommendation}
              </Text>
            </View>
            <View
              className="rounded-2xl p-5 border"
              style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light }}
            >
              {movement.tips.map((tip, i) => (
                <View key={i} className="flex-row mb-2.5">
                  <Text style={{ color: info.color, fontSize: 13 }}>•  </Text>
                  <Text
                    style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.secondary, flex: 1 }}
                    className="text-sm leading-5"
                  >
                    {tip}
                  </Text>
                </View>
              ))}
              <View className="mt-3 pt-3 border-t flex-row flex-wrap" style={{ borderTopColor: theme.border.light, gap: 6 }}>
                {movement.workouts.map(w => (
                  <View
                    key={w}
                    className="px-2.5 py-1 rounded-full"
                    style={{ backgroundColor: `${info.color}15` }}
                  >
                    <Text
                      style={{ fontFamily: 'Quicksand_500Medium', color: info.color, fontSize: 11 }}
                    >
                      {w}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </Animated.View>

          {/* Self-Care Suggestions */}
          <Animated.View entering={FadeInUp.delay(400).duration(600)} className="mx-6 mt-5">
            <View className="flex-row items-center mb-3">
              <Heart size={16} color={theme.accent.purple} />
              <Text
                style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
                className="text-base ml-2"
              >
                Self-Care — {selfCare.theme}
              </Text>
            </View>
            <View
              className="rounded-2xl p-5 border"
              style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light }}
            >
              {selfCare.practices.map((practice, i) => (
                <View key={i} className="flex-row mb-2.5">
                  <Text style={{ color: theme.accent.purple, fontSize: 13 }}>•  </Text>
                  <Text
                    style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.secondary, flex: 1 }}
                    className="text-sm leading-5"
                  >
                    {practice}
                  </Text>
                </View>
              ))}
            </View>
          </Animated.View>

          {/* Symptom Trend Chart — Premium */}
          <Animated.View entering={FadeInUp.delay(460).duration(600)} className="mx-6 mt-5">
            <View className="flex-row items-center mb-3">
              <TrendingUp size={16} color={theme.accent.purple} />
              <Text
                style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
                className="text-base ml-2"
              >
                Symptom Trends — Last 30 Days
              </Text>
            </View>
            {isPremium ? (
              <SymptomTrendChart accentColor={info.color} theme={theme} />
            ) : (
              <Pressable
                onPress={() => router.push('/paywall')}
                className="rounded-2xl p-5 border items-center"
                style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light }}
              >
                <View
                  className="w-12 h-12 rounded-full items-center justify-center mb-3"
                  style={{ backgroundColor: `${theme.accent.purple}15` }}
                >
                  <TrendingUp size={22} color={theme.accent.purple} />
                </View>
                <Text
                  style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
                  className="text-base"
                >
                  Unlock Symptom Analytics
                </Text>
                <Text
                  style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.tertiary }}
                  className="text-xs mt-1 text-center"
                >
                  Track patterns across your cycles with Premium
                </Text>
                <View
                  className="mt-3 px-4 py-2 rounded-full"
                  style={{ backgroundColor: theme.accent.purple }}
                >
                  <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: '#fff' }} className="text-xs">
                    Upgrade to Premium
                  </Text>
                </View>
              </Pressable>
            )}
          </Animated.View>

          {/* Luna AI Card */}
          <Animated.View
            entering={FadeInUp.delay(520).duration(600)}
            className="mx-6 mt-5"
          >
            <Pressable onPress={() => router.push('/luna-ai' as any)}>
              <LinearGradient
                colors={[`${theme.accent.purple}20`, `${theme.accent.purple}08`]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ borderRadius: 20, padding: 18, borderWidth: 1, borderColor: `${theme.accent.purple}30` }}
              >
                <View className="flex-row items-center">
                  <View
                    className="w-12 h-12 rounded-full items-center justify-center mr-4"
                    style={{ backgroundColor: `${theme.accent.purple}20` }}
                  >
                    <Brain size={22} color={theme.accent.purple} />
                  </View>
                  <View className="flex-1">
                    <Text
                      style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
                      className="text-base"
                    >
                      Luna AI
                    </Text>
                    <Text
                      style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.tertiary }}
                      className="text-xs mt-0.5"
                    >
                      Ask questions about your cycle and wellness
                    </Text>
                  </View>
                  <ChevronRight size={18} color={theme.text.muted} />
                </View>
              </LinearGradient>
            </Pressable>
          </Animated.View>

          {/* Labs Guide Card */}
          <Animated.View
            entering={FadeInUp.delay(580).duration(600)}
            className="mx-6 mt-4"
          >
            <Pressable
              onPress={() => router.push('/labs-guide' as any)}
              className="flex-row items-center rounded-2xl p-5 border"
              style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light }}
            >
              <View
                className="w-12 h-12 rounded-full items-center justify-center mr-4"
                style={{ backgroundColor: `${theme.accent.blush}15` }}
              >
                <FlaskConical size={22} color={theme.accent.blush} />
              </View>
              <View className="flex-1">
                <Text
                  style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
                  className="text-base"
                >
                  Labs Guide
                </Text>
                <Text
                  style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.tertiary }}
                  className="text-xs mt-0.5"
                >
                  Understand your hormone lab results
                </Text>
              </View>
              <ChevronRight size={18} color={theme.text.muted} />
            </Pressable>
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

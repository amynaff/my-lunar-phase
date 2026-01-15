import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, Dimensions, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import { Moon, Sparkles, Heart, Calendar, ChevronRight, Apple, Dumbbell, Crown, Flame, Sun, Leaf } from 'lucide-react-native';
import { CycleWheel } from '@/components/CycleWheel';
import { CycleGraph } from '@/components/CycleGraph';
import { useCycleStore, phaseInfo, lifeStageInfo, perimenopauseSymptoms, menopauseSymptoms } from '@/lib/cycle-store';
import { useThemeStore, getTheme } from '@/lib/theme-store';
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
import * as SplashScreen from 'expo-splash-screen';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const getCurrentPhase = useCycleStore(s => s.getCurrentPhase);
  const getDaysUntilNextPeriod = useCycleStore(s => s.getDaysUntilNextPeriod);
  const hasCompletedOnboarding = useCycleStore(s => s.hasCompletedOnboarding);
  const lifeStage = useCycleStore(s => s.lifeStage);
  const themeMode = useThemeStore(s => s.mode);
  const theme = getTheme(themeMode);
  const tier = useSubscriptionStore(s => s.tier);
  const isPremium = tier === 'premium';
  const [isReady, setIsReady] = useState(false);

  const [fontsLoaded] = useFonts({
    CormorantGaramond_400Regular,
    CormorantGaramond_600SemiBold,
    Quicksand_400Regular,
    Quicksand_500Medium,
    Quicksand_600SemiBold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
      setTimeout(() => setIsReady(true), 100);
    }
  }, [fontsLoaded]);

  useEffect(() => {
    if (isReady && !hasCompletedOnboarding) {
      router.replace('/onboarding');
    }
  }, [hasCompletedOnboarding, isReady]);

  if (!fontsLoaded || !isReady) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.bg.primary, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={theme.accent.pink} />
      </View>
    );
  }

  const currentPhase = getCurrentPhase();
  const info = phaseInfo[currentPhase];
  const stageInfo = lifeStageInfo[lifeStage];
  const daysUntilPeriod = getDaysUntilNextPeriod();

  const quickActions = [
    {
      icon: Apple,
      label: 'Nutrition',
      color: theme.accent.pink,
      route: '/(tabs)/nutrition',
    },
    {
      icon: Dumbbell,
      label: 'Movement',
      color: theme.accent.purple,
      route: '/(tabs)/movement',
    },
    {
      icon: Heart,
      label: 'Self-Care',
      color: theme.accent.blush,
      route: '/(tabs)/selfcare',
    },
  ];

  // Get life stage specific colors and icons
  const getStageTheme = () => {
    switch (lifeStage) {
      case 'perimenopause':
        return { color: '#f59e0b', icon: Leaf, gradient: ['#fcd34d', '#f59e0b'] as [string, string] };
      case 'menopause':
        return { color: '#8b5cf6', icon: Sun, gradient: ['#c4b5fd', '#8b5cf6'] as [string, string] };
      default:
        return { color: theme.accent.purple, icon: Moon, gradient: ['#f9a8d4', '#c4b5fd'] as [string, string] };
    }
  };

  const stageTheme = getStageTheme();

  // Render different content based on life stage
  const renderLifeStageContent = () => {
    if (lifeStage === 'regular') {
      return (
        <>
          {/* Cycle Wheel */}
          <Animated.View
            entering={FadeInUp.delay(300).duration(800)}
            className="items-center mt-6"
          >
            <CycleWheel />
          </Animated.View>

          {/* Phase Info Card */}
          <Animated.View
            entering={FadeInUp.delay(500).duration(600)}
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
                  <Text
                    style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.tertiary }}
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

              <View className="mt-4 pt-4 border-t" style={{ borderTopColor: theme.border.light }}>
                <View className="flex-row items-center">
                  <Sparkles size={14} color={theme.accent.purple} />
                  <Text
                    style={{ fontFamily: 'Quicksand_500Medium', color: theme.text.accent }}
                    className="text-xs ml-2"
                  >
                    Your superpower: {info.superpower}
                  </Text>
                </View>
              </View>
            </View>
          </Animated.View>

          {/* Next Period Countdown */}
          <Animated.View
            entering={FadeInUp.delay(550).duration(600)}
            className="mx-6 mt-4"
          >
            <View
              className="flex-row items-center justify-between rounded-2xl p-4 border"
              style={{ backgroundColor: `${theme.accent.rose}10`, borderColor: `${theme.accent.rose}30` }}
            >
              <View className="flex-row items-center">
                <Calendar size={18} color={theme.accent.pink} />
                <Text
                  style={{ fontFamily: 'Quicksand_500Medium', color: theme.text.primary }}
                  className="text-sm ml-3"
                >
                  Next period in
                </Text>
              </View>
              <View className="flex-row items-center">
                <Text
                  style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.accent.pink }}
                  className="text-lg mr-1"
                >
                  {daysUntilPeriod}
                </Text>
                <Text
                  style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.secondary }}
                  className="text-sm"
                >
                  days
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* Cycle Graph - Educational */}
          <Animated.View
            entering={FadeInUp.delay(600).duration(600)}
            className="mx-6 mt-6"
          >
            <CycleGraph />
          </Animated.View>
        </>
      );
    } else if (lifeStage === 'perimenopause') {
      return (
        <>
          {/* Perimenopause Status Card */}
          <Animated.View
            entering={FadeInUp.delay(300).duration(600)}
            className="mx-6 mt-6"
          >
            <LinearGradient
              colors={['rgba(251, 191, 36, 0.15)', 'rgba(245, 158, 11, 0.1)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ borderRadius: 24, padding: 20, borderWidth: 1, borderColor: 'rgba(245, 158, 11, 0.3)' }}
            >
              <View className="flex-row items-center mb-3">
                <View
                  className="w-14 h-14 rounded-full items-center justify-center mr-4"
                  style={{ backgroundColor: 'rgba(245, 158, 11, 0.2)' }}
                >
                  <Leaf size={28} color="#f59e0b" />
                </View>
                <View className="flex-1">
                  <Text
                    style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
                    className="text-lg"
                  >
                    Your Transition Journey
                  </Text>
                  <Text
                    style={{ fontFamily: 'Quicksand_400Regular', color: '#92400e' }}
                    className="text-xs mt-0.5"
                  >
                    Embracing change with grace
                  </Text>
                </View>
              </View>

              <Text
                style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.secondary }}
                className="text-sm leading-5"
              >
                {stageInfo.description} Track your symptoms to understand patterns and feel more in control.
              </Text>
            </LinearGradient>
          </Animated.View>

          {/* Symptom Quick Track */}
          <Animated.View
            entering={FadeInUp.delay(450).duration(600)}
            className="mx-6 mt-4"
          >
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                if (isPremium) {
                  // TODO: Navigate to symptom tracking
                } else {
                  router.push('/paywall');
                }
              }}
            >
              <View
                className="rounded-2xl p-4 border"
                style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light }}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <Flame size={20} color="#f59e0b" />
                    <Text
                      style={{ fontFamily: 'Quicksand_500Medium', color: theme.text.primary }}
                      className="text-sm ml-3"
                    >
                      Track Today's Symptoms
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    {!isPremium && (
                      <View className="px-2 py-1 rounded-full mr-2" style={{ backgroundColor: 'rgba(249, 168, 212, 0.2)' }}>
                        <Crown size={12} color="#f9a8d4" />
                      </View>
                    )}
                    <ChevronRight size={18} color={theme.text.tertiary} />
                  </View>
                </View>

                {/* Common symptom pills */}
                <View className="flex-row flex-wrap mt-3" style={{ gap: 8 }}>
                  {perimenopauseSymptoms.slice(0, 5).map((symptom) => (
                    <View
                      key={symptom.id}
                      className="flex-row items-center px-3 py-1.5 rounded-full"
                      style={{ backgroundColor: `${stageTheme.color}15` }}
                    >
                      <Text className="text-sm mr-1">{symptom.emoji}</Text>
                      <Text
                        style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.secondary }}
                        className="text-xs"
                      >
                        {symptom.name}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </Pressable>
          </Animated.View>

          {/* Last period if still tracking */}
          <Animated.View
            entering={FadeInUp.delay(550).duration(600)}
            className="mx-6 mt-4"
          >
            <View
              className="flex-row items-center justify-between rounded-2xl p-4 border"
              style={{ backgroundColor: `${stageTheme.color}10`, borderColor: `${stageTheme.color}30` }}
            >
              <View className="flex-row items-center">
                <Calendar size={18} color={stageTheme.color} />
                <Text
                  style={{ fontFamily: 'Quicksand_500Medium', color: theme.text.primary }}
                  className="text-sm ml-3"
                >
                  Next period estimate
                </Text>
              </View>
              <View className="flex-row items-center">
                <Text
                  style={{ fontFamily: 'Quicksand_600SemiBold', color: stageTheme.color }}
                  className="text-base mr-1"
                >
                  ~{daysUntilPeriod}
                </Text>
                <Text
                  style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.secondary }}
                  className="text-sm"
                >
                  days
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* Educational Card */}
          <Animated.View
            entering={FadeInUp.delay(650).duration(600)}
            className="mx-6 mt-6"
          >
            <View
              className="rounded-2xl p-5 border"
              style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light }}
            >
              <Text
                style={{ fontFamily: 'Quicksand_600SemiBold', color: stageTheme.color }}
                className="text-xs uppercase tracking-wider mb-3"
              >
                Did you know?
              </Text>
              <Text
                style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.secondary }}
                className="text-sm leading-5"
              >
                Perimenopause typically lasts 4-8 years. During this time, estrogen levels fluctuate significantly, which can cause symptoms to come and go. Tracking helps you identify patterns and prepare.
              </Text>
            </View>
          </Animated.View>
        </>
      );
    } else {
      // Menopause
      return (
        <>
          {/* Menopause Status Card */}
          <Animated.View
            entering={FadeInUp.delay(300).duration(600)}
            className="mx-6 mt-6"
          >
            <LinearGradient
              colors={['rgba(139, 92, 246, 0.15)', 'rgba(167, 139, 250, 0.1)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ borderRadius: 24, padding: 20, borderWidth: 1, borderColor: 'rgba(139, 92, 246, 0.3)' }}
            >
              <View className="flex-row items-center mb-3">
                <View
                  className="w-14 h-14 rounded-full items-center justify-center mr-4"
                  style={{ backgroundColor: 'rgba(139, 92, 246, 0.2)' }}
                >
                  <Sun size={28} color="#8b5cf6" />
                </View>
                <View className="flex-1">
                  <Text
                    style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
                    className="text-lg"
                  >
                    Your Second Spring
                  </Text>
                  <Text
                    style={{ fontFamily: 'Quicksand_400Regular', color: '#5b21b6' }}
                    className="text-xs mt-0.5"
                  >
                    Wisdom & freedom
                  </Text>
                </View>
              </View>

              <Text
                style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.secondary }}
                className="text-sm leading-5"
              >
                {stageInfo.description} Focus on nourishing your body and embracing this powerful new chapter.
              </Text>
            </LinearGradient>
          </Animated.View>

          {/* Symptom Quick Track */}
          <Animated.View
            entering={FadeInUp.delay(450).duration(600)}
            className="mx-6 mt-4"
          >
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                if (isPremium) {
                  // TODO: Navigate to symptom tracking
                } else {
                  router.push('/paywall');
                }
              }}
            >
              <View
                className="rounded-2xl p-4 border"
                style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light }}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <Flame size={20} color="#8b5cf6" />
                    <Text
                      style={{ fontFamily: 'Quicksand_500Medium', color: theme.text.primary }}
                      className="text-sm ml-3"
                    >
                      Track Today's Symptoms
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    {!isPremium && (
                      <View className="px-2 py-1 rounded-full mr-2" style={{ backgroundColor: 'rgba(249, 168, 212, 0.2)' }}>
                        <Crown size={12} color="#f9a8d4" />
                      </View>
                    )}
                    <ChevronRight size={18} color={theme.text.tertiary} />
                  </View>
                </View>

                {/* Common symptom pills */}
                <View className="flex-row flex-wrap mt-3" style={{ gap: 8 }}>
                  {menopauseSymptoms.slice(0, 5).map((symptom) => (
                    <View
                      key={symptom.id}
                      className="flex-row items-center px-3 py-1.5 rounded-full"
                      style={{ backgroundColor: `${stageTheme.color}15` }}
                    >
                      <Text className="text-sm mr-1">{symptom.emoji}</Text>
                      <Text
                        style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.secondary }}
                        className="text-xs"
                      >
                        {symptom.name}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </Pressable>
          </Animated.View>

          {/* Health Focus Areas */}
          <Animated.View
            entering={FadeInUp.delay(550).duration(600)}
            className="mx-6 mt-6"
          >
            <Text
              style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
              className="text-base mb-3"
            >
              Focus Areas for Menopause
            </Text>
            <View className="flex-row flex-wrap" style={{ gap: 10 }}>
              {[
                { emoji: '💪', label: 'Bone Health' },
                { emoji: '❤️', label: 'Heart Health' },
                { emoji: '🧠', label: 'Brain Health' },
                { emoji: '😴', label: 'Sleep Quality' },
              ].map((item) => (
                <View
                  key={item.label}
                  className="flex-row items-center px-4 py-3 rounded-2xl border"
                  style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light }}
                >
                  <Text className="text-lg mr-2">{item.emoji}</Text>
                  <Text
                    style={{ fontFamily: 'Quicksand_500Medium', color: theme.text.primary }}
                    className="text-sm"
                  >
                    {item.label}
                  </Text>
                </View>
              ))}
            </View>
          </Animated.View>

          {/* Educational Card */}
          <Animated.View
            entering={FadeInUp.delay(650).duration(600)}
            className="mx-6 mt-6"
          >
            <View
              className="rounded-2xl p-5 border"
              style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light }}
            >
              <Text
                style={{ fontFamily: 'Quicksand_600SemiBold', color: stageTheme.color }}
                className="text-xs uppercase tracking-wider mb-3"
              >
                Your body's wisdom
              </Text>
              <Text
                style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.secondary }}
                className="text-sm leading-5"
              >
                After menopause, your body finds a new hormonal balance. While estrogen levels are lower, your body adapts. Focus on strength training, calcium-rich foods, and heart-healthy habits to thrive.
              </Text>
            </View>
          </Animated.View>
        </>
      );
    }
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
            <View className="flex-row items-center justify-between">
              <View>
                <Text
                  style={{ fontFamily: 'CormorantGaramond_400Regular', color: theme.text.muted }}
                  className="text-sm tracking-widest uppercase"
                >
                  {lifeStage === 'regular' ? 'Welcome back' : stageInfo.name}
                </Text>
                <Text
                  style={{ fontFamily: 'CormorantGaramond_600SemiBold', color: theme.text.primary }}
                  className="text-3xl mt-1"
                >
                  Luna Flow
                </Text>
              </View>
              <View className="flex-row items-center">
                {!isPremium && (
                  <Pressable
                    className="w-10 h-10 rounded-full items-center justify-center border mr-2"
                    style={{ backgroundColor: 'rgba(249, 168, 212, 0.1)', borderColor: 'rgba(249, 168, 212, 0.3)' }}
                    onPress={() => router.push('/paywall')}
                  >
                    <Crown size={18} color="#f9a8d4" />
                  </Pressable>
                )}
                <Pressable
                  className="w-10 h-10 rounded-full items-center justify-center border"
                  style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light }}
                  onPress={() => router.push('/settings')}
                >
                  <stageTheme.icon size={20} color={stageTheme.color} />
                </Pressable>
              </View>
            </View>
          </Animated.View>

          {/* Life Stage Specific Content */}
          {renderLifeStageContent()}

          {/* Quick Actions */}
          <Animated.View
            entering={FadeInUp.delay(700).duration(600)}
            className="mt-6 px-6"
          >
            <Text
              style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
              className="text-lg mb-4"
            >
              Today's Guidance
            </Text>

            <View className="flex-row" style={{ gap: 10 }}>
              {quickActions.map((action, index) => (
                <AnimatedPressable
                  key={action.label}
                  entering={FadeInUp.delay(750 + index * 80).duration(500)}
                  className="flex-1"
                  onPress={() => router.push(action.route as any)}
                >
                  <View
                    className="rounded-2xl p-4 border items-center"
                    style={{
                      backgroundColor: `${action.color}10`,
                      borderColor: `${action.color}30`,
                    }}
                  >
                    <View
                      className="w-11 h-11 rounded-full items-center justify-center mb-2"
                      style={{ backgroundColor: `${action.color}20` }}
                    >
                      <action.icon size={20} color={action.color} />
                    </View>
                    <Text
                      style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
                      className="text-xs"
                    >
                      {action.label}
                    </Text>
                  </View>
                </AnimatedPressable>
              ))}
            </View>
          </Animated.View>

          {/* Daily Affirmation */}
          <Animated.View
            entering={FadeInUp.delay(900).duration(600)}
            className="mx-6 mt-6"
          >
            <LinearGradient
              colors={[`${stageTheme.gradient[0]}30`, `${stageTheme.gradient[1]}20`]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ borderRadius: 20, padding: 20 }}
            >
              <Text
                className="text-xs uppercase tracking-widest mb-2"
                style={{ fontFamily: 'Quicksand_600SemiBold', color: stageTheme.color }}
              >
                Daily Affirmation
              </Text>
              <Text
                style={{ fontFamily: 'CormorantGaramond_400Regular', color: theme.text.primary }}
                className="text-xl leading-7"
              >
                {getAffirmation(lifeStage, currentPhase)}
              </Text>
            </LinearGradient>
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

function getAffirmation(lifeStage: string, phase: string): string {
  const affirmations: Record<string, Record<string, string>> = {
    regular: {
      menstrual: "I honor my body's need for rest and embrace this time of renewal.",
      follicular: "I am filled with creative energy and open to new possibilities.",
      ovulatory: "I radiate confidence and connect deeply with those around me.",
      luteal: "I trust my ability to complete what I've started and honor my need for solitude.",
    },
    perimenopause: {
      menstrual: "I embrace this transition with grace, trusting my body's wisdom.",
      follicular: "Change brings growth. I welcome each new day with curiosity.",
      ovulatory: "My experience and wisdom make me more powerful than ever.",
      luteal: "I am patient with myself as my body finds its new rhythm.",
    },
    menopause: {
      default: "I am entering a season of freedom and renewed purpose. My best years are ahead.",
    },
  };

  if (lifeStage === 'menopause') {
    return affirmations.menopause.default;
  }

  return affirmations[lifeStage]?.[phase] || affirmations.regular.follicular;
}

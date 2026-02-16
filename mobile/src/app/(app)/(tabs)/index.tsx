import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, Dimensions, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import { Moon, Sparkles, Heart, Calendar, ChevronRight, Apple, Dumbbell, Crown, Flame, Sun, Leaf, Info, MessageCircle, BarChart3 } from 'lucide-react-native';
import { CycleWheel } from '@/components/CycleWheel';
import { CycleGraph } from '@/components/CycleGraph';
import { MoonPhaseCard, moonCycleEducation } from '@/components/MoonPhaseCard';
import { useCycleStore, phaseInfo, lifeStageInfo, perimenopauseSymptoms, menopauseSymptoms, getMoonPhase, moonPhaseInfo, getMoonPhaseCycleEquivalent } from '@/lib/cycle-store';
import { useThemeStore, getTheme } from '@/lib/theme-store';
import { useSubscriptionStore } from '@/lib/subscription-store';
import { api } from '@/lib/api/api';
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

  // Sync cycle data to backend for partner feature
  useEffect(() => {
    if (!isReady || !hasCompletedOnboarding) return;
    const phase = getCurrentPhase();
    const currentMoon = getMoonPhase();
    const moonInfo = moonPhaseInfo[currentMoon];
    api.post('/api/partner/sync', {
      lifeStage,
      currentPhase: phase,
      dayOfCycle: lifeStage === 'regular' ? useCycleStore.getState().getDayOfCycle() : undefined,
      cycleLength: lifeStage === 'regular' ? useCycleStore.getState().cycleLength : undefined,
      moonPhase: lifeStage !== 'regular' ? moonInfo.name : undefined,
    }).catch(() => {
      // Silently fail - partner sync is not critical
    });
  }, [isReady, hasCompletedOnboarding, lifeStage]);

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
    {
      icon: BarChart3,
      label: 'Track',
      color: theme.accent.lavender,
      route: '/(tabs)/insights',
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
      const currentMoon = getMoonPhase();
      const moonInfo = moonPhaseInfo[currentMoon];
      const moonCyclePhase = getMoonPhaseCycleEquivalent(currentMoon);
      const moonCycleInfo = phaseInfo[moonCyclePhase];
      const moonPractices = moonCycleEducation.phases[currentMoon];

      return (
        <>
          {/* Moon Phase Card - Primary focus for perimenopause */}
          <View className="mx-6 mt-6">
            <MoonPhaseCard showEducation={true} />
          </View>

          {/* Moon-Based Guidance Banner */}
          <Animated.View
            entering={FadeInUp.delay(400).duration(600)}
            className="mx-6 mt-4"
          >
            <View
              className="rounded-2xl p-4 border"
              style={{ backgroundColor: `${moonInfo.color}10`, borderColor: `${moonInfo.color}30` }}
            >
              <View className="flex-row items-center mb-2">
                <Info size={16} color={stageTheme.color} />
                <Text
                  style={{ fontFamily: 'Quicksand_600SemiBold', color: stageTheme.color }}
                  className="text-xs uppercase tracking-wider ml-2"
                >
                  Why Follow the Moon?
                </Text>
              </View>
              <Text
                style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.secondary }}
                className="text-sm leading-5"
              >
                As your cycle becomes irregular during perimenopause, the moon offers a beautiful, natural rhythm to guide your wellness. The 29-day lunar cycle mirrors the menstrual cycle, helping you stay connected to nature's rhythms.
              </Text>
            </View>
          </Animated.View>

          {/* Today's Moon-Based Practices */}
          <Animated.View
            entering={FadeInUp.delay(500).duration(600)}
            className="mx-6 mt-4"
          >
            <View
              className="rounded-2xl p-5 border"
              style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light }}
            >
              <Text
                style={{ fontFamily: 'Quicksand_600SemiBold', color: moonCycleInfo.color }}
                className="text-xs uppercase tracking-wider mb-3"
              >
                {moonInfo.emoji} Today's Focus: {moonPractices.focus}
              </Text>
              <View style={{ gap: 10 }}>
                {moonPractices.practices.slice(0, 3).map((practice, index) => (
                  <View key={index} className="flex-row items-start">
                    <View
                      className="w-5 h-5 rounded-full items-center justify-center mr-3 mt-0.5"
                      style={{ backgroundColor: `${moonCycleInfo.color}20` }}
                    >
                      <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: moonCycleInfo.color, fontSize: 10 }}>
                        {index + 1}
                      </Text>
                    </View>
                    <Text
                      style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.secondary, flex: 1 }}
                      className="text-sm leading-5"
                    >
                      {practice}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </Animated.View>

          {/* Symptom Quick Track */}
          <Animated.View
            entering={FadeInUp.delay(600).duration(600)}
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
        </>
      );
    } else {
      // Menopause - Full moon phase guidance
      const currentMoon = getMoonPhase();
      const moonInfo = moonPhaseInfo[currentMoon];
      const moonCyclePhase = getMoonPhaseCycleEquivalent(currentMoon);
      const moonCycleInfo = phaseInfo[moonCyclePhase];
      const moonPractices = moonCycleEducation.phases[currentMoon];

      return (
        <>
          {/* Moon Phase Card - Primary focus for menopause */}
          <View className="mx-6 mt-6">
            <MoonPhaseCard showEducation={true} />
          </View>

          {/* Nature's Rhythm Explanation */}
          <Animated.View
            entering={FadeInUp.delay(400).duration(600)}
            className="mx-6 mt-4"
          >
            <LinearGradient
              colors={['rgba(139, 92, 246, 0.12)', 'rgba(196, 181, 253, 0.08)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ borderRadius: 20, padding: 16, borderWidth: 1, borderColor: 'rgba(139, 92, 246, 0.25)' }}
            >
              <View className="flex-row items-center mb-2">
                <Sparkles size={16} color="#8b5cf6" />
                <Text
                  style={{ fontFamily: 'Quicksand_600SemiBold', color: '#8b5cf6' }}
                  className="text-xs uppercase tracking-wider ml-2"
                >
                  Connect with Nature
                </Text>
              </View>
              <Text
                style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.secondary }}
                className="text-sm leading-5"
              >
                Without a menstrual cycle, the moon becomes your guide. Ancient wisdom and modern women alike have found peace in following the lunar rhythm - a 29-day cycle that mirrors the menstrual cycle and connects you to nature's eternal flow.
              </Text>
            </LinearGradient>
          </Animated.View>

          {/* Today's Moon-Based Practices */}
          <Animated.View
            entering={FadeInUp.delay(500).duration(600)}
            className="mx-6 mt-4"
          >
            <View
              className="rounded-2xl p-5 border"
              style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light }}
            >
              <Text
                style={{ fontFamily: 'Quicksand_600SemiBold', color: moonCycleInfo.color }}
                className="text-xs uppercase tracking-wider mb-3"
              >
                {moonInfo.emoji} Today's Focus: {moonPractices.focus}
              </Text>
              <View style={{ gap: 10 }}>
                {moonPractices.practices.map((practice, index) => (
                  <View key={index} className="flex-row items-start">
                    <View
                      className="w-5 h-5 rounded-full items-center justify-center mr-3 mt-0.5"
                      style={{ backgroundColor: `${moonCycleInfo.color}20` }}
                    >
                      <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: moonCycleInfo.color, fontSize: 10 }}>
                        {index + 1}
                      </Text>
                    </View>
                    <Text
                      style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.secondary, flex: 1 }}
                      className="text-sm leading-5"
                    >
                      {practice}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </Animated.View>

          {/* Health Focus Areas */}
          <Animated.View
            entering={FadeInUp.delay(600).duration(600)}
            className="mx-6 mt-4"
          >
            <Text
              style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
              className="text-base mb-3"
            >
              Menopause Wellness Focus
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

          {/* Symptom Quick Track */}
          <Animated.View
            entering={FadeInUp.delay(700).duration(600)}
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
          contentContainerStyle={{ paddingBottom: 140 }}
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
                {/* Luna AI Button */}
                <Pressable
                  className="w-10 h-10 rounded-full items-center justify-center border mr-2"
                  style={{ backgroundColor: `${stageTheme.color}15`, borderColor: `${stageTheme.color}30` }}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push('/luna-ai');
                  }}
                >
                  <Sparkles size={18} color={stageTheme.color} />
                </Pressable>
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

          {/* Luna AI Assistant */}
          <Animated.View
            entering={FadeInUp.delay(800).duration(600)}
            className="mx-6 mt-6"
          >
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/luna-ai');
              }}
            >
              <LinearGradient
                colors={[`${stageTheme.color}20`, `${stageTheme.color}10`]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ borderRadius: 20, padding: 16, borderWidth: 1, borderColor: `${stageTheme.color}30` }}
              >
                <View className="flex-row items-center">
                  <View
                    className="w-12 h-12 rounded-full items-center justify-center mr-4"
                    style={{ backgroundColor: `${stageTheme.color}25` }}
                  >
                    <Sparkles size={22} color={stageTheme.color} />
                  </View>
                  <View className="flex-1">
                    <Text
                      style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
                      className="text-base"
                    >
                      Ask Luna AI
                    </Text>
                    <Text
                      style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.tertiary }}
                      className="text-xs mt-0.5"
                    >
                      Get personalized wellness advice
                    </Text>
                  </View>
                  <View
                    className="w-8 h-8 rounded-full items-center justify-center"
                    style={{ backgroundColor: `${stageTheme.color}20` }}
                  >
                    <MessageCircle size={16} color={stageTheme.color} />
                  </View>
                </View>
              </LinearGradient>
            </Pressable>
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

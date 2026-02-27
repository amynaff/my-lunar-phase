import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, Dimensions, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeIn,
} from 'react-native-reanimated';
import { Moon, Sparkles, Heart, Calendar, ChevronRight, Apple, Dumbbell, Crown, MessageCircle, Settings, Droplets } from 'lucide-react-native';
import { CycleWheel } from '@/components/CycleWheel';
import { CycleGraph } from '@/components/CycleGraph';
import { CycleCalendar, CycleDotIndicator } from '@/components/CycleCalendar';
import { CycleStatsCard } from '@/components/CycleStatsCard';
import { CycleInsightsCard } from '@/components/CycleInsightsCard';
import { LogPeriodModal, QuickLogPeriodButton } from '@/components/LogPeriodModal';
import { EditPeriodDatesModal } from '@/components/EditPeriodDatesModal';
import { SymptomLogModal } from '@/components/SymptomLogModal';
import { SymptomInsightsCard } from '@/components/SymptomInsightsCard';
import { useCycleStore, phaseInfo, getMoonPhase, moonPhaseInfo, CyclePhase } from '@/lib/cycle-store';
import { useThemeStore, getTheme } from '@/lib/theme-store';
import { useSubscriptionStore } from '@/lib/subscription-store';
import { api } from '@/lib/api/api';
import { router } from 'expo-router';
import { useSession } from '@/lib/auth/use-session';
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

// Phase-specific affirmations
const getAffirmation = (phase: CyclePhase): string => {
  const affirmations: Record<CyclePhase, string> = {
    menstrual: "I honor my body's need for rest and embrace this time of renewal.",
    follicular: "I am filled with creative energy and open to new possibilities.",
    ovulatory: "I radiate confidence and connect deeply with those around me.",
    luteal: "I trust my ability to complete what I've started and honor my need for solitude.",
  };
  return affirmations[phase] || affirmations.follicular;
};

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const getCurrentPhase = useCycleStore(s => s.getCurrentPhase);
  const getDaysUntilNextPeriod = useCycleStore(s => s.getDaysUntilNextPeriod);
  const getDayOfCycle = useCycleStore(s => s.getDayOfCycle);
  const hasCompletedOnboarding = useCycleStore(s => s.hasCompletedOnboarding);
  const storedLifeStage = useCycleStore(s => s.lifeStage);
  const themeMode = useThemeStore(s => s.mode);
  const theme = getTheme(themeMode);
  const tier = useSubscriptionStore(s => s.tier);
  const isPremium = tier === 'premium';
  const [isReady, setIsReady] = useState(false);
  const { data: session, isLoading: sessionLoading } = useSession();

  const [showLogPeriodModal, setShowLogPeriodModal] = useState(false);
  const [showCalendarView, setShowCalendarView] = useState(false);
  const [showEditPeriodDates, setShowEditPeriodDates] = useState(false);
  const [showSymptomLogModal, setShowSymptomLogModal] = useState(false);

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
    if (isReady && !sessionLoading && session?.user && !hasCompletedOnboarding) {
      router.replace('/onboarding');
    }
  }, [hasCompletedOnboarding, isReady, session, sessionLoading]);

  // Sync cycle data to backend for partner feature
  useEffect(() => {
    if (!isReady || !hasCompletedOnboarding) return;
    const phase = getCurrentPhase();
    const currentMoon = getMoonPhase();
    const moonInfo = moonPhaseInfo[currentMoon];
    api.post('/api/partner/sync', {
      lifeStage: storedLifeStage,
      currentPhase: phase,
      dayOfCycle: useCycleStore.getState().getDayOfCycle(),
      cycleLength: useCycleStore.getState().cycleLength,
      moonPhase: moonInfo.name,
    }).catch(() => {
      // Silently fail - partner sync is not critical
    });
  }, [isReady, hasCompletedOnboarding, storedLifeStage]);

  if (!fontsLoaded || !isReady) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.bg.primary, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={theme.accent.pink} />
      </View>
    );
  }

  const currentPhase = getCurrentPhase();
  const currentMoon = getMoonPhase();
  const moonInfo = moonPhaseInfo[currentMoon];
  const info = phaseInfo[currentPhase];
  const daysUntilPeriod = getDaysUntilNextPeriod();
  const dayOfCycle = getDayOfCycle();

  const quickActions = [
    {
      icon: Apple,
      label: 'Nourish',
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
            <View className="flex-row items-center justify-between mb-4">
              <View>
                <Text
                  style={{ fontFamily: 'CormorantGaramond_400Regular', color: theme.text.muted }}
                  className="text-sm tracking-widest uppercase"
                >
                  Your monthly rhythm
                </Text>
                <Text
                  style={{ fontFamily: 'CormorantGaramond_600SemiBold', color: theme.text.primary }}
                  className="text-3xl mt-1"
                >
                  Menstrual Cycle
                </Text>
              </View>
              <View className="flex-row items-center">
                {/* Luna AI Button */}
                <Pressable
                  className="w-9 h-9 rounded-full items-center justify-center border mr-2"
                  style={{ backgroundColor: `${theme.accent.purple}15`, borderColor: `${theme.accent.purple}30` }}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push('/luna-ai');
                  }}
                >
                  <Sparkles size={16} color={theme.accent.purple} />
                </Pressable>
                {!isPremium && (
                  <Pressable
                    className="w-9 h-9 rounded-full items-center justify-center border mr-2"
                    style={{ backgroundColor: 'rgba(249, 168, 212, 0.1)', borderColor: 'rgba(249, 168, 212, 0.3)' }}
                    onPress={() => router.push('/paywall')}
                  >
                    <Crown size={16} color="#f9a8d4" />
                  </Pressable>
                )}
                <Pressable
                  className="w-9 h-9 rounded-full items-center justify-center border"
                  style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light }}
                  onPress={() => router.push('/(app)/settings')}
                >
                  <Settings size={18} color={theme.accent.purple} />
                </Pressable>
              </View>
            </View>
          </Animated.View>

          {/* Cycle Wheel */}
          <Animated.View
            entering={FadeInUp.delay(200).duration(800)}
            className="items-center mt-2"
          >
            <CycleWheel />
          </Animated.View>

          {/* Log Period Button */}
          <Animated.View
            entering={FadeInUp.delay(300).duration(600)}
            className="mx-6 mt-4"
          >
            <QuickLogPeriodButton
              themeMode={themeMode}
              onPress={() => setShowLogPeriodModal(true)}
            />
          </Animated.View>

          {/* Cycle Progress Dots */}
          <Animated.View
            entering={FadeInUp.delay(350).duration(600)}
            className="mx-6 mt-2"
          >
            <CycleDotIndicator themeMode={themeMode} />
          </Animated.View>

          {/* Phase Info Card */}
          <Animated.View
            entering={FadeInUp.delay(400).duration(600)}
            className="mx-6 mt-4"
          >
            <View
              className="rounded-3xl p-5 border"
              style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light }}
            >
              <View className="flex-row items-center mb-3">
                <View
                  className="w-10 h-10 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: `${info.color}20` }}
                >
                  <Text className="text-xl">{info.emoji}</Text>
                </View>
                <View className="flex-1">
                  <Text
                    style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
                    className="text-base"
                  >
                    {info.name} Phase
                  </Text>
                  <Text
                    style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.tertiary }}
                    className="text-xs"
                  >
                    Day {dayOfCycle} · {info.energy}
                  </Text>
                </View>
                {/* Moon phase indicator */}
                <View
                  className="items-center px-3 py-1.5 rounded-full"
                  style={{ backgroundColor: `${moonInfo.color}15` }}
                >
                  <Text className="text-sm">{moonInfo.emoji}</Text>
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
            entering={FadeInUp.delay(450).duration(600)}
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

          {/* Fertility & Ovulation Insight */}
          {(currentPhase === 'follicular' || currentPhase === 'ovulatory') && (
            <Animated.View
              entering={FadeInUp.delay(500).duration(600)}
              className="mx-6 mt-4"
            >
              <View
                className="rounded-2xl p-4 border"
                style={{ backgroundColor: `${theme.accent.purple}10`, borderColor: `${theme.accent.purple}30` }}
              >
                <View className="flex-row items-center">
                  <Droplets size={18} color={theme.accent.purple} />
                  <Text
                    style={{ fontFamily: 'Quicksand_500Medium', color: theme.text.primary }}
                    className="text-sm ml-3 flex-1"
                  >
                    {currentPhase === 'ovulatory'
                      ? 'Fertile window - Peak fertility days'
                      : 'Approaching fertile window'
                    }
                  </Text>
                  <View
                    className="px-2 py-1 rounded-full"
                    style={{ backgroundColor: `${theme.accent.purple}20` }}
                  >
                    <Text
                      style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.accent.purple }}
                      className="text-xs"
                    >
                      {currentPhase === 'ovulatory' ? 'High' : 'Medium'}
                    </Text>
                  </View>
                </View>
              </View>
            </Animated.View>
          )}

          {/* My Cycles - Insights Card */}
          <Animated.View
            entering={FadeInUp.delay(520).duration(600)}
            className="mx-6 mt-4"
          >
            <CycleInsightsCard
              themeMode={themeMode}
              onEditPeriodDates={() => setShowEditPeriodDates(true)}
              onCheckSymptoms={() => router.push('/luna-ai')}
            />
          </Animated.View>

          {/* Symptom Tracking Card */}
          <Animated.View
            entering={FadeInUp.delay(530).duration(600)}
            className="mx-6 mt-4"
          >
            <SymptomInsightsCard
              themeMode={themeMode}
              onLogSymptoms={() => setShowSymptomLogModal(true)}
            />
          </Animated.View>

          {/* Calendar Toggle */}
          <Animated.View
            entering={FadeInUp.delay(540).duration(600)}
            className="mx-6 mt-4"
          >
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowCalendarView(!showCalendarView);
              }}
              className="flex-row items-center justify-between rounded-2xl p-4 border"
              style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light }}
            >
              <View className="flex-row items-center">
                <Calendar size={18} color={theme.accent.purple} />
                <Text
                  style={{ fontFamily: 'Quicksand_500Medium', color: theme.text.primary }}
                  className="text-sm ml-3"
                >
                  {showCalendarView ? 'Hide Calendar' : 'View Calendar'}
                </Text>
              </View>
              <ChevronRight
                size={18}
                color={theme.text.tertiary}
                style={{ transform: [{ rotate: showCalendarView ? '90deg' : '0deg' }] }}
              />
            </Pressable>
          </Animated.View>

          {/* Calendar View */}
          {showCalendarView && (
            <Animated.View
              entering={FadeIn.duration(300)}
              className="mx-6 mt-4"
            >
              <CycleCalendar
                themeMode={themeMode}
                onDayPress={(date) => {
                  if (date <= new Date()) {
                    setShowLogPeriodModal(true);
                  }
                }}
              />
            </Animated.View>
          )}

          {/* Cycle Graph - Educational */}
          <Animated.View
            entering={FadeInUp.delay(560).duration(600)}
            className="mx-6 mt-6"
          >
            <CycleGraph />
          </Animated.View>

          {/* Quick Actions */}
          <Animated.View
            entering={FadeInUp.delay(600).duration(600)}
            className="mt-6 px-6"
          >
            <Text
              style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
              className="text-lg mb-4"
            >
              Today's Guidance
            </Text>

            <View className="flex-row justify-between">
              {quickActions.map((action, index) => (
                <AnimatedPressable
                  key={action.label}
                  entering={FadeInUp.delay(650 + index * 80).duration(500)}
                  style={{ flex: 1, marginHorizontal: index === 1 ? 8 : 0 }}
                  onPress={() => router.push(action.route as any)}
                >
                  <View
                    className="rounded-2xl p-4 border items-center justify-center"
                    style={{
                      backgroundColor: `${action.color}10`,
                      borderColor: `${action.color}30`,
                      height: 100,
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
            entering={FadeInUp.delay(700).duration(600)}
            className="mx-6 mt-6"
          >
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/luna-ai');
              }}
            >
              <LinearGradient
                colors={[`${theme.accent.purple}20`, `${theme.accent.purple}10`]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ borderRadius: 20, padding: 16, borderWidth: 1, borderColor: `${theme.accent.purple}30` }}
              >
                <View className="flex-row items-center">
                  <View
                    className="w-10 h-10 rounded-full items-center justify-center mr-3"
                    style={{ backgroundColor: `${theme.accent.purple}25` }}
                  >
                    <Sparkles size={18} color={theme.accent.purple} />
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
                      Get personalized cycle advice
                    </Text>
                  </View>
                  <View
                    className="w-8 h-8 rounded-full items-center justify-center"
                    style={{ backgroundColor: `${theme.accent.purple}20` }}
                  >
                    <MessageCircle size={16} color={theme.accent.purple} />
                  </View>
                </View>
              </LinearGradient>
            </Pressable>
          </Animated.View>

          {/* Daily Affirmation */}
          <Animated.View
            entering={FadeInUp.delay(800).duration(600)}
            className="mx-6 mt-6"
          >
            <LinearGradient
              colors={['rgba(249, 168, 212, 0.3)', 'rgba(196, 181, 253, 0.2)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ borderRadius: 20, padding: 20 }}
            >
              <View className="flex-row items-center mb-3">
                <Moon size={14} color={theme.accent.purple} />
                <Text
                  className="text-xs uppercase tracking-widest ml-2"
                  style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.accent.purple }}
                >
                  Daily Affirmation
                </Text>
              </View>
              <Text
                style={{ fontFamily: 'CormorantGaramond_400Regular', color: theme.text.primary }}
                className="text-xl leading-7"
              >
                {getAffirmation(currentPhase)}
              </Text>
            </LinearGradient>
          </Animated.View>
        </ScrollView>
      </LinearGradient>

      {/* Log Period Modal */}
      <LogPeriodModal
        visible={showLogPeriodModal}
        onClose={() => setShowLogPeriodModal(false)}
        themeMode={themeMode}
      />

      {/* Edit Period Dates Modal */}
      <EditPeriodDatesModal
        visible={showEditPeriodDates}
        onClose={() => setShowEditPeriodDates(false)}
        themeMode={themeMode}
      />

      {/* Symptom Log Modal */}
      <SymptomLogModal
        visible={showSymptomLogModal}
        onClose={() => setShowSymptomLogModal(false)}
      />
    </View>
  );
}

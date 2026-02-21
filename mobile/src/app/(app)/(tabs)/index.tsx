import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, Dimensions, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeIn,
  SlideInRight,
  Layout,
} from 'react-native-reanimated';
import { Moon, Sparkles, Heart, Calendar, ChevronRight, Apple, Dumbbell, Crown, Flame, Sun, Leaf, Info, MessageCircle, Star, Settings, Droplets, ThermometerSun, Brain, BedDouble, Bone, HeartPulse, Zap, TrendingUp } from 'lucide-react-native';
import { CycleWheel } from '@/components/CycleWheel';
import { CycleGraph } from '@/components/CycleGraph';
import { MoonPhaseCard, moonCycleEducation } from '@/components/MoonPhaseCard';
import { LifeStageTabNav, lifeStageTabConfig } from '@/components/LifeStageTabNav';
import { CycleCalendar, CycleDotIndicator } from '@/components/CycleCalendar';
import { CycleStatsCard, CycleStatsMini } from '@/components/CycleStatsCard';
import { LogPeriodModal, QuickLogPeriodButton } from '@/components/LogPeriodModal';
import { useCycleStore, phaseInfo, lifeStageInfo, perimenopauseSymptoms, menopauseSymptoms, postmenopauseSymptoms, getMoonPhase, moonPhaseInfo, getMoonPhaseCycleEquivalent, LifeStage, CyclePhase } from '@/lib/cycle-store';
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

// Tab-specific titles and descriptions
const tabInfo: Record<LifeStage, { title: string; subtitle: string }> = {
  regular: {
    title: 'Menstrual Cycle',
    subtitle: 'Your monthly rhythm',
  },
  perimenopause: {
    title: 'Perimenopause',
    subtitle: 'Embracing the transition',
  },
  menopause: {
    title: 'Menopause',
    subtitle: 'Your second spring',
  },
  postmenopause: {
    title: 'Postmenopause',
    subtitle: 'Your wisdom years',
  },
};

// Phase-specific affirmations with moon phase variations
const getAffirmation = (lifeStage: LifeStage, phase: CyclePhase, moonPhase?: string): string => {
  const affirmations: Record<LifeStage, Record<string, string>> = {
    regular: {
      menstrual: "I honor my body's need for rest and embrace this time of renewal.",
      follicular: "I am filled with creative energy and open to new possibilities.",
      ovulatory: "I radiate confidence and connect deeply with those around me.",
      luteal: "I trust my ability to complete what I've started and honor my need for solitude.",
    },
    perimenopause: {
      new_moon: "I embrace this transition with grace, welcoming each new beginning.",
      waxing_crescent: "Change brings growth. I nurture my evolving self with patience.",
      first_quarter: "My experience guides me forward with strength and clarity.",
      waxing_gibbous: "I trust my body's wisdom as it finds its new rhythm.",
      full_moon: "My inner light shines brightest in this season of transformation.",
      waning_gibbous: "I release what no longer serves me and embrace what does.",
      last_quarter: "I am grateful for this journey of becoming.",
      waning_crescent: "I rest in the knowledge that I am exactly where I need to be.",
      default: "I embrace this transition with grace, trusting my body's wisdom.",
    },
    menopause: {
      new_moon: "I enter this new chapter with openness and curiosity.",
      waxing_crescent: "My wisdom grows with each passing day.",
      first_quarter: "I am free to create the life I truly desire.",
      waxing_gibbous: "My clarity and purpose illuminate my path forward.",
      full_moon: "I celebrate the fullness of who I am becoming.",
      waning_gibbous: "I share my wisdom freely and receive with gratitude.",
      last_quarter: "I release old patterns and welcome new possibilities.",
      waning_crescent: "In stillness, I discover my deepest truths.",
      default: "I am entering a season of freedom and renewed purpose. My best years are ahead.",
    },
    postmenopause: {
      new_moon: "Each day is a canvas for my wisdom and creativity.",
      waxing_crescent: "I continue to grow, learn, and bloom.",
      first_quarter: "My confidence and clarity guide every decision.",
      waxing_gibbous: "I embrace vitality and vibrant living.",
      full_moon: "I am radiant in my wisdom and my power.",
      waning_gibbous: "I mentor and inspire those around me.",
      last_quarter: "I honor my journey and all it has taught me.",
      waning_crescent: "In peace and presence, I find my greatest strength.",
      default: "I embrace my wisdom years with joy. My clarity, confidence, and purpose shine brighter than ever.",
    },
  };

  if (lifeStage === 'regular') {
    return affirmations.regular[phase] || affirmations.regular.follicular;
  }

  if (moonPhase && affirmations[lifeStage][moonPhase]) {
    return affirmations[lifeStage][moonPhase];
  }

  return affirmations[lifeStage].default;
};

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const getCurrentPhase = useCycleStore(s => s.getCurrentPhase);
  const getDaysUntilNextPeriod = useCycleStore(s => s.getDaysUntilNextPeriod);
  const getDayOfCycle = useCycleStore(s => s.getDayOfCycle);
  const hasCompletedOnboarding = useCycleStore(s => s.hasCompletedOnboarding);
  const storedLifeStage = useCycleStore(s => s.lifeStage);
  const setLifeStage = useCycleStore(s => s.setLifeStage);
  const themeMode = useThemeStore(s => s.mode);
  const theme = getTheme(themeMode);
  const tier = useSubscriptionStore(s => s.tier);
  const isPremium = tier === 'premium';
  const [isReady, setIsReady] = useState(false);
  const { data: session, isLoading: sessionLoading } = useSession();

  // Active tab for viewing (can differ from stored life stage for exploration)
  const [activeTab, setActiveTab] = useState<LifeStage>(storedLifeStage);
  const [isExploring, setIsExploring] = useState(false);
  const [showLogPeriodModal, setShowLogPeriodModal] = useState(false);
  const [showCalendarView, setShowCalendarView] = useState(false);

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
      dayOfCycle: storedLifeStage === 'regular' ? useCycleStore.getState().getDayOfCycle() : undefined,
      cycleLength: storedLifeStage === 'regular' ? useCycleStore.getState().cycleLength : undefined,
      moonPhase: storedLifeStage !== 'regular' ? moonInfo.name : undefined,
    }).catch(() => {
      // Silently fail - partner sync is not critical
    });
  }, [isReady, hasCompletedOnboarding, storedLifeStage]);

  // Reset active tab when stored life stage changes
  useEffect(() => {
    setActiveTab(storedLifeStage);
    setIsExploring(false);
  }, [storedLifeStage]);

  const handleTabChange = useCallback((newStage: LifeStage) => {
    setActiveTab(newStage);
    setIsExploring(newStage !== storedLifeStage);
  }, [storedLifeStage]);

  const handleSwitchToStage = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setLifeStage(activeTab);
    setIsExploring(false);
    router.push('/onboarding');
  }, [activeTab, setLifeStage]);

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
  const stageInfo = lifeStageInfo[activeTab];
  const daysUntilPeriod = getDaysUntilNextPeriod();
  const dayOfCycle = getDayOfCycle();

  // Get theme colors based on active tab
  const getTabTheme = (stage: LifeStage) => {
    const tabConfig = lifeStageTabConfig.find(t => t.key === stage);
    return {
      color: tabConfig?.color || theme.accent.purple,
      gradient: tabConfig?.gradient || ['#f9a8d4', '#c4b5fd'] as [string, string],
      icon: tabConfig?.icon || Moon,
    };
  };

  const activeTabTheme = getTabTheme(activeTab);

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

  // Render content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'regular':
        return renderMenstrualCycleContent();
      case 'perimenopause':
        return renderPerimenopauseContent();
      case 'menopause':
        return renderMenopauseContent();
      case 'postmenopause':
        return renderPostmenopauseContent();
      default:
        return null;
    }
  };

  // Menstrual Cycle Content (Regular)
  const renderMenstrualCycleContent = () => {
    const moonCyclePhase = getMoonPhaseCycleEquivalent(currentMoon);
    const moonCycleInfo = phaseInfo[moonCyclePhase];
    const getCycleStats = useCycleStore.getState().getCycleStats;
    const stats = getCycleStats();

    return (
      <>
        {/* Cycle Wheel */}
        <Animated.View
          entering={FadeInUp.delay(300).duration(800)}
          className="items-center mt-6"
        >
          <CycleWheel />
        </Animated.View>

        {/* Log Period Button */}
        <Animated.View
          entering={FadeInUp.delay(400).duration(600)}
          className="mx-6 mt-4"
        >
          <QuickLogPeriodButton
            themeMode={themeMode}
            onPress={() => setShowLogPeriodModal(true)}
          />
        </Animated.View>

        {/* Cycle Progress Dots */}
        <Animated.View
          entering={FadeInUp.delay(450).duration(600)}
          className="mx-6 mt-2"
        >
          <CycleDotIndicator themeMode={themeMode} />
        </Animated.View>

        {/* Phase Info Card */}
        <Animated.View
          entering={FadeInUp.delay(500).duration(600)}
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

        {/* Fertility & Ovulation Insight */}
        {(currentPhase === 'follicular' || currentPhase === 'ovulatory') && (
          <Animated.View
            entering={FadeInUp.delay(600).duration(600)}
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

        {/* Cycle Stats Card */}
        <Animated.View
          entering={FadeInUp.delay(620).duration(600)}
          className="mx-6 mt-4"
        >
          <CycleStatsCard
            themeMode={themeMode}
            onViewHistory={() => router.push('/cycle-history')}
            onCheckSymptoms={() => router.push('/luna-ai')}
          />
        </Animated.View>

        {/* Calendar Toggle */}
        <Animated.View
          entering={FadeInUp.delay(640).duration(600)}
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
          entering={FadeInUp.delay(650).duration(600)}
          className="mx-6 mt-6"
        >
          <CycleGraph />
        </Animated.View>
      </>
    );
  };

  // Perimenopause Content
  const renderPerimenopauseContent = () => {
    const moonCyclePhase = getMoonPhaseCycleEquivalent(currentMoon);
    const moonCycleInfo = phaseInfo[moonCyclePhase];
    const moonPractices = moonCycleEducation.phases[currentMoon];

    return (
      <>
        {/* Moon Phase Card - Primary focus for perimenopause */}
        <Animated.View
          entering={FadeInUp.delay(300).duration(600)}
          className="mx-6 mt-6"
        >
          <MoonPhaseCard showEducation={true} />
        </Animated.View>

        {/* Moon-Based Guidance Banner */}
        <Animated.View
          entering={FadeInUp.delay(400).duration(600)}
          className="mx-6 mt-4"
        >
          <View
            className="rounded-2xl p-4 border"
            style={{ backgroundColor: `${moonInfo.color}10`, borderColor: `${activeTabTheme.color}30` }}
          >
            <View className="flex-row items-center mb-2">
              <Info size={16} color={activeTabTheme.color} />
              <Text
                style={{ fontFamily: 'Quicksand_600SemiBold', color: activeTabTheme.color }}
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

        {/* Transition Wellness Focus */}
        <Animated.View
          entering={FadeInUp.delay(450).duration(600)}
          className="mx-6 mt-4"
        >
          <Text
            style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
            className="text-base mb-3"
          >
            Transition Wellness Focus
          </Text>
          <View className="flex-row flex-wrap" style={{ gap: 10 }}>
            {[
              { icon: ThermometerSun, label: 'Hot Flashes', color: '#f59e0b' },
              { icon: BedDouble, label: 'Sleep', color: '#8b5cf6' },
              { icon: Brain, label: 'Brain Fog', color: '#ec4899' },
              { icon: HeartPulse, label: 'Mood', color: '#ef4444' },
            ].map((item) => (
              <View
                key={item.label}
                className="flex-row items-center px-4 py-3 rounded-2xl border"
                style={{ backgroundColor: `${item.color}10`, borderColor: `${item.color}25` }}
              >
                <item.icon size={16} color={item.color} style={{ marginRight: 8 }} />
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
                    style={{ backgroundColor: `${activeTabTheme.color}15` }}
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
  };

  // Menopause Content
  const renderMenopauseContent = () => {
    const moonCyclePhase = getMoonPhaseCycleEquivalent(currentMoon);
    const moonCycleInfo = phaseInfo[moonCyclePhase];
    const moonPractices = moonCycleEducation.phases[currentMoon];

    return (
      <>
        {/* Moon Phase Card - Primary focus for menopause */}
        <Animated.View
          entering={FadeInUp.delay(300).duration(600)}
          className="mx-6 mt-6"
        >
          <MoonPhaseCard showEducation={true} />
        </Animated.View>

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
                Your Second Spring
              </Text>
            </View>
            <Text
              style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.secondary }}
              className="text-sm leading-5"
            >
              Without a menstrual cycle, the moon becomes your guide. Ancient wisdom and modern women alike have found peace in following the lunar rhythm - a 29-day cycle that connects you to nature's eternal flow.
            </Text>
          </LinearGradient>
        </Animated.View>

        {/* Health Focus Areas */}
        <Animated.View
          entering={FadeInUp.delay(450).duration(600)}
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
              { icon: Bone, label: 'Bone Health', color: '#8b5cf6' },
              { icon: HeartPulse, label: 'Heart Health', color: '#ef4444' },
              { icon: Brain, label: 'Brain Health', color: '#ec4899' },
              { icon: BedDouble, label: 'Sleep Quality', color: '#6366f1' },
            ].map((item) => (
              <View
                key={item.label}
                className="flex-row items-center px-4 py-3 rounded-2xl border"
                style={{ backgroundColor: `${item.color}10`, borderColor: `${item.color}25` }}
              >
                <item.icon size={16} color={item.color} style={{ marginRight: 8 }} />
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
                    style={{ backgroundColor: `${activeTabTheme.color}15` }}
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
  };

  // Postmenopause Content
  const renderPostmenopauseContent = () => {
    const moonCyclePhase = getMoonPhaseCycleEquivalent(currentMoon);
    const moonCycleInfo = phaseInfo[moonCyclePhase];
    const moonPractices = moonCycleEducation.phases[currentMoon];

    return (
      <>
        {/* Moon Phase Card */}
        <Animated.View
          entering={FadeInUp.delay(300).duration(600)}
          className="mx-6 mt-6"
        >
          <MoonPhaseCard showEducation={true} />
        </Animated.View>

        {/* Wisdom Years Welcome */}
        <Animated.View
          entering={FadeInUp.delay(400).duration(600)}
          className="mx-6 mt-4"
        >
          <LinearGradient
            colors={['rgba(236, 72, 153, 0.12)', 'rgba(249, 168, 212, 0.08)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ borderRadius: 20, padding: 16, borderWidth: 1, borderColor: 'rgba(236, 72, 153, 0.25)' }}
          >
            <View className="flex-row items-center mb-2">
              <Star size={16} color="#ec4899" />
              <Text
                style={{ fontFamily: 'Quicksand_600SemiBold', color: '#ec4899' }}
                className="text-xs uppercase tracking-wider ml-2"
              >
                Your Wisdom Years
              </Text>
            </View>
            <Text
              style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.secondary }}
              className="text-sm leading-5"
            >
              This is a time of clarity, confidence, and renewed purpose. Your body has found its new rhythm. The moon guides your wellness journey, connecting you to nature's timeless cycles and your own inner wisdom.
            </Text>
          </LinearGradient>
        </Animated.View>

        {/* Wellness Focus Areas */}
        <Animated.View
          entering={FadeInUp.delay(450).duration(600)}
          className="mx-6 mt-4"
        >
          <Text
            style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
            className="text-base mb-3"
          >
            Postmenopause Wellness
          </Text>
          <View className="flex-row flex-wrap" style={{ gap: 10 }}>
            {[
              { icon: Bone, label: 'Bone Strength', color: '#ec4899' },
              { icon: HeartPulse, label: 'Heart Health', color: '#ef4444' },
              { icon: Brain, label: 'Mental Clarity', color: '#8b5cf6' },
              { icon: Zap, label: 'Vitality', color: '#f59e0b' },
            ].map((item) => (
              <View
                key={item.label}
                className="flex-row items-center px-4 py-3 rounded-2xl border"
                style={{ backgroundColor: `${item.color}10`, borderColor: `${item.color}25` }}
              >
                <item.icon size={16} color={item.color} style={{ marginRight: 8 }} />
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

        {/* Track Wellness */}
        <Animated.View
          entering={FadeInUp.delay(600).duration(600)}
          className="mx-6 mt-4"
        >
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              if (isPremium) {
                // Navigate to symptom tracker
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
                  <Flame size={20} color="#ec4899" />
                  <Text
                    style={{ fontFamily: 'Quicksand_500Medium', color: theme.text.primary }}
                    className="text-sm ml-3"
                  >
                    Track Your Wellness
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

              {/* Wellness tracking pills */}
              <View className="flex-row flex-wrap mt-3" style={{ gap: 8 }}>
                {postmenopauseSymptoms.slice(0, 5).map((symptom) => (
                  <View
                    key={symptom.id}
                    className="flex-row items-center px-3 py-1.5 rounded-full"
                    style={{ backgroundColor: `${activeTabTheme.color}15` }}
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
            <View className="flex-row items-center justify-between mb-4">
              <View>
                <Text
                  style={{ fontFamily: 'CormorantGaramond_400Regular', color: theme.text.muted }}
                  className="text-sm tracking-widest uppercase"
                >
                  {tabInfo[activeTab].subtitle}
                </Text>
                <Text
                  style={{ fontFamily: 'CormorantGaramond_600SemiBold', color: theme.text.primary }}
                  className="text-3xl mt-1"
                >
                  {tabInfo[activeTab].title}
                </Text>
              </View>
              <View className="flex-row items-center">
                {/* Luna AI Button */}
                <Pressable
                  className="w-9 h-9 rounded-full items-center justify-center border mr-2"
                  style={{ backgroundColor: `${activeTabTheme.color}15`, borderColor: `${activeTabTheme.color}30` }}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push('/luna-ai');
                  }}
                >
                  <Sparkles size={16} color={activeTabTheme.color} />
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
                  <Settings size={18} color={activeTabTheme.color} />
                </Pressable>
              </View>
            </View>
          </Animated.View>

          {/* Life Stage Tab Navigation */}
          <Animated.View
            entering={FadeInDown.delay(200).duration(600)}
          >
            <LifeStageTabNav
              activeStage={activeTab}
              onStageChange={handleTabChange}
              themeMode={themeMode}
            />
          </Animated.View>

          {/* Exploring Banner */}
          {isExploring && (
            <Animated.View
              entering={FadeIn.duration(300)}
              className="mx-6 mt-4"
            >
              <Pressable onPress={handleSwitchToStage}>
                <LinearGradient
                  colors={[`${activeTabTheme.color}20`, `${activeTabTheme.color}10`]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ borderRadius: 16, padding: 12, borderWidth: 1, borderColor: `${activeTabTheme.color}40` }}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1">
                      <Info size={16} color={activeTabTheme.color} />
                      <Text
                        style={{ fontFamily: 'Quicksand_500Medium', color: theme.text.primary }}
                        className="text-sm ml-2 flex-1"
                      >
                        Exploring {tabInfo[activeTab].title}
                      </Text>
                    </View>
                    <View
                      className="px-3 py-1.5 rounded-full"
                      style={{ backgroundColor: `${activeTabTheme.color}25` }}
                    >
                      <Text
                        style={{ fontFamily: 'Quicksand_600SemiBold', color: activeTabTheme.color }}
                        className="text-xs"
                      >
                        Switch to this stage
                      </Text>
                    </View>
                  </View>
                </LinearGradient>
              </Pressable>
            </Animated.View>
          )}

          {/* Tab-Specific Content */}
          {renderTabContent()}

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

            <View className="flex-row justify-between">
              {quickActions.map((action, index) => (
                <AnimatedPressable
                  key={action.label}
                  entering={FadeInUp.delay(750 + index * 80).duration(500)}
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
                colors={[`${activeTabTheme.color}20`, `${activeTabTheme.color}10`]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ borderRadius: 20, padding: 16, borderWidth: 1, borderColor: `${activeTabTheme.color}30` }}
              >
                <View className="flex-row items-center">
                  <View
                    className="w-10 h-10 rounded-full items-center justify-center mr-3"
                    style={{ backgroundColor: `${activeTabTheme.color}25` }}
                  >
                    <Sparkles size={18} color={activeTabTheme.color} />
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
                      Get personalized {activeTab === 'regular' ? 'cycle' : lifeStageInfo[activeTab].name.toLowerCase()} advice
                    </Text>
                  </View>
                  <View
                    className="w-8 h-8 rounded-full items-center justify-center"
                    style={{ backgroundColor: `${activeTabTheme.color}20` }}
                  >
                    <MessageCircle size={16} color={activeTabTheme.color} />
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
              colors={[`${activeTabTheme.gradient[0]}30`, `${activeTabTheme.gradient[1]}20`]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ borderRadius: 20, padding: 20 }}
            >
              <View className="flex-row items-center mb-3">
                <Moon size={14} color={activeTabTheme.color} />
                <Text
                  className="text-xs uppercase tracking-widest ml-2"
                  style={{ fontFamily: 'Quicksand_600SemiBold', color: activeTabTheme.color }}
                >
                  Daily Affirmation
                </Text>
              </View>
              <Text
                style={{ fontFamily: 'CormorantGaramond_400Regular', color: theme.text.primary }}
                className="text-xl leading-7"
              >
                {getAffirmation(activeTab, currentPhase, currentMoon)}
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
    </View>
  );
}

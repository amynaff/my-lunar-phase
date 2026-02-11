import React, { useCallback } from 'react';
import { View, Text, ScrollView, Pressable, RefreshControl, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import {
  ArrowLeft,
  Heart,
  Moon,
  Sun,
  Coffee,
  MessageCircleHeart,
  Gift,
  Sparkles,
  Clock,
  Users,
  Flame,
  Leaf,
  CloudRain,
  RefreshCw,
} from 'lucide-react-native';
import { useThemeStore, getTheme } from '@/lib/theme-store';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { api } from '@/lib/api/api';
import { useQuery } from '@tanstack/react-query';
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

// ---------- Types ----------

interface PartnerData {
  hasPartner: boolean;
  partnerName: string;
  isMainUser: boolean;
  sharedData: {
    lifeStage: 'regular' | 'perimenopause' | 'menopause';
    currentPhase: 'menstrual' | 'follicular' | 'ovulatory' | 'luteal';
    dayOfCycle: number | null;
    cycleLength: number | null;
    moonPhase: string | null;
    lastUpdated: string;
  } | null;
}

type CyclePhase = 'menstrual' | 'follicular' | 'ovulatory' | 'luteal';
type LifeStage = 'regular' | 'perimenopause' | 'menopause';

// ---------- Phase data ----------

const phaseDetails: Record<CyclePhase, {
  emoji: string;
  name: string;
  color: string;
  gradientColors: [string, string];
  feeling: string;
  tips: string[];
  icon: typeof Moon;
}> = {
  menstrual: {
    emoji: '\uD83C\uDF19',
    name: 'Menstrual Phase',
    color: '#e06287',
    gradientColors: ['rgba(224, 98, 135, 0.15)', 'rgba(224, 98, 135, 0.05)'],
    feeling: 'She may feel tired, introspective, and in need of comfort. Energy is low and emotions can be tender. This is her time to rest and restore.',
    tips: [
      'Bring her a warm cup of tea or hot chocolate',
      'Give her space and time to rest without guilt',
      'Offer a heating pad or warm blanket',
      'Be patient and gentle with mood changes',
      'Take on some extra household tasks',
    ],
    icon: Moon,
  },
  follicular: {
    emoji: '\uD83C\uDF1C',
    name: 'Follicular Phase',
    color: '#6dbb7a',
    gradientColors: ['rgba(109, 187, 122, 0.15)', 'rgba(109, 187, 122, 0.05)'],
    feeling: 'She is feeling renewed energy and optimism. Creativity is flowing and she is open to new experiences. This is a great time for adventures together.',
    tips: [
      'Plan a fun date or outing together',
      'Encourage and support her new ideas',
      'Be active together -- walk, hike, dance',
      'Try something new as a couple',
      'Celebrate her rising energy and spark',
    ],
    icon: Sparkles,
  },
  ovulatory: {
    emoji: '\uD83C\uDF15',
    name: 'Ovulatory Phase',
    color: '#f5a623',
    gradientColors: ['rgba(245, 166, 35, 0.15)', 'rgba(245, 166, 35, 0.05)'],
    feeling: 'She is at her most confident and social. Communication comes easily and she radiates warmth. This is peak connection time.',
    tips: [
      'Plan social outings with friends or family',
      'Have deep, meaningful conversations',
      'Be fully present when she talks to you',
      'Compliment her genuinely and often',
      'Enjoy quality time together',
    ],
    icon: Sun,
  },
  luteal: {
    emoji: '\uD83C\uDF18',
    name: 'Luteal Phase',
    color: '#9d84ed',
    gradientColors: ['rgba(157, 132, 237, 0.15)', 'rgba(157, 132, 237, 0.05)'],
    feeling: 'She may feel more sensitive, emotional, or withdrawn. PMS symptoms can affect her mood and comfort. Extra patience goes a long way right now.',
    tips: [
      'Be extra patient and gentle with her',
      'Do not take mood changes personally',
      'Offer her favorite comfort food or snack',
      'Give her space when she needs it',
      'Help with logistics and planning',
    ],
    icon: CloudRain,
  },
};

const perimenopauseTips = [
  'Understand that symptoms can be unpredictable',
  'Keep the house cool and offer cold water',
  'Be flexible with plans -- she may need to cancel',
  'Listen without trying to fix everything',
  'Encourage her to talk to her doctor',
];

const menopauseTips = [
  'Be understanding of hot flashes and sleep issues',
  'Support her wellness routines and self-care',
  'Celebrate this new chapter of life together',
  'Be patient with brain fog moments',
  'Plan calm, low-stress activities together',
];

// ---------- Quick actions ----------

interface QuickAction {
  label: string;
  emoji: string;
  color: string;
}

const quickActionsByPhase: Record<CyclePhase, QuickAction[]> = {
  menstrual: [
    { label: 'Bring warm tea', emoji: '\u2615', color: '#e06287' },
    { label: 'Run a bath', emoji: '\uD83D\uDEC1', color: '#c57bdb' },
    { label: 'Cozy movie night', emoji: '\uD83C\uDF7F', color: '#9d84ed' },
  ],
  follicular: [
    { label: 'Plan a date night', emoji: '\uD83C\uDF1F', color: '#6dbb7a' },
    { label: 'Cook together', emoji: '\uD83C\uDF73', color: '#f5a623' },
    { label: 'Go on a walk', emoji: '\uD83C\uDF3F', color: '#4ecdc4' },
  ],
  ovulatory: [
    { label: 'Write a love note', emoji: '\uD83D\uDC8C', color: '#f5a623' },
    { label: 'Plan a surprise', emoji: '\uD83C\uDF81', color: '#e06287' },
    { label: 'Dance together', emoji: '\uD83D\uDC83', color: '#9d84ed' },
  ],
  luteal: [
    { label: 'Get her fav snack', emoji: '\uD83C\uDF6B', color: '#9d84ed' },
    { label: 'Handle dinner', emoji: '\uD83C\uDF5D', color: '#e06287' },
    { label: 'Plan a cozy night', emoji: '\uD83D\uDE0C', color: '#6dbb7a' },
  ],
};

const menopauseQuickActions: QuickAction[] = [
  { label: 'Send a sweet text', emoji: '\uD83D\uDCF1', color: '#9d84ed' },
  { label: 'Bring her favorite snack', emoji: '\uD83C\uDF53', color: '#e06287' },
  { label: 'Plan a peaceful walk', emoji: '\uD83C\uDF3B', color: '#6dbb7a' },
];

// ---------- Helpers ----------

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays} days ago`;
}

// ---------- Component ----------

export default function PartnerViewScreen() {
  const insets = useSafeAreaInsets();
  const themeMode = useThemeStore(s => s.mode);
  const theme = getTheme(themeMode);

  const [fontsLoaded] = useFonts({
    CormorantGaramond_400Regular,
    CormorantGaramond_600SemiBold,
    Quicksand_400Regular,
    Quicksand_500Medium,
    Quicksand_600SemiBold,
  });

  const {
    data,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery<PartnerData>({
    queryKey: ['partner-data'],
    queryFn: () => api.get<PartnerData>('/api/partner/partner-data'),
  });

  const handleBack = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  }, []);

  const handleQuickAction = useCallback((label: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // In a full implementation, this could trigger a notification or reminder
  }, []);

  if (!fontsLoaded) return null;

  // Determine what to display
  const hasData = data?.hasPartner && data.sharedData !== null;
  const sharedData = data?.sharedData;
  const partnerName = data?.partnerName ?? 'Partner';
  const isNonCycling = sharedData?.lifeStage === 'menopause';
  const isPeri = sharedData?.lifeStage === 'perimenopause';
  const phase = sharedData?.currentPhase ?? 'follicular';
  const phaseInfo = phaseDetails[phase];

  // Pick the right tips for life stage
  const getSupportTips = (): string[] => {
    if (isNonCycling) return menopauseTips;
    if (isPeri) return perimenopauseTips;
    return phaseInfo.tips;
  };

  const getQuickActions = (): QuickAction[] => {
    if (isNonCycling || isPeri) return menopauseQuickActions;
    return quickActionsByPhase[phase];
  };

  const getPhaseColor = (): string => {
    if (isNonCycling) return '#8b5cf6';
    if (isPeri) return '#f59e0b';
    return phaseInfo.color;
  };

  const getPhaseEmoji = (): string => {
    if (isNonCycling) return '\uD83C\uDF1A';
    if (isPeri) return '\uD83C\uDF17';
    return phaseInfo.emoji;
  };

  const getPhaseName = (): string => {
    if (isNonCycling) return 'Menopause';
    if (isPeri) return 'Perimenopause';
    return phaseInfo.name;
  };

  const getFeeling = (): string => {
    if (isNonCycling) {
      return 'She may experience hot flashes, sleep changes, and shifting moods. This is a powerful transition -- your steady presence means the world.';
    }
    if (isPeri) {
      return 'Her body is going through changes and symptoms can be unpredictable. Some days feel normal, others are challenging. Consistency and kindness are everything.';
    }
    return phaseInfo.feeling;
  };

  const accentColor = getPhaseColor();

  // ---------- Loading state ----------

  if (isLoading) {
    return (
      <View className="flex-1">
        <LinearGradient
          colors={theme.gradient}
          locations={[0, 0.25, 0.5, 0.75, 1]}
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <ActivityIndicator size="large" color={theme.accent.purple} />
          <Text
            style={{ fontFamily: 'Quicksand_500Medium', color: theme.text.muted, marginTop: 16 }}
          >
            Loading partner data...
          </Text>
        </LinearGradient>
      </View>
    );
  }

  // ---------- Empty / No partner state ----------

  if (!hasData) {
    return (
      <View className="flex-1">
        <LinearGradient
          colors={theme.gradient}
          locations={[0, 0.25, 0.5, 0.75, 1]}
          style={{ flex: 1 }}
        >
          {/* Header */}
          <Animated.View
            entering={FadeInDown.delay(100).duration(600)}
            style={{ paddingTop: insets.top + 12 }}
            className="px-6"
          >
            <Pressable
              onPress={handleBack}
              className="w-10 h-10 rounded-full items-center justify-center border"
              style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light }}
            >
              <ArrowLeft size={20} color={theme.text.secondary} />
            </Pressable>
          </Animated.View>

          {/* Empty state content */}
          <View className="flex-1 items-center justify-center px-8">
            <Animated.View
              entering={FadeInUp.delay(200).duration(700)}
              className="items-center"
            >
              <View
                className="w-24 h-24 rounded-full items-center justify-center mb-6"
                style={{ backgroundColor: `${theme.accent.rose}15` }}
              >
                <Heart size={40} color={theme.accent.rose} />
              </View>
              <Text
                style={{ fontFamily: 'CormorantGaramond_600SemiBold', color: theme.text.primary }}
                className="text-3xl text-center mb-3"
              >
                No Shared Data Yet
              </Text>
              <Text
                style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.tertiary, lineHeight: 22 }}
                className="text-sm text-center"
              >
                Your partner has not shared their cycle information with you yet. Once they do, you will see supportive insights here to help you be the best partner you can be.
              </Text>
              <Pressable
                onPress={() => refetch()}
                className="mt-8 flex-row items-center rounded-full px-6 py-3 border"
                style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light }}
              >
                <RefreshCw size={16} color={theme.accent.purple} />
                <Text
                  style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.accent.purple, marginLeft: 8 }}
                  className="text-sm"
                >
                  Refresh
                </Text>
              </Pressable>
            </Animated.View>
          </View>
        </LinearGradient>
      </View>
    );
  }

  // ---------- Main view ----------

  return (
    <View className="flex-1">
      <LinearGradient
        colors={theme.gradient}
        locations={[0, 0.25, 0.5, 0.75, 1]}
        style={{ flex: 1 }}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => refetch()}
              tintColor={theme.accent.purple}
            />
          }
        >
          {/* Header */}
          <Animated.View
            entering={FadeInDown.delay(100).duration(600)}
            style={{ paddingTop: insets.top + 12 }}
            className="px-6"
          >
            <View className="flex-row items-center justify-between">
              <Pressable
                onPress={handleBack}
                className="w-10 h-10 rounded-full items-center justify-center border"
                style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light }}
              >
                <ArrowLeft size={20} color={theme.text.secondary} />
              </Pressable>
              <View className="flex-row items-center">
                <Clock size={14} color={theme.text.muted} />
                <Text
                  style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.muted, marginLeft: 4 }}
                  className="text-xs"
                >
                  {sharedData?.lastUpdated ? formatTimeAgo(sharedData.lastUpdated) : ''}
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* Title */}
          <Animated.View
            entering={FadeInDown.delay(200).duration(600)}
            className="px-6 mt-6"
          >
            <Text
              style={{ fontFamily: 'Quicksand_500Medium', color: theme.text.muted }}
              className="text-sm"
            >
              Partner Support
            </Text>
            <Text
              style={{ fontFamily: 'CormorantGaramond_600SemiBold', color: theme.text.primary }}
              className="text-4xl mt-1"
            >
              Supporting {partnerName}
            </Text>
          </Animated.View>

          {/* Phase Card */}
          <Animated.View
            entering={FadeInUp.delay(300).duration(700)}
            className="mx-6 mt-8"
          >
            <LinearGradient
              colors={isNonCycling || isPeri
                ? [`${accentColor}20`, `${accentColor}08`]
                : phaseInfo.gradientColors
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                borderRadius: 24,
                padding: 24,
                borderWidth: 1,
                borderColor: `${accentColor}30`,
              }}
            >
              <View className="flex-row items-center">
                <View
                  className="w-16 h-16 rounded-full items-center justify-center"
                  style={{ backgroundColor: `${accentColor}20` }}
                >
                  <Text className="text-3xl">{getPhaseEmoji()}</Text>
                </View>
                <View className="ml-4 flex-1">
                  <Text
                    style={{ fontFamily: 'CormorantGaramond_600SemiBold', color: theme.text.primary }}
                    className="text-2xl"
                  >
                    {getPhaseName()}
                  </Text>
                  {!isNonCycling && sharedData?.dayOfCycle != null && (
                    <Text
                      style={{ fontFamily: 'Quicksand_500Medium', color: accentColor }}
                      className="text-sm mt-1"
                    >
                      Day {sharedData.dayOfCycle}
                      {sharedData.cycleLength != null ? ` of ${sharedData.cycleLength}` : ''}
                    </Text>
                  )}
                  {(isNonCycling || isPeri) && sharedData?.moonPhase && (
                    <Text
                      style={{ fontFamily: 'Quicksand_500Medium', color: accentColor }}
                      className="text-sm mt-1"
                    >
                      Moon: {sharedData.moonPhase}
                    </Text>
                  )}
                </View>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* How She May Feel */}
          <Animated.View
            entering={FadeInUp.delay(400).duration(700)}
            className="mx-6 mt-6"
          >
            <View className="flex-row items-center mb-3">
              <Heart size={16} color={theme.accent.rose} />
              <Text
                style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.accent }}
                className="text-xs uppercase tracking-wider ml-2"
              >
                How She May Feel
              </Text>
            </View>
            <View
              className="rounded-2xl p-5 border"
              style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light }}
            >
              <Text
                style={{
                  fontFamily: 'Quicksand_400Regular',
                  color: theme.text.secondary,
                  lineHeight: 22,
                }}
                className="text-sm"
              >
                {getFeeling()}
              </Text>
            </View>
          </Animated.View>

          {/* How to Be Supportive */}
          <Animated.View
            entering={FadeInUp.delay(500).duration(700)}
            className="mx-6 mt-6"
          >
            <View className="flex-row items-center mb-3">
              <Users size={16} color={accentColor} />
              <Text
                style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.accent }}
                className="text-xs uppercase tracking-wider ml-2"
              >
                How to Be Supportive
              </Text>
            </View>
            <View
              className="rounded-2xl border overflow-hidden"
              style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light }}
            >
              {getSupportTips().map((tip, index) => {
                const isLast = index === getSupportTips().length - 1;
                const tipIcons = [Flame, Coffee, Gift, Leaf, MessageCircleHeart];
                const TipIcon = tipIcons[index % tipIcons.length];

                return (
                  <View
                    key={index}
                    className="flex-row items-start p-4"
                    style={!isLast ? { borderBottomWidth: 1, borderBottomColor: theme.border.light } : undefined}
                  >
                    <View
                      className="w-8 h-8 rounded-full items-center justify-center mt-0.5"
                      style={{ backgroundColor: `${accentColor}15` }}
                    >
                      <TipIcon size={14} color={accentColor} />
                    </View>
                    <Text
                      style={{
                        fontFamily: 'Quicksand_500Medium',
                        color: theme.text.primary,
                        lineHeight: 21,
                        flex: 1,
                        marginLeft: 12,
                        marginTop: 4,
                      }}
                      className="text-sm"
                    >
                      {tip}
                    </Text>
                  </View>
                );
              })}
            </View>
          </Animated.View>

          {/* Quick Actions */}
          <Animated.View
            entering={FadeInUp.delay(600).duration(700)}
            className="mx-6 mt-6"
          >
            <View className="flex-row items-center mb-3">
              <Sparkles size={16} color={theme.accent.lavender} />
              <Text
                style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.accent }}
                className="text-xs uppercase tracking-wider ml-2"
              >
                Quick Actions
              </Text>
            </View>
            <View className="flex-row justify-between">
              {getQuickActions().map((action, index) => (
                <Pressable
                  key={index}
                  onPress={() => handleQuickAction(action.label)}
                  className="flex-1 items-center rounded-2xl p-4 border"
                  style={{
                    backgroundColor: theme.bg.card,
                    borderColor: theme.border.light,
                    marginHorizontal: index === 1 ? 8 : 0,
                  }}
                >
                  <View
                    className="w-12 h-12 rounded-full items-center justify-center mb-3"
                    style={{ backgroundColor: `${action.color}15` }}
                  >
                    <Text className="text-xl">{action.emoji}</Text>
                  </View>
                  <Text
                    style={{
                      fontFamily: 'Quicksand_500Medium',
                      color: theme.text.primary,
                      textAlign: 'center',
                    }}
                    className="text-xs"
                  >
                    {action.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Animated.View>

          {/* Gentle reminder */}
          <Animated.View
            entering={FadeInUp.delay(700).duration(700)}
            className="mx-6 mt-8"
          >
            <LinearGradient
              colors={[`${theme.accent.rose}12`, `${theme.accent.lavender}12`]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                borderRadius: 20,
                padding: 20,
                borderWidth: 1,
                borderColor: `${theme.accent.rose}20`,
              }}
            >
              <View className="flex-row items-start">
                <Text className="text-lg mr-3" style={{ marginTop: 2 }}>{'\u2728'}</Text>
                <View className="flex-1">
                  <Text
                    style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
                    className="text-sm mb-1"
                  >
                    Remember
                  </Text>
                  <Text
                    style={{
                      fontFamily: 'Quicksand_400Regular',
                      color: theme.text.tertiary,
                      lineHeight: 20,
                    }}
                    className="text-xs"
                  >
                    Every person is different. These are general guidelines -- the best thing you can do is ask her how she feels and listen with your whole heart.
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Footer */}
          <Animated.View
            entering={FadeInUp.delay(800).duration(600)}
            className="mx-6 mt-8 items-center"
          >
            <View className="flex-row items-center">
              <Heart size={12} color={theme.accent.rose} />
              <Text
                style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.muted, marginLeft: 6 }}
                className="text-xs"
              >
                Being here already shows you care
              </Text>
              <Heart size={12} color={theme.accent.rose} style={{ marginLeft: 6 }} />
            </View>
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert, Platform, Modal, Switch } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import {
  X,
  Moon,
  Sun,
  Calendar,
  Clock,
  RotateCcw,
  Heart,
  Info,
  ChevronRight,
  Crown,
  Leaf,
  Check,
  Users,
  LogOut,
  Shield,
  MessageCircle,
  FlaskConical,
} from 'lucide-react-native';
import { useCycleStore, phaseInfo, LifeStage, lifeStageInfo } from '@/lib/cycle-store';
import { useThemeStore, getTheme } from '@/lib/theme-store';
import { useSubscriptionStore } from '@/lib/subscription-store';
import { authClient } from '@/lib/auth/auth-client';
import { useInvalidateSession } from '@/lib/auth/use-session';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import DateTimePicker from '@react-native-community/datetimepicker';
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

const CYCLE_LENGTHS = [21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35];
const PERIOD_LENGTHS = [3, 4, 5, 6, 7, 8];

const lifeStageOptions: { stage: LifeStage; icon: typeof Moon; color: string }[] = [
  { stage: 'regular', icon: Moon, color: '#9d84ed' },
  { stage: 'perimenopause', icon: Leaf, color: '#f59e0b' },
  { stage: 'menopause', icon: Sun, color: '#8b5cf6' },
];

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const invalidateSession = useInvalidateSession();
  const lastPeriodStart = useCycleStore(s => s.lastPeriodStart);
  const cycleLength = useCycleStore(s => s.cycleLength);
  const periodLength = useCycleStore(s => s.periodLength);
  const lifeStage = useCycleStore(s => s.lifeStage);
  const setLastPeriodStart = useCycleStore(s => s.setLastPeriodStart);
  const setCycleLength = useCycleStore(s => s.setCycleLength);
  const setPeriodLength = useCycleStore(s => s.setPeriodLength);
  const setLifeStage = useCycleStore(s => s.setLifeStage);
  const resetOnboarding = useCycleStore(s => s.resetOnboarding);
  const getCurrentPhase = useCycleStore(s => s.getCurrentPhase);
  const getDayOfCycle = useCycleStore(s => s.getDayOfCycle);

  const themeMode = useThemeStore(s => s.mode);
  const toggleMode = useThemeStore(s => s.toggleMode);
  const theme = getTheme(themeMode);

  const tier = useSubscriptionStore(s => s.tier);
  const isPremium = tier === 'premium';

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCycleLengthPicker, setShowCycleLengthPicker] = useState(false);
  const [showPeriodLengthPicker, setShowPeriodLengthPicker] = useState(false);
  const [showLifeStagePicker, setShowLifeStagePicker] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(
    lastPeriodStart ? new Date(lastPeriodStart) : new Date()
  );

  const [fontsLoaded] = useFonts({
    CormorantGaramond_400Regular,
    CormorantGaramond_600SemiBold,
    Quicksand_400Regular,
    Quicksand_500Medium,
    Quicksand_600SemiBold,
  });

  if (!fontsLoaded) return null;

  const currentPhase = getCurrentPhase();
  const dayOfCycle = getDayOfCycle();
  const info = phaseInfo[currentPhase];
  const stageInfo = lifeStageInfo[lifeStage];

  const handleReset = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Reset Cycle Data',
      'This will clear all your cycle information and return you to the setup screen. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            resetOnboarding();
            router.replace('/onboarding');
          },
        },
      ]
    );
  };

  const handleThemeToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleMode();
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      if (selectedDate) {
        setLastPeriodStart(selectedDate);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } else if (selectedDate) {
      setTempDate(selectedDate);
    }
  };

  const handleConfirmDate = () => {
    setLastPeriodStart(tempDate);
    setShowDatePicker(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleCycleLengthSelect = (length: number) => {
    Haptics.selectionAsync();
    setCycleLength(length);
    setShowCycleLengthPicker(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handlePeriodLengthSelect = (length: number) => {
    Haptics.selectionAsync();
    setPeriodLength(length);
    setShowPeriodLengthPicker(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleLifeStageSelect = (stage: LifeStage) => {
    Haptics.selectionAsync();
    setLifeStage(stage);
    setShowLifeStagePicker(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Get stage-specific accent color
  const getStageColor = () => {
    switch (lifeStage) {
      case 'perimenopause': return '#f59e0b';
      case 'menopause': return '#8b5cf6';
      default: return theme.accent.purple;
    }
  };

  const stageColor = getStageColor();

  return (
    <View className="flex-1">
      <LinearGradient
        colors={theme.gradient}
        locations={[0, 0.25, 0.5, 0.75, 1]}
        style={{ flex: 1 }}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View
            entering={FadeInDown.delay(100).duration(600)}
            style={{ paddingTop: insets.top + 16 }}
            className="px-6"
          >
            <View className="flex-row items-center justify-between">
              <Text
                style={{ fontFamily: 'CormorantGaramond_600SemiBold', color: theme.text.primary }}
                className="text-3xl"
              >
                Settings
              </Text>
              <Pressable
                onPress={() => router.back()}
                className="w-10 h-10 rounded-full items-center justify-center border"
                style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light }}
              >
                <X size={20} color={stageColor} />
              </Pressable>
            </View>
          </Animated.View>

          {/* Subscription Status */}
          <Animated.View
            entering={FadeInUp.delay(150).duration(600)}
            className="mx-6 mt-8"
          >
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                if (!isPremium) {
                  router.push('/paywall');
                }
              }}
            >
              <LinearGradient
                colors={isPremium ? ['#fcd34d', '#f59e0b'] : ['rgba(249, 168, 212, 0.2)', 'rgba(196, 181, 253, 0.2)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ borderRadius: 20, padding: 16, borderWidth: 1, borderColor: isPremium ? '#f59e0b' : 'rgba(249, 168, 212, 0.3)' }}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <View
                      className="w-10 h-10 rounded-full items-center justify-center mr-3"
                      style={{ backgroundColor: isPremium ? 'rgba(255,255,255,0.3)' : 'rgba(249, 168, 212, 0.2)' }}
                    >
                      <Crown size={20} color={isPremium ? '#fff' : '#f9a8d4'} />
                    </View>
                    <View>
                      <Text
                        style={{ fontFamily: 'Quicksand_600SemiBold', color: isPremium ? '#fff' : theme.text.primary }}
                        className="text-base"
                      >
                        {isPremium ? 'Premium Member' : 'Free Plan'}
                      </Text>
                      <Text
                        style={{ fontFamily: 'Quicksand_400Regular', color: isPremium ? 'rgba(255,255,255,0.8)' : theme.text.tertiary }}
                        className="text-xs"
                      >
                        {isPremium ? 'All features unlocked' : 'Tap to upgrade'}
                      </Text>
                    </View>
                  </View>
                  {!isPremium && <ChevronRight size={18} color={theme.text.muted} />}
                </View>
              </LinearGradient>
            </Pressable>
          </Animated.View>

          {/* Life Stage Selection */}
          <Animated.View
            entering={FadeInUp.delay(200).duration(600)}
            className="mx-6 mt-6"
          >
            <Text
              style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.accent }}
              className="text-xs uppercase tracking-wider mb-4"
            >
              Life Stage
            </Text>
            <Pressable
              onPress={() => setShowLifeStagePicker(true)}
            >
              <View
                className="rounded-2xl p-4 border flex-row items-center justify-between"
                style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light }}
              >
                <View className="flex-row items-center">
                  <View
                    className="w-10 h-10 rounded-full items-center justify-center mr-3"
                    style={{ backgroundColor: `${stageColor}20` }}
                  >
                    <Text className="text-lg">{stageInfo.emoji}</Text>
                  </View>
                  <View>
                    <Text
                      style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
                      className="text-base"
                    >
                      {stageInfo.name}
                    </Text>
                    <Text
                      style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.tertiary }}
                      className="text-xs"
                    >
                      {stageInfo.ageRange}
                    </Text>
                  </View>
                </View>
                <ChevronRight size={18} color={theme.text.muted} />
              </View>
            </Pressable>
          </Animated.View>

          {/* Current Cycle Info - Only show for regular cycles */}
          {lifeStage === 'regular' && (
            <Animated.View
              entering={FadeInUp.delay(250).duration(600)}
              className="mx-6 mt-6"
            >
              <View
                className="rounded-2xl p-4 border"
                style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light }}
              >
                <View className="flex-row items-center">
                  <View
                    className="w-10 h-10 rounded-full items-center justify-center mr-3"
                    style={{ backgroundColor: `${info.color}20` }}
                  >
                    <Text className="text-xl">{info.emoji}</Text>
                  </View>
                  <View>
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
                      Day {dayOfCycle} of {cycleLength}
                    </Text>
                  </View>
                </View>
              </View>
            </Animated.View>
          )}

          {/* Appearance Settings */}
          <Animated.View
            entering={FadeInUp.delay(300).duration(600)}
            className="mx-6 mt-6"
          >
            <Text
              style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.accent }}
              className="text-xs uppercase tracking-wider mb-4"
            >
              Appearance
            </Text>
            <View
              className="rounded-2xl border overflow-hidden"
              style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light }}
            >
              <View className="p-4 flex-row items-center justify-between">
                <View className="flex-row items-center">
                  {themeMode === 'dark' ? (
                    <Moon size={18} color={theme.accent.lavender} />
                  ) : (
                    <Sun size={18} color={theme.accent.pink} />
                  )}
                  <Text
                    style={{ fontFamily: 'Quicksand_500Medium', color: theme.text.primary }}
                    className="text-sm ml-3"
                  >
                    Dark Mode
                  </Text>
                </View>
                <Switch
                  value={themeMode === 'dark'}
                  onValueChange={handleThemeToggle}
                  trackColor={{ false: theme.border.medium, true: stageColor }}
                  thumbColor={themeMode === 'dark' ? theme.accent.lavender : '#ffffff'}
                  ios_backgroundColor={theme.border.medium}
                />
              </View>
            </View>
          </Animated.View>

          {/* Cycle Settings - Only show for regular/perimenopause */}
          {lifeStage !== 'menopause' && (
            <Animated.View
              entering={FadeInUp.delay(350).duration(600)}
              className="mx-6 mt-6"
            >
              <Text
                style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.accent }}
                className="text-xs uppercase tracking-wider mb-4"
              >
                Cycle Information
              </Text>
              <View
                className="rounded-2xl border overflow-hidden"
                style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light }}
              >
                {/* Last Period Start */}
                <Pressable
                  onPress={() => {
                    setTempDate(lastPeriodStart ? new Date(lastPeriodStart) : new Date());
                    setShowDatePicker(true);
                  }}
                  className="p-4 flex-row items-center justify-between"
                >
                  <View className="flex-row items-center flex-1">
                    <Calendar size={18} color={stageColor} />
                    <View className="ml-3">
                      <Text
                        style={{ fontFamily: 'Quicksand_500Medium', color: theme.text.primary }}
                        className="text-sm"
                      >
                        Last Period Start
                      </Text>
                      <Text
                        style={{ fontFamily: 'Quicksand_500Medium', color: stageColor }}
                        className="text-xs mt-0.5"
                      >
                        {formatDate(lastPeriodStart)}
                      </Text>
                    </View>
                  </View>
                  <View className="flex-row items-center">
                    <ChevronRight size={16} color={theme.text.muted} />
                  </View>
                </Pressable>

                {/* Cycle Length - Only for regular cycles */}
                {lifeStage === 'regular' && (
                  <Pressable
                    onPress={() => setShowCycleLengthPicker(true)}
                    className="p-4 flex-row items-center justify-between border-t"
                    style={{ borderTopColor: theme.border.light }}
                  >
                    <View className="flex-row items-center">
                      <Clock size={18} color={stageColor} />
                      <Text
                        style={{ fontFamily: 'Quicksand_500Medium', color: theme.text.primary }}
                        className="text-sm ml-3"
                      >
                        Cycle Length
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <Text
                        style={{ fontFamily: 'Quicksand_500Medium', color: stageColor }}
                        className="text-sm mr-2"
                      >
                        {cycleLength} days
                      </Text>
                      <ChevronRight size={16} color={theme.text.muted} />
                    </View>
                  </Pressable>
                )}

                {/* Period Length - Only for regular cycles */}
                {lifeStage === 'regular' && (
                  <Pressable
                    onPress={() => setShowPeriodLengthPicker(true)}
                    className="p-4 flex-row items-center justify-between border-t"
                    style={{ borderTopColor: theme.border.light }}
                  >
                    <View className="flex-row items-center">
                      <Moon size={18} color={theme.accent.rose} />
                      <Text
                        style={{ fontFamily: 'Quicksand_500Medium', color: theme.text.primary }}
                        className="text-sm ml-3"
                      >
                        Period Length
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <Text
                        style={{ fontFamily: 'Quicksand_500Medium', color: stageColor }}
                        className="text-sm mr-2"
                      >
                        {periodLength} days
                      </Text>
                      <ChevronRight size={16} color={theme.text.muted} />
                    </View>
                  </Pressable>
                )}
              </View>
            </Animated.View>
          )}

          {/* Partner Support */}
          <Animated.View
            entering={FadeInUp.delay(380).duration(600)}
            className="mx-6 mt-6"
          >
            <Text
              style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.accent }}
              className="text-xs uppercase tracking-wider mb-4"
            >
              Partner Support
            </Text>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/(app)/partner-settings');
              }}
            >
              <View
                className="rounded-2xl p-4 border flex-row items-center justify-between"
                style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light }}
              >
                <View className="flex-row items-center flex-1 mr-2">
                  <View
                    className="w-10 h-10 rounded-full items-center justify-center mr-3"
                    style={{ backgroundColor: `${theme.accent.rose}20` }}
                  >
                    <Users size={20} color={theme.accent.rose} />
                  </View>
                  <View className="flex-1">
                    <Text
                      style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
                      className="text-base"
                    >
                      Partner Support
                    </Text>
                    <Text
                      style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.tertiary }}
                      className="text-xs"
                    >
                      Invite someone to support you
                    </Text>
                  </View>
                </View>
                <ChevronRight size={18} color={theme.text.muted} />
              </View>
            </Pressable>
          </Animated.View>

          {/* Community Stories */}
          <Animated.View
            entering={FadeInUp.delay(390).duration(600)}
            className="mx-6 mt-6"
          >
            <Text
              style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.accent }}
              className="text-xs uppercase tracking-wider mb-4"
            >
              Community
            </Text>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/(app)/community');
              }}
            >
              <View
                className="rounded-2xl p-4 border"
                style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light }}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1 mr-2">
                    <View
                      className="w-10 h-10 rounded-full items-center justify-center mr-3"
                      style={{ backgroundColor: `${theme.accent.purple}20` }}
                    >
                      <MessageCircle size={18} color={theme.accent.purple} />
                    </View>
                    <View className="flex-1">
                      <Text
                        style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
                        className="text-base"
                      >
                        Women's Stories
                      </Text>
                      <Text
                        style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.tertiary }}
                        className="text-xs"
                      >
                        Read & share experiences
                      </Text>
                    </View>
                  </View>
                  <ChevronRight size={18} color={theme.text.muted} />
                </View>
                {/* Privacy Notice */}
                <View
                  className="flex-row items-center mt-3 pt-3"
                  style={{ borderTopWidth: 1, borderTopColor: theme.border.light }}
                >
                  <Shield size={12} color={theme.accent.purple} />
                  <Text
                    style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.muted }}
                    className="text-xs ml-2"
                  >
                    100% anonymous - we never collect personal data
                  </Text>
                </View>
              </View>
            </Pressable>
          </Animated.View>

          {/* Actions */}
          <Animated.View
            entering={FadeInUp.delay(400).duration(600)}
            className="mx-6 mt-6"
          >
            <Text
              style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.accent }}
              className="text-xs uppercase tracking-wider mb-4"
            >
              Actions
            </Text>
            <View
              className="rounded-2xl border overflow-hidden"
              style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light }}
            >
              <Pressable
                onPress={handleReset}
                className="p-4 flex-row items-center justify-between"
              >
                <View className="flex-row items-center">
                  <RotateCcw size={18} color={theme.accent.pink} />
                  <Text
                    style={{ fontFamily: 'Quicksand_500Medium', color: theme.text.primary }}
                    className="text-sm ml-3"
                  >
                    Reset & Start Over
                  </Text>
                </View>
                <ChevronRight size={16} color={theme.text.muted} />
              </Pressable>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  Alert.alert(
                    'Sign Out',
                    'Are you sure you want to sign out?',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Sign Out',
                        style: 'destructive',
                        onPress: async () => {
                          await authClient.signOut();
                          await invalidateSession();
                        },
                      },
                    ]
                  );
                }}
                className="p-4 flex-row items-center justify-between border-t"
                style={{ borderTopColor: theme.border.light }}
              >
                <View className="flex-row items-center">
                  <LogOut size={18} color={theme.accent.pink} />
                  <Text
                    style={{ fontFamily: 'Quicksand_500Medium', color: theme.text.primary }}
                    className="text-sm ml-3"
                  >
                    Sign Out
                  </Text>
                </View>
                <ChevronRight size={16} color={theme.text.muted} />
              </Pressable>
            </View>
          </Animated.View>

          {/* About */}
          <Animated.View
            entering={FadeInUp.delay(500).duration(600)}
            className="mx-6 mt-6"
          >
            <Text
              style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.accent }}
              className="text-xs uppercase tracking-wider mb-4"
            >
              About
            </Text>
            <View
              className="rounded-2xl border overflow-hidden"
              style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light }}
            >
              <View className="p-4 flex-row items-center">
                <Info size={18} color={theme.text.muted} />
                <Text
                  style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.secondary }}
                  className="text-sm ml-3 flex-1"
                >
                  Luna Flow helps you understand and work with your body's natural rhythms at every stage of life.
                </Text>
              </View>
              <View style={{ height: 1, backgroundColor: theme.border.light }} />
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push('/(app)/labs-guide');
                }}
                className="p-4 flex-row items-center justify-between"
              >
                <View className="flex-row items-center">
                  <FlaskConical size={18} color={theme.accent.lavender} />
                  <Text
                    style={{ fontFamily: 'Quicksand_500Medium', color: theme.text.primary }}
                    className="text-sm ml-3"
                  >
                    Labs Guide
                  </Text>
                </View>
                <ChevronRight size={16} color={theme.text.muted} />
              </Pressable>
              <View style={{ height: 1, backgroundColor: theme.border.light }} />
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push('/(app)/privacy-policy');
                }}
                className="p-4 flex-row items-center justify-between"
              >
                <View className="flex-row items-center">
                  <Shield size={18} color={theme.accent.purple} />
                  <Text
                    style={{ fontFamily: 'Quicksand_500Medium', color: theme.text.primary }}
                    className="text-sm ml-3"
                  >
                    Privacy Policy
                  </Text>
                </View>
                <ChevronRight size={16} color={theme.text.muted} />
              </Pressable>
            </View>
          </Animated.View>

          {/* Footer */}
          <Animated.View
            entering={FadeInUp.delay(600).duration(600)}
            className="mx-6 mt-8 items-center"
          >
            <View className="flex-row items-center">
              <Heart size={14} color={theme.accent.rose} />
              <Text
                style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.muted }}
                className="text-xs ml-2"
              >
                Made with love by a woman for women everywhere
              </Text>
            </View>
            <Text
              style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.muted }}
              className="text-xs mt-2"
            >
              Version 1.1.0
            </Text>
          </Animated.View>
        </ScrollView>
      </LinearGradient>

      {/* Date Picker Modal */}
      {showDatePicker && Platform.OS === 'ios' && (
        <Modal transparent animationType="slide">
          <View className="flex-1 justify-end" style={{ backgroundColor: theme.overlay }}>
            <View
              className="rounded-t-3xl"
              style={{ backgroundColor: theme.bg.cardSolid }}
            >
              <View className="flex-row justify-between items-center p-4 border-b" style={{ borderBottomColor: theme.border.light }}>
                <Pressable onPress={() => setShowDatePicker(false)}>
                  <Text style={{ fontFamily: 'Quicksand_500Medium', color: theme.accent.pink }}>Cancel</Text>
                </Pressable>
                <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}>
                  Select Date
                </Text>
                <Pressable onPress={handleConfirmDate}>
                  <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: stageColor }}>Done</Text>
                </Pressable>
              </View>
              <DateTimePicker
                value={tempDate}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
                maximumDate={new Date()}
                themeVariant={themeMode}
                style={{ height: 200 }}
              />
              <View style={{ height: insets.bottom }} />
            </View>
          </View>
        </Modal>
      )}

      {/* Android Date Picker */}
      {showDatePicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={tempDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}

      {/* Life Stage Picker Modal */}
      <Modal visible={showLifeStagePicker} transparent animationType="slide">
        <View className="flex-1 justify-end" style={{ backgroundColor: theme.overlay }}>
          <View className="rounded-t-3xl" style={{ backgroundColor: theme.bg.cardSolid }}>
            <View className="flex-row justify-between items-center p-4 border-b" style={{ borderBottomColor: theme.border.light }}>
              <Pressable onPress={() => setShowLifeStagePicker(false)}>
                <Text style={{ fontFamily: 'Quicksand_500Medium', color: theme.accent.pink }}>Cancel</Text>
              </Pressable>
              <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}>
                Life Stage
              </Text>
              <View style={{ width: 50 }} />
            </View>
            <View className="p-4">
              {lifeStageOptions.map((option) => {
                const optionInfo = lifeStageInfo[option.stage];
                const isSelected = lifeStage === option.stage;
                const IconComponent = option.icon;

                return (
                  <Pressable
                    key={option.stage}
                    onPress={() => handleLifeStageSelect(option.stage)}
                    className="p-4 rounded-2xl mb-3 border flex-row items-center justify-between"
                    style={{
                      backgroundColor: isSelected ? `${option.color}15` : theme.bg.secondary,
                      borderColor: isSelected ? option.color : theme.border.light,
                    }}
                  >
                    <View className="flex-row items-center">
                      <View
                        className="w-12 h-12 rounded-full items-center justify-center mr-4"
                        style={{ backgroundColor: `${option.color}20` }}
                      >
                        <IconComponent size={24} color={option.color} />
                      </View>
                      <View>
                        <Text
                          style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
                          className="text-base"
                        >
                          {optionInfo.name}
                        </Text>
                        <Text
                          style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.tertiary }}
                          className="text-xs"
                        >
                          {optionInfo.ageRange}
                        </Text>
                      </View>
                    </View>
                    {isSelected && (
                      <View
                        className="w-6 h-6 rounded-full items-center justify-center"
                        style={{ backgroundColor: option.color }}
                      >
                        <Check size={14} color="#fff" />
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
            <View style={{ height: insets.bottom + 16 }} />
          </View>
        </View>
      </Modal>

      {/* Cycle Length Picker Modal */}
      <Modal visible={showCycleLengthPicker} transparent animationType="slide">
        <View className="flex-1 justify-end" style={{ backgroundColor: theme.overlay }}>
          <View className="rounded-t-3xl" style={{ backgroundColor: theme.bg.cardSolid }}>
            <View className="flex-row justify-between items-center p-4 border-b" style={{ borderBottomColor: theme.border.light }}>
              <Pressable onPress={() => setShowCycleLengthPicker(false)}>
                <Text style={{ fontFamily: 'Quicksand_500Medium', color: theme.accent.pink }}>Cancel</Text>
              </Pressable>
              <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}>
                Cycle Length
              </Text>
              <View style={{ width: 50 }} />
            </View>
            <View className="p-4">
              <View className="flex-row flex-wrap justify-center">
                {CYCLE_LENGTHS.map((length) => (
                  <Pressable
                    key={length}
                    onPress={() => handleCycleLengthSelect(length)}
                    className="w-14 h-14 rounded-full items-center justify-center m-1.5 border"
                    style={{
                      backgroundColor: cycleLength === length ? stageColor : theme.bg.secondary,
                      borderColor: cycleLength === length ? stageColor : theme.border.light,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: 'Quicksand_600SemiBold',
                        color: cycleLength === length ? '#fff' : theme.text.secondary,
                      }}
                      className="text-base"
                    >
                      {length}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <Text
                style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.muted }}
                className="text-sm text-center mt-4"
              >
                Average is 28 days
              </Text>
            </View>
            <View style={{ height: insets.bottom + 16 }} />
          </View>
        </View>
      </Modal>

      {/* Period Length Picker Modal */}
      <Modal visible={showPeriodLengthPicker} transparent animationType="slide">
        <View className="flex-1 justify-end" style={{ backgroundColor: theme.overlay }}>
          <View className="rounded-t-3xl" style={{ backgroundColor: theme.bg.cardSolid }}>
            <View className="flex-row justify-between items-center p-4 border-b" style={{ borderBottomColor: theme.border.light }}>
              <Pressable onPress={() => setShowPeriodLengthPicker(false)}>
                <Text style={{ fontFamily: 'Quicksand_500Medium', color: theme.accent.pink }}>Cancel</Text>
              </Pressable>
              <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}>
                Period Length
              </Text>
              <View style={{ width: 50 }} />
            </View>
            <View className="p-4">
              <View className="flex-row justify-center">
                {PERIOD_LENGTHS.map((length) => (
                  <Pressable
                    key={length}
                    onPress={() => handlePeriodLengthSelect(length)}
                    className="w-16 h-16 rounded-full items-center justify-center mx-2 border"
                    style={{
                      backgroundColor: periodLength === length ? theme.accent.blush : theme.bg.secondary,
                      borderColor: periodLength === length ? theme.accent.blush : theme.border.light,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: 'Quicksand_600SemiBold',
                        color: periodLength === length ? '#fff' : theme.text.secondary,
                      }}
                      className="text-lg"
                    >
                      {length}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <Text
                style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.muted }}
                className="text-sm text-center mt-4"
              >
                Average is 5 days
              </Text>
            </View>
            <View style={{ height: insets.bottom + 16 }} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

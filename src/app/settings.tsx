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
  Palette,
} from 'lucide-react-native';
import { useCycleStore, phaseInfo } from '@/lib/cycle-store';
import { useThemeStore, getTheme } from '@/lib/theme-store';
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

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const lastPeriodStart = useCycleStore(s => s.lastPeriodStart);
  const cycleLength = useCycleStore(s => s.cycleLength);
  const periodLength = useCycleStore(s => s.periodLength);
  const setLastPeriodStart = useCycleStore(s => s.setLastPeriodStart);
  const setCycleLength = useCycleStore(s => s.setCycleLength);
  const setPeriodLength = useCycleStore(s => s.setPeriodLength);
  const resetOnboarding = useCycleStore(s => s.resetOnboarding);
  const getCurrentPhase = useCycleStore(s => s.getCurrentPhase);
  const getDayOfCycle = useCycleStore(s => s.getDayOfCycle);

  const themeMode = useThemeStore(s => s.mode);
  const toggleMode = useThemeStore(s => s.toggleMode);
  const theme = getTheme(themeMode);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCycleLengthPicker, setShowCycleLengthPicker] = useState(false);
  const [showPeriodLengthPicker, setShowPeriodLengthPicker] = useState(false);
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
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
                <X size={20} color={theme.accent.purple} />
              </Pressable>
            </View>
          </Animated.View>

          {/* Current Cycle Info */}
          <Animated.View
            entering={FadeInUp.delay(200).duration(600)}
            className="mx-6 mt-8"
          >
            <View
              className="rounded-3xl p-5 border"
              style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light }}
            >
              <View className="flex-row items-center">
                <View
                  className="w-12 h-12 rounded-full items-center justify-center mr-4"
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
                    style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.tertiary }}
                    className="text-sm"
                  >
                    Day {dayOfCycle} of {cycleLength}
                  </Text>
                </View>
              </View>
            </View>
          </Animated.View>

          {/* Appearance Settings */}
          <Animated.View
            entering={FadeInUp.delay(250).duration(600)}
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
                  trackColor={{ false: theme.border.medium, true: theme.accent.purple }}
                  thumbColor={themeMode === 'dark' ? theme.accent.lavender : '#ffffff'}
                  ios_backgroundColor={theme.border.medium}
                />
              </View>
            </View>
            <Text
              style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.muted }}
              className="text-xs mt-2 ml-1"
            >
              Perfect for nighttime tracking
            </Text>
          </Animated.View>

          {/* Cycle Settings - Editable */}
          <Animated.View
            entering={FadeInUp.delay(300).duration(600)}
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
              {/* Last Period Start - Tappable */}
              <Pressable
                onPress={() => {
                  setTempDate(lastPeriodStart ? new Date(lastPeriodStart) : new Date());
                  setShowDatePicker(true);
                }}
                className="p-4 flex-row items-center justify-between"
              >
                <View className="flex-row items-center">
                  <Calendar size={18} color={theme.accent.pink} />
                  <Text
                    style={{ fontFamily: 'Quicksand_500Medium', color: theme.text.primary }}
                    className="text-sm ml-3"
                  >
                    Last Period Start
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Text
                    style={{ fontFamily: 'Quicksand_500Medium', color: theme.accent.purple }}
                    className="text-sm mr-2"
                  >
                    {formatDate(lastPeriodStart)}
                  </Text>
                  <ChevronRight size={16} color={theme.text.muted} />
                </View>
              </Pressable>

              {/* Cycle Length - Tappable */}
              <Pressable
                onPress={() => setShowCycleLengthPicker(true)}
                className="p-4 flex-row items-center justify-between border-t"
                style={{ borderTopColor: theme.border.light }}
              >
                <View className="flex-row items-center">
                  <Clock size={18} color={theme.accent.purple} />
                  <Text
                    style={{ fontFamily: 'Quicksand_500Medium', color: theme.text.primary }}
                    className="text-sm ml-3"
                  >
                    Cycle Length
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Text
                    style={{ fontFamily: 'Quicksand_500Medium', color: theme.accent.purple }}
                    className="text-sm mr-2"
                  >
                    {cycleLength} days
                  </Text>
                  <ChevronRight size={16} color={theme.text.muted} />
                </View>
              </Pressable>

              {/* Period Length - Tappable */}
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
                    style={{ fontFamily: 'Quicksand_500Medium', color: theme.accent.purple }}
                    className="text-sm mr-2"
                  >
                    {periodLength} days
                  </Text>
                  <ChevronRight size={16} color={theme.text.muted} />
                </View>
              </Pressable>
            </View>

            <Text
              style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.muted }}
              className="text-xs mt-2 ml-1"
            >
              Tap any field to edit
            </Text>
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
                    Reset Cycle Data
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
                  Luna Flow helps you understand and work with your menstrual cycle, not against it.
                </Text>
              </View>
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
                Made with love for women everywhere
              </Text>
            </View>
            <Text
              style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.muted }}
              className="text-xs mt-2"
            >
              Version 1.0.0
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
                  <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.accent.purple }}>Done</Text>
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
                      backgroundColor: cycleLength === length ? theme.accent.purple : theme.bg.secondary,
                      borderColor: cycleLength === length ? theme.accent.purple : theme.border.light,
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

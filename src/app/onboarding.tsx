import React, { useState } from 'react';
import { View, Text, Pressable, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideOutLeft,
  FadeInDown,
} from 'react-native-reanimated';
import { Moon, Sparkles, Heart, ArrowRight, ChevronLeft } from 'lucide-react-native';
import { useCycleStore } from '@/lib/cycle-store';
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

const { width, height } = Dimensions.get('window');

const CYCLE_LENGTHS = [21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35];
const PERIOD_LENGTHS = [3, 4, 5, 6, 7, 8];

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);
  const [lastPeriod, setLastPeriod] = useState(new Date());
  const [cycleLength, setCycleLength] = useState(28);
  const [periodLength, setPeriodLength] = useState(5);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const setLastPeriodStart = useCycleStore(s => s.setLastPeriodStart);
  const setCycleLengthStore = useCycleStore(s => s.setCycleLength);
  const setPeriodLengthStore = useCycleStore(s => s.setPeriodLength);
  const completeOnboarding = useCycleStore(s => s.completeOnboarding);

  const [fontsLoaded] = useFonts({
    CormorantGaramond_400Regular,
    CormorantGaramond_600SemiBold,
    Quicksand_400Regular,
    Quicksand_500Medium,
    Quicksand_600SemiBold,
  });

  if (!fontsLoaded) return null;

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleComplete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setLastPeriodStart(lastPeriod);
    setCycleLengthStore(cycleLength);
    setPeriodLengthStore(periodLength);
    completeOnboarding();
    router.replace('/(tabs)');
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const steps = [
    // Welcome
    {
      title: 'Welcome to Luna Flow',
      subtitle: 'Your cycle is your superpower',
      content: (
        <View className="items-center">
          <View className="w-32 h-32 rounded-full bg-luna-500/20 items-center justify-center mb-8">
            <Moon size={60} color="#f472b6" />
          </View>
          <Text
            style={{ fontFamily: 'Quicksand_400Regular' }}
            className="text-luna-200/80 text-base text-center leading-6 px-4"
          >
            Learn to eat, move, and care for yourself in harmony with your menstrual cycle.
            Transform hormonal chaos into empowered wellness.
          </Text>
        </View>
      ),
    },
    // Last Period Date
    {
      title: 'When did your last period start?',
      subtitle: 'This helps us track your cycle',
      content: (
        <View className="items-center">
          <Pressable
            onPress={() => setShowDatePicker(true)}
            className="bg-white/10 rounded-2xl px-8 py-5 border border-luna-500/30"
          >
            <Text
              style={{ fontFamily: 'Quicksand_600SemiBold' }}
              className="text-white text-xl text-center"
            >
              {formatDate(lastPeriod)}
            </Text>
          </Pressable>
          {showDatePicker && (
            <View className="mt-4 bg-white/10 rounded-2xl overflow-hidden">
              <DateTimePicker
                value={lastPeriod}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, date) => {
                  if (Platform.OS === 'android') {
                    setShowDatePicker(false);
                  }
                  if (date) {
                    setLastPeriod(date);
                  }
                }}
                maximumDate={new Date()}
                textColor="#fff"
                themeVariant="dark"
              />
              {Platform.OS === 'ios' && (
                <Pressable
                  onPress={() => setShowDatePicker(false)}
                  className="py-3 border-t border-white/10"
                >
                  <Text
                    style={{ fontFamily: 'Quicksand_600SemiBold' }}
                    className="text-luna-400 text-center"
                  >
                    Done
                  </Text>
                </Pressable>
              )}
            </View>
          )}
          <Text
            style={{ fontFamily: 'Quicksand_400Regular' }}
            className="text-luna-300/60 text-sm text-center mt-6"
          >
            Tap the date to change it
          </Text>
        </View>
      ),
    },
    // Cycle Length
    {
      title: 'How long is your cycle?',
      subtitle: 'From the first day of one period to the next',
      content: (
        <View className="items-center">
          <View className="flex-row flex-wrap justify-center">
            {CYCLE_LENGTHS.map((length) => (
              <Pressable
                key={length}
                onPress={() => {
                  Haptics.selectionAsync();
                  setCycleLength(length);
                }}
                className={`w-14 h-14 rounded-full items-center justify-center m-1.5 border ${
                  cycleLength === length
                    ? 'bg-luna-500 border-luna-400'
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <Text
                  style={{ fontFamily: 'Quicksand_600SemiBold' }}
                  className={`text-base ${
                    cycleLength === length ? 'text-white' : 'text-luna-300'
                  }`}
                >
                  {length}
                </Text>
              </Pressable>
            ))}
          </View>
          <Text
            style={{ fontFamily: 'Quicksand_400Regular' }}
            className="text-luna-300/60 text-sm text-center mt-6"
          >
            Average is 28 days • Don't know? That's okay!
          </Text>
        </View>
      ),
    },
    // Period Length
    {
      title: 'How long is your period?',
      subtitle: 'Days of menstrual flow',
      content: (
        <View className="items-center">
          <View className="flex-row justify-center">
            {PERIOD_LENGTHS.map((length) => (
              <Pressable
                key={length}
                onPress={() => {
                  Haptics.selectionAsync();
                  setPeriodLength(length);
                }}
                className={`w-16 h-16 rounded-full items-center justify-center mx-2 border ${
                  periodLength === length
                    ? 'bg-luna-500 border-luna-400'
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <Text
                  style={{ fontFamily: 'Quicksand_600SemiBold' }}
                  className={`text-lg ${
                    periodLength === length ? 'text-white' : 'text-luna-300'
                  }`}
                >
                  {length}
                </Text>
              </Pressable>
            ))}
          </View>
          <Text
            style={{ fontFamily: 'Quicksand_400Regular' }}
            className="text-luna-300/60 text-sm text-center mt-6"
          >
            Average is 5 days
          </Text>

          {/* Summary */}
          <View className="mt-10 bg-white/5 rounded-2xl p-5 w-full border border-white/10">
            <Text
              style={{ fontFamily: 'Quicksand_600SemiBold' }}
              className="text-luna-400 text-xs uppercase tracking-wider mb-4"
            >
              Your Cycle Summary
            </Text>
            <View className="flex-row justify-between mb-2">
              <Text
                style={{ fontFamily: 'Quicksand_400Regular' }}
                className="text-luna-200/70"
              >
                Last period started
              </Text>
              <Text
                style={{ fontFamily: 'Quicksand_500Medium' }}
                className="text-white"
              >
                {formatDate(lastPeriod)}
              </Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text
                style={{ fontFamily: 'Quicksand_400Regular' }}
                className="text-luna-200/70"
              >
                Cycle length
              </Text>
              <Text
                style={{ fontFamily: 'Quicksand_500Medium' }}
                className="text-white"
              >
                {cycleLength} days
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text
                style={{ fontFamily: 'Quicksand_400Regular' }}
                className="text-luna-200/70"
              >
                Period length
              </Text>
              <Text
                style={{ fontFamily: 'Quicksand_500Medium' }}
                className="text-white"
              >
                {periodLength} days
              </Text>
            </View>
          </View>
        </View>
      ),
    },
  ];

  const currentStep = steps[step];

  return (
    <View className="flex-1">
      <LinearGradient
        colors={['#0f0720', '#1e0a3c', '#2d1050', '#1e0a3c', '#0f0720']}
        locations={[0, 0.2, 0.5, 0.8, 1]}
        style={{ flex: 1 }}
      >
        {/* Header with back button */}
        <View
          style={{ paddingTop: insets.top + 16 }}
          className="px-6 flex-row items-center"
        >
          {step > 0 ? (
            <Pressable
              onPress={handleBack}
              className="w-10 h-10 rounded-full bg-white/10 items-center justify-center"
            >
              <ChevronLeft size={20} color="#f9a8d4" />
            </Pressable>
          ) : (
            <View className="w-10 h-10" />
          )}

          {/* Progress dots */}
          <View className="flex-1 flex-row justify-center">
            {steps.map((_, i) => (
              <View
                key={i}
                className={`w-2 h-2 rounded-full mx-1 ${
                  i === step ? 'bg-luna-400' : i < step ? 'bg-luna-500/50' : 'bg-white/20'
                }`}
              />
            ))}
          </View>

          <View className="w-10 h-10" />
        </View>

        {/* Content */}
        <View className="flex-1 justify-center px-6">
          <Animated.View
            key={step}
            entering={SlideInRight.duration(300)}
            exiting={SlideOutLeft.duration(300)}
          >
            <Text
              style={{ fontFamily: 'CormorantGaramond_600SemiBold' }}
              className="text-white text-3xl text-center mb-2"
            >
              {currentStep.title}
            </Text>
            <Text
              style={{ fontFamily: 'Quicksand_400Regular' }}
              className="text-luna-300/70 text-sm text-center mb-10"
            >
              {currentStep.subtitle}
            </Text>
            {currentStep.content}
          </Animated.View>
        </View>

        {/* Footer */}
        <View
          style={{ paddingBottom: insets.bottom + 24 }}
          className="px-6"
        >
          <Pressable onPress={handleNext}>
            <LinearGradient
              colors={['#ec4899', '#9333ea']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                padding: 18,
                borderRadius: 16,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                style={{ fontFamily: 'Quicksand_600SemiBold' }}
                className="text-white text-base mr-2"
              >
                {step === 3 ? 'Get Started' : 'Continue'}
              </Text>
              {step === 3 ? (
                <Sparkles size={20} color="#fff" />
              ) : (
                <ArrowRight size={20} color="#fff" />
              )}
            </LinearGradient>
          </Pressable>

          {step === 0 && (
            <Text
              style={{ fontFamily: 'Quicksand_400Regular' }}
              className="text-luna-300/50 text-xs text-center mt-4"
            >
              Your data stays on your device. We respect your privacy.
            </Text>
          )}
        </View>
      </LinearGradient>
    </View>
  );
}

import React, { useState } from 'react';
import { View, Text, Pressable, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  SlideInRight,
  SlideOutLeft,
} from 'react-native-reanimated';
import { Moon, Sparkles, ArrowRight, ChevronLeft } from 'lucide-react-native';
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
          <View
            className="w-32 h-32 rounded-full items-center justify-center mb-8"
            style={{ backgroundColor: 'rgba(249, 168, 212, 0.2)' }}
          >
            <Moon size={60} color="#9d84ed" />
          </View>
          <Text
            style={{ fontFamily: 'Quicksand_400Regular', color: '#5a3fa3' }}
            className="text-base text-center leading-6 px-4"
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
            className="rounded-2xl px-8 py-5 border"
            style={{ backgroundColor: 'rgba(255,255,255,0.8)', borderColor: 'rgba(185, 166, 247, 0.3)' }}
          >
            <Text
              style={{ fontFamily: 'Quicksand_600SemiBold', color: '#4a3485' }}
              className="text-xl text-center"
            >
              {formatDate(lastPeriod)}
            </Text>
          </Pressable>
          {showDatePicker && (
            <View className="mt-4 rounded-2xl overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.95)' }}>
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
                themeVariant="light"
              />
              {Platform.OS === 'ios' && (
                <Pressable
                  onPress={() => setShowDatePicker(false)}
                  className="py-3 border-t"
                  style={{ borderTopColor: 'rgba(185, 166, 247, 0.3)' }}
                >
                  <Text
                    style={{ fontFamily: 'Quicksand_600SemiBold', color: '#9d84ed' }}
                    className="text-center"
                  >
                    Done
                  </Text>
                </Pressable>
              )}
            </View>
          )}
          <Text
            style={{ fontFamily: 'Quicksand_400Regular', color: '#8466db' }}
            className="text-sm text-center mt-6"
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
                className="w-14 h-14 rounded-full items-center justify-center m-1.5 border"
                style={{
                  backgroundColor: cycleLength === length ? '#9d84ed' : 'rgba(255,255,255,0.8)',
                  borderColor: cycleLength === length ? '#9d84ed' : 'rgba(185, 166, 247, 0.3)',
                }}
              >
                <Text
                  style={{
                    fontFamily: 'Quicksand_600SemiBold',
                    color: cycleLength === length ? '#fff' : '#6d4fc4',
                  }}
                  className="text-base"
                >
                  {length}
                </Text>
              </Pressable>
            ))}
          </View>
          <Text
            style={{ fontFamily: 'Quicksand_400Regular', color: '#8466db' }}
            className="text-sm text-center mt-6"
          >
            Average is 28 days
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
                className="w-16 h-16 rounded-full items-center justify-center mx-2 border"
                style={{
                  backgroundColor: periodLength === length ? '#ff8aa6' : 'rgba(255,255,255,0.8)',
                  borderColor: periodLength === length ? '#ff8aa6' : 'rgba(255, 179, 196, 0.4)',
                }}
              >
                <Text
                  style={{
                    fontFamily: 'Quicksand_600SemiBold',
                    color: periodLength === length ? '#fff' : '#d42a56',
                  }}
                  className="text-lg"
                >
                  {length}
                </Text>
              </Pressable>
            ))}
          </View>
          <Text
            style={{ fontFamily: 'Quicksand_400Regular', color: '#8466db' }}
            className="text-sm text-center mt-6"
          >
            Average is 5 days
          </Text>

          {/* Summary */}
          <View
            className="mt-10 rounded-2xl p-5 w-full border"
            style={{ backgroundColor: 'rgba(255,255,255,0.8)', borderColor: 'rgba(185, 166, 247, 0.3)' }}
          >
            <Text
              style={{ fontFamily: 'Quicksand_600SemiBold', color: '#9d84ed' }}
              className="text-xs uppercase tracking-wider mb-4"
            >
              Your Cycle Summary
            </Text>
            <View className="flex-row justify-between mb-2">
              <Text style={{ fontFamily: 'Quicksand_400Regular', color: '#6d4fc4' }}>
                Last period started
              </Text>
              <Text style={{ fontFamily: 'Quicksand_500Medium', color: '#4a3485' }}>
                {formatDate(lastPeriod)}
              </Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text style={{ fontFamily: 'Quicksand_400Regular', color: '#6d4fc4' }}>
                Cycle length
              </Text>
              <Text style={{ fontFamily: 'Quicksand_500Medium', color: '#4a3485' }}>
                {cycleLength} days
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text style={{ fontFamily: 'Quicksand_400Regular', color: '#6d4fc4' }}>
                Period length
              </Text>
              <Text style={{ fontFamily: 'Quicksand_500Medium', color: '#4a3485' }}>
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
        colors={['#f8f7ff', '#f0edff', '#fdf2f8', '#f5f0ff', '#f8f7ff']}
        locations={[0, 0.25, 0.5, 0.75, 1]}
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
              className="w-10 h-10 rounded-full items-center justify-center border"
              style={{ backgroundColor: 'rgba(255,255,255,0.6)', borderColor: 'rgba(185, 166, 247, 0.3)' }}
            >
              <ChevronLeft size={20} color="#9d84ed" />
            </Pressable>
          ) : (
            <View className="w-10 h-10" />
          )}

          {/* Progress dots */}
          <View className="flex-1 flex-row justify-center">
            {steps.map((_, i) => (
              <View
                key={i}
                className="w-2 h-2 rounded-full mx-1"
                style={{
                  backgroundColor: i === step ? '#9d84ed' : i < step ? '#c4b5fd' : 'rgba(185, 166, 247, 0.3)',
                }}
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
              style={{ fontFamily: 'CormorantGaramond_600SemiBold', color: '#4a3485' }}
              className="text-3xl text-center mb-2"
            >
              {currentStep.title}
            </Text>
            <Text
              style={{ fontFamily: 'Quicksand_400Regular', color: '#8466db' }}
              className="text-sm text-center mb-10"
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
              colors={['#f9a8d4', '#c4b5fd']}
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
                style={{ fontFamily: 'Quicksand_600SemiBold', color: '#fff' }}
                className="text-base mr-2"
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
              style={{ fontFamily: 'Quicksand_400Regular', color: '#b9a6f7' }}
              className="text-xs text-center mt-4"
            >
              Your data stays on your device. We respect your privacy.
            </Text>
          )}
        </View>
      </LinearGradient>
    </View>
  );
}

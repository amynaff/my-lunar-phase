import React, { useState } from 'react';
import { View, Text, Pressable, Dimensions, Platform, Modal, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  SlideInRight,
  SlideOutLeft,
} from 'react-native-reanimated';
import { Moon, Sparkles, ArrowRight, ChevronLeft, ChevronDown } from 'lucide-react-native';
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

// Generate last 60 days for date selection
const generateRecentDates = () => {
  const dates: Date[] = [];
  const today = new Date();
  for (let i = 0; i < 60; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    dates.push(date);
  }
  return dates;
};

const RECENT_DATES = generateRecentDates();

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
            className="rounded-2xl px-8 py-5 border flex-row items-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.8)', borderColor: 'rgba(185, 166, 247, 0.3)' }}
          >
            <Text
              style={{ fontFamily: 'Quicksand_600SemiBold', color: '#4a3485' }}
              className="text-xl text-center"
            >
              {formatDate(lastPeriod)}
            </Text>
            <ChevronDown size={20} color="#9d84ed" style={{ marginLeft: 8 }} />
          </Pressable>
          <Text
            style={{ fontFamily: 'Quicksand_400Regular', color: '#8466db' }}
            className="text-sm text-center mt-4"
          >
            Tap to select a different date
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

      {/* Date Picker Modal - works on all platforms including web */}
      <Modal visible={showDatePicker} transparent animationType="slide">
        <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <View className="rounded-t-3xl" style={{ backgroundColor: '#fff', maxHeight: height * 0.6 }}>
            <View className="flex-row justify-between items-center p-4 border-b" style={{ borderBottomColor: 'rgba(185, 166, 247, 0.2)' }}>
              <Pressable onPress={() => setShowDatePicker(false)}>
                <Text style={{ fontFamily: 'Quicksand_500Medium', color: '#ff6289' }}>Cancel</Text>
              </Pressable>
              <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: '#4a3485' }}>
                Select Date
              </Text>
              <View style={{ width: 50 }} />
            </View>
            <ScrollView
              className="p-4"
              contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
            >
              {RECENT_DATES.map((date, index) => {
                const isSelected =
                  date.getDate() === lastPeriod.getDate() &&
                  date.getMonth() === lastPeriod.getMonth() &&
                  date.getFullYear() === lastPeriod.getFullYear();

                const isToday = index === 0;
                const daysAgo = index === 0 ? 'Today' : index === 1 ? 'Yesterday' : `${index} days ago`;

                return (
                  <Pressable
                    key={index}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setLastPeriod(date);
                      setShowDatePicker(false);
                    }}
                    className="p-4 rounded-xl mb-2 border flex-row items-center justify-between"
                    style={{
                      backgroundColor: isSelected ? '#9d84ed' : 'rgba(248,247,255,1)',
                      borderColor: isSelected ? '#9d84ed' : 'rgba(185, 166, 247, 0.3)',
                    }}
                  >
                    <View>
                      <Text
                        style={{
                          fontFamily: 'Quicksand_600SemiBold',
                          color: isSelected ? '#fff' : '#4a3485',
                        }}
                        className="text-base"
                      >
                        {formatDate(date)}
                      </Text>
                      <Text
                        style={{
                          fontFamily: 'Quicksand_400Regular',
                          color: isSelected ? 'rgba(255,255,255,0.8)' : '#8466db',
                        }}
                        className="text-xs mt-0.5"
                      >
                        {daysAgo}
                      </Text>
                    </View>
                    {isSelected && (
                      <View className="w-6 h-6 rounded-full bg-white items-center justify-center">
                        <View className="w-3 h-3 rounded-full" style={{ backgroundColor: '#9d84ed' }} />
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

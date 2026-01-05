import React from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import {
  X,
  Moon,
  Calendar,
  Clock,
  RotateCcw,
  Heart,
  Info,
  ChevronRight,
} from 'lucide-react-native';
import { useCycleStore, phaseInfo } from '@/lib/cycle-store';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
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

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const lastPeriodStart = useCycleStore(s => s.lastPeriodStart);
  const cycleLength = useCycleStore(s => s.cycleLength);
  const periodLength = useCycleStore(s => s.periodLength);
  const resetOnboarding = useCycleStore(s => s.resetOnboarding);
  const getCurrentPhase = useCycleStore(s => s.getCurrentPhase);
  const getDayOfCycle = useCycleStore(s => s.getDayOfCycle);

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
        colors={['#0f0720', '#1e0a3c', '#2d1050', '#1e0a3c', '#0f0720']}
        locations={[0, 0.3, 0.5, 0.7, 1]}
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
                style={{ fontFamily: 'CormorantGaramond_600SemiBold' }}
                className="text-white text-3xl"
              >
                Settings
              </Text>
              <Pressable
                onPress={() => router.back()}
                className="w-10 h-10 rounded-full bg-white/10 items-center justify-center"
              >
                <X size={20} color="#f9a8d4" />
              </Pressable>
            </View>
          </Animated.View>

          {/* Current Cycle Info */}
          <Animated.View
            entering={FadeInUp.delay(200).duration(600)}
            className="mx-6 mt-8"
          >
            <LinearGradient
              colors={[`${info.color}30`, `${info.color}10`]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ borderRadius: 24, padding: 20 }}
            >
              <View className="flex-row items-center mb-4">
                <View
                  className="w-12 h-12 rounded-full items-center justify-center mr-4"
                  style={{ backgroundColor: `${info.color}40` }}
                >
                  <Text className="text-2xl">{info.emoji}</Text>
                </View>
                <View>
                  <Text
                    style={{ fontFamily: 'Quicksand_600SemiBold' }}
                    className="text-white text-lg"
                  >
                    {info.name} Phase
                  </Text>
                  <Text
                    style={{ fontFamily: 'Quicksand_400Regular' }}
                    className="text-luna-300/70 text-sm"
                  >
                    Day {dayOfCycle} of {cycleLength}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Cycle Settings */}
          <Animated.View
            entering={FadeInUp.delay(300).duration(600)}
            className="mx-6 mt-6"
          >
            <Text
              style={{ fontFamily: 'Quicksand_600SemiBold' }}
              className="text-luna-400 text-xs uppercase tracking-wider mb-4"
            >
              Cycle Information
            </Text>
            <View className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
              <View className="p-4 flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <Calendar size={18} color="#f472b6" />
                  <Text
                    style={{ fontFamily: 'Quicksand_500Medium' }}
                    className="text-white text-sm ml-3"
                  >
                    Last Period Start
                  </Text>
                </View>
                <Text
                  style={{ fontFamily: 'Quicksand_400Regular' }}
                  className="text-luna-300/70 text-sm"
                >
                  {formatDate(lastPeriodStart)}
                </Text>
              </View>

              <View className="border-t border-white/10 p-4 flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <Clock size={18} color="#c084fc" />
                  <Text
                    style={{ fontFamily: 'Quicksand_500Medium' }}
                    className="text-white text-sm ml-3"
                  >
                    Cycle Length
                  </Text>
                </View>
                <Text
                  style={{ fontFamily: 'Quicksand_400Regular' }}
                  className="text-luna-300/70 text-sm"
                >
                  {cycleLength} days
                </Text>
              </View>

              <View className="border-t border-white/10 p-4 flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <Moon size={18} color="#a78bfa" />
                  <Text
                    style={{ fontFamily: 'Quicksand_500Medium' }}
                    className="text-white text-sm ml-3"
                  >
                    Period Length
                  </Text>
                </View>
                <Text
                  style={{ fontFamily: 'Quicksand_400Regular' }}
                  className="text-luna-300/70 text-sm"
                >
                  {periodLength} days
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* Actions */}
          <Animated.View
            entering={FadeInUp.delay(400).duration(600)}
            className="mx-6 mt-6"
          >
            <Text
              style={{ fontFamily: 'Quicksand_600SemiBold' }}
              className="text-luna-400 text-xs uppercase tracking-wider mb-4"
            >
              Actions
            </Text>
            <View className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
              <Pressable
                onPress={handleReset}
                className="p-4 flex-row items-center justify-between"
              >
                <View className="flex-row items-center">
                  <RotateCcw size={18} color="#fb7185" />
                  <Text
                    style={{ fontFamily: 'Quicksand_500Medium' }}
                    className="text-white text-sm ml-3"
                  >
                    Reset Cycle Data
                  </Text>
                </View>
                <ChevronRight size={18} color="#a78bfa" />
              </Pressable>
            </View>
          </Animated.View>

          {/* About */}
          <Animated.View
            entering={FadeInUp.delay(500).duration(600)}
            className="mx-6 mt-6"
          >
            <Text
              style={{ fontFamily: 'Quicksand_600SemiBold' }}
              className="text-luna-400 text-xs uppercase tracking-wider mb-4"
            >
              About
            </Text>
            <View className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
              <View className="p-4 flex-row items-center">
                <Info size={18} color="#a78bfa" />
                <Text
                  style={{ fontFamily: 'Quicksand_400Regular' }}
                  className="text-luna-200/70 text-sm ml-3 flex-1"
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
              <Heart size={14} color="#f472b6" />
              <Text
                style={{ fontFamily: 'Quicksand_400Regular' }}
                className="text-luna-300/50 text-xs ml-2"
              >
                Made with love for women everywhere
              </Text>
            </View>
            <Text
              style={{ fontFamily: 'Quicksand_400Regular' }}
              className="text-luna-300/30 text-xs mt-2"
            >
              Version 1.0.0
            </Text>
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

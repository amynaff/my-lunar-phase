import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, Dimensions, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import { Moon, Sparkles, Heart, Calendar, ChevronRight } from 'lucide-react-native';
import { CycleWheel } from '@/components/CycleWheel';
import { useCycleStore, phaseInfo } from '@/lib/cycle-store';
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

const { width } = Dimensions.get('window');

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const getCurrentPhase = useCycleStore(s => s.getCurrentPhase);
  const getDaysUntilNextPeriod = useCycleStore(s => s.getDaysUntilNextPeriod);
  const hasCompletedOnboarding = useCycleStore(s => s.hasCompletedOnboarding);
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
      // Small delay to ensure store is hydrated
      setTimeout(() => setIsReady(true), 100);
    }
  }, [fontsLoaded]);

  useEffect(() => {
    if (isReady && !hasCompletedOnboarding) {
      router.replace('/onboarding');
    }
  }, [hasCompletedOnboarding, isReady]);

  if (!fontsLoaded || !isReady) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0f0720', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#f472b6" />
      </View>
    );
  }

  const currentPhase = getCurrentPhase();
  const info = phaseInfo[currentPhase];
  const daysUntilPeriod = getDaysUntilNextPeriod();

  const quickActions = [
    {
      icon: Heart,
      label: 'Self-Care',
      color: '#f472b6',
      route: '/(tabs)/selfcare',
    },
    {
      icon: Sparkles,
      label: 'Nutrition',
      color: '#c084fc',
      route: '/(tabs)/nutrition',
    },
  ];

  return (
    <View className="flex-1">
      <LinearGradient
        colors={['#0f0720', '#1e0a3c', '#2d1050', '#1e0a3c', '#0f0720']}
        locations={[0, 0.3, 0.5, 0.7, 1]}
        style={{ flex: 1 }}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 100 }}
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
                  style={{ fontFamily: 'CormorantGaramond_400Regular' }}
                  className="text-luna-300/60 text-sm tracking-widest uppercase"
                >
                  Welcome back
                </Text>
                <Text
                  style={{ fontFamily: 'CormorantGaramond_600SemiBold' }}
                  className="text-white text-3xl mt-1"
                >
                  Luna Flow
                </Text>
              </View>
              <Pressable
                className="w-10 h-10 rounded-full bg-white/10 items-center justify-center"
                onPress={() => router.push('/settings')}
              >
                <Moon size={20} color="#f9a8d4" />
              </Pressable>
            </View>
          </Animated.View>

          {/* Cycle Wheel */}
          <Animated.View
            entering={FadeInUp.delay(300).duration(800)}
            className="items-center mt-8"
          >
            <CycleWheel />
          </Animated.View>

          {/* Phase Info Card */}
          <Animated.View
            entering={FadeInUp.delay(500).duration(600)}
            className="mx-6 mt-8"
          >
            <LinearGradient
              colors={['rgba(249, 168, 212, 0.15)', 'rgba(147, 51, 234, 0.1)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ borderRadius: 24, padding: 1 }}
            >
              <View className="bg-night-950/80 rounded-3xl p-5">
                <View className="flex-row items-center mb-3">
                  <View
                    className="w-10 h-10 rounded-full items-center justify-center mr-3"
                    style={{ backgroundColor: `${info.color}30` }}
                  >
                    <Text className="text-xl">{info.emoji}</Text>
                  </View>
                  <View className="flex-1">
                    <Text
                      style={{ fontFamily: 'Quicksand_600SemiBold' }}
                      className="text-white text-lg"
                    >
                      {info.name} Phase
                    </Text>
                    <Text
                      style={{ fontFamily: 'Quicksand_400Regular' }}
                      className="text-luna-300/70 text-xs"
                    >
                      {info.energy}
                    </Text>
                  </View>
                </View>

                <Text
                  style={{ fontFamily: 'Quicksand_400Regular' }}
                  className="text-luna-200/80 text-sm leading-5"
                >
                  {info.description}
                </Text>

                <View className="mt-4 pt-4 border-t border-white/10">
                  <View className="flex-row items-center">
                    <Sparkles size={14} color="#f9a8d4" />
                    <Text
                      style={{ fontFamily: 'Quicksand_500Medium' }}
                      className="text-luna-300 text-xs ml-2"
                    >
                      Your superpower: {info.superpower}
                    </Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Next Period Countdown */}
          <Animated.View
            entering={FadeInUp.delay(600).duration(600)}
            className="mx-6 mt-4"
          >
            <Pressable className="flex-row items-center justify-between bg-white/5 rounded-2xl p-4 border border-white/10">
              <View className="flex-row items-center">
                <Calendar size={18} color="#f472b6" />
                <Text
                  style={{ fontFamily: 'Quicksand_500Medium' }}
                  className="text-luna-200 text-sm ml-3"
                >
                  Next period in
                </Text>
              </View>
              <View className="flex-row items-center">
                <Text
                  style={{ fontFamily: 'Quicksand_600SemiBold' }}
                  className="text-white text-lg mr-1"
                >
                  {daysUntilPeriod}
                </Text>
                <Text
                  style={{ fontFamily: 'Quicksand_400Regular' }}
                  className="text-luna-300/70 text-sm"
                >
                  days
                </Text>
              </View>
            </Pressable>
          </Animated.View>

          {/* Quick Actions */}
          <Animated.View
            entering={FadeInUp.delay(700).duration(600)}
            className="mt-8 px-6"
          >
            <Text
              style={{ fontFamily: 'Quicksand_600SemiBold' }}
              className="text-white text-lg mb-4"
            >
              Today's Guidance
            </Text>

            <View className="flex-row" style={{ gap: 12 }}>
              {quickActions.map((action, index) => (
                <AnimatedPressable
                  key={action.label}
                  entering={FadeInUp.delay(800 + index * 100).duration(500)}
                  className="flex-1"
                  onPress={() => router.push(action.route as any)}
                >
                  <LinearGradient
                    colors={[`${action.color}20`, `${action.color}05`]}
                    style={{ borderRadius: 20, padding: 16 }}
                  >
                    <View
                      className="w-12 h-12 rounded-full items-center justify-center mb-3"
                      style={{ backgroundColor: `${action.color}30` }}
                    >
                      <action.icon size={22} color={action.color} />
                    </View>
                    <Text
                      style={{ fontFamily: 'Quicksand_500Medium' }}
                      className="text-white text-sm"
                    >
                      {action.label}
                    </Text>
                    <View className="flex-row items-center mt-1">
                      <Text
                        style={{ fontFamily: 'Quicksand_400Regular' }}
                        className="text-luna-300/60 text-xs"
                      >
                        For {currentPhase}
                      </Text>
                      <ChevronRight size={12} color="#f9a8d4" className="ml-1" />
                    </View>
                  </LinearGradient>
                </AnimatedPressable>
              ))}
            </View>
          </Animated.View>

          {/* Daily Affirmation */}
          <Animated.View
            entering={FadeInUp.delay(900).duration(600)}
            className="mx-6 mt-6"
          >
            <LinearGradient
              colors={['rgba(236, 72, 153, 0.1)', 'rgba(168, 85, 247, 0.1)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ borderRadius: 20, padding: 20 }}
            >
              <Text className="text-luna-400 text-xs uppercase tracking-widest mb-2">
                Daily Affirmation
              </Text>
              <Text
                style={{ fontFamily: 'CormorantGaramond_400Regular' }}
                className="text-white text-xl leading-7"
              >
                {getAffirmation(currentPhase)}
              </Text>
            </LinearGradient>
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

function getAffirmation(phase: string): string {
  const affirmations: Record<string, string> = {
    menstrual: "I honor my body's need for rest and embrace this time of renewal.",
    follicular: "I am filled with creative energy and open to new possibilities.",
    ovulatory: "I radiate confidence and connect deeply with those around me.",
    luteal: "I trust my ability to complete what I've started and honor my need for solitude.",
  };
  return affirmations[phase] || affirmations.follicular;
}

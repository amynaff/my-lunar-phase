import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Sparkles, Brain, FlaskConical, TrendingUp, ChevronRight } from 'lucide-react-native';
import { useThemeStore, getTheme } from '@/lib/theme-store';
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

export default function InsightsScreen() {
  const insets = useSafeAreaInsets();
  const themeMode = useThemeStore(s => s.mode);
  const theme = getTheme(themeMode);
  const getCurrentPhase = useCycleStore(s => s.getCurrentPhase);
  const getDayOfCycle = useCycleStore(s => s.getDayOfCycle);

  const [fontsLoaded] = useFonts({
    CormorantGaramond_400Regular,
    CormorantGaramond_600SemiBold,
    Quicksand_400Regular,
    Quicksand_500Medium,
    Quicksand_600SemiBold,
  });

  const currentPhase = getCurrentPhase();
  const info = phaseInfo[currentPhase];
  const dayOfCycle = getDayOfCycle();

  if (!fontsLoaded) return null;

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={theme.gradient}
        locations={[0, 0.25, 0.5, 0.75, 1]}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 140 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View
            entering={FadeInDown.delay(100).duration(600)}
            style={{ paddingTop: insets.top + 16 }}
            className="px-6"
          >
            <Text
              style={{ fontFamily: 'CormorantGaramond_400Regular', color: theme.text.muted }}
              className="text-sm tracking-widest uppercase"
            >
              Your cycle data
            </Text>
            <Text
              style={{ fontFamily: 'CormorantGaramond_600SemiBold', color: theme.text.primary }}
              className="text-3xl mt-1"
            >
              Insights
            </Text>
          </Animated.View>

          {/* Phase Summary Card */}
          <Animated.View
            entering={FadeInUp.delay(200).duration(600)}
            className="mx-6 mt-5"
          >
            <LinearGradient
              colors={[`${info.color}30`, `${info.color}15`]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ borderRadius: 24, padding: 24, borderWidth: 1, borderColor: `${info.color}30` }}
            >
              <View className="flex-row items-center mb-3">
                <View
                  className="w-14 h-14 rounded-full items-center justify-center mr-4"
                  style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                >
                  <Text className="text-3xl">{info.emoji}</Text>
                </View>
                <View className="flex-1">
                  <Text
                    style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
                    className="text-lg"
                  >
                    {info.name} Phase
                  </Text>
                  <Text
                    style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.secondary }}
                    className="text-sm"
                  >
                    Day {dayOfCycle} of your cycle
                  </Text>
                </View>
                <View
                  className="px-3 py-1.5 rounded-full"
                  style={{ backgroundColor: `${info.color}25` }}
                >
                  <Text
                    style={{ fontFamily: 'Quicksand_600SemiBold', color: info.color }}
                    className="text-xs"
                  >
                    {info.energy}
                  </Text>
                </View>
              </View>
              <Text
                style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.secondary }}
                className="text-sm leading-5"
              >
                {info.description}
              </Text>
              <View className="mt-4 pt-4 border-t" style={{ borderTopColor: `${info.color}30` }}>
                <View className="flex-row items-center">
                  <Sparkles size={14} color={info.color} />
                  <Text
                    style={{ fontFamily: 'Quicksand_500Medium', color: theme.text.primary }}
                    className="text-xs ml-2"
                  >
                    Superpower: {info.superpower}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Coming Soon — Analytics */}
          <Animated.View
            entering={FadeInUp.delay(300).duration(600)}
            className="mx-6 mt-5"
          >
            <View
              className="rounded-2xl p-5 border"
              style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light }}
            >
              <View className="flex-row items-center mb-3">
                <View
                  className="w-10 h-10 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: `${theme.accent.purple}15` }}
                >
                  <TrendingUp size={20} color={theme.accent.purple} />
                </View>
                <View className="flex-1">
                  <Text
                    style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
                    className="text-base"
                  >
                    Detailed Analytics
                  </Text>
                  <View
                    className="px-2 py-0.5 rounded-full mt-0.5 self-start"
                    style={{ backgroundColor: `${theme.accent.pink}20` }}
                  >
                    <Text
                      style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.accent.pink }}
                      className="text-xs"
                    >
                      Coming Soon
                    </Text>
                  </View>
                </View>
              </View>
              <Text
                style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.secondary }}
                className="text-sm leading-5"
              >
                Trend charts and mood heatmaps are on the way. Soon you'll be able to visualize patterns in your cycle, energy, and symptoms over time.
              </Text>
            </View>
          </Animated.View>

          {/* Luna AI Card */}
          <Animated.View
            entering={FadeInUp.delay(400).duration(600)}
            className="mx-6 mt-4"
          >
            <Pressable
              onPress={() => router.push('/luna-ai' as any)}
            >
              <LinearGradient
                colors={[`${theme.accent.purple}20`, `${theme.accent.purple}08`]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ borderRadius: 20, padding: 18, borderWidth: 1, borderColor: `${theme.accent.purple}30` }}
              >
                <View className="flex-row items-center">
                  <View
                    className="w-12 h-12 rounded-full items-center justify-center mr-4"
                    style={{ backgroundColor: `${theme.accent.purple}20` }}
                  >
                    <Brain size={22} color={theme.accent.purple} />
                  </View>
                  <View className="flex-1">
                    <Text
                      style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
                      className="text-base"
                    >
                      Luna AI
                    </Text>
                    <Text
                      style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.tertiary }}
                      className="text-xs mt-0.5"
                    >
                      Ask questions about your cycle and wellness
                    </Text>
                  </View>
                  <ChevronRight size={18} color={theme.text.muted} />
                </View>
              </LinearGradient>
            </Pressable>
          </Animated.View>

          {/* Labs Guide Card */}
          <Animated.View
            entering={FadeInUp.delay(480).duration(600)}
            className="mx-6 mt-4"
          >
            <Pressable
              onPress={() => router.push('/labs-guide' as any)}
              className="flex-row items-center rounded-2xl p-5 border"
              style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light }}
            >
              <View
                className="w-12 h-12 rounded-full items-center justify-center mr-4"
                style={{ backgroundColor: `${theme.accent.blush}15` }}
              >
                <FlaskConical size={22} color={theme.accent.blush} />
              </View>
              <View className="flex-1">
                <Text
                  style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
                  className="text-base"
                >
                  Labs Guide
                </Text>
                <Text
                  style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.tertiary }}
                  className="text-xs mt-0.5"
                >
                  Understand your hormone lab results
                </Text>
              </View>
              <ChevronRight size={18} color={theme.text.muted} />
            </Pressable>
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

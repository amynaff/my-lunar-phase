import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Heart, Activity, Brain, Wind, Sun, Star, ChevronRight } from 'lucide-react-native';
import { useCycleStore, lifeStageInfo } from '@/lib/cycle-store';
import { useThemeStore, getTheme } from '@/lib/theme-store';
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

const wellnessPillars = [
  {
    icon: Heart,
    title: 'Heart Health',
    description: 'Cardiovascular wellness becomes especially important after menopause.',
    color: '#ef4444',
    route: '/hormonal-education',
  },
  {
    icon: Activity,
    title: 'Bone Health',
    description: 'Support bone density with weight-bearing movement and calcium-rich nutrition.',
    color: '#8b5cf6',
    route: '/hormonal-education',
  },
  {
    icon: Brain,
    title: 'Brain Health',
    description: 'Cognitive wellness, mental clarity, and emotional resilience.',
    color: '#06b6d4',
    route: '/hormonal-education',
  },
  {
    icon: Wind,
    title: 'Sleep & Energy',
    description: 'Quality rest and sustained vitality throughout the day.',
    color: '#f59e0b',
    route: '/hormonal-education',
  },
];

export default function WellnessScreen() {
  const insets = useSafeAreaInsets();
  const storedLifeStage = useCycleStore(s => s.lifeStage);
  const themeMode = useThemeStore(s => s.mode);
  const theme = getTheme(themeMode);

  const isMenopause = storedLifeStage === 'menopause';
  const stageColor = isMenopause ? '#8b5cf6' : '#ec4899';
  const StageIcon = isMenopause ? Sun : Star;
  const stageInfo = lifeStageInfo[storedLifeStage];

  const [fontsLoaded] = useFonts({
    CormorantGaramond_400Regular,
    CormorantGaramond_600SemiBold,
    Quicksand_400Regular,
    Quicksand_500Medium,
    Quicksand_600SemiBold,
  });

  if (!fontsLoaded) return null;

  return (
    <View className="flex-1">
      <LinearGradient
        colors={theme.gradient}
        locations={[0, 0.25, 0.5, 0.75, 1]}
        style={{ flex: 1 }}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 120 }}
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
              Your wellness
            </Text>
            <Text
              style={{ fontFamily: 'CormorantGaramond_600SemiBold', color: theme.text.primary }}
              className="text-3xl mt-1"
            >
              Wellness Hub
            </Text>
          </Animated.View>

          {/* Stage Banner */}
          <Animated.View
            entering={FadeInUp.delay(200).duration(600)}
            className="mx-6 mt-6"
          >
            <LinearGradient
              colors={isMenopause ? ['#c4b5fd', '#8b5cf6'] : ['#f9a8d4', '#ec4899']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ borderRadius: 20, padding: 20 }}
            >
              <View className="flex-row items-center">
                <View
                  className="w-14 h-14 rounded-full items-center justify-center mr-4"
                  style={{ backgroundColor: 'rgba(255,255,255,0.25)' }}
                >
                  <StageIcon size={28} color="#fff" />
                </View>
                <View className="flex-1">
                  <Text
                    style={{ fontFamily: 'CormorantGaramond_600SemiBold', color: '#fff' }}
                    className="text-xl"
                  >
                    {stageInfo.name}
                  </Text>
                  <Text
                    style={{ fontFamily: 'Quicksand_400Regular', color: 'rgba(255,255,255,0.85)' }}
                    className="text-xs mt-1"
                  >
                    {stageInfo.description}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Wellness Pillars */}
          <Animated.View
            entering={FadeInUp.delay(300).duration(600)}
            className="mx-6 mt-6"
          >
            <Text
              style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
              className="text-lg mb-4"
            >
              Wellness Pillars
            </Text>

            {wellnessPillars.map((pillar, index) => (
              <Animated.View key={pillar.title} entering={FadeInUp.delay(350 + index * 60).duration(400)}>
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push(pillar.route as any);
                  }}
                  className="flex-row items-center rounded-2xl p-4 border mb-3"
                  style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light }}
                >
                  <View
                    className="w-12 h-12 rounded-full items-center justify-center mr-4"
                    style={{ backgroundColor: `${pillar.color}15` }}
                  >
                    <pillar.icon size={22} color={pillar.color} />
                  </View>
                  <View className="flex-1">
                    <Text
                      style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
                      className="text-sm mb-1"
                    >
                      {pillar.title}
                    </Text>
                    <Text
                      style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.tertiary }}
                      className="text-xs leading-4"
                    >
                      {pillar.description}
                    </Text>
                  </View>
                  <ChevronRight size={18} color={theme.text.muted} />
                </Pressable>
              </Animated.View>
            ))}
          </Animated.View>

          {/* Hormonal Education Link */}
          <Animated.View
            entering={FadeInUp.delay(600).duration(600)}
            className="mx-6 mt-2"
          >
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/hormonal-education');
              }}
              className="flex-row items-center justify-between rounded-2xl p-4 border"
              style={{ backgroundColor: `${stageColor}10`, borderColor: `${stageColor}30` }}
            >
              <View className="flex-row items-center flex-1">
                <View
                  className="w-10 h-10 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: `${stageColor}20` }}
                >
                  <Brain size={20} color={stageColor} />
                </View>
                <View className="flex-1">
                  <Text
                    style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
                    className="text-sm"
                  >
                    Hormonal Health Education
                  </Text>
                  <Text
                    style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.tertiary }}
                    className="text-xs"
                  >
                    Learn about hormone support options
                  </Text>
                </View>
              </View>
              <ChevronRight size={18} color={theme.text.tertiary} />
            </Pressable>
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

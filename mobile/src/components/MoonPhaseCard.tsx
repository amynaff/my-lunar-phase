import React from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, { FadeInUp, useAnimatedStyle, useSharedValue, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronRight, Sparkles } from 'lucide-react-native';
import { getMoonPhase, moonPhaseInfo, phaseInfo, MoonPhase } from '@/lib/cycle-store';
import { getTheme, useThemeStore } from '@/lib/theme-store';
import * as Haptics from 'expo-haptics';

interface MoonPhaseCardProps {
  onPress?: () => void;
  showEducation?: boolean;
  compact?: boolean;
}

// Map moon phase to a "day" in a 29-day lunar cycle for display
const getMoonDay = (moonPhase: MoonPhase): number => {
  const dayMap: Record<MoonPhase, number> = {
    new_moon: 1,
    waxing_crescent: 4,
    first_quarter: 8,
    waxing_gibbous: 11,
    full_moon: 15,
    waning_gibbous: 19,
    last_quarter: 22,
    waning_crescent: 26,
  };
  return dayMap[moonPhase];
};

export function MoonPhaseCard({ onPress, showEducation = true, compact = false }: MoonPhaseCardProps) {
  const themeMode = useThemeStore(s => s.mode);
  const theme = getTheme(themeMode);

  const currentMoonPhase = getMoonPhase();
  const moonInfo = moonPhaseInfo[currentMoonPhase];
  const correspondingCyclePhase = moonInfo.correspondingCyclePhase;
  const cycleInfo = phaseInfo[correspondingCyclePhase];
  const moonDay = getMoonDay(currentMoonPhase);

  // Glow animation for the moon
  const glowOpacity = useSharedValue(0.4);

  React.useEffect(() => {
    glowOpacity.value = withRepeat(
      withTiming(0.8, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  if (compact) {
    return (
      <Pressable onPress={handlePress}>
        <View
          className="rounded-2xl p-4 border flex-row items-center"
          style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light }}
        >
          <View className="relative mr-3">
            <Animated.View
              style={[
                glowStyle,
                {
                  position: 'absolute',
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: moonInfo.color,
                  shadowColor: moonInfo.color,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.8,
                  shadowRadius: 12,
                },
              ]}
            />
            <View
              className="w-12 h-12 rounded-full items-center justify-center"
              style={{ backgroundColor: `${moonInfo.color}30` }}
            >
              <Text className="text-2xl">{moonInfo.emoji}</Text>
            </View>
          </View>

          <View className="flex-1">
            <Text
              style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
              className="text-base"
            >
              {moonInfo.name}
            </Text>
            <Text
              style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.tertiary }}
              className="text-xs"
            >
              Day {moonDay} of lunar cycle
            </Text>
          </View>

          {onPress && <ChevronRight size={18} color={theme.text.tertiary} />}
        </View>
      </Pressable>
    );
  }

  return (
    <Animated.View entering={FadeInUp.delay(300).duration(600)}>
      <Pressable onPress={handlePress}>
        <LinearGradient
          colors={[`${moonInfo.color}20`, `${cycleInfo.color}15`]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: 24, padding: 20, borderWidth: 1, borderColor: `${moonInfo.color}40` }}
        >
          {/* Header */}
          <View className="flex-row items-start justify-between mb-4">
            <View className="flex-1">
              <Text
                style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.accent }}
                className="text-xs uppercase tracking-wider mb-1"
              >
                Current Moon Phase
              </Text>
              <Text
                style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
                className="text-xl"
              >
                {moonInfo.name}
              </Text>
              <Text
                style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.tertiary }}
                className="text-xs mt-0.5"
              >
                Day {moonDay} of 29-day lunar cycle
              </Text>
            </View>

            {/* Moon Visual */}
            <View className="relative">
              <Animated.View
                style={[
                  glowStyle,
                  {
                    position: 'absolute',
                    width: 64,
                    height: 64,
                    borderRadius: 32,
                    backgroundColor: moonInfo.color,
                    shadowColor: moonInfo.color,
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.6,
                    shadowRadius: 16,
                  },
                ]}
              />
              <View
                className="w-16 h-16 rounded-full items-center justify-center"
                style={{ backgroundColor: `${moonInfo.color}40` }}
              >
                <Text className="text-4xl">{moonInfo.emoji}</Text>
              </View>
            </View>
          </View>

          {/* Moon Energy */}
          <View className="mb-4">
            <Text
              style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.secondary }}
              className="text-sm leading-5"
            >
              {moonInfo.description}
            </Text>
          </View>

          {/* Energy Level */}
          <View
            className="rounded-xl p-3 mb-4"
            style={{ backgroundColor: `${moonInfo.color}15` }}
          >
            <View className="flex-row items-center">
              <Sparkles size={14} color={cycleInfo.color} />
              <Text
                style={{ fontFamily: 'Quicksand_500Medium', color: theme.text.primary }}
                className="text-sm ml-2"
              >
                Energy: {moonInfo.energy}
              </Text>
            </View>
          </View>

          {/* Connection to Cycle Phases */}
          {showEducation && (
            <View
              className="rounded-xl p-4 border"
              style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light }}
            >
              <Text
                style={{ fontFamily: 'Quicksand_600SemiBold', color: cycleInfo.color }}
                className="text-xs uppercase tracking-wider mb-2"
              >
                Nature's Rhythm
              </Text>
              <Text
                style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.secondary }}
                className="text-sm leading-5"
              >
                The {moonInfo.name.toLowerCase()} aligns with the energy of the{' '}
                <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: cycleInfo.color }}>
                  {cycleInfo.name.toLowerCase()} phase
                </Text>
                {' '}- {cycleInfo.description.split(' - ')[1]?.toLowerCase() || cycleInfo.description.toLowerCase()}
              </Text>

              <View className="mt-3 pt-3 border-t" style={{ borderTopColor: theme.border.light }}>
                <Text
                  style={{ fontFamily: 'Quicksand_500Medium', color: theme.text.accent }}
                  className="text-xs"
                >
                  {cycleInfo.emoji} Your superpower: {cycleInfo.superpower}
                </Text>
              </View>
            </View>
          )}

          {onPress && (
            <View className="flex-row items-center justify-end mt-3">
              <Text
                style={{ fontFamily: 'Quicksand_500Medium', color: theme.text.accent }}
                className="text-xs mr-1"
              >
                Learn more
              </Text>
              <ChevronRight size={14} color={theme.text.accent} />
            </View>
          )}
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

// Educational content about following moon phases
export const moonCycleEducation = {
  title: "Following the Moon's Rhythm",
  subtitle: "A unique way to connect with nature",
  intro: `When your menstrual cycle becomes irregular or stops, the moon offers a beautiful way to stay connected to natural rhythms. For thousands of years, women have synced their wellness practices with the lunar cycle.`,

  phases: {
    new_moon: {
      focus: "Rest & Intention Setting",
      practices: [
        "Set intentions for the coming month",
        "Practice deep rest and meditation",
        "Journal about what you want to release",
        "Gentle restorative yoga or stretching",
      ],
    },
    waxing_crescent: {
      focus: "New Beginnings & Planning",
      practices: [
        "Start new projects or habits",
        "Plan your wellness goals",
        "Light cardio or energizing walks",
        "Try new healthy recipes",
      ],
    },
    first_quarter: {
      focus: "Action & Determination",
      practices: [
        "Take decisive action on goals",
        "Moderate intensity workouts",
        "Tackle challenging tasks",
        "Focus on building strength",
      ],
    },
    waxing_gibbous: {
      focus: "Refinement & Adjustment",
      practices: [
        "Review and adjust your approach",
        "Fine-tune your nutrition",
        "Practice patience and trust",
        "Maintain consistent movement",
      ],
    },
    full_moon: {
      focus: "Celebration & Connection",
      practices: [
        "Celebrate your progress",
        "Social activities and connection",
        "High-energy activities if you feel called",
        "Practice gratitude rituals",
      ],
    },
    waning_gibbous: {
      focus: "Gratitude & Sharing",
      practices: [
        "Share your wisdom with others",
        "Practice generous self-care",
        "Begin winding down intensity",
        "Focus on nourishing foods",
      ],
    },
    last_quarter: {
      focus: "Release & Let Go",
      practices: [
        "Release what no longer serves you",
        "Gentle movement and yoga",
        "Declutter your space and mind",
        "Practice forgiveness",
      ],
    },
    waning_crescent: {
      focus: "Rest & Surrender",
      practices: [
        "Embrace deep rest",
        "Restorative practices only",
        "Prepare for the new cycle",
        "Spend time in quiet reflection",
      ],
    },
  },

  whyItMatters: `The moon affects tides, plant growth, and animal behavior. Many women find that aligning with lunar rhythms provides a sense of structure and connection to something larger than themselves - especially during perimenopause and menopause when hormonal cycles shift.`,
};

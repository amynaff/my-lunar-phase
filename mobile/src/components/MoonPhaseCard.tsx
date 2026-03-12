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
              {moonInfo.alternateName} · Day {moonDay}
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
                {moonInfo.alternateName} · Day {moonDay} of 29-day lunar cycle
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
  subtitle: "Connecting with nature's cycles",
  intro: `Being in tune with moon phases is a way for women in all situations—living in the city, by the sea, or anywhere in between—to connect with the rhythms of nature. Whether you're in perimenopause, menopause, or post-menopause, the lunar cycle offers a beautiful framework for wellness and self-care.`,

  phases: {
    new_moon: {
      name: "New Moon",
      alternateName: "Dark Moon",
      focus: "Rest & Intention Setting",
      spiritualMeaning: "The New Moon symbolizes new beginnings, introspection, and the planting of intentions. In spiritual traditions, it represents a time to set goals, cleanse energy, and embrace the unknown.",
      practices: [
        "Set intentions for the coming lunar month",
        "Practice deep rest and meditation",
        "Journal about what you wish to release and manifest",
        "Gentle restorative yoga or stretching",
        "Cleanse your energy and space",
      ],
    },
    waxing_crescent: {
      name: "Waxing Crescent",
      alternateName: "Growing Moon",
      focus: "Growth & Building Momentum",
      spiritualMeaning: "The Waxing Crescent embodies growth, action, and building momentum. It's a time to focus on your intentions, take steps toward your goals, and cultivate positive energy.",
      practices: [
        "Start new projects or habits",
        "Take the first steps toward your intentions",
        "Light cardio or energizing walks",
        "Plan your wellness goals for the cycle",
        "Nurture new relationships or ideas",
      ],
    },
    first_quarter: {
      name: "First Quarter",
      alternateName: "Waxing Half Moon",
      focus: "Action & Decisive Commitment",
      spiritualMeaning: "The First Quarter signifies decision-making, overcoming obstacles, and taking decisive action. It's a time to assess your progress and commit fully to your path.",
      practices: [
        "Take decisive action on your goals",
        "Overcome obstacles with determination",
        "Moderate to high intensity workouts",
        "Make important decisions you've been postponing",
        "Assess and recommit to your intentions",
      ],
    },
    waxing_gibbous: {
      name: "Waxing Gibbous",
      alternateName: "Growing Full Moon",
      focus: "Refinement & Purification",
      spiritualMeaning: "The Waxing Gibbous represents refinement, preparation, and purification. It's ideal for fine-tuning your plans, releasing distractions, and aligning with your purpose.",
      practices: [
        "Review and adjust your approach",
        "Fine-tune your nutrition and self-care",
        "Release distractions that don't serve you",
        "Practice patience and trust the process",
        "Prepare for the fullness ahead",
      ],
    },
    full_moon: {
      name: "Full Moon",
      alternateName: "Power Moon",
      focus: "Celebration & Manifestation",
      spiritualMeaning: "The Full Moon is the peak of lunar energy. It symbolizes fulfillment, revelation, celebration, and release. In many traditions, it's a time for gratitude, manifestation, and spiritual rituals.",
      practices: [
        "Celebrate your progress and achievements",
        "Practice gratitude rituals",
        "Social activities and deep connection",
        "Release what no longer serves you",
        "High-energy activities if you feel called",
        "Manifest your deepest intentions",
      ],
    },
    waning_gibbous: {
      name: "Waning Gibbous",
      alternateName: "Declining Moon",
      focus: "Gratitude & Wisdom Sharing",
      spiritualMeaning: "The Waning Gibbous emphasizes gratitude, reflection, and sharing wisdom. It's a time to acknowledge your achievements, give thanks for your blessings, and share what you've learned.",
      practices: [
        "Share your wisdom and experiences with others",
        "Practice generous self-care",
        "Express gratitude for all you've received",
        "Begin winding down intensity",
        "Focus on nourishing, grounding foods",
      ],
    },
    last_quarter: {
      name: "Third Quarter",
      alternateName: "Last Quarter / Waning Half Moon",
      focus: "Release & Forgiveness",
      spiritualMeaning: "The Third Quarter is associated with forgiveness, letting go, and emotional cleansing. It supports releasing old patterns and making peace with the past.",
      practices: [
        "Release what no longer serves you",
        "Practice forgiveness—of self and others",
        "Gentle movement and restorative yoga",
        "Declutter your space and mind",
        "Do shadow work and face hidden truths",
      ],
    },
    waning_crescent: {
      name: "Waning Crescent",
      alternateName: "Surrender Moon / Ashen Moon",
      focus: "Rest & Spiritual Renewal",
      spiritualMeaning: "The Waning Crescent represents rest, surrender, and spiritual renewal. It's a time for deep introspection, healing, and preparing for the next cycle.",
      practices: [
        "Embrace deep, restorative rest",
        "Surrender to what is",
        "Prepare mentally for the new cycle",
        "Spend time in quiet reflection",
        "Connect with your intuition and inner wisdom",
      ],
    },
  },

  darkMoon: {
    name: "Dark Moon",
    description: "A rare, spiritually potent phase when the Moon is completely invisible. Often occurring in the final hours before the New Moon, it's linked to hidden knowledge, deep intuition, and inner transformation.",
    spiritualMeaning: "The Dark Moon is considered a powerful time for shadow work, connecting with unseen truths, and accessing the deepest parts of your psyche. It's a portal between cycles—the space between endings and beginnings.",
  },

  whyItMatters: `The moon affects tides, plant growth, and animal behavior. For women whose menstrual cycles have become irregular or stopped, following the lunar cycle provides structure and connection to something larger than ourselves. Even for women with regular cycles, moon awareness deepens our relationship with natural rhythms—reminding us that our fluctuations in energy, mood, and needs are not weaknesses, but part of a beautiful dance shared with all of nature.`,

  forAllWomen: `Whether you live in a bustling city or by the peaceful sea, whether you're cycling regularly or have completed your menstrual journey, the moon is always there—a constant companion connecting you to the rhythms of the earth. Following her phases is one of the most ancient ways women have honored their connection to nature.`,
};

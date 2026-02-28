import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolateColor,
  FadeIn,
} from 'react-native-reanimated';
import { Moon, Leaf, Sparkles, Star } from 'lucide-react-native';
import { LifeStage, lifeStageInfo } from '@/lib/cycle-store';
import { getTheme } from '@/lib/theme-store';
import * as Haptics from 'expo-haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface LifeStageTabNavProps {
  activeStage: LifeStage;
  onStageChange: (stage: LifeStage) => void;
  themeMode: 'light' | 'dark';
}

interface TabConfig {
  key: LifeStage;
  label: string;
  shortLabel: string;
  icon: typeof Moon;
  color: string;
  gradient: [string, string];
}

const tabs: TabConfig[] = [
  {
    key: 'regular',
    label: 'Menstrual Cycle',
    shortLabel: 'Cycle',
    icon: Moon,
    color: '#9d84ed',
    gradient: ['#f9a8d4', '#c4b5fd'],
  },
  {
    key: 'perimenopause',
    label: 'Perimenopause',
    shortLabel: 'Peri',
    icon: Leaf,
    color: '#f59e0b',
    gradient: ['#fcd34d', '#f59e0b'],
  },
  {
    key: 'menopause',
    label: 'Menopause',
    shortLabel: 'Meno',
    icon: Sparkles,
    color: '#8b5cf6',
    gradient: ['#c4b5fd', '#8b5cf6'],
  },
  {
    key: 'postmenopause',
    label: 'Postmenopause',
    shortLabel: 'Post',
    icon: Star,
    color: '#ec4899',
    gradient: ['#f9a8d4', '#ec4899'],
  },
];

export function LifeStageTabNav({ activeStage, onStageChange, themeMode }: LifeStageTabNavProps) {
  const theme = getTheme(themeMode);

  const handleTabPress = (stage: LifeStage) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onStageChange(stage);
  };

  return (
    <Animated.View
      entering={FadeIn.duration(400)}
      className="mx-4"
    >
      <View
        className="flex-row rounded-2xl p-1.5 border"
        style={{
          backgroundColor: `${theme.bg.card}90`,
          borderColor: theme.border.light,
        }}
      >
        {tabs.map((tab, index) => {
          const isActive = activeStage === tab.key;
          const Icon = tab.icon;

          return (
            <Pressable
              key={tab.key}
              onPress={() => handleTabPress(tab.key)}
              className="flex-1 py-2.5 px-1 rounded-xl items-center justify-center"
              style={[
                isActive && {
                  backgroundColor: `${tab.color}20`,
                  borderWidth: 1,
                  borderColor: `${tab.color}40`,
                },
              ]}
            >
              <View className="flex-row items-center justify-center">
                <Icon
                  size={14}
                  color={isActive ? tab.color : theme.text.tertiary}
                  style={{ marginRight: 4 }}
                />
                <Text
                  style={{
                    fontFamily: isActive ? 'Quicksand_600SemiBold' : 'Quicksand_500Medium',
                    color: isActive ? tab.color : theme.text.tertiary,
                    fontSize: 11,
                  }}
                  numberOfLines={1}
                >
                  {tab.shortLabel}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </Animated.View>
  );
}

// Extended tab navigation with full labels for larger screens or expanded view
export function LifeStageTabNavExpanded({ activeStage, onStageChange, themeMode }: LifeStageTabNavProps) {
  const theme = getTheme(themeMode);

  const handleTabPress = (stage: LifeStage) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onStageChange(stage);
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 4 }}
    >
      <View className="flex-row" style={{ gap: 8 }}>
        {tabs.map((tab) => {
          const isActive = activeStage === tab.key;
          const Icon = tab.icon;

          return (
            <Pressable
              key={tab.key}
              onPress={() => handleTabPress(tab.key)}
              className="flex-row items-center py-2.5 px-4 rounded-full border"
              style={[
                {
                  backgroundColor: isActive ? `${tab.color}15` : `${theme.bg.card}80`,
                  borderColor: isActive ? `${tab.color}40` : theme.border.light,
                },
              ]}
            >
              <Icon
                size={16}
                color={isActive ? tab.color : theme.text.tertiary}
                style={{ marginRight: 6 }}
              />
              <Text
                style={{
                  fontFamily: isActive ? 'Quicksand_600SemiBold' : 'Quicksand_500Medium',
                  color: isActive ? tab.color : theme.text.secondary,
                  fontSize: 13,
                }}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

export { tabs as lifeStageTabConfig };

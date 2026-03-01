import React, { useCallback, useEffect } from 'react';
import { View, Text, Pressable, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  FadeInUp,
  FadeOutRight,
  Layout,
  SlideInRight,
} from 'react-native-reanimated';
import {
  TrendingUp,
  Eye,
  Palette,
  Lightbulb,
  X,
  Sparkles,
  BookOpen,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import {
  useFonts,
  Quicksand_400Regular,
  Quicksand_500Medium,
  Quicksand_600SemiBold,
} from '@expo-google-fonts/quicksand';
import { CormorantGaramond_500Medium } from '@expo-google-fonts/cormorant-garamond';
import { useThemeStore, getTheme } from '@/lib/theme-store';
import { phaseInfo, CyclePhase } from '@/lib/cycle-store';
import {
  useJournalInsights,
  useDismissInsight,
  useMarkInsightAsRead,
  JournalInsight,
} from '@/lib/api/journal';

interface JournalInsightsPanelProps {
  style?: StyleProp<ViewStyle>;
}

type InsightType = 'pattern' | 'observation' | 'theme' | 'suggestion';

const insightTypeConfig: Record<InsightType, {
  icon: typeof TrendingUp;
  color: string;
  bgColor: string;
  label: string;
}> = {
  pattern: {
    icon: TrendingUp,
    color: '#8b5cf6',
    bgColor: 'rgba(139, 92, 246, 0.15)',
    label: 'Pattern',
  },
  observation: {
    icon: Eye,
    color: '#06b6d4',
    bgColor: 'rgba(6, 182, 212, 0.15)',
    label: 'Observation',
  },
  theme: {
    icon: Palette,
    color: '#ec4899',
    bgColor: 'rgba(236, 72, 153, 0.15)',
    label: 'Theme',
  },
  suggestion: {
    icon: Lightbulb,
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.15)',
    label: 'Suggestion',
  },
};

// Helper to get cycle phase color
const getPhaseColor = (phase: string): string => {
  const info = phaseInfo[phase as CyclePhase];
  return info?.color || '#9d84ed';
};

// Mock data for insights (used when no real data is available)
const mockInsights: JournalInsight[] = [
  {
    id: 'mock-1',
    userId: 'user',
    type: 'pattern',
    title: 'Sleep & Energy Connection',
    content: 'You tend to write about lower energy on days when you mention poor sleep. Prioritizing rest during your luteal phase might help.',
    confidence: 0.85,
    relatedTags: ['tired', 'rest'],
    relatedPhases: ['luteal'],
    dateRange: null,
    isRead: false,
    isDismissed: false,
    createdAt: new Date().toISOString(),
    expiresAt: null,
  },
  {
    id: 'mock-2',
    userId: 'user',
    type: 'observation',
    title: 'Creativity Peaks',
    content: 'Your most creative and detailed entries often appear during your follicular phase. This is a great time for brainstorming and new projects.',
    confidence: 0.78,
    relatedTags: ['creative', 'energized'],
    relatedPhases: ['follicular'],
    dateRange: null,
    isRead: false,
    isDismissed: false,
    createdAt: new Date().toISOString(),
    expiresAt: null,
  },
];

export function JournalInsightsPanel({ style }: JournalInsightsPanelProps) {
  const themeMode = useThemeStore((s) => s.mode);
  const theme = getTheme(themeMode);

  const { data: insightsData, isLoading, error } = useJournalInsights();
  const dismissMutation = useDismissInsight();
  const markAsReadMutation = useMarkInsightAsRead();

  const [fontsLoaded] = useFonts({
    Quicksand_400Regular,
    Quicksand_500Medium,
    Quicksand_600SemiBold,
    CormorantGaramond_500Medium,
  });

  // Filter out dismissed insights
  const activeInsights = (insightsData?.insights || []).filter(
    (insight) => !insight.isDismissed
  );

  // Use mock data if no real insights available (for demo purposes)
  const displayInsights = activeInsights.length > 0 ? activeInsights : (error ? [] : mockInsights);

  // Mark insight as read when it becomes visible
  const handleInsightView = useCallback((insight: JournalInsight) => {
    if (!insight.isRead && !insight.id.startsWith('mock-')) {
      markAsReadMutation.mutate(insight.id);
    }
  }, [markAsReadMutation]);

  // Handle dismiss
  const handleDismiss = useCallback((insightId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!insightId.startsWith('mock-')) {
      dismissMutation.mutate(insightId);
    }
  }, [dismissMutation]);

  // Mark insights as read when they appear
  useEffect(() => {
    displayInsights.forEach((insight) => {
      if (!insight.isRead) {
        handleInsightView(insight);
      }
    });
  }, [displayInsights, handleInsightView]);

  if (!fontsLoaded) return null;

  // Empty state
  if (displayInsights.length === 0 && !isLoading) {
    return (
      <Animated.View
        entering={FadeInUp.duration(400)}
        style={style}
      >
        <View
          className="p-5 rounded-3xl border"
          style={{
            backgroundColor: theme.bg.card,
            borderColor: theme.border.light,
          }}
        >
          {/* Header */}
          <View className="flex-row items-center mb-4">
            <View
              className="w-8 h-8 rounded-full items-center justify-center mr-2"
              style={{ backgroundColor: `${theme.accent.purple}15` }}
            >
              <Sparkles size={16} color={theme.accent.purple} />
            </View>
            <Text
              style={{ fontFamily: 'Quicksand_500Medium', color: theme.text.secondary }}
              className="text-sm"
            >
              Luna noticed...
            </Text>
          </View>

          {/* Empty State Content */}
          <View className="items-center py-6">
            <View
              className="w-16 h-16 rounded-full items-center justify-center mb-4"
              style={{ backgroundColor: `${theme.accent.lavender}15` }}
            >
              <BookOpen size={28} color={theme.accent.lavender} />
            </View>
            <Text
              style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
              className="text-base mb-2"
            >
              Keep journaling!
            </Text>
            <Text
              style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.tertiary }}
              className="text-sm text-center leading-5"
            >
              As you write more entries, I will start noticing patterns and offer personalized insights about your cycle and wellbeing.
            </Text>
          </View>
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      entering={FadeInUp.duration(400)}
      style={style}
    >
      {/* Header */}
      <View className="flex-row items-center mb-4 px-1">
        <View
          className="w-7 h-7 rounded-full items-center justify-center mr-2"
          style={{ backgroundColor: `${theme.accent.purple}15` }}
        >
          <Sparkles size={14} color={theme.accent.purple} />
        </View>
        <Text
          style={{ fontFamily: 'Quicksand_500Medium', color: theme.text.secondary }}
          className="text-sm"
        >
          Luna noticed...
        </Text>
      </View>

      {/* Insight Cards */}
      <View style={{ gap: 12 }}>
        {displayInsights.map((insight, index) => {
          const typeKey = (insight.type as InsightType) || 'observation';
          const config = insightTypeConfig[typeKey] || insightTypeConfig.observation;
          const Icon = config.icon;

          // Extract tags and phases from content (mock parsing)
          // In a real app, these would come from the API
          const extractedTags: string[] = insight.relatedTags || [];
          const extractedPhases: string[] = insight.relatedPhases || [];

          // Simple extraction for demo (look for phase names in content if not provided)
          if (extractedPhases.length === 0) {
            const phases = ['menstrual', 'follicular', 'ovulatory', 'luteal'];
            phases.forEach((phase) => {
              if (insight.content.toLowerCase().includes(phase)) {
                extractedPhases.push(phase);
              }
            });
          }

          return (
            <Animated.View
              key={insight.id}
              entering={SlideInRight.delay(index * 100).duration(400)}
              exiting={FadeOutRight.duration(300)}
              layout={Layout.springify()}
            >
              <View
                className="p-4 rounded-2xl border"
                style={{
                  backgroundColor: theme.bg.card,
                  borderColor: theme.border.light,
                }}
              >
                {/* Card Header */}
                <View className="flex-row items-start justify-between mb-3">
                  {/* Type Badge */}
                  <View
                    className="flex-row items-center px-2.5 py-1.5 rounded-full"
                    style={{ backgroundColor: config.bgColor }}
                  >
                    <Icon size={12} color={config.color} />
                    <Text
                      style={{
                        fontFamily: 'Quicksand_600SemiBold',
                        color: config.color,
                      }}
                      className="text-xs ml-1.5"
                    >
                      {config.label}
                    </Text>
                  </View>

                  {/* Dismiss Button */}
                  <Pressable
                    onPress={() => handleDismiss(insight.id)}
                    className="w-7 h-7 rounded-full items-center justify-center -mt-1 -mr-1"
                    style={{ backgroundColor: `${theme.text.tertiary}10` }}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <X size={14} color={theme.text.tertiary} />
                  </Pressable>
                </View>

                {/* Title */}
                <Text
                  style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
                  className="text-base mb-2"
                >
                  {insight.title}
                </Text>

                {/* Content */}
                <Text
                  style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.secondary }}
                  className="text-sm leading-5"
                >
                  {insight.content}
                </Text>

                {/* Related Tags & Phases */}
                {(extractedTags.length > 0 || extractedPhases.length > 0) && (
                  <View className="flex-row flex-wrap mt-3" style={{ gap: 6 }}>
                    {/* Related Phases */}
                    {extractedPhases.map((phase: string) => (
                      <View
                        key={phase}
                        className="px-2.5 py-1 rounded-full"
                        style={{ backgroundColor: `${getPhaseColor(phase)}15` }}
                      >
                        <Text
                          style={{
                            fontFamily: 'Quicksand_500Medium',
                            color: getPhaseColor(phase),
                          }}
                          className="text-xs"
                        >
                          {phaseInfo[phase as CyclePhase]?.emoji} {phaseInfo[phase as CyclePhase]?.name}
                        </Text>
                      </View>
                    ))}

                    {/* Related Tags */}
                    {extractedTags.map((tag: string) => (
                      <View
                        key={tag}
                        className="px-2.5 py-1 rounded-full"
                        style={{ backgroundColor: `${theme.accent.lavender}20` }}
                      >
                        <Text
                          style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.tertiary }}
                          className="text-xs"
                        >
                          {tag}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Unread indicator */}
                {!insight.isRead && !insight.id.startsWith('mock-') && (
                  <View
                    className="absolute top-4 right-12 w-2 h-2 rounded-full"
                    style={{ backgroundColor: theme.accent.pink }}
                  />
                )}
              </View>
            </Animated.View>
          );
        })}
      </View>
    </Animated.View>
  );
}

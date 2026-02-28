import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import {
  Activity,
  ChevronRight,
  Plus,
  TrendingUp,
  History,
  Sparkles,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useThemeStore, getTheme, ThemeMode } from '@/lib/theme-store';
import { useCycleStore, CyclePhase, phaseInfo } from '@/lib/cycle-store';
import {
  useSymptomStore,
  getSymptomById,
  severityConfig,
} from '@/lib/symptom-store';

interface SymptomInsightsCardProps {
  themeMode?: ThemeMode;
  onLogSymptoms?: () => void;
  onViewHistory?: () => void;
}

export function SymptomInsightsCard({
  themeMode: propThemeMode,
  onLogSymptoms,
  onViewHistory,
}: SymptomInsightsCardProps) {
  const storeThemeMode = useThemeStore((s) => s.mode);
  const themeMode = propThemeMode ?? storeThemeMode;
  const theme = getTheme(themeMode);

  const getCurrentPhase = useCycleStore((s) => s.getCurrentPhase);
  const currentPhase = getCurrentPhase();

  const entries = useSymptomStore((s) => s.entries);
  const getRecentEntries = useSymptomStore((s) => s.getRecentEntries);
  const getPredictedSymptoms = useSymptomStore((s) => s.getPredictedSymptoms);
  const getMostCommonSymptoms = useSymptomStore((s) => s.getMostCommonSymptoms);

  const today = new Date().toISOString().split('T')[0];
  const todayEntry = entries.find(e => e.date === today);
  const recentEntries = getRecentEntries(7);
  const predictions = getPredictedSymptoms(currentPhase);
  const mostCommon = getMostCommonSymptoms(3);

  const hasLoggedToday = !!todayEntry;
  const loggingStreak = (() => {
    let streak = 0;
    const sortedEntries = [...entries].sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const checkDate = new Date();
    for (const entry of sortedEntries) {
      const entryDate = new Date(entry.date).toISOString().split('T')[0];
      const expectedDate = checkDate.toISOString().split('T')[0];

      if (entryDate === expectedDate) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (new Date(entryDate) < checkDate) {
        break;
      }
    }
    return streak;
  })();

  return (
    <View
      className="rounded-3xl overflow-hidden"
      style={{ borderWidth: 1, borderColor: theme.border.light }}
    >
      <LinearGradient
        colors={[theme.bg.card, `${theme.accent.purple}08`]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ padding: 20 }}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <View
              className="w-10 h-10 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: `${theme.accent.pink}20` }}
            >
              <Activity size={20} color={theme.accent.pink} />
            </View>
            <View>
              <Text
                style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
                className="text-base"
              >
                Symptom Tracking
              </Text>
              <Text
                style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.tertiary }}
                className="text-xs"
              >
                {entries.length} entries logged
              </Text>
            </View>
          </View>
          {entries.length > 0 && (
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onViewHistory?.();
              }}
              className="flex-row items-center"
            >
              <Text
                style={{ fontFamily: 'Quicksand_500Medium', color: theme.accent.purple }}
                className="text-xs mr-1"
              >
                History
              </Text>
              <ChevronRight size={14} color={theme.accent.purple} />
            </Pressable>
          )}
        </View>

        {/* Log Today CTA */}
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onLogSymptoms?.();
          }}
          className="flex-row items-center justify-between p-4 rounded-2xl mb-4"
          style={{
            backgroundColor: hasLoggedToday ? `${theme.accent.purple}10` : theme.accent.pink,
            borderWidth: hasLoggedToday ? 1 : 0,
            borderColor: `${theme.accent.purple}20`,
          }}
        >
          <View className="flex-row items-center">
            {hasLoggedToday ? (
              <>
                <View
                  className="w-8 h-8 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: `${theme.accent.purple}20` }}
                >
                  <Sparkles size={16} color={theme.accent.purple} />
                </View>
                <View>
                  <Text
                    style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
                    className="text-sm"
                  >
                    Logged today
                  </Text>
                  <Text
                    style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.tertiary }}
                    className="text-xs"
                  >
                    {todayEntry?.symptoms.length} symptom{todayEntry?.symptoms.length !== 1 ? 's' : ''} tracked
                  </Text>
                </View>
              </>
            ) : (
              <>
                <View
                  className="w-8 h-8 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                >
                  <Plus size={18} color="#fff" />
                </View>
                <View>
                  <Text
                    style={{ fontFamily: 'Quicksand_600SemiBold', color: '#fff' }}
                    className="text-sm"
                  >
                    Log today's symptoms
                  </Text>
                  <Text
                    style={{ fontFamily: 'Quicksand_400Regular', color: 'rgba(255,255,255,0.8)' }}
                    className="text-xs"
                  >
                    Track how you're feeling
                  </Text>
                </View>
              </>
            )}
          </View>
          <ChevronRight size={18} color={hasLoggedToday ? theme.accent.purple : '#fff'} />
        </Pressable>

        {/* Today's Symptoms */}
        {hasLoggedToday && todayEntry && todayEntry.symptoms.length > 0 && (
          <View className="mb-4">
            <Text
              style={{ fontFamily: 'Quicksand_500Medium', color: theme.text.secondary }}
              className="text-xs mb-2"
            >
              Today's symptoms
            </Text>
            <View className="flex-row flex-wrap" style={{ gap: 8 }}>
              {todayEntry.symptoms.map(s => {
                const symptom = getSymptomById(s.symptomId);
                if (!symptom) return null;
                return (
                  <View
                    key={s.symptomId}
                    className="flex-row items-center px-3 py-1.5 rounded-full"
                    style={{
                      backgroundColor: `${severityConfig[s.severity].color}15`,
                      borderWidth: 1,
                      borderColor: `${severityConfig[s.severity].color}30`,
                    }}
                  >
                    <Text className="mr-1">{symptom.icon}</Text>
                    <Text
                      style={{ fontFamily: 'Quicksand_500Medium', color: theme.text.primary }}
                      className="text-xs"
                    >
                      {symptom.name}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Predictions Based on History */}
        {predictions.length > 0 && !hasLoggedToday && (
          <Animated.View entering={FadeIn.duration(300)} className="mb-4">
            <View
              className="p-3 rounded-2xl"
              style={{ backgroundColor: `${theme.accent.purple}10`, borderWidth: 1, borderColor: `${theme.accent.purple}15` }}
            >
              <View className="flex-row items-center mb-2">
                <TrendingUp size={14} color={theme.accent.purple} style={{ marginRight: 6 }} />
                <Text
                  style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
                  className="text-xs"
                >
                  Based on your {phaseInfo[currentPhase]?.name ?? 'current'} phase history
                </Text>
              </View>
              <View className="flex-row flex-wrap" style={{ gap: 6 }}>
                {predictions.slice(0, 4).map(p => {
                  const symptom = getSymptomById(p.symptomId);
                  if (!symptom) return null;
                  return (
                    <View
                      key={p.symptomId}
                      className="flex-row items-center px-2.5 py-1 rounded-full"
                      style={{ backgroundColor: `${theme.accent.pink}15` }}
                    >
                      <Text className="mr-1 text-sm">{symptom.icon}</Text>
                      <Text
                        style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.secondary }}
                        className="text-xs"
                      >
                        {symptom.name}
                      </Text>
                      <Text
                        style={{ fontFamily: 'Quicksand_500Medium', color: theme.accent.pink }}
                        className="text-xs ml-1"
                      >
                        {Math.round(p.likelihood)}%
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </Animated.View>
        )}

        {/* Stats Row */}
        {entries.length > 0 && (
          <View className="flex-row" style={{ gap: 12 }}>
            {/* Logging Streak */}
            <View
              className="flex-1 p-3 rounded-xl items-center"
              style={{ backgroundColor: theme.bg.secondary }}
            >
              <Text
                style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.accent.pink }}
                className="text-xl"
              >
                {loggingStreak}
              </Text>
              <Text
                style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.tertiary }}
                className="text-xs"
              >
                day streak
              </Text>
            </View>

            {/* This Week */}
            <View
              className="flex-1 p-3 rounded-xl items-center"
              style={{ backgroundColor: theme.bg.secondary }}
            >
              <Text
                style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.accent.purple }}
                className="text-xl"
              >
                {recentEntries.length}
              </Text>
              <Text
                style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.tertiary }}
                className="text-xs"
              >
                this week
              </Text>
            </View>

            {/* Most Common */}
            {mostCommon.length > 0 && (
              <View
                className="flex-1 p-3 rounded-xl items-center"
                style={{ backgroundColor: theme.bg.secondary }}
              >
                <Text className="text-xl">
                  {getSymptomById(mostCommon[0].symptomId)?.icon ?? '📊'}
                </Text>
                <Text
                  style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.tertiary }}
                  className="text-xs"
                >
                  most common
                </Text>
              </View>
            )}
          </View>
        )}

        {/* No Data State */}
        {entries.length === 0 && (
          <View className="p-4 rounded-xl items-center" style={{ backgroundColor: `${theme.accent.purple}10` }}>
            <Text
              style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.secondary }}
              className="text-sm text-center"
            >
              Start tracking your symptoms to see patterns and predictions based on your unique cycle
            </Text>
          </View>
        )}
      </LinearGradient>
    </View>
  );
}

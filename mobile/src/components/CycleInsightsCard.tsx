import React, { useState } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import {
  Calendar,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Info,
  ChevronRight,
  Edit3,
  Sparkles,
  Activity,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useThemeStore, getTheme, ThemeMode } from '@/lib/theme-store';
import { useCycleStore, CycleStats } from '@/lib/cycle-store';
import { router } from 'expo-router';

interface CycleInsightsCardProps {
  themeMode?: ThemeMode;
  onEditPeriodDates?: () => void;
  onCheckSymptoms?: () => void;
}

export function CycleInsightsCard({
  themeMode: propThemeMode,
  onEditPeriodDates,
  onCheckSymptoms,
}: CycleInsightsCardProps) {
  const storeThemeMode = useThemeStore((s) => s.mode);
  const themeMode = propThemeMode ?? storeThemeMode;
  const theme = getTheme(themeMode);

  const getCycleStats = useCycleStore((s) => s.getCycleStats);
  const periodHistory = useCycleStore((s) => s.periodHistory);
  const cycleLength = useCycleStore((s) => s.cycleLength);
  const periodLength = useCycleStore((s) => s.periodLength);
  const lastPeriodStart = useCycleStore((s) => s.lastPeriodStart);

  const stats = getCycleStats();
  const hasEnoughData = stats.totalCyclesTracked >= 2;

  // Determine if cycle length is normal (21-35 days)
  const isCycleLengthNormal = (length: number) => length >= 21 && length <= 35;
  // Determine if period length is normal (2-7 days)
  const isPeriodLengthNormal = (length: number) => length >= 2 && length <= 7;
  // Determine if variation is irregular (>7 days)
  const isVariationIrregular = (min: number, max: number) => (max - min) > 7;

  const lastCycleStatus = stats.lastCycleLength
    ? isCycleLengthNormal(stats.lastCycleLength) ? 'normal' : 'abnormal'
    : null;

  const lastPeriodStatus = stats.lastPeriodLength
    ? isPeriodLengthNormal(stats.lastPeriodLength) ? 'normal' : 'abnormal'
    : null;

  const variationStatus = hasEnoughData
    ? isVariationIrregular(stats.cycleLengthVariation.min, stats.cycleLengthVariation.max) ? 'irregular' : 'regular'
    : null;

  // Get current cycle info
  const getCurrentCycleInfo = () => {
    if (!lastPeriodStart) return null;
    const start = new Date(lastPeriodStart);
    const today = new Date();
    const daysSinceStart = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return {
      day: daysSinceStart + 1,
      startDate: start,
    };
  };

  const currentCycle = getCurrentCycleInfo();

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const renderStatusBadge = (status: 'normal' | 'abnormal' | 'irregular' | 'regular' | null, type: 'cycle' | 'period' | 'variation') => {
    if (!status) return null;

    const configs = {
      normal: { color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', icon: CheckCircle, label: 'NORMAL' },
      abnormal: { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', icon: AlertTriangle, label: 'ABNORMAL' },
      irregular: { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', icon: AlertTriangle, label: 'IRREGULAR' },
      regular: { color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', icon: CheckCircle, label: 'REGULAR' },
    };

    const config = configs[status];
    const Icon = config.icon;

    return (
      <View className="flex-row items-center px-2 py-1 rounded-full" style={{ backgroundColor: config.bg }}>
        <Icon size={12} color={config.color} />
        <Text
          style={{ fontFamily: 'Quicksand_600SemiBold', color: config.color }}
          className="text-xs ml-1"
        >
          {config.label}
        </Text>
      </View>
    );
  };

  return (
    <View
      className="rounded-3xl overflow-hidden"
      style={{ borderWidth: 1, borderColor: theme.border.light }}
    >
      <LinearGradient
        colors={[theme.bg.card, `${theme.accent.pink}08`]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ padding: 20 }}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <View
              className="w-10 h-10 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: `${theme.accent.purple}20` }}
            >
              <Activity size={20} color={theme.accent.purple} />
            </View>
            <View>
              <Text
                style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
                className="text-base"
              >
                My Cycles
              </Text>
              <Text
                style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.tertiary }}
                className="text-xs"
              >
                {stats.totalCyclesTracked} cycle{stats.totalCyclesTracked !== 1 ? 's' : ''} tracked
              </Text>
            </View>
          </View>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/cycle-history');
            }}
            className="flex-row items-center"
          >
            <Text
              style={{ fontFamily: 'Quicksand_500Medium', color: theme.accent.purple }}
              className="text-xs mr-1"
            >
              See all
            </Text>
            <ChevronRight size={14} color={theme.accent.purple} />
          </Pressable>
        </View>

        {/* Current Cycle */}
        {currentCycle && (
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onEditPeriodDates?.();
            }}
            className="flex-row items-center justify-between p-3 rounded-2xl mb-3"
            style={{ backgroundColor: `${theme.accent.pink}10`, borderWidth: 1, borderColor: `${theme.accent.pink}20` }}
          >
            <View>
              <Text
                style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
                className="text-base"
              >
                Current cycle: {currentCycle.day} days
              </Text>
              <Text
                style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.tertiary }}
                className="text-xs mt-0.5"
              >
                Started {formatDate(currentCycle.startDate)}
              </Text>
            </View>
            <View className="flex-row items-center">
              <Edit3 size={14} color={theme.accent.pink} />
              <ChevronRight size={16} color={theme.accent.pink} />
            </View>
          </Pressable>
        )}

        {/* Cycle Progress Dots */}
        {currentCycle && (
          <View className="flex-row flex-wrap mb-4" style={{ gap: 4 }}>
            {Array.from({ length: Math.min(currentCycle.day, 35) }).map((_, i) => (
              <View
                key={i}
                className="w-2.5 h-2.5 rounded-full"
                style={{
                  backgroundColor: i < periodLength
                    ? theme.accent.pink
                    : i < currentCycle.day
                      ? theme.accent.purple
                      : `${theme.accent.purple}30`,
                }}
              />
            ))}
            {currentCycle.day > 35 && (
              <Text
                style={{ fontFamily: 'Quicksand_500Medium', color: theme.text.tertiary }}
                className="text-xs ml-1"
              >
                +{currentCycle.day - 35}
              </Text>
            )}
          </View>
        )}

        {/* Stats Grid */}
        <View style={{ gap: 12 }}>
          {/* Previous Cycle Length */}
          <View
            className="flex-row items-center justify-between p-3 rounded-xl"
            style={{ backgroundColor: theme.bg.secondary }}
          >
            <View className="flex-row items-center flex-1">
              <Info size={14} color={theme.text.tertiary} style={{ marginRight: 8 }} />
              <Text
                style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.secondary }}
                className="text-sm"
              >
                Previous cycle length
              </Text>
            </View>
            <View className="flex-row items-center">
              <Text
                style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
                className="text-base mr-2"
              >
                {stats.lastCycleLength ? `${stats.lastCycleLength} days` : '—'}
              </Text>
              {renderStatusBadge(lastCycleStatus, 'cycle')}
            </View>
          </View>

          {/* Previous Period Length */}
          <View
            className="flex-row items-center justify-between p-3 rounded-xl"
            style={{ backgroundColor: theme.bg.secondary }}
          >
            <View className="flex-row items-center flex-1">
              <Info size={14} color={theme.text.tertiary} style={{ marginRight: 8 }} />
              <Text
                style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.secondary }}
                className="text-sm"
              >
                Previous period length
              </Text>
            </View>
            <View className="flex-row items-center">
              <Text
                style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
                className="text-base mr-2"
              >
                {stats.lastPeriodLength ? `${stats.lastPeriodLength} days` : '—'}
              </Text>
              {renderStatusBadge(lastPeriodStatus, 'period')}
            </View>
          </View>

          {/* Cycle Length Variation */}
          <View
            className="flex-row items-center justify-between p-3 rounded-xl"
            style={{ backgroundColor: theme.bg.secondary }}
          >
            <View className="flex-row items-center flex-1">
              <Info size={14} color={theme.text.tertiary} style={{ marginRight: 8 }} />
              <Text
                style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.secondary }}
                className="text-sm"
              >
                Cycle length variation
              </Text>
            </View>
            <View className="flex-row items-center">
              <Text
                style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
                className="text-base mr-2"
              >
                {hasEnoughData
                  ? `${stats.cycleLengthVariation.min}-${stats.cycleLengthVariation.max} days`
                  : '—'
                }
              </Text>
              {renderStatusBadge(variationStatus, 'variation')}
            </View>
          </View>
        </View>

        {/* PCOS/Irregular Warning Message */}
        {(lastCycleStatus === 'abnormal' || variationStatus === 'irregular') && (
          <Animated.View entering={FadeIn.duration(300)} className="mt-4">
            <View
              className="p-4 rounded-2xl"
              style={{ backgroundColor: `${theme.accent.pink}10`, borderWidth: 1, borderColor: `${theme.accent.pink}20` }}
            >
              <View className="flex-row items-start">
                <View
                  className="w-8 h-8 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: `${theme.accent.pink}20` }}
                >
                  <Sparkles size={16} color={theme.accent.pink} />
                </View>
                <View className="flex-1">
                  <Text
                    style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.secondary }}
                    className="text-sm leading-5"
                  >
                    Painful periods along with irregular cycles might be related to specific health conditions that could be possible to relieve or treat. Let's see if that may be your case.
                  </Text>
                </View>
              </View>

              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onCheckSymptoms?.() || router.push('/luna-ai');
                }}
                className="mt-3 py-3 rounded-full items-center"
                style={{ backgroundColor: theme.accent.pink }}
              >
                <Text
                  style={{ fontFamily: 'Quicksand_600SemiBold', color: '#fff' }}
                  className="text-sm"
                >
                  Check symptoms
                </Text>
              </Pressable>

              <Text
                style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.tertiary }}
                className="text-xs text-center mt-2"
              >
                NOTE: This app is not a diagnostic tool
              </Text>
            </View>
          </Animated.View>
        )}

        {/* Not enough data message */}
        {stats.totalCyclesTracked < 2 && (
          <View className="mt-4 p-3 rounded-xl" style={{ backgroundColor: `${theme.accent.purple}10` }}>
            <Text
              style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.secondary }}
              className="text-xs text-center"
            >
              Log more periods to see cycle insights and detect irregularities
            </Text>
          </View>
        )}
      </LinearGradient>
    </View>
  );
}

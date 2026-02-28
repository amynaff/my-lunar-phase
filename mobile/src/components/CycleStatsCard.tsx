import React from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { AlertTriangle, CheckCircle, Info, ChevronRight, TrendingUp, Calendar, Clock, Activity } from 'lucide-react-native';
import { useCycleStore, CycleStats } from '@/lib/cycle-store';
import { getTheme } from '@/lib/theme-store';
import * as Haptics from 'expo-haptics';

interface CycleStatsCardProps {
  themeMode: 'light' | 'dark';
  onViewHistory?: () => void;
  onCheckSymptoms?: () => void;
}

// Determine if a value is normal, abnormal, or irregular
type Status = 'normal' | 'abnormal' | 'irregular';

const getStatus = (value: number, type: 'cycle' | 'period' | 'variation'): Status => {
  if (type === 'cycle') {
    if (value >= 21 && value <= 35) return 'normal';
    return 'abnormal';
  }
  if (type === 'period') {
    if (value >= 2 && value <= 7) return 'normal';
    return 'abnormal';
  }
  if (type === 'variation') {
    if (value <= 7) return 'normal';
    return 'irregular';
  }
  return 'normal';
};

const StatusBadge = ({ status, themeMode }: { status: Status; themeMode: 'light' | 'dark' }) => {
  const theme = getTheme(themeMode);

  const config = {
    normal: { color: '#22c55e', icon: CheckCircle, label: 'NORMAL' },
    abnormal: { color: '#f59e0b', icon: AlertTriangle, label: 'ABNORMAL' },
    irregular: { color: '#f59e0b', icon: AlertTriangle, label: 'IRREGULAR' },
  };

  const { color, icon: Icon, label } = config[status];

  return (
    <View className="flex-row items-center">
      <Icon size={14} color={color} />
      <Text
        style={{ fontFamily: 'Quicksand_600SemiBold', color, fontSize: 10 }}
        className="ml-1"
      >
        {label}
      </Text>
    </View>
  );
};

const StatRow = ({
  label,
  value,
  unit,
  status,
  themeMode,
  showInfo,
  onInfoPress,
}: {
  label: string;
  value: string | number;
  unit?: string;
  status?: Status;
  themeMode: 'light' | 'dark';
  showInfo?: boolean;
  onInfoPress?: () => void;
}) => {
  const theme = getTheme(themeMode);

  return (
    <View className="flex-row items-center justify-between py-3 border-b" style={{ borderBottomColor: theme.border.light }}>
      <View className="flex-row items-center flex-1">
        <Text
          style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.secondary }}
          className="text-sm"
        >
          {label}
        </Text>
        {showInfo && (
          <Pressable onPress={onInfoPress} className="ml-2">
            <Info size={14} color={theme.text.tertiary} />
          </Pressable>
        )}
      </View>
      <View className="flex-row items-center">
        <Text
          style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
          className="text-base mr-2"
        >
          {value}{unit && <Text style={{ color: theme.text.secondary }}> {unit}</Text>}
        </Text>
        {status && <StatusBadge status={status} themeMode={themeMode} />}
      </View>
    </View>
  );
};

export function CycleStatsCard({ themeMode, onViewHistory, onCheckSymptoms }: CycleStatsCardProps) {
  const theme = getTheme(themeMode);
  const getCycleStats = useCycleStore(s => s.getCycleStats);
  const periodHistory = useCycleStore(s => s.periodHistory);
  const lastPeriodStart = useCycleStore(s => s.lastPeriodStart);
  const getDayOfCycle = useCycleStore(s => s.getDayOfCycle);

  const stats = getCycleStats();
  const dayOfCycle = getDayOfCycle();

  const hasEnoughData = stats.totalCyclesTracked >= 2;
  const showIrregularWarning = stats.isIrregular && hasEnoughData;

  // Calculate current cycle length (days since last period started)
  const currentCycleDays = lastPeriodStart
    ? Math.floor((new Date().getTime() - new Date(lastPeriodStart).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <Animated.View
      entering={FadeInUp.delay(200).duration(600)}
      className="rounded-3xl border overflow-hidden"
      style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light }}
    >
      {/* Header */}
      <View className="px-4 py-3 border-b" style={{ borderBottomColor: theme.border.light }}>
        <Text
          style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
          className="text-base"
        >
          My Cycles
        </Text>
      </View>

      {/* Stats */}
      <View className="px-4">
        {/* Previous/Average Cycle Length */}
        <StatRow
          label="Previous cycle length"
          value={stats.lastCycleLength || stats.averageCycleLength}
          unit="days"
          status={getStatus(stats.lastCycleLength || stats.averageCycleLength, 'cycle')}
          themeMode={themeMode}
          showInfo
        />

        {/* Previous Period Length */}
        <StatRow
          label="Previous period length"
          value={stats.lastPeriodLength || stats.averagePeriodLength}
          unit="days"
          status={getStatus(stats.lastPeriodLength || stats.averagePeriodLength, 'period')}
          themeMode={themeMode}
          showInfo
        />

        {/* Cycle Length Variation */}
        {hasEnoughData && (
          <StatRow
            label="Cycle length variation"
            value={`${stats.cycleLengthVariation.min}-${stats.cycleLengthVariation.max}`}
            unit="days"
            status={getStatus(stats.cycleLengthVariation.max - stats.cycleLengthVariation.min, 'variation')}
            themeMode={themeMode}
            showInfo
          />
        )}

        {/* Current Cycle Status */}
        {lastPeriodStart && (
          <View className="flex-row items-center justify-between py-3">
            <Text
              style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.secondary }}
              className="text-sm"
            >
              Current cycle
            </Text>
            <View className="flex-row items-center">
              <Text
                style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.accent.pink }}
                className="text-base"
              >
                Day {dayOfCycle}
              </Text>
              <Text
                style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.tertiary }}
                className="text-sm ml-1"
              >
                of ~{Math.round(stats.averageCycleLength)}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Irregular Cycles Warning */}
      {showIrregularWarning && (
        <View className="mx-4 mb-4 p-4 rounded-2xl" style={{ backgroundColor: `${theme.accent.pink}10` }}>
          <View className="flex-row items-start">
            <View
              className="w-8 h-8 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: `${theme.accent.pink}20` }}
            >
              <AlertTriangle size={16} color={theme.accent.pink} />
            </View>
            <View className="flex-1">
              <Text
                style={{ fontFamily: 'Quicksand_500Medium', color: theme.text.primary }}
                className="text-sm mb-1"
              >
                Irregular cycles detected
              </Text>
              <Text
                style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.secondary }}
                className="text-xs leading-4"
              >
                Irregular cycles may relate to conditions like PCOS, stress, or hormonal changes. Track your symptoms and consult a healthcare provider for personalized guidance.
              </Text>
            </View>
          </View>

          {onCheckSymptoms && (
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onCheckSymptoms();
              }}
              className="mt-3 py-2.5 rounded-full items-center"
              style={{ backgroundColor: theme.accent.pink }}
            >
              <Text
                style={{ fontFamily: 'Quicksand_600SemiBold', color: '#fff' }}
                className="text-sm"
              >
                Check symptoms
              </Text>
            </Pressable>
          )}

          <Text
            style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.tertiary }}
            className="text-xs text-center mt-2"
          >
            NOTE: LunaFlow is not a diagnostic tool
          </Text>
        </View>
      )}

      {/* Not Enough Data Message */}
      {!hasEnoughData && stats.totalCyclesTracked > 0 && (
        <View className="mx-4 mb-4 p-4 rounded-2xl" style={{ backgroundColor: `${theme.accent.purple}10` }}>
          <View className="flex-row items-center">
            <Info size={16} color={theme.accent.purple} />
            <Text
              style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.secondary }}
              className="text-xs ml-2 flex-1"
            >
              Log more periods to see cycle patterns. Predictions improve with more data.
            </Text>
          </View>
        </View>
      )}

      {/* Cycle History Link */}
      {onViewHistory && periodHistory.length > 0 && (
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onViewHistory();
          }}
          className="flex-row items-center justify-between px-4 py-3 border-t"
          style={{ borderTopColor: theme.border.light }}
        >
          <Text
            style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
            className="text-sm"
          >
            Cycle history
          </Text>
          <View className="flex-row items-center">
            <Text
              style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.tertiary }}
              className="text-sm mr-2"
            >
              See all
            </Text>
            <ChevronRight size={16} color={theme.text.tertiary} />
          </View>
        </Pressable>
      )}

      {/* Current Cycle Preview */}
      {lastPeriodStart && (
        <View className="px-4 py-3 border-t" style={{ borderTopColor: theme.border.light }}>
          <View className="flex-row items-center justify-between mb-2">
            <Text
              style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
              className="text-sm"
            >
              Current cycle: {currentCycleDays} days
            </Text>
            {onViewHistory && (
              <Pressable onPress={onViewHistory}>
                <ChevronRight size={16} color={theme.text.tertiary} />
              </Pressable>
            )}
          </View>
          <Text
            style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.secondary }}
            className="text-xs mb-2"
          >
            Started {new Date(lastPeriodStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </Text>

          {/* Cycle Progress Dots */}
          <CycleProgressDots stats={stats} dayOfCycle={dayOfCycle} themeMode={themeMode} />
        </View>
      )}
    </Animated.View>
  );
}

// Cycle progress dots visualization
function CycleProgressDots({
  stats,
  dayOfCycle,
  themeMode,
}: {
  stats: CycleStats;
  dayOfCycle: number;
  themeMode: 'light' | 'dark';
}) {
  const theme = getTheme(themeMode);
  const cycleLength = Math.round(stats.averageCycleLength);
  const periodLength = Math.round(stats.averagePeriodLength);
  const ovulationDay = cycleLength - 14;
  const fertileStart = ovulationDay - 5;
  const fertileEnd = ovulationDay + 1;

  // Show max 31 dots, or cycle length
  const dotsToShow = Math.min(cycleLength, 31);

  return (
    <View className="flex-row flex-wrap" style={{ gap: 3 }}>
      {Array.from({ length: dotsToShow }).map((_, i) => {
        const day = i + 1;
        let color = `${theme.text.tertiary}30`;

        if (day <= periodLength) {
          color = day <= dayOfCycle ? '#ec4899' : '#f9a8d4';
        } else if (day >= fertileStart && day <= fertileEnd) {
          color = day <= dayOfCycle ? '#8b5cf6' : '#c4b5fd';
        } else if (day <= dayOfCycle) {
          color = `${theme.accent.purple}60`;
        }

        const isCurrentDay = day === dayOfCycle;

        return (
          <View
            key={day}
            className="rounded-full"
            style={{
              width: isCurrentDay ? 10 : 8,
              height: isCurrentDay ? 10 : 8,
              backgroundColor: color,
              borderWidth: isCurrentDay ? 2 : 0,
              borderColor: theme.text.primary,
            }}
          />
        );
      })}
    </View>
  );
}

// Mini stats display for compact views
export function CycleStatsMini({ themeMode }: { themeMode: 'light' | 'dark' }) {
  const theme = getTheme(themeMode);
  const getCycleStats = useCycleStore(s => s.getCycleStats);
  const getDayOfCycle = useCycleStore(s => s.getDayOfCycle);

  const stats = getCycleStats();
  const dayOfCycle = getDayOfCycle();

  return (
    <View className="flex-row" style={{ gap: 12 }}>
      <View className="flex-1 rounded-2xl p-3 border" style={{ backgroundColor: `${theme.accent.pink}10`, borderColor: `${theme.accent.pink}25` }}>
        <View className="flex-row items-center mb-1">
          <Calendar size={12} color={theme.accent.pink} />
          <Text style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.tertiary, fontSize: 10, marginLeft: 4 }}>
            Cycle Day
          </Text>
        </View>
        <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.accent.pink, fontSize: 18 }}>
          {dayOfCycle}
        </Text>
      </View>

      <View className="flex-1 rounded-2xl p-3 border" style={{ backgroundColor: `${theme.accent.purple}10`, borderColor: `${theme.accent.purple}25` }}>
        <View className="flex-row items-center mb-1">
          <Activity size={12} color={theme.accent.purple} />
          <Text style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.tertiary, fontSize: 10, marginLeft: 4 }}>
            Avg Cycle
          </Text>
        </View>
        <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.accent.purple, fontSize: 18 }}>
          {Math.round(stats.averageCycleLength)}d
        </Text>
      </View>

      <View className="flex-1 rounded-2xl p-3 border" style={{ backgroundColor: `${theme.accent.blush}10`, borderColor: `${theme.accent.blush}25` }}>
        <View className="flex-row items-center mb-1">
          <TrendingUp size={12} color={theme.accent.blush} />
          <Text style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.tertiary, fontSize: 10, marginLeft: 4 }}>
            Tracked
          </Text>
        </View>
        <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.accent.blush, fontSize: 18 }}>
          {stats.totalCyclesTracked}
        </Text>
      </View>
    </View>
  );
}

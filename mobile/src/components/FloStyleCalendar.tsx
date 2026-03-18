import React, { useState, useMemo, useRef, useCallback } from 'react';
import { View, Text, Pressable, ScrollView, Dimensions, Modal } from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { X, Settings, Plus } from 'lucide-react-native';
import { useCycleStore, getMoonPhase, moonPhaseInfo, MoonPhase } from '@/lib/cycle-store';
import { getTheme, useThemeStore } from '@/lib/theme-store';
import * as Haptics from 'expo-haptics';

interface FloStyleCalendarProps {
  visible: boolean;
  onClose: () => void;
  onDayPress?: (date: Date) => void;
  onLogPeriod?: (date: Date) => void;
}

const DAYS_OF_WEEK = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Get moon phase for any date
const getMoonPhaseForDate = (date: Date): MoonPhase => {
  const knownNewMoon = new Date(2000, 0, 6, 18, 14, 0);
  const lunarCycle = 29.53058867;
  const daysSinceNewMoon = (date.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24);
  const moonAge = ((daysSinceNewMoon % lunarCycle) + lunarCycle) % lunarCycle;

  if (moonAge < 1.85) return 'new_moon';
  if (moonAge < 7.38) return 'waxing_crescent';
  if (moonAge < 9.23) return 'first_quarter';
  if (moonAge < 14.77) return 'waxing_gibbous';
  if (moonAge < 16.61) return 'full_moon';
  if (moonAge < 22.15) return 'waning_gibbous';
  if (moonAge < 23.99) return 'last_quarter';
  return 'waning_crescent';
};

// Moon phase colors and mini emoji
const getMoonVisual = (phase: MoonPhase): { color: string; emoji: string } => {
  const visuals: Record<MoonPhase, { color: string; emoji: string }> = {
    new_moon: { color: '#1e1b4b', emoji: '🌑' },
    waxing_crescent: { color: '#fcd34d', emoji: '🌒' },
    first_quarter: { color: '#fcd34d', emoji: '🌓' },
    waxing_gibbous: { color: '#fcd34d', emoji: '🌔' },
    full_moon: { color: '#fef3c7', emoji: '🌕' },
    waning_gibbous: { color: '#fcd34d', emoji: '🌖' },
    last_quarter: { color: '#1e1b4b', emoji: '🌗' },
    waning_crescent: { color: '#1e1b4b', emoji: '🌘' },
  };
  return visuals[phase];
};

// Generate months to display (past 6 months + current + next 2 months)
const generateMonths = (centerDate: Date, count: number = 12): Date[] => {
  const months: Date[] = [];
  const start = new Date(centerDate);
  start.setMonth(start.getMonth() - Math.floor(count / 2));

  for (let i = 0; i < count; i++) {
    const month = new Date(start);
    month.setMonth(month.getMonth() + i);
    months.push(month);
  }
  return months;
};

// Single month component
function MonthView({
  monthDate,
  theme,
  isDateInPeriod,
  isPredictedPeriod,
  today,
  onDayPress,
  onLogPeriod,
}: {
  monthDate: Date;
  theme: ReturnType<typeof getTheme>;
  isDateInPeriod: (date: Date) => boolean;
  isPredictedPeriod: (date: Date) => boolean;
  today: Date;
  onDayPress?: (date: Date) => void;
  onLogPeriod?: (date: Date) => void;
}) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();

  // Monday-start week (0 = Monday, 6 = Sunday)
  let startingDay = firstDay.getDay() - 1;
  if (startingDay < 0) startingDay = 6;

  const days: (Date | null)[] = [];

  // Add empty slots for days before the first
  for (let i = 0; i < startingDay; i++) {
    days.push(null);
  }

  // Add actual days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i));
  }

  const handleDayPress = (date: Date) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onDayPress?.(date);
  };

  const handleDayLongPress = (date: Date) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onLogPeriod?.(date);
  };

  return (
    <View className="mb-8">
      {/* Month header */}
      <Text
        style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.accent.purple }}
        className="text-lg text-center mb-4"
      >
        {MONTHS[month]}
      </Text>

      {/* Calendar grid */}
      <View className="flex-row flex-wrap">
        {days.map((date, index) => {
          if (!date) {
            return <View key={`empty-${month}-${index}`} className="w-[14.28%] h-14" />;
          }

          const moonPhase = getMoonPhaseForDate(date);
          const moonVisual = getMoonVisual(moonPhase);
          const isPeriod = isDateInPeriod(date);
          const isPredicted = isPredictedPeriod(date);
          const isToday = date.toDateString() === today.toDateString();
          const isFuture = date > today;

          return (
            <Pressable
              key={date.toISOString()}
              onPress={() => handleDayPress(date)}
              onLongPress={() => handleDayLongPress(date)}
              delayLongPress={500}
              className="w-[14.28%] h-14 items-center justify-center"
            >
              {/* Period indicator (pink circle) */}
              {isPeriod && (
                <View
                  className="absolute w-10 h-10 rounded-full"
                  style={{ backgroundColor: '#ec4899' }}
                />
              )}

              {/* Today indicator (dashed circle) */}
              {isToday && !isPeriod && (
                <View
                  className="absolute w-10 h-10 rounded-full"
                  style={{
                    borderWidth: 1.5,
                    borderColor: theme.accent.purple,
                    borderStyle: 'dashed',
                  }}
                />
              )}

              {/* Day number */}
              <Text
                style={{
                  fontFamily: 'Quicksand_600SemiBold',
                  color: isPeriod ? '#fff' : isFuture ? theme.text.tertiary : theme.text.primary,
                  fontSize: 15,
                }}
              >
                {date.getDate()}
              </Text>

              {/* Moon phase indicator - styled like Flo app */}
              <View
                className="mt-0.5"
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: moonPhase === 'new_moon' ? '#1e1b4b' : '#f5d742',
                  overflow: 'hidden',
                }}
              >
                {/* Dark overlay for different phases */}
                {moonPhase === 'waxing_crescent' && (
                  <View
                    style={{
                      position: 'absolute',
                      left: -3,
                      top: 0,
                      width: 12,
                      height: 12,
                      borderRadius: 6,
                      backgroundColor: '#1e1b4b',
                    }}
                  />
                )}
                {moonPhase === 'first_quarter' && (
                  <View
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      width: 6,
                      height: 12,
                      backgroundColor: '#1e1b4b',
                    }}
                  />
                )}
                {moonPhase === 'waxing_gibbous' && (
                  <View
                    style={{
                      position: 'absolute',
                      left: -6,
                      top: 0,
                      width: 9,
                      height: 12,
                      borderRadius: 6,
                      backgroundColor: '#1e1b4b',
                    }}
                  />
                )}
                {moonPhase === 'waning_gibbous' && (
                  <View
                    style={{
                      position: 'absolute',
                      right: -6,
                      top: 0,
                      width: 9,
                      height: 12,
                      borderRadius: 6,
                      backgroundColor: '#1e1b4b',
                    }}
                  />
                )}
                {moonPhase === 'last_quarter' && (
                  <View
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 0,
                      width: 6,
                      height: 12,
                      backgroundColor: '#1e1b4b',
                    }}
                  />
                )}
                {moonPhase === 'waning_crescent' && (
                  <View
                    style={{
                      position: 'absolute',
                      right: -3,
                      top: 0,
                      width: 12,
                      height: 12,
                      borderRadius: 6,
                      backgroundColor: '#1e1b4b',
                    }}
                  />
                )}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function FloStyleCalendar({ visible, onClose, onDayPress, onLogPeriod }: FloStyleCalendarProps) {
  const themeMode = useThemeStore(s => s.mode);
  const theme = getTheme(themeMode);
  const [viewMode, setViewMode] = useState<'month' | 'year'>('month');

  const isDateInPeriod = useCycleStore(s => s.isDateInPeriod);
  const lastPeriodStart = useCycleStore(s => s.lastPeriodStart);
  const cycleLength = useCycleStore(s => s.cycleLength);
  const periodLength = useCycleStore(s => s.periodLength);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const months = useMemo(() => generateMonths(today, 12), [today]);

  // Check if a date is a predicted period day (future)
  const isPredictedPeriod = useCallback((date: Date): boolean => {
    if (!lastPeriodStart || date <= today) return false;

    const lastStart = new Date(lastPeriodStart);
    const daysSinceStart = Math.floor((date.getTime() - lastStart.getTime()) / (1000 * 60 * 60 * 24));
    const dayOfCycle = (daysSinceStart % cycleLength) + 1;

    return dayOfCycle >= 1 && dayOfCycle <= periodLength;
  }, [lastPeriodStart, today, cycleLength, periodLength]);

  const scrollViewRef = useRef<ScrollView>(null);

  // Scroll to current month on open
  React.useEffect(() => {
    if (visible && scrollViewRef.current) {
      // Current month is roughly in the middle (index 6 out of 12)
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ y: 400, animated: false });
      }, 100);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1" style={{ backgroundColor: theme.bg.primary }}>
        {/* Header */}
        <View
          className="flex-row items-center justify-between px-4 pt-4 pb-3 border-b"
          style={{ borderBottomColor: theme.border.light }}
        >
          <Pressable
            onPress={onClose}
            className="w-10 h-10 items-center justify-center"
          >
            <X size={24} color={theme.text.secondary} />
          </Pressable>

          {/* Month/Year Toggle */}
          <View
            className="flex-row rounded-full overflow-hidden"
            style={{ backgroundColor: theme.bg.card }}
          >
            <Pressable
              onPress={() => setViewMode('month')}
              className="px-5 py-2"
              style={{
                backgroundColor: viewMode === 'month' ? theme.accent.purple : 'transparent',
              }}
            >
              <Text
                style={{
                  fontFamily: 'Quicksand_600SemiBold',
                  color: viewMode === 'month' ? '#fff' : theme.text.secondary,
                  fontSize: 14,
                }}
              >
                Month
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setViewMode('year')}
              className="px-5 py-2"
              style={{
                backgroundColor: viewMode === 'year' ? theme.accent.purple : 'transparent',
              }}
            >
              <Text
                style={{
                  fontFamily: 'Quicksand_600SemiBold',
                  color: viewMode === 'year' ? '#fff' : theme.text.secondary,
                  fontSize: 14,
                }}
              >
                Year
              </Text>
            </Pressable>
          </View>

          <Pressable
            onPress={() => {}}
            className="w-10 h-10 items-center justify-center"
          >
            <Settings size={22} color={theme.text.secondary} />
          </Pressable>
        </View>

        {/* Days of week header */}
        <View className="flex-row px-4 py-3 border-b" style={{ borderBottomColor: theme.border.light }}>
          {DAYS_OF_WEEK.map((day, index) => (
            <View key={`${day}-${index}`} className="flex-1 items-center">
              <Text
                style={{ fontFamily: 'Quicksand_500Medium', color: theme.text.tertiary }}
                className="text-sm"
              >
                {day}
              </Text>
            </View>
          ))}
        </View>

        {/* Scrollable months */}
        <ScrollView
          ref={scrollViewRef}
          className="flex-1 px-4"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 100 }}
        >
          {months.map((monthDate, index) => (
            <MonthView
              key={monthDate.toISOString()}
              monthDate={monthDate}
              theme={theme}
              isDateInPeriod={isDateInPeriod}
              isPredictedPeriod={isPredictedPeriod}
              today={today}
              onDayPress={onDayPress}
              onLogPeriod={onLogPeriod}
            />
          ))}
        </ScrollView>

        {/* Legend */}
        <View
          className="px-6 py-4 border-t"
          style={{
            borderTopColor: theme.border.light,
            backgroundColor: theme.bg.primary,
          }}
        >
          <View className="flex-row justify-center items-center" style={{ gap: 16 }}>
            <View className="flex-row items-center">
              <View className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: '#ec4899' }} />
              <Text style={{ fontFamily: 'Quicksand_500Medium', color: theme.text.secondary, fontSize: 12 }}>
                Period
              </Text>
            </View>
            <View className="flex-row items-center">
              <View
                className="w-4 h-4 rounded-full mr-2"
                style={{
                  borderWidth: 1.5,
                  borderColor: theme.accent.purple,
                  borderStyle: 'dashed',
                }}
              />
              <Text style={{ fontFamily: 'Quicksand_500Medium', color: theme.text.secondary, fontSize: 12 }}>
                Today
              </Text>
            </View>
            <View className="flex-row items-center">
              <View className="w-3 h-3 rounded-full mr-1.5" style={{ backgroundColor: '#f5d742' }} />
              <Text style={{ fontFamily: 'Quicksand_500Medium', color: theme.text.secondary, fontSize: 12 }}>
                Full
              </Text>
            </View>
            <View className="flex-row items-center">
              <View className="w-3 h-3 rounded-full mr-1.5" style={{ backgroundColor: '#1e1b4b' }} />
              <Text style={{ fontFamily: 'Quicksand_500Medium', color: theme.text.secondary, fontSize: 12 }}>
                New
              </Text>
            </View>
          </View>
          <Text
            style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.tertiary, fontSize: 11 }}
            className="text-center mt-2"
          >
            Long press any day to log a new period
          </Text>
        </View>
      </View>
    </Modal>
  );
}

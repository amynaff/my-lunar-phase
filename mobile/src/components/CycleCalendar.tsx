import React, { useState, useMemo } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useCycleStore } from '@/lib/cycle-store';
import { getTheme } from '@/lib/theme-store';
import * as Haptics from 'expo-haptics';

interface CycleCalendarProps {
  themeMode: 'light' | 'dark';
  onDayPress?: (date: Date) => void;
  selectedDate?: Date | null;
  compact?: boolean;
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Color coding for different day types
const DAY_COLORS = {
  period: '#ec4899', // Pink for period days
  fertile: '#8b5cf6', // Purple for fertile window
  ovulation: '#6366f1', // Indigo for ovulation
  predicted: '#f9a8d4', // Light pink for predicted period
  today: '#9d84ed', // Purple accent for today
};

export function CycleCalendar({ themeMode, onDayPress, selectedDate, compact = false }: CycleCalendarProps) {
  const theme = getTheme(themeMode);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const isDateInPeriod = useCycleStore(s => s.isDateInPeriod);
  const isDateInFertileWindow = useCycleStore(s => s.isDateInFertileWindow);
  const isDateOvulation = useCycleStore(s => s.isDateOvulation);
  const periodHistory = useCycleStore(s => s.periodHistory);
  const lastPeriodStart = useCycleStore(s => s.lastPeriodStart);
  const cycleLength = useCycleStore(s => s.cycleLength);
  const periodLength = useCycleStore(s => s.periodLength);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get days in month
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days: (Date | null)[] = [];

    // Add empty slots for days before the first
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }

    // Add actual days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const days = useMemo(() => getDaysInMonth(currentMonth), [currentMonth]);

  // Check if a date is a predicted period day (future)
  const isPredictedPeriod = (date: Date): boolean => {
    if (!lastPeriodStart || date <= today) return false;

    const lastStart = new Date(lastPeriodStart);
    const daysSinceStart = Math.floor((date.getTime() - lastStart.getTime()) / (1000 * 60 * 60 * 24));
    const dayOfCycle = (daysSinceStart % cycleLength) + 1;

    return dayOfCycle >= 1 && dayOfCycle <= periodLength;
  };

  // Get the day type for styling
  const getDayType = (date: Date): 'period' | 'fertile' | 'ovulation' | 'predicted' | 'normal' => {
    if (isDateInPeriod(date)) return 'period';
    if (isPredictedPeriod(date)) return 'predicted';
    if (isDateOvulation(date)) return 'ovulation';
    if (isDateInFertileWindow(date)) return 'fertile';
    return 'normal';
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const handleDayPress = (date: Date) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onDayPress?.(date);
  };

  const isSelected = (date: Date) => {
    if (!selectedDate) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString();
  };

  return (
    <Animated.View
      entering={FadeIn.duration(400)}
      className="rounded-3xl border overflow-hidden"
      style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light }}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b" style={{ borderBottomColor: theme.border.light }}>
        <Pressable
          onPress={() => navigateMonth('prev')}
          className="w-8 h-8 rounded-full items-center justify-center"
          style={{ backgroundColor: `${theme.accent.purple}15` }}
        >
          <ChevronLeft size={18} color={theme.accent.purple} />
        </Pressable>

        <Text
          style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
          className="text-base"
        >
          {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </Text>

        <Pressable
          onPress={() => navigateMonth('next')}
          className="w-8 h-8 rounded-full items-center justify-center"
          style={{ backgroundColor: `${theme.accent.purple}15` }}
        >
          <ChevronRight size={18} color={theme.accent.purple} />
        </Pressable>
      </View>

      {/* Days of week header */}
      <View className="flex-row px-2 py-2 border-b" style={{ borderBottomColor: theme.border.light }}>
        {DAYS_OF_WEEK.map(day => (
          <View key={day} className="flex-1 items-center">
            <Text
              style={{ fontFamily: 'Quicksand_500Medium', color: theme.text.tertiary }}
              className="text-xs"
            >
              {compact ? day.charAt(0) : day}
            </Text>
          </View>
        ))}
      </View>

      {/* Calendar grid */}
      <View className="px-2 py-2">
        <View className="flex-row flex-wrap">
          {days.map((date, index) => {
            if (!date) {
              return <View key={`empty-${index}`} className="w-[14.28%] aspect-square" />;
            }

            const dayType = getDayType(date);
            const selected = isSelected(date);
            const todayDate = isToday(date);
            const isPast = date < today;
            const isFuture = date > today;

            // Determine background color
            let bgColor = 'transparent';
            let textColor = theme.text.primary;
            let borderColor = 'transparent';

            if (dayType === 'period') {
              bgColor = DAY_COLORS.period;
              textColor = '#fff';
            } else if (dayType === 'predicted') {
              bgColor = `${DAY_COLORS.predicted}40`;
              textColor = DAY_COLORS.period;
              borderColor = DAY_COLORS.predicted;
            } else if (dayType === 'ovulation') {
              bgColor = DAY_COLORS.ovulation;
              textColor = '#fff';
            } else if (dayType === 'fertile') {
              bgColor = `${DAY_COLORS.fertile}25`;
              textColor = DAY_COLORS.fertile;
            }

            if (todayDate && dayType === 'normal') {
              borderColor = DAY_COLORS.today;
            }

            if (selected) {
              borderColor = theme.accent.pink;
            }

            if (isPast && dayType === 'normal') {
              textColor = theme.text.tertiary;
            }

            return (
              <Pressable
                key={date.toISOString()}
                onPress={() => handleDayPress(date)}
                className="w-[14.28%] aspect-square p-0.5"
              >
                <View
                  className="flex-1 rounded-full items-center justify-center"
                  style={{
                    backgroundColor: bgColor,
                    borderWidth: borderColor !== 'transparent' ? 2 : 0,
                    borderColor,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: todayDate ? 'Quicksand_600SemiBold' : 'Quicksand_500Medium',
                      color: textColor,
                      fontSize: compact ? 12 : 14,
                    }}
                  >
                    {date.getDate()}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Legend */}
      {!compact && (
        <View className="px-4 py-3 border-t" style={{ borderTopColor: theme.border.light }}>
          <View className="flex-row flex-wrap justify-center" style={{ gap: 12 }}>
            <View className="flex-row items-center">
              <View className="w-3 h-3 rounded-full mr-1.5" style={{ backgroundColor: DAY_COLORS.period }} />
              <Text style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.secondary, fontSize: 11 }}>
                Period
              </Text>
            </View>
            <View className="flex-row items-center">
              <View className="w-3 h-3 rounded-full mr-1.5" style={{ backgroundColor: `${DAY_COLORS.predicted}60`, borderWidth: 1, borderColor: DAY_COLORS.predicted }} />
              <Text style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.secondary, fontSize: 11 }}>
                Predicted
              </Text>
            </View>
            <View className="flex-row items-center">
              <View className="w-3 h-3 rounded-full mr-1.5" style={{ backgroundColor: DAY_COLORS.fertile }} />
              <Text style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.secondary, fontSize: 11 }}>
                Fertile
              </Text>
            </View>
            <View className="flex-row items-center">
              <View className="w-3 h-3 rounded-full mr-1.5" style={{ backgroundColor: DAY_COLORS.ovulation }} />
              <Text style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.secondary, fontSize: 11 }}>
                Ovulation
              </Text>
            </View>
          </View>
        </View>
      )}
    </Animated.View>
  );
}

// Compact horizontal cycle indicator (similar to Flo's dot view)
export function CycleDotIndicator({ themeMode }: { themeMode: 'light' | 'dark' }) {
  const theme = getTheme(themeMode);
  const cycleLength = useCycleStore(s => s.cycleLength);
  const periodLength = useCycleStore(s => s.periodLength);
  const getDayOfCycle = useCycleStore(s => s.getDayOfCycle);
  const lastPeriodStart = useCycleStore(s => s.lastPeriodStart);

  const dayOfCycle = getDayOfCycle();

  // Generate dots for the current cycle
  const dots = useMemo(() => {
    const result = [];
    const ovulationDay = cycleLength - 14;
    const fertileStart = ovulationDay - 5;
    const fertileEnd = ovulationDay + 1;

    for (let i = 1; i <= cycleLength; i++) {
      let color = theme.text.tertiary + '40'; // Default gray
      let isCurrent = i === dayOfCycle;

      if (i <= periodLength) {
        color = DAY_COLORS.period;
      } else if (i === ovulationDay) {
        color = DAY_COLORS.ovulation;
      } else if (i >= fertileStart && i <= fertileEnd) {
        color = DAY_COLORS.fertile;
      }

      result.push({ day: i, color, isCurrent });
    }
    return result;
  }, [cycleLength, periodLength, dayOfCycle, theme.text.tertiary]);

  if (!lastPeriodStart) return null;

  return (
    <View className="py-2">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 4 }}
      >
        <View className="flex-row items-center" style={{ gap: 4 }}>
          {dots.map(dot => (
            <View
              key={dot.day}
              className="rounded-full"
              style={{
                width: dot.isCurrent ? 12 : 8,
                height: dot.isCurrent ? 12 : 8,
                backgroundColor: dot.color,
                borderWidth: dot.isCurrent ? 2 : 0,
                borderColor: theme.text.primary,
              }}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

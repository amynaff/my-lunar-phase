import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Check,
  Trash2,
  Calendar,
  Edit3,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useThemeStore, getTheme, ThemeMode } from '@/lib/theme-store';
import { useCycleStore, PeriodLogEntry } from '@/lib/cycle-store';

interface EditPeriodDatesModalProps {
  visible: boolean;
  onClose: () => void;
  themeMode?: ThemeMode;
}

const DAYS_OF_WEEK = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function EditPeriodDatesModal({
  visible,
  onClose,
  themeMode: propThemeMode,
}: EditPeriodDatesModalProps) {
  const insets = useSafeAreaInsets();
  const storeThemeMode = useThemeStore((s) => s.mode);
  const themeMode = propThemeMode ?? storeThemeMode;
  const theme = getTheme(themeMode);

  const periodHistory = useCycleStore((s) => s.periodHistory);
  const logPeriodStart = useCycleStore((s) => s.logPeriodStart);
  const logPeriodEnd = useCycleStore((s) => s.logPeriodEnd);
  const updatePeriodEntry = useCycleStore((s) => s.updatePeriodEntry);
  const deletePeriodEntry = useCycleStore((s) => s.deletePeriodEntry);
  const setLastPeriodStart = useCycleStore((s) => s.setLastPeriodStart);

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set());
  const [editingPeriod, setEditingPeriod] = useState<PeriodLogEntry | null>(null);
  const [mode, setMode] = useState<'view' | 'select'>('view');

  // Get period dates from history
  const periodDates = useMemo(() => {
    const dates = new Map<string, { type: 'logged' | 'predicted'; periodId?: string }>();

    periodHistory.forEach((period) => {
      const startDate = new Date(period.startDate);
      const endDate = period.endDate
        ? new Date(period.endDate)
        : new Date(startDate.getTime() + (period.periodLength - 1) * 24 * 60 * 60 * 1000);

      let current = new Date(startDate);
      while (current <= endDate) {
        const dateStr = current.toISOString().split('T')[0];
        dates.set(dateStr, { type: 'logged', periodId: period.id });
        current.setDate(current.getDate() + 1);
      }
    });

    return dates;
  }, [periodHistory]);

  // Generate calendar days for current month
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Adjust for Monday start (0 = Monday, 6 = Sunday)
    let startDayOfWeek = firstDay.getDay() - 1;
    if (startDayOfWeek < 0) startDayOfWeek = 6;

    const days: Array<{ date: Date | null; dateStr: string | null }> = [];

    // Add empty cells for days before the first of the month
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push({ date: null, dateStr: null });
    }

    // Add all days of the month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      days.push({ date, dateStr: date.toISOString().split('T')[0] });
    }

    return days;
  }, [currentMonth]);

  const navigateMonth = (direction: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  const toggleDate = (dateStr: string, date: Date) => {
    if (mode !== 'select') return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const newSelected = new Set(selectedDates);
    if (newSelected.has(dateStr)) {
      newSelected.delete(dateStr);
    } else {
      newSelected.add(dateStr);
    }
    setSelectedDates(newSelected);
  };

  const handleDatePress = (dateStr: string, date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (date > today) {
      // Can't log future dates
      return;
    }

    if (mode === 'select') {
      toggleDate(dateStr, date);
    } else {
      // Check if this date is part of a logged period
      const periodInfo = periodDates.get(dateStr);
      if (periodInfo?.periodId) {
        const period = periodHistory.find(p => p.id === periodInfo.periodId);
        if (period) {
          setEditingPeriod(period);
        }
      } else {
        // Start selecting for a new period
        setMode('select');
        setSelectedDates(new Set([dateStr]));
      }
    }
  };

  const saveSelectedDates = () => {
    if (selectedDates.size === 0) {
      setMode('view');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Sort dates to find start and end
    const sortedDates = Array.from(selectedDates).sort();
    const startDateStr = sortedDates[0];
    const endDateStr = sortedDates[sortedDates.length - 1];
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    // Check if we're editing an existing period
    if (editingPeriod) {
      updatePeriodEntry(editingPeriod.id, {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        periodLength: Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1,
      });

      // Update lastPeriodStart if this is the most recent period
      const sortedHistory = [...periodHistory].sort((a, b) =>
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      );
      if (sortedHistory[0]?.id === editingPeriod.id) {
        setLastPeriodStart(startDate);
      }
    } else {
      // Create new period
      logPeriodStart(startDate);

      // If multiple days selected, also log the end
      if (sortedDates.length > 1) {
        // Need to get the newly created period ID
        setTimeout(() => {
          const newHistory = useCycleStore.getState().periodHistory;
          const newPeriod = newHistory.find(p =>
            p.startDate.split('T')[0] === startDateStr
          );
          if (newPeriod) {
            logPeriodEnd(newPeriod.id, endDate);
          }
        }, 100);
      }
    }

    setMode('view');
    setSelectedDates(new Set());
    setEditingPeriod(null);
  };

  const deletePeriod = () => {
    if (!editingPeriod) return;

    Alert.alert(
      'Delete Period',
      'Are you sure you want to delete this period entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            deletePeriodEntry(editingPeriod.id);
            setEditingPeriod(null);
            setMode('view');
            setSelectedDates(new Set());
          },
        },
      ]
    );
  };

  const cancelSelection = () => {
    setMode('view');
    setSelectedDates(new Set());
    setEditingPeriod(null);
  };

  // When editing a period, pre-select its dates
  useEffect(() => {
    if (editingPeriod) {
      const dates = new Set<string>();
      const startDate = new Date(editingPeriod.startDate);
      const endDate = editingPeriod.endDate
        ? new Date(editingPeriod.endDate)
        : new Date(startDate.getTime() + (editingPeriod.periodLength - 1) * 24 * 60 * 60 * 1000);

      let current = new Date(startDate);
      while (current <= endDate) {
        dates.add(current.toISOString().split('T')[0]);
        current.setDate(current.getDate() + 1);
      }

      setSelectedDates(dates);
      setMode('select');

      // Navigate to the month of the period
      setCurrentMonth(startDate);
    }
  }, [editingPeriod]);

  const renderDay = (day: { date: Date | null; dateStr: string | null }, index: number) => {
    if (!day.date || !day.dateStr) {
      return <View key={`empty-${index}`} className="w-10 h-10" />;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isToday = day.date.toDateString() === today.toDateString();
    const isFuture = day.date > today;
    const periodInfo = periodDates.get(day.dateStr);
    const isSelected = selectedDates.has(day.dateStr);
    const isPeriodDay = periodInfo?.type === 'logged';

    let bgColor = 'transparent';
    let textColor = theme.text.primary;
    let borderColor = 'transparent';

    if (isSelected) {
      bgColor = theme.accent.pink;
      textColor = '#fff';
    } else if (isPeriodDay) {
      bgColor = theme.accent.pink;
      textColor = '#fff';
    } else if (isToday) {
      borderColor = theme.accent.purple;
      textColor = theme.accent.purple;
    }

    if (isFuture) {
      textColor = theme.text.tertiary;
    }

    return (
      <Pressable
        key={day.dateStr}
        onPress={() => !isFuture && handleDatePress(day.dateStr!, day.date!)}
        className="w-10 h-10 items-center justify-center rounded-full"
        style={{
          backgroundColor: bgColor,
          borderWidth: borderColor !== 'transparent' ? 2 : 0,
          borderColor,
          borderStyle: isPeriodDay && !isSelected ? 'solid' : 'solid',
        }}
      >
        <Text
          style={{
            fontFamily: 'Quicksand_500Medium',
            color: textColor,
            opacity: isFuture ? 0.4 : 1,
          }}
          className="text-sm"
        >
          {day.date.getDate()}
        </Text>
      </Pressable>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={{ flex: 1, backgroundColor: theme.bg.primary }}>
        <LinearGradient
          colors={theme.gradient}
          locations={[0, 0.25, 0.5, 0.75, 1]}
          style={{ flex: 1 }}
        >
          {/* Header */}
          <View
            style={{ paddingTop: insets.top + 12 }}
            className="px-5 pb-4 flex-row items-center justify-between"
          >
            <Pressable
              onPress={onClose}
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: `${theme.accent.purple}15` }}
            >
              <X size={20} color={theme.accent.purple} />
            </Pressable>

            <View className="flex-row items-center">
              <Text
                style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
                className="text-lg"
              >
                Edit Period Dates
              </Text>
            </View>

            <Pressable
              onPress={() => {/* Settings */}}
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: 'transparent' }}
            >
              <View style={{ width: 20 }} />
            </Pressable>
          </View>

          {/* View Toggle */}
          <View className="flex-row items-center justify-center mb-4">
            <View
              className="flex-row p-1 rounded-full"
              style={{ backgroundColor: theme.bg.card }}
            >
              <View
                className="px-4 py-2 rounded-full"
                style={{ backgroundColor: theme.accent.purple }}
              >
                <Text
                  style={{ fontFamily: 'Quicksand_600SemiBold', color: '#fff' }}
                  className="text-sm"
                >
                  Month
                </Text>
              </View>
              <View className="px-4 py-2 rounded-full">
                <Text
                  style={{ fontFamily: 'Quicksand_500Medium', color: theme.text.tertiary }}
                  className="text-sm"
                >
                  Year
                </Text>
              </View>
            </View>
          </View>

          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Month Navigation */}
            <View className="flex-row items-center justify-between px-6 mb-4">
              <Pressable
                onPress={() => navigateMonth(-1)}
                className="w-10 h-10 rounded-full items-center justify-center"
                style={{ backgroundColor: `${theme.accent.purple}15` }}
              >
                <ChevronLeft size={20} color={theme.accent.purple} />
              </Pressable>

              <Text
                style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
                className="text-lg"
              >
                {MONTHS[currentMonth.getMonth()]}
              </Text>

              <Pressable
                onPress={() => navigateMonth(1)}
                className="w-10 h-10 rounded-full items-center justify-center"
                style={{ backgroundColor: `${theme.accent.purple}15` }}
              >
                <ChevronRight size={20} color={theme.accent.purple} />
              </Pressable>
            </View>

            {/* Calendar */}
            <View className="px-6">
              {/* Day Headers */}
              <View className="flex-row justify-between mb-2">
                {DAYS_OF_WEEK.map((day, index) => (
                  <View key={index} className="w-10 items-center">
                    <Text
                      style={{ fontFamily: 'Quicksand_500Medium', color: theme.text.tertiary }}
                      className="text-xs"
                    >
                      {day}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Calendar Grid */}
              <View className="flex-row flex-wrap">
                {calendarDays.map((day, index) => (
                  <View key={index} style={{ width: '14.28%', alignItems: 'center', marginBottom: 8 }}>
                    {renderDay(day, index)}
                  </View>
                ))}
              </View>
            </View>

            {/* Selection Mode Actions */}
            {mode === 'select' && (
              <Animated.View entering={FadeInUp.duration(300)} className="px-6 mt-6">
                <View
                  className="p-4 rounded-2xl"
                  style={{ backgroundColor: theme.bg.card, borderWidth: 1, borderColor: theme.border.light }}
                >
                  <Text
                    style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
                    className="text-base mb-2"
                  >
                    {editingPeriod ? 'Edit Period' : 'Log Period'}
                  </Text>
                  <Text
                    style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.tertiary }}
                    className="text-sm mb-4"
                  >
                    Tap dates to select your period days, then save
                  </Text>

                  <View className="flex-row" style={{ gap: 12 }}>
                    <Pressable
                      onPress={cancelSelection}
                      className="flex-1 py-3 rounded-full items-center border"
                      style={{ borderColor: theme.border.light }}
                    >
                      <Text
                        style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.secondary }}
                        className="text-sm"
                      >
                        Cancel
                      </Text>
                    </Pressable>

                    {editingPeriod && (
                      <Pressable
                        onPress={deletePeriod}
                        className="py-3 px-4 rounded-full items-center"
                        style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                      >
                        <Trash2 size={18} color="#ef4444" />
                      </Pressable>
                    )}

                    <Pressable
                      onPress={saveSelectedDates}
                      className="flex-1 py-3 rounded-full items-center"
                      style={{ backgroundColor: theme.accent.pink }}
                    >
                      <Text
                        style={{ fontFamily: 'Quicksand_600SemiBold', color: '#fff' }}
                        className="text-sm"
                      >
                        Save
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </Animated.View>
            )}

            {/* Period History */}
            {mode === 'view' && periodHistory.length > 0 && (
              <Animated.View entering={FadeIn.duration(300)} className="px-6 mt-6">
                <Text
                  style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
                  className="text-lg mb-4"
                >
                  Recent Periods
                </Text>

                {[...periodHistory]
                  .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
                  .slice(0, 5)
                  .map((period) => {
                    const startDate = new Date(period.startDate);
                    const endDate = period.endDate
                      ? new Date(period.endDate)
                      : new Date(startDate.getTime() + (period.periodLength - 1) * 24 * 60 * 60 * 1000);

                    return (
                      <Pressable
                        key={period.id}
                        onPress={() => setEditingPeriod(period)}
                        className="flex-row items-center justify-between p-4 rounded-2xl mb-2"
                        style={{ backgroundColor: theme.bg.card, borderWidth: 1, borderColor: theme.border.light }}
                      >
                        <View className="flex-row items-center">
                          <View
                            className="w-10 h-10 rounded-full items-center justify-center mr-3"
                            style={{ backgroundColor: `${theme.accent.pink}20` }}
                          >
                            <Calendar size={18} color={theme.accent.pink} />
                          </View>
                          <View>
                            <Text
                              style={{ fontFamily: 'Quicksand_500Medium', color: theme.text.primary }}
                              className="text-sm"
                            >
                              {startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </Text>
                            <Text
                              style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.tertiary }}
                              className="text-xs"
                            >
                              {period.periodLength} days · {period.cycleLength ? `${period.cycleLength} day cycle` : 'First logged'}
                            </Text>
                          </View>
                        </View>
                        <Edit3 size={16} color={theme.text.tertiary} />
                      </Pressable>
                    );
                  })}
              </Animated.View>
            )}

            {/* Help Text */}
            <View className="px-6 mt-6">
              <Text
                style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.tertiary }}
                className="text-xs text-center"
              >
                Tap any date to start logging a period.{'\n'}
                Tap a logged period to edit or delete it.
              </Text>
            </View>
          </ScrollView>

          {/* Bottom Action */}
          {mode === 'view' && (
            <View
              style={{ paddingBottom: insets.bottom + 16 }}
              className="px-6 pt-4"
            >
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  setMode('select');
                  setSelectedDates(new Set());
                }}
                className="py-4 rounded-full items-center"
                style={{ backgroundColor: theme.accent.pink }}
              >
                <Text
                  style={{ fontFamily: 'Quicksand_600SemiBold', color: '#fff' }}
                  className="text-base"
                >
                  Edit period dates
                </Text>
              </Pressable>
            </View>
          )}
        </LinearGradient>
      </View>
    </Modal>
  );
}

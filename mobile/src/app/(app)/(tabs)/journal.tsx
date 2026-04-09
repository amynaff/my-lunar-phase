import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeIn,
} from 'react-native-reanimated';
import {
  BookOpen,
  Plus,
  ChevronLeft,
  ChevronRight,
  Flame,
  Mic,
  Sparkles,
  Zap,
  Moon,
  Trash2,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import {
  useFonts,
  CormorantGaramond_400Regular,
  CormorantGaramond_600SemiBold,
} from '@expo-google-fonts/cormorant-garamond';
import {
  Quicksand_400Regular,
  Quicksand_500Medium,
  Quicksand_600SemiBold,
} from '@expo-google-fonts/quicksand';
import { useThemeStore, getTheme } from '@/lib/theme-store';
import { useCycleStore, phaseInfo, CyclePhase } from '@/lib/cycle-store';
import { useJournalStore, journalPrompts, JournalEntry } from '@/lib/journal-store';
import { JournalEntryModal } from '@/components/JournalEntryModal';
import { QuickCheckInSheet } from '@/components/QuickCheckInSheet';

type ViewMode = 'week' | 'month' | 'all';

const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function JournalScreen() {
  const insets = useSafeAreaInsets();
  const themeMode = useThemeStore((s) => s.mode);
  const theme = getTheme(themeMode);
  const getCurrentPhase = useCycleStore((s) => s.getCurrentPhase);

  const entries = useJournalStore((s) => s.entries);
  const getEntriesByWeek = useJournalStore((s) => s.getEntriesByWeek);
  const getEntriesByMonth = useJournalStore((s) => s.getEntriesByMonth);
  const getStreakCount = useJournalStore((s) => s.getStreakCount);
  const getTotalEntries = useJournalStore((s) => s.getTotalEntries);
  const getEntriesThisWeek = useJournalStore((s) => s.getEntriesThisWeek);
  const deleteEntry = useJournalStore((s) => s.deleteEntry);

  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [showQuickCheckIn, setShowQuickCheckIn] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | undefined>();
  const [selectedPrompt, setSelectedPrompt] = useState<string | undefined>();

  const [fontsLoaded] = useFonts({
    CormorantGaramond_400Regular,
    CormorantGaramond_600SemiBold,
    Quicksand_400Regular,
    Quicksand_500Medium,
    Quicksand_600SemiBold,
  });

  const currentPhase = getCurrentPhase();
  const phasePromptData = journalPrompts[currentPhase] || journalPrompts.follicular;

  // Get entries based on view mode
  const displayedEntries = useMemo(() => {
    if (viewMode === 'all') {
      return entries;
    } else if (viewMode === 'week') {
      return getEntriesByWeek(selectedDate);
    } else {
      return getEntriesByMonth(selectedDate.getFullYear(), selectedDate.getMonth());
    }
  }, [viewMode, selectedDate, entries, getEntriesByWeek, getEntriesByMonth]);

  // Generate week days for calendar strip
  const weekDays = useMemo(() => {
    const days = [];
    const startOfWeek = new Date(selectedDate);
    const dayOfWeek = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek);

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      days.push(date);
    }
    return days;
  }, [selectedDate]);

  // Get entries for a specific date
  const getEntriesForDate = useCallback((date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return entries.filter((e) => e.date.split('T')[0] === dateStr);
  }, [entries]);

  const navigateWeek = (direction: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + direction * 7);
    setSelectedDate(newDate);
  };

  const navigateMonth = (direction: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setSelectedDate(newDate);
  };

  const openNewEntry = (prompt?: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setEditingEntry(undefined);
    setSelectedPrompt(prompt);
    setShowEntryModal(true);
  };

  const openEditEntry = (entry: JournalEntry) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEditingEntry(entry);
    setSelectedPrompt(undefined);
    setShowEntryModal(true);
  };

  const confirmDeleteEntry = (entry: JournalEntry) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this journal entry? This cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            deleteEntry(entry.id);
          },
        },
      ]
    );
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (!fontsLoaded) return null;

  const streak = getStreakCount();
  const totalEntries = getTotalEntries();
  const entriesThisWeek = getEntriesThisWeek();

  return (
    <View className="flex-1">
      <LinearGradient
        colors={theme.gradient}
        locations={[0, 0.25, 0.5, 0.75, 1]}
        style={{ flex: 1 }}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 140 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View
            entering={FadeInDown.delay(100).duration(600)}
            style={{ paddingTop: insets.top + 16 }}
            className="px-6"
          >
            <View className="flex-row items-center justify-between mb-2">
              <Text
                style={{ fontFamily: 'CormorantGaramond_600SemiBold', color: theme.text.primary }}
                className="text-3xl"
              >
                Journal
              </Text>
              <View className="flex-row items-center" style={{ gap: 8 }}>
                {/* Quick Check-In Button */}
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    setShowQuickCheckIn(true);
                  }}
                  className="h-10 px-4 rounded-full items-center justify-center flex-row"
                  style={{ backgroundColor: `${theme.accent.pink}18`, gap: 6 }}
                >
                  <Zap size={16} color={theme.accent.pink} />
                  <Text
                    style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.accent.pink }}
                    className="text-xs"
                  >
                    Quick
                  </Text>
                </Pressable>
                {/* New Entry Button */}
                <Pressable
                  onPress={() => openNewEntry()}
                  className="h-10 px-4 rounded-full items-center justify-center flex-row"
                  style={{ backgroundColor: theme.accent.purple, gap: 6 }}
                >
                  <Plus size={16} color="#fff" />
                  <Text
                    style={{ fontFamily: 'Quicksand_600SemiBold', color: '#fff' }}
                    className="text-xs"
                  >
                    New
                  </Text>
                </Pressable>
              </View>
            </View>
          </Animated.View>

          {/* Stats Row — lightweight inline strip */}
          <Animated.View
            entering={FadeInUp.delay(150).duration(600)}
            className="px-6 mt-3"
          >
            <View
              className="flex-row rounded-2xl px-4 py-3"
              style={{ backgroundColor: theme.bg.card }}
            >
              <View className="flex-1 items-center">
                <View className="flex-row items-center" style={{ gap: 4 }}>
                  <Flame size={14} color="#f59e0b" />
                  <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: '#f59e0b' }} className="text-lg">
                    {streak}
                  </Text>
                </View>
                <Text style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.tertiary }} className="text-xs mt-0.5">
                  streak
                </Text>
              </View>
              <View
                style={{ width: 1, backgroundColor: theme.border.light, marginVertical: 4 }}
              />
              <View className="flex-1 items-center">
                <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.accent.purple }} className="text-lg">
                  {entriesThisWeek}
                </Text>
                <Text style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.tertiary }} className="text-xs mt-0.5">
                  this week
                </Text>
              </View>
              <View
                style={{ width: 1, backgroundColor: theme.border.light, marginVertical: 4 }}
              />
              <View className="flex-1 items-center">
                <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.accent.pink }} className="text-lg">
                  {totalEntries}
                </Text>
                <Text style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.tertiary }} className="text-xs mt-0.5">
                  total
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* View Mode Toggle */}
          <Animated.View
            entering={FadeInUp.delay(200).duration(600)}
            className="px-6 mt-6"
          >
            <View
              className="flex-row p-1 rounded-2xl"
              style={{ backgroundColor: theme.bg.card }}
            >
              {(['week', 'month', 'all'] as ViewMode[]).map((mode) => (
                <Pressable
                  key={mode}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setViewMode(mode);
                  }}
                  className="flex-1 py-2.5 rounded-xl items-center"
                  style={{
                    backgroundColor: viewMode === mode ? theme.accent.purple : 'transparent',
                  }}
                >
                  <Text
                    style={{
                      fontFamily: 'Quicksand_600SemiBold',
                      color: viewMode === mode ? '#fff' : theme.text.tertiary,
                    }}
                    className="text-sm capitalize"
                  >
                    {mode}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Animated.View>

          {/* Week Calendar Strip (only in week view) */}
          {viewMode === 'week' && (
            <Animated.View
              entering={FadeIn.duration(300)}
              className="px-6 mt-4"
            >
              {/* Week Navigation */}
              <View className="flex-row items-center justify-between mb-3">
                <Pressable
                  onPress={() => navigateWeek(-1)}
                  className="w-8 h-8 rounded-full items-center justify-center"
                  style={{ backgroundColor: `${theme.accent.purple}15` }}
                >
                  <ChevronLeft size={18} color={theme.accent.purple} />
                </Pressable>

                <Text
                  style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
                  className="text-sm"
                >
                  {weekDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} -{' '}
                  {weekDays[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </Text>

                <Pressable
                  onPress={() => navigateWeek(1)}
                  className="w-8 h-8 rounded-full items-center justify-center"
                  style={{ backgroundColor: `${theme.accent.purple}15` }}
                >
                  <ChevronRight size={18} color={theme.accent.purple} />
                </Pressable>
              </View>

              {/* Day Pills */}
              <View className="flex-row justify-between">
                {weekDays.map((day, index) => {
                  const dayEntries = getEntriesForDate(day);
                  const isToday = day.toDateString() === new Date().toDateString();
                  const isSelected = day.toDateString() === selectedDate.toDateString();
                  const hasEntries = dayEntries.length > 0;

                  return (
                    <Pressable
                      key={index}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setSelectedDate(day);
                      }}
                      className="items-center py-2 px-2 rounded-xl"
                      style={{
                        backgroundColor: isSelected
                          ? theme.accent.purple
                          : isToday
                          ? `${theme.accent.purple}15`
                          : 'transparent',
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: 'Quicksand_500Medium',
                          color: isSelected ? '#fff' : theme.text.tertiary,
                        }}
                        className="text-xs mb-1"
                      >
                        {DAYS_SHORT[index]}
                      </Text>
                      <Text
                        style={{
                          fontFamily: 'Quicksand_600SemiBold',
                          color: isSelected ? '#fff' : theme.text.primary,
                        }}
                        className="text-base"
                      >
                        {day.getDate()}
                      </Text>
                      {hasEntries && (
                        <View
                          className="w-1.5 h-1.5 rounded-full mt-1"
                          style={{
                            backgroundColor: isSelected ? '#fff' : theme.accent.pink,
                          }}
                        />
                      )}
                    </Pressable>
                  );
                })}
              </View>
            </Animated.View>
          )}

          {/* Month Navigation (only in month view) */}
          {viewMode === 'month' && (
            <Animated.View
              entering={FadeIn.duration(300)}
              className="px-6 mt-4"
            >
              <View className="flex-row items-center justify-between">
                <Pressable
                  onPress={() => navigateMonth(-1)}
                  className="w-8 h-8 rounded-full items-center justify-center"
                  style={{ backgroundColor: `${theme.accent.purple}15` }}
                >
                  <ChevronLeft size={18} color={theme.accent.purple} />
                </Pressable>

                <Text
                  style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
                  className="text-lg"
                >
                  {MONTHS[selectedDate.getMonth()]} {selectedDate.getFullYear()}
                </Text>

                <Pressable
                  onPress={() => navigateMonth(1)}
                  className="w-8 h-8 rounded-full items-center justify-center"
                  style={{ backgroundColor: `${theme.accent.purple}15` }}
                >
                  <ChevronRight size={18} color={theme.accent.purple} />
                </Pressable>
              </View>
            </Animated.View>
          )}

          {/* Entries List */}
          <Animated.View
            entering={FadeInUp.delay(250).duration(600)}
            className="px-6 mt-6"
          >
            <Text
              style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
              className="text-base mb-3"
            >
              {viewMode === 'week'
                ? 'This Week'
                : viewMode === 'month'
                ? MONTHS[selectedDate.getMonth()]
                : 'All Entries'}
            </Text>

            {displayedEntries.length === 0 ? (
              <View
                className="p-6 rounded-2xl border items-center"
                style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light }}
              >
                <BookOpen size={32} color={theme.text.tertiary} />
                <Text
                  style={{ fontFamily: 'Quicksand_500Medium', color: theme.text.secondary }}
                  className="text-sm mt-3"
                >
                  Nothing here yet
                </Text>
                <Pressable
                  onPress={() => openNewEntry(phasePromptData.prompts[0])}
                  className="mt-3 px-4 py-2 rounded-full"
                  style={{ backgroundColor: `${theme.accent.purple}15` }}
                >
                  <Text
                    style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.accent.purple }}
                    className="text-xs"
                  >
                    Start writing
                  </Text>
                </Pressable>
              </View>
            ) : (
              <View style={{ gap: 10 }}>
                {displayedEntries.map((entry, index) => (
                  <Animated.View
                    key={entry.id}
                    entering={FadeInUp.delay(300 + index * 50).duration(400)}
                  >
                    <Pressable
                      onPress={() => openEditEntry(entry)}
                      className="p-4 rounded-2xl border"
                      style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light }}
                    >
                      {/* Entry Header */}
                      <View className="flex-row items-center justify-between mb-2">
                        <View className="flex-row items-center flex-1 flex-wrap" style={{ gap: 6 }}>
                          <Text
                            style={{ fontFamily: 'Quicksand_500Medium', color: theme.text.tertiary }}
                            className="text-xs"
                          >
                            {formatDate(entry.date)} · {formatTime(entry.createdAt)}
                          </Text>
                          {entry.cyclePhase && phaseInfo[entry.cyclePhase as CyclePhase] && (
                            <Text
                              style={{
                                fontFamily: 'Quicksand_400Regular',
                                color: phaseInfo[entry.cyclePhase as CyclePhase].color,
                              }}
                              className="text-xs"
                            >
                              {phaseInfo[entry.cyclePhase as CyclePhase].emoji} Day {entry.dayOfCycle}
                            </Text>
                          )}
                        </View>
                        <View className="flex-row items-center" style={{ gap: 6 }}>
                          {entry.voiceMemoUri && (
                            <Mic size={12} color={theme.text.tertiary} />
                          )}
                          <Pressable
                            onPress={(e) => {
                              e.stopPropagation();
                              confirmDeleteEntry(entry);
                            }}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          >
                            <Trash2 size={14} color={theme.text.tertiary} />
                          </Pressable>
                        </View>
                      </View>

                      {/* Title */}
                      {entry.title && (
                        <Text
                          style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
                          className="text-base mb-1"
                        >
                          {entry.title}
                        </Text>
                      )}

                      {/* Content Preview */}
                      <Text
                        style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.secondary }}
                        className="text-sm leading-5"
                        numberOfLines={3}
                      >
                        {entry.content || '(Voice memo only)'}
                      </Text>

                      {/* Tags */}
                      {entry.tags.length > 0 && (
                        <View className="flex-row flex-wrap mt-2" style={{ gap: 6 }}>
                          {entry.tags.slice(0, 4).map((tagId) => (
                            <View
                              key={tagId}
                              className="px-2 py-0.5 rounded-full"
                              style={{ backgroundColor: `${theme.accent.purple}12` }}
                            >
                              <Text
                                style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.tertiary }}
                                className="text-xs"
                              >
                                {tagId}
                              </Text>
                            </View>
                          ))}
                        </View>
                      )}

                      {/* Prompt used */}
                      {entry.prompt && (
                        <Text
                          style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.tertiary }}
                          className="text-xs italic mt-2"
                          numberOfLines={1}
                        >
                          "{entry.prompt}"
                        </Text>
                      )}

                      {/* Luna's Reflection */}
                      {(entry as any).lunaReflection && (
                        <View
                          className="mt-3 p-3 rounded-xl"
                          style={{ backgroundColor: `${theme.accent.purple}08` }}
                        >
                          <View className="flex-row items-center mb-1">
                            <Moon size={12} color={theme.accent.purple} />
                            <Text
                              style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.accent.purple }}
                              className="text-xs ml-1.5"
                            >
                              Luna noticed...
                            </Text>
                          </View>
                          <Text
                            style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.secondary }}
                            className="text-xs leading-4 italic"
                          >
                            {(entry as any).lunaReflection}
                          </Text>
                        </View>
                      )}
                    </Pressable>
                  </Animated.View>
                ))}
              </View>
            )}
          </Animated.View>

          {/* Today's Prompt — at the bottom, as a writing nudge */}
          <Animated.View
            entering={FadeInUp.delay(300).duration(600)}
            className="px-6 mt-6"
          >
            <View
              className="p-4 rounded-2xl border"
              style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light }}
            >
              <View className="flex-row items-center mb-2" style={{ gap: 6 }}>
                <Sparkles size={14} color={theme.accent.purple} />
                <Text
                  style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.accent.purple }}
                  className="text-xs"
                >
                  {phasePromptData.theme}
                </Text>
              </View>
              <Text
                style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.secondary }}
                className="text-sm leading-5 italic mb-3"
                numberOfLines={2}
              >
                "{phasePromptData.prompts[0]}"
              </Text>
              <Pressable
                onPress={() => openNewEntry(phasePromptData.prompts[0])}
                className="self-start px-3 py-1.5 rounded-full"
                style={{ backgroundColor: `${theme.accent.purple}15` }}
              >
                <Text
                  style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.accent.purple }}
                  className="text-xs"
                >
                  Write to this prompt
                </Text>
              </Pressable>
            </View>
          </Animated.View>
        </ScrollView>
      </LinearGradient>

      {/* Journal Entry Modal */}
      <JournalEntryModal
        visible={showEntryModal}
        onClose={() => {
          setShowEntryModal(false);
          setEditingEntry(undefined);
          setSelectedPrompt(undefined);
        }}
        editEntry={editingEntry}
        initialPrompt={selectedPrompt}
      />

      {/* Quick Check-In Sheet */}
      <QuickCheckInSheet
        visible={showQuickCheckIn}
        onClose={() => setShowQuickCheckIn(false)}
      />
    </View>
  );
}

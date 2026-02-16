import React, { useMemo } from "react";
import { View, Text, Pressable, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import {
  LocalMoodEntry,
  getMoodColor,
  getEnergyColor,
} from "../lib/mood-store";
import { useCycleStore, phaseInfo, type CyclePhase } from "../lib/cycle-store";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CALENDAR_PADDING = 16;
const DAY_GAP = 4;
const DAYS_PER_ROW = 7;
const DAY_SIZE =
  (SCREEN_WIDTH - CALENDAR_PADDING * 2 - DAY_GAP * (DAYS_PER_ROW - 1)) /
  DAYS_PER_ROW;

interface MoodHeatmapCalendarProps {
  year: number;
  month: number; // 0-indexed
  entries: LocalMoodEntry[];
  viewMode: "mood" | "energy";
  onDayPress: (date: Date) => void;
  onMonthChange: (year: number, month: number) => void;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// Get phase for a specific date
const getPhaseForDate = (
  date: Date,
  lastPeriodStart: string | null,
  cycleLength: number,
  periodLength: number
): CyclePhase | null => {
  if (!lastPeriodStart) return null;

  const start = new Date(lastPeriodStart);
  const daysSinceStart = Math.floor(
    (date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (daysSinceStart < 0) return null;

  const dayOfCycle = (daysSinceStart % cycleLength) + 1;

  if (dayOfCycle <= periodLength) return "menstrual";
  if (dayOfCycle <= 13) return "follicular";
  if (dayOfCycle <= 17) return "ovulatory";
  return "luteal";
};

export function MoodHeatmapCalendar({
  year,
  month,
  entries,
  viewMode,
  onDayPress,
  onMonthChange,
}: MoodHeatmapCalendarProps) {
  const lastPeriodStart = useCycleStore((s) => s.lastPeriodStart);
  const cycleLength = useCycleStore((s) => s.cycleLength);
  const periodLength = useCycleStore((s) => s.periodLength);

  // Create a map of date -> entry for quick lookup
  const entryMap = useMemo(() => {
    const map: Record<string, LocalMoodEntry> = {};
    for (const entry of entries) {
      map[entry.date] = entry;
    }
    return map;
  }, [entries]);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: Array<{
      date: Date | null;
      dayNumber: number | null;
      entry: LocalMoodEntry | null;
      phase: CyclePhase | null;
      isToday: boolean;
      isFuture: boolean;
    }> = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({
        date: null,
        dayNumber: null,
        entry: null,
        phase: null,
        isToday: false,
        isFuture: false,
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateKey = date.toISOString().split("T")[0];
      const entry = entryMap[dateKey] || null;
      const phase = getPhaseForDate(
        date,
        lastPeriodStart,
        cycleLength,
        periodLength
      );
      const isToday = date.getTime() === today.getTime();
      const isFuture = date.getTime() > today.getTime();

      days.push({
        date,
        dayNumber: day,
        entry,
        phase,
        isToday,
        isFuture,
      });
    }

    return days;
  }, [year, month, entryMap, lastPeriodStart, cycleLength, periodLength]);

  const handlePrevMonth = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (month === 0) {
      onMonthChange(year - 1, 11);
    } else {
      onMonthChange(year, month - 1);
    }
  };

  const handleNextMonth = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (month === 11) {
      onMonthChange(year + 1, 0);
    } else {
      onMonthChange(year, month + 1);
    }
  };

  const handleDayPress = (date: Date | null, isFuture: boolean) => {
    if (!date || isFuture) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onDayPress(date);
  };

  // Get background color for a day cell
  const getDayBackgroundColor = (
    entry: LocalMoodEntry | null,
    phase: CyclePhase | null
  ): string => {
    if (!entry) {
      // Show faint phase color if no entry
      if (phase) {
        const phaseColor = phaseInfo[phase].color;
        return `${phaseColor}15`; // Very faint phase indicator
      }
      return "transparent";
    }

    const value = viewMode === "mood" ? entry.mood : entry.energy;
    return viewMode === "mood"
      ? getMoodColor(value, 0.85)
      : getEnergyColor(value, 0.85);
  };

  return (
    <Animated.View entering={FadeIn.duration(400)} className="w-full">
      {/* Header with month navigation */}
      <View className="flex-row items-center justify-between mb-4 px-2">
        <Pressable
          onPress={handlePrevMonth}
          className="p-2 rounded-full bg-white/10"
          hitSlop={10}
        >
          <ChevronLeft size={20} color="#a78bfa" />
        </Pressable>

        <Text
          className="text-lg text-purple-100"
          style={{ fontFamily: "Cormorant_600SemiBold" }}
        >
          {MONTHS[month]} {year}
        </Text>

        <Pressable
          onPress={handleNextMonth}
          className="p-2 rounded-full bg-white/10"
          hitSlop={10}
        >
          <ChevronRight size={20} color="#a78bfa" />
        </Pressable>
      </View>

      {/* Weekday headers */}
      <View
        className="flex-row justify-between mb-2"
        style={{ paddingHorizontal: CALENDAR_PADDING - DAY_GAP / 2 }}
      >
        {WEEKDAYS.map((day) => (
          <View key={day} style={{ width: DAY_SIZE }} className="items-center">
            <Text
              className="text-xs text-purple-300/70"
              style={{ fontFamily: "Quicksand_500Medium" }}
            >
              {day}
            </Text>
          </View>
        ))}
      </View>

      {/* Calendar grid */}
      <View
        className="flex-row flex-wrap"
        style={{
          paddingHorizontal: CALENDAR_PADDING - DAY_GAP / 2,
          gap: DAY_GAP,
        }}
      >
        {calendarDays.map((day, index) => {
          const bgColor = getDayBackgroundColor(day.entry, day.phase);
          const hasEntry = !!day.entry;

          return (
            <Pressable
              key={index}
              onPress={() => handleDayPress(day.date, day.isFuture)}
              disabled={!day.date || day.isFuture}
              style={{
                width: DAY_SIZE,
                height: DAY_SIZE,
                borderRadius: 8,
                backgroundColor: bgColor,
                opacity: day.isFuture ? 0.3 : 1,
              }}
              className={`items-center justify-center ${
                day.isToday ? "border-2 border-purple-400" : ""
              } ${hasEntry ? "" : "border border-purple-500/20"}`}
            >
              {day.dayNumber && (
                <>
                  <Text
                    className={`text-sm ${
                      hasEntry ? "text-white" : "text-purple-200/60"
                    }`}
                    style={{ fontFamily: "Quicksand_600SemiBold" }}
                  >
                    {day.dayNumber}
                  </Text>
                  {/* Phase indicator dot */}
                  {day.phase && !hasEntry && (
                    <View
                      className="absolute bottom-1 w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: phaseInfo[day.phase].color }}
                    />
                  )}
                </>
              )}
            </Pressable>
          );
        })}
      </View>

      {/* Legend */}
      <Animated.View
        entering={FadeInDown.delay(200).duration(400)}
        className="mt-6 px-4"
      >
        <Text
          className="text-xs text-purple-300/70 mb-2"
          style={{ fontFamily: "Quicksand_500Medium" }}
        >
          {viewMode === "mood" ? "Mood Scale" : "Energy Scale"}
        </Text>
        <View className="flex-row items-center justify-between">
          {[1, 2, 3, 4, 5].map((level) => (
            <View key={level} className="items-center">
              <View
                className="w-8 h-8 rounded-md mb-1"
                style={{
                  backgroundColor:
                    viewMode === "mood"
                      ? getMoodColor(level, 0.85)
                      : getEnergyColor(level, 0.85),
                }}
              />
              <Text
                className="text-xs text-purple-300/60"
                style={{ fontFamily: "Quicksand_500Medium" }}
              >
                {level}
              </Text>
            </View>
          ))}
        </View>
        <View className="flex-row justify-between mt-1">
          <Text
            className="text-xs text-purple-300/50"
            style={{ fontFamily: "Quicksand_500Medium" }}
          >
            {viewMode === "mood" ? "Low" : "Exhausted"}
          </Text>
          <Text
            className="text-xs text-purple-300/50"
            style={{ fontFamily: "Quicksand_500Medium" }}
          >
            {viewMode === "mood" ? "High" : "Energized"}
          </Text>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

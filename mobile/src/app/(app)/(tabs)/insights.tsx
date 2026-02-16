import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { View, Text, ScrollView, Pressable, RefreshControl } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Plus, TrendingUp, Calendar, Sparkles } from "lucide-react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useQuery } from "@tanstack/react-query";
import { MoodHeatmapCalendar } from "../../../components/MoodHeatmapCalendar";
import {
  useMoodStore,
  formatDateKey,
  type LocalMoodEntry,
} from "../../../lib/mood-store";
import { moodApi, type MoodStats } from "../../../lib/api/mood";
import { useCycleStore, phaseInfo, type CyclePhase } from "../../../lib/cycle-store";

type ViewMode = "mood" | "energy";

export default function InsightsScreen() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>("mood");
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [refreshing, setRefreshing] = useState(false);

  // Local store - get entries object directly
  const entries = useMoodStore((s) => s.entries);

  // Compute month entries from entries object (memoized)
  const monthEntries = useMemo(() => {
    return Object.values(entries).filter((entry) => {
      const entryDate = new Date(entry.date);
      return entryDate.getFullYear() === currentYear && entryDate.getMonth() === currentMonth;
    });
  }, [entries, currentYear, currentMonth]);

  // Fetch entries from server
  const { data: serverEntries, refetch: refetchEntries } = useQuery({
    queryKey: ["mood-entries", currentYear, currentMonth],
    queryFn: async () => {
      const startDate = new Date(currentYear, currentMonth, 1).toISOString();
      const endDate = new Date(currentYear, currentMonth + 1, 0).toISOString();
      const result = await moodApi.getEntries(startDate, endDate);
      return result.entries;
    },
  });

  // Fetch stats
  const { data: stats, refetch: refetchStats } = useQuery({
    queryKey: ["mood-stats"],
    queryFn: () => moodApi.getStats(),
  });

  // Track if we've synced this data already
  const lastSyncedRef = useRef<string | null>(null);

  // Sync server entries to local store (only when data actually changes)
  useEffect(() => {
    if (!serverEntries || serverEntries.length === 0) return;

    // Create a key from the data to check if it changed
    const dataKey = serverEntries.map(e => `${e.id}-${e.updatedAt}`).join(',');
    if (lastSyncedRef.current === dataKey) return;

    lastSyncedRef.current = dataKey;

    const localEntries: LocalMoodEntry[] = serverEntries.map((e) => ({
      date: e.date.split("T")[0],
      mood: e.mood,
      energy: e.energy,
      notes: e.notes ?? undefined,
      cyclePhase: e.cyclePhase ?? undefined,
      dayOfCycle: e.dayOfCycle ?? undefined,
      synced: true,
    }));
    useMoodStore.getState().setEntries(localEntries);
  }, [serverEntries]);

  const handleDayPress = (date: Date) => {
    router.push({
      pathname: "/(app)/log-mood",
      params: { date: date.toISOString() },
    });
  };

  const handleMonthChange = (year: number, month: number) => {
    setCurrentYear(year);
    setCurrentMonth(month);
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchEntries(), refetchStats()]);
    setRefreshing(false);
  }, [refetchEntries, refetchStats]);

  const handleLogToday = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/(app)/log-mood");
  };

  // Check if today has been logged
  const todayKey = formatDateKey(new Date());
  const hasLoggedToday = !!entries[todayKey];

  return (
    <View className="flex-1 bg-[#0f0a1a]">
      <LinearGradient
        colors={["#1a1028", "#0f0a1a", "#0a0610"]}
        className="flex-1"
      >
        <SafeAreaView className="flex-1" edges={["top"]}>
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 120 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor="#a78bfa"
              />
            }
          >
            {/* Header */}
            <Animated.View
              entering={FadeIn.duration(400)}
              className="px-4 pt-4 pb-2"
            >
              <Text
                className="text-3xl text-purple-100"
                style={{ fontFamily: "Cormorant_600SemiBold" }}
              >
                Insights
              </Text>
              <Text
                className="text-purple-300/60 mt-1"
                style={{ fontFamily: "Quicksand_500Medium" }}
              >
                Track patterns in your mood & energy
              </Text>
            </Animated.View>

            {/* Quick Log Button */}
            {!hasLoggedToday && (
              <Animated.View
                entering={FadeInDown.delay(100).duration(400)}
                className="px-4 mt-4"
              >
                <Pressable onPress={handleLogToday}>
                  <LinearGradient
                    colors={["#7c3aed", "#9d84ed"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="rounded-2xl p-4 flex-row items-center"
                  >
                    <View className="w-10 h-10 rounded-full bg-white/20 items-center justify-center mr-3">
                      <Plus size={22} color="#fff" />
                    </View>
                    <View className="flex-1">
                      <Text
                        className="text-white text-base"
                        style={{ fontFamily: "Quicksand_600SemiBold" }}
                      >
                        Log Today's Mood
                      </Text>
                      <Text
                        className="text-white/70 text-sm"
                        style={{ fontFamily: "Quicksand_500Medium" }}
                      >
                        Tap to record how you're feeling
                      </Text>
                    </View>
                    <Sparkles size={20} color="#fff" />
                  </LinearGradient>
                </Pressable>
              </Animated.View>
            )}

            {/* View Mode Toggle */}
            <Animated.View
              entering={FadeInDown.delay(200).duration(400)}
              className="px-4 mt-6"
            >
              <View className="flex-row bg-white/5 rounded-2xl p-1 border border-purple-500/20">
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setViewMode("mood");
                  }}
                  className={`flex-1 py-3 rounded-xl items-center ${
                    viewMode === "mood" ? "bg-purple-500/30" : ""
                  }`}
                >
                  <Text
                    className={`${
                      viewMode === "mood"
                        ? "text-purple-100"
                        : "text-purple-300/60"
                    }`}
                    style={{ fontFamily: "Quicksand_600SemiBold" }}
                  >
                    Mood
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setViewMode("energy");
                  }}
                  className={`flex-1 py-3 rounded-xl items-center ${
                    viewMode === "energy" ? "bg-purple-500/30" : ""
                  }`}
                >
                  <Text
                    className={`${
                      viewMode === "energy"
                        ? "text-purple-100"
                        : "text-purple-300/60"
                    }`}
                    style={{ fontFamily: "Quicksand_600SemiBold" }}
                  >
                    Energy
                  </Text>
                </Pressable>
              </View>
            </Animated.View>

            {/* Heatmap Calendar */}
            <Animated.View
              entering={FadeInDown.delay(300).duration(400)}
              className="mt-6 px-2"
            >
              <MoodHeatmapCalendar
                year={currentYear}
                month={currentMonth}
                entries={monthEntries}
                viewMode={viewMode}
                onDayPress={handleDayPress}
                onMonthChange={handleMonthChange}
              />
            </Animated.View>

            {/* Stats Section */}
            {stats && stats.totalEntries > 0 && (
              <Animated.View
                entering={FadeInDown.delay(400).duration(400)}
                className="mt-8 px-4"
              >
                <View className="flex-row items-center mb-4">
                  <TrendingUp size={18} color="#a78bfa" />
                  <Text
                    className="text-purple-100 text-lg ml-2"
                    style={{ fontFamily: "Cormorant_600SemiBold" }}
                  >
                    Your Patterns
                  </Text>
                </View>

                {/* Overall Stats */}
                <View className="flex-row gap-3 mb-4">
                  <View className="flex-1 bg-white/5 rounded-2xl p-4 border border-purple-500/20">
                    <Text
                      className="text-purple-300/60 text-xs mb-1"
                      style={{ fontFamily: "Quicksand_500Medium" }}
                    >
                      Avg Mood
                    </Text>
                    <Text
                      className="text-purple-100 text-2xl"
                      style={{ fontFamily: "Quicksand_600SemiBold" }}
                    >
                      {stats.avgMood.toFixed(1)}
                    </Text>
                  </View>
                  <View className="flex-1 bg-white/5 rounded-2xl p-4 border border-purple-500/20">
                    <Text
                      className="text-purple-300/60 text-xs mb-1"
                      style={{ fontFamily: "Quicksand_500Medium" }}
                    >
                      Avg Energy
                    </Text>
                    <Text
                      className="text-purple-100 text-2xl"
                      style={{ fontFamily: "Quicksand_600SemiBold" }}
                    >
                      {stats.avgEnergy.toFixed(1)}
                    </Text>
                  </View>
                  <View className="flex-1 bg-white/5 rounded-2xl p-4 border border-purple-500/20">
                    <Text
                      className="text-purple-300/60 text-xs mb-1"
                      style={{ fontFamily: "Quicksand_500Medium" }}
                    >
                      Entries
                    </Text>
                    <Text
                      className="text-purple-100 text-2xl"
                      style={{ fontFamily: "Quicksand_600SemiBold" }}
                    >
                      {stats.totalEntries}
                    </Text>
                  </View>
                </View>

                {/* Phase Averages */}
                {stats.phaseAverages.length > 0 && (
                  <View className="bg-white/5 rounded-2xl p-4 border border-purple-500/20">
                    <Text
                      className="text-purple-100 text-base mb-3"
                      style={{ fontFamily: "Quicksand_600SemiBold" }}
                    >
                      By Cycle Phase
                    </Text>
                    {stats.phaseAverages.map((phaseStat) => {
                      const phase = phaseStat.phase as CyclePhase;
                      const info = phaseInfo[phase];
                      if (!info) return null;

                      return (
                        <View
                          key={phase}
                          className="flex-row items-center py-2 border-b border-purple-500/10 last:border-b-0"
                        >
                          <Text className="text-lg mr-2">{info.emoji}</Text>
                          <Text
                            className="flex-1 text-purple-200"
                            style={{ fontFamily: "Quicksand_500Medium" }}
                          >
                            {info.name}
                          </Text>
                          <View className="flex-row items-center">
                            <View className="items-center mr-4">
                              <Text
                                className="text-purple-300/60 text-xs"
                                style={{ fontFamily: "Quicksand_500Medium" }}
                              >
                                Mood
                              </Text>
                              <Text
                                className="text-purple-100"
                                style={{ fontFamily: "Quicksand_600SemiBold" }}
                              >
                                {phaseStat.avgMood.toFixed(1)}
                              </Text>
                            </View>
                            <View className="items-center">
                              <Text
                                className="text-purple-300/60 text-xs"
                                style={{ fontFamily: "Quicksand_500Medium" }}
                              >
                                Energy
                              </Text>
                              <Text
                                className="text-purple-100"
                                style={{ fontFamily: "Quicksand_600SemiBold" }}
                              >
                                {phaseStat.avgEnergy.toFixed(1)}
                              </Text>
                            </View>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                )}
              </Animated.View>
            )}

            {/* Empty State */}
            {(!stats || stats.totalEntries === 0) && (
              <Animated.View
                entering={FadeInDown.delay(400).duration(400)}
                className="mt-8 px-4"
              >
                <View className="bg-white/5 rounded-2xl p-6 border border-purple-500/20 items-center">
                  <Calendar size={40} color="#a78bfa" />
                  <Text
                    className="text-purple-100 text-lg mt-4 text-center"
                    style={{ fontFamily: "Cormorant_600SemiBold" }}
                  >
                    Start Tracking
                  </Text>
                  <Text
                    className="text-purple-300/60 text-center mt-2"
                    style={{ fontFamily: "Quicksand_500Medium" }}
                  >
                    Log your mood and energy daily to see patterns across your
                    cycle. Tap any day on the calendar to add an entry.
                  </Text>
                </View>
              </Animated.View>
            )}
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

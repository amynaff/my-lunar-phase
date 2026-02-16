import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { X, Check } from "lucide-react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  useMoodStore,
  formatDateKey,
  moodLevels,
  energyLevels,
} from "../../lib/mood-store";
import { moodApi } from "../../lib/api/mood";
import { useCycleStore, phaseInfo } from "../../lib/cycle-store";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface LevelSelectorProps {
  levels: typeof moodLevels | typeof energyLevels;
  value: number;
  onChange: (value: number) => void;
  label: string;
}

function LevelSelector({ levels, value, onChange, label }: LevelSelectorProps) {
  return (
    <View className="mb-6">
      <Text
        className="text-purple-100 text-lg mb-4"
        style={{ fontFamily: "Cormorant_600SemiBold" }}
      >
        {label}
      </Text>
      <View className="flex-row justify-between">
        {levels.map((level) => {
          const isSelected = value === level.value;
          return (
            <Pressable
              key={level.value}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onChange(level.value);
              }}
              className={`items-center justify-center p-3 rounded-2xl ${
                isSelected ? "border-2 border-white/30" : ""
              }`}
              style={{
                backgroundColor: isSelected ? level.color : `${level.color}30`,
                width: 60,
                height: 80,
              }}
            >
              <Text className="text-2xl mb-1">{level.emoji}</Text>
              <Text
                className={`text-xs text-center ${
                  isSelected ? "text-white" : "text-purple-200/70"
                }`}
                style={{ fontFamily: "Quicksand_500Medium" }}
                numberOfLines={1}
              >
                {level.label.split(" ")[0]}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function LogMoodScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ date?: string }>();
  const queryClient = useQueryClient();

  // Parse date from params or use today
  const selectedDate = params.date ? new Date(params.date) : new Date();
  const dateKey = formatDateKey(selectedDate);

  // Get existing entry if any
  const existingEntry = useMoodStore((s) => s.getEntry(dateKey));
  const setEntry = useMoodStore((s) => s.setEntry);

  // Get current cycle info
  const getCurrentPhase = useCycleStore((s) => s.getCurrentPhase);
  const getDayOfCycle = useCycleStore((s) => s.getDayOfCycle);
  const lifeStage = useCycleStore((s) => s.lifeStage);

  const currentPhase = getCurrentPhase();
  const dayOfCycle = getDayOfCycle();

  // Form state
  const [mood, setMood] = useState(existingEntry?.mood ?? 3);
  const [energy, setEnergy] = useState(existingEntry?.energy ?? 3);
  const [notes, setNotes] = useState(existingEntry?.notes ?? "");

  // Animation
  const saveButtonScale = useSharedValue(1);

  const saveButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: saveButtonScale.value }],
  }));

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const data = {
        date: dateKey,
        mood,
        energy,
        notes: notes.trim() || undefined,
        cyclePhase: lifeStage === "regular" ? currentPhase : undefined,
        dayOfCycle: lifeStage === "regular" ? dayOfCycle : undefined,
      };
      return moodApi.saveEntry(data);
    },
    onSuccess: (response) => {
      // Update local store
      setEntry({
        date: dateKey,
        mood,
        energy,
        notes: notes.trim() || undefined,
        cyclePhase: lifeStage === "regular" ? currentPhase : undefined,
        dayOfCycle: lifeStage === "regular" ? dayOfCycle : undefined,
        synced: true,
      });
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["mood-entries"] });
      queryClient.invalidateQueries({ queryKey: ["mood-stats"] });
      // Close modal
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    },
    onError: () => {
      // Still save locally even if server fails
      setEntry({
        date: dateKey,
        mood,
        energy,
        notes: notes.trim() || undefined,
        cyclePhase: lifeStage === "regular" ? currentPhase : undefined,
        dayOfCycle: lifeStage === "regular" ? dayOfCycle : undefined,
        synced: false,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      router.back();
    },
  });

  const handleSave = () => {
    saveButtonScale.value = withSpring(0.95, {}, () => {
      saveButtonScale.value = withSpring(1);
    });
    saveMutation.mutate();
  };

  const formatDisplayDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);

    if (compareDate.getTime() === today.getTime()) {
      return "Today";
    }

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (compareDate.getTime() === yesterday.getTime()) {
      return "Yesterday";
    }

    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <View className="flex-1 bg-[#0f0a1a]">
      <LinearGradient
        colors={["#1a1028", "#0f0a1a", "#0a0610"]}
        className="flex-1"
      >
        <SafeAreaView className="flex-1" edges={["top"]}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1"
          >
            {/* Header */}
            <Animated.View
              entering={FadeIn.duration(400)}
              className="flex-row items-center justify-between px-4 py-3"
            >
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.back();
                }}
                className="p-2 rounded-full bg-white/10"
              >
                <X size={22} color="#a78bfa" />
              </Pressable>

              <View className="items-center">
                <Text
                  className="text-purple-100 text-xl"
                  style={{ fontFamily: "Cormorant_600SemiBold" }}
                >
                  Log Mood & Energy
                </Text>
                <Text
                  className="text-purple-300/60 text-sm"
                  style={{ fontFamily: "Quicksand_500Medium" }}
                >
                  {formatDisplayDate(selectedDate)}
                </Text>
              </View>

              <AnimatedPressable
                onPress={handleSave}
                disabled={saveMutation.isPending}
                style={saveButtonStyle}
                className="p-2 rounded-full bg-purple-500/30"
              >
                <Check size={22} color="#a78bfa" />
              </AnimatedPressable>
            </Animated.View>

            <ScrollView
              className="flex-1 px-4"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 40 }}
            >
              {/* Current Phase Card */}
              {lifeStage === "regular" && (
                <Animated.View
                  entering={FadeInDown.delay(100).duration(400)}
                  className="bg-white/5 rounded-2xl p-4 mb-6 border border-purple-500/20"
                >
                  <View className="flex-row items-center">
                    <Text className="text-2xl mr-3">
                      {phaseInfo[currentPhase].emoji}
                    </Text>
                    <View>
                      <Text
                        className="text-purple-100"
                        style={{ fontFamily: "Quicksand_600SemiBold" }}
                      >
                        {phaseInfo[currentPhase].name} Phase
                      </Text>
                      <Text
                        className="text-purple-300/60 text-sm"
                        style={{ fontFamily: "Quicksand_500Medium" }}
                      >
                        Day {dayOfCycle} of cycle
                      </Text>
                    </View>
                  </View>
                </Animated.View>
              )}

              {/* Mood Selector */}
              <Animated.View entering={FadeInDown.delay(200).duration(400)}>
                <LevelSelector
                  levels={moodLevels}
                  value={mood}
                  onChange={setMood}
                  label="How are you feeling?"
                />
              </Animated.View>

              {/* Energy Selector */}
              <Animated.View entering={FadeInDown.delay(300).duration(400)}>
                <LevelSelector
                  levels={energyLevels}
                  value={energy}
                  onChange={setEnergy}
                  label="What's your energy level?"
                />
              </Animated.View>

              {/* Notes */}
              <Animated.View entering={FadeInDown.delay(400).duration(400)}>
                <Text
                  className="text-purple-100 text-lg mb-3"
                  style={{ fontFamily: "Cormorant_600SemiBold" }}
                >
                  Notes (optional)
                </Text>
                <TextInput
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="How was your day? Any symptoms or observations..."
                  placeholderTextColor="rgba(167, 139, 250, 0.4)"
                  multiline
                  numberOfLines={4}
                  className="bg-white/5 rounded-2xl p-4 text-purple-100 border border-purple-500/20 min-h-[120px]"
                  style={{
                    fontFamily: "Quicksand_500Medium",
                    textAlignVertical: "top",
                  }}
                />
              </Animated.View>

              {/* Save Button */}
              <Animated.View entering={FadeInDown.delay(500).duration(400)}>
                <Pressable
                  onPress={handleSave}
                  disabled={saveMutation.isPending}
                  className="mt-8 rounded-2xl overflow-hidden"
                >
                  <LinearGradient
                    colors={["#9d84ed", "#7c3aed"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="py-4 items-center"
                  >
                    <Text
                      className="text-white text-lg"
                      style={{ fontFamily: "Quicksand_600SemiBold" }}
                    >
                      {saveMutation.isPending ? "Saving..." : "Save Entry"}
                    </Text>
                  </LinearGradient>
                </Pressable>
              </Animated.View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

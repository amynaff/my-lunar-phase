import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { X, Check, Sparkles } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useThemeStore, getTheme } from '@/lib/theme-store';
import { useCycleStore, phaseInfo } from '@/lib/cycle-store';
import { journalTags } from '@/lib/journal-store';
import { useQuickCheckIn } from '@/lib/api/journal';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Mood emojis for the 1-5 scale
const moodEmojis = [
  { value: 1, emoji: '😢', label: 'Sad' },
  { value: 2, emoji: '😕', label: 'Low' },
  { value: 3, emoji: '😐', label: 'Okay' },
  { value: 4, emoji: '🙂', label: 'Good' },
  { value: 5, emoji: '😊', label: 'Great' },
];

interface QuickCheckInSheetProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function QuickCheckInSheet({
  visible,
  onClose,
  onSuccess,
}: QuickCheckInSheetProps) {
  const insets = useSafeAreaInsets();
  const themeMode = useThemeStore((s) => s.mode);
  const theme = getTheme(themeMode);
  const getCurrentPhase = useCycleStore((s) => s.getCurrentPhase);
  const getDayOfCycle = useCycleStore((s) => s.getDayOfCycle);

  const quickCheckInMutation = useQuickCheckIn();

  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const currentPhase = getCurrentPhase();
  const dayOfCycle = getDayOfCycle();

  // Animation values
  const moodScale = useSharedValue(1);

  // Reset form when modal opens
  useEffect(() => {
    if (visible) {
      setSelectedMood(null);
      setNote('');
      setSelectedTags([]);
    }
  }, [visible]);

  const selectMood = (value: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedMood(value);
    // Quick scale animation
    moodScale.value = withSpring(1.1, { damping: 10 }, () => {
      moodScale.value = withSpring(1, { damping: 10 });
    });
  };

  const toggleTag = (tagId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]
    );
  };

  const handleCheckIn = async () => {
    if (!selectedMood && !note.trim() && selectedTags.length === 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    try {
      await quickCheckInMutation.mutateAsync({
        mood: selectedMood || undefined,
        note: note.trim() || undefined,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
        cyclePhase: currentPhase,
        dayOfCycle,
      });

      onSuccess?.();
      onClose();
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      console.error('Quick check-in failed:', error);
    }
  };

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  const characterCount = note.length;
  const maxCharacters = 280;
  const isOverLimit = characterCount > maxCharacters;

  return (
    <Modal visible={visible} animationType="none" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Backdrop */}
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: theme.overlay,
          }}
        >
          <Pressable style={{ flex: 1 }} onPress={handleClose} />
        </Animated.View>

        {/* Sheet Content */}
        <Animated.View
          entering={SlideInDown.springify().damping(20).stiffness(90)}
          exiting={SlideOutDown.springify().damping(20).stiffness(90)}
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            maxHeight: SCREEN_HEIGHT * 0.85,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            overflow: 'hidden',
          }}
        >
          <LinearGradient
            colors={theme.gradient}
            locations={[0, 0.25, 0.5, 0.75, 1]}
            style={{ flex: 1 }}
          >
            {/* Handle bar */}
            <View className="items-center pt-3 pb-2">
              <View
                style={{
                  width: 40,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: theme.border.medium,
                }}
              />
            </View>

            {/* Header */}
            <View className="px-5 pb-4 flex-row items-center justify-between">
              <Pressable
                onPress={handleClose}
                className="w-10 h-10 rounded-full items-center justify-center"
                style={{ backgroundColor: `${theme.accent.purple}15` }}
              >
                <X size={20} color={theme.accent.purple} />
              </Pressable>

              <View className="flex-row items-center">
                <Sparkles size={18} color={theme.accent.purple} />
                <Text
                  style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
                  className="text-lg ml-2"
                >
                  Quick Check-In
                </Text>
              </View>

              <Pressable
                onPress={handleCheckIn}
                disabled={quickCheckInMutation.isPending || isOverLimit}
                className="px-4 py-2 rounded-full"
                style={{
                  backgroundColor:
                    quickCheckInMutation.isPending || isOverLimit
                      ? theme.border.light
                      : theme.accent.purple,
                }}
              >
                <Text
                  style={{
                    fontFamily: 'Quicksand_600SemiBold',
                    color: quickCheckInMutation.isPending || isOverLimit ? theme.text.muted : '#fff',
                  }}
                  className="text-sm"
                >
                  {quickCheckInMutation.isPending ? 'Saving...' : 'Check In'}
                </Text>
              </Pressable>
            </View>

            <ScrollView
              className="flex-1"
              contentContainerStyle={{
                paddingHorizontal: 20,
                paddingBottom: insets.bottom + 20,
              }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Current Phase Badge */}
              <View className="flex-row items-center mb-5">
                <View
                  className="px-3 py-1.5 rounded-full flex-row items-center"
                  style={{ backgroundColor: `${phaseInfo[currentPhase]?.color || theme.accent.purple}20` }}
                >
                  <Text className="text-sm mr-1">{phaseInfo[currentPhase]?.emoji || '🌙'}</Text>
                  <Text
                    style={{
                      fontFamily: 'Quicksand_500Medium',
                      color: phaseInfo[currentPhase]?.color || theme.accent.purple,
                    }}
                    className="text-xs"
                  >
                    {phaseInfo[currentPhase]?.name || 'Unknown'} Phase - Day {dayOfCycle}
                  </Text>
                </View>
              </View>

              {/* Mood Selection */}
              <View className="mb-5">
                <Text
                  style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
                  className="text-sm mb-3"
                >
                  How are you feeling?
                </Text>
                <View
                  className="flex-row justify-between p-4 rounded-2xl border"
                  style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light }}
                >
                  {moodEmojis.map((mood) => {
                    const isSelected = selectedMood === mood.value;
                    return (
                      <Pressable
                        key={mood.value}
                        onPress={() => selectMood(mood.value)}
                        className="items-center"
                        style={{ flex: 1 }}
                      >
                        <View
                          className="w-12 h-12 rounded-full items-center justify-center mb-1"
                          style={{
                            backgroundColor: isSelected
                              ? `${theme.accent.purple}25`
                              : 'transparent',
                            borderWidth: isSelected ? 2 : 0,
                            borderColor: theme.accent.purple,
                          }}
                        >
                          <Text className="text-2xl">{mood.emoji}</Text>
                        </View>
                        <Text
                          style={{
                            fontFamily: isSelected ? 'Quicksand_600SemiBold' : 'Quicksand_400Regular',
                            color: isSelected ? theme.accent.purple : theme.text.tertiary,
                          }}
                          className="text-xs"
                        >
                          {mood.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Quick Note */}
              <View className="mb-5">
                <View className="flex-row justify-between items-center mb-3">
                  <Text
                    style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
                    className="text-sm"
                  >
                    Quick thought
                  </Text>
                  <Text
                    style={{
                      fontFamily: 'Quicksand_400Regular',
                      color: isOverLimit ? '#ef4444' : theme.text.tertiary,
                    }}
                    className="text-xs"
                  >
                    {characterCount}/{maxCharacters}
                  </Text>
                </View>
                <TextInput
                  value={note}
                  onChangeText={setNote}
                  placeholder="What's on your mind? (like a tweet)"
                  placeholderTextColor={theme.text.tertiary}
                  multiline
                  maxLength={300} // Allow slightly over to show warning
                  textAlignVertical="top"
                  style={{
                    fontFamily: 'Quicksand_400Regular',
                    color: theme.text.primary,
                    backgroundColor: theme.bg.card,
                    borderColor: isOverLimit ? '#ef4444' : theme.border.light,
                    minHeight: 80,
                  }}
                  className="p-4 rounded-2xl border text-base"
                />
              </View>

              {/* Tags Section */}
              <View>
                <Text
                  style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
                  className="text-sm mb-3"
                >
                  Add tags
                </Text>
                <View className="flex-row flex-wrap" style={{ gap: 8 }}>
                  {journalTags.map((tag) => {
                    const isSelected = selectedTags.includes(tag.id);
                    return (
                      <Pressable
                        key={tag.id}
                        onPress={() => toggleTag(tag.id)}
                        className="flex-row items-center px-3 py-2 rounded-full border"
                        style={{
                          backgroundColor: isSelected
                            ? `${theme.accent.purple}20`
                            : theme.bg.card,
                          borderColor: isSelected
                            ? theme.accent.purple
                            : theme.border.light,
                        }}
                      >
                        <Text className="text-sm mr-1">{tag.emoji}</Text>
                        <Text
                          style={{
                            fontFamily: 'Quicksand_500Medium',
                            color: isSelected ? theme.accent.purple : theme.text.secondary,
                          }}
                          className="text-xs"
                        >
                          {tag.label}
                        </Text>
                        {isSelected && (
                          <Check size={12} color={theme.accent.purple} style={{ marginLeft: 4 }} />
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </ScrollView>
          </LinearGradient>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

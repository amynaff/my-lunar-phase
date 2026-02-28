import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInUp, FadeOut } from 'react-native-reanimated';
import { X, Mic, MicOff, Play, Pause, Trash2, Sparkles, Check } from 'lucide-react-native';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { useThemeStore, getTheme } from '@/lib/theme-store';
import { useCycleStore, phaseInfo } from '@/lib/cycle-store';
import { useJournalStore, journalPrompts, journalTags, JournalEntry } from '@/lib/journal-store';

interface JournalEntryModalProps {
  visible: boolean;
  onClose: () => void;
  editEntry?: JournalEntry;
  initialPrompt?: string;
}

export function JournalEntryModal({
  visible,
  onClose,
  editEntry,
  initialPrompt,
}: JournalEntryModalProps) {
  const insets = useSafeAreaInsets();
  const themeMode = useThemeStore((s) => s.mode);
  const theme = getTheme(themeMode);
  const getCurrentPhase = useCycleStore((s) => s.getCurrentPhase);
  const getDayOfCycle = useCycleStore((s) => s.getDayOfCycle);
  const addEntry = useJournalStore((s) => s.addEntry);
  const updateEntry = useJournalStore((s) => s.updateEntry);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<string | undefined>(initialPrompt);
  const [showPrompts, setShowPrompts] = useState(false);

  // Voice memo state
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceMemoUri, setVoiceMemoUri] = useState<string | undefined>();
  const [voiceMemoDuration, setVoiceMemoDuration] = useState<number>(0);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);

  const currentPhase = getCurrentPhase();
  const dayOfCycle = getDayOfCycle();
  const phasePrompts = journalPrompts[currentPhase] || journalPrompts.follicular;

  // Initialize form with edit data
  useEffect(() => {
    if (editEntry) {
      setTitle(editEntry.title || '');
      setContent(editEntry.content);
      setSelectedTags(editEntry.tags || []);
      setSelectedPrompt(editEntry.prompt);
      setVoiceMemoUri(editEntry.voiceMemoUri);
      setVoiceMemoDuration(editEntry.voiceMemoDuration || 0);
    } else {
      resetForm();
      if (initialPrompt) {
        setSelectedPrompt(initialPrompt);
      }
    }
  }, [editEntry, visible, initialPrompt]);

  const resetForm = () => {
    setTitle('');
    setContent('');
    setSelectedTags([]);
    setSelectedPrompt(undefined);
    setVoiceMemoUri(undefined);
    setVoiceMemoDuration(0);
    setShowPrompts(false);
  };

  const toggleTag = (tagId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]
    );
  };

  const selectPrompt = (prompt: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedPrompt(prompt);
    setShowPrompts(false);
  };

  // Voice recording functions
  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Permission required', 'Please allow microphone access to record voice memos.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(recording);
      setIsRecording(true);
      setRecordingDuration(0);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Track recording duration
      const interval = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);

      recording.setOnRecordingStatusUpdate((status) => {
        if (!status.isRecording) {
          clearInterval(interval);
        }
      });
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setVoiceMemoUri(uri || undefined);
      setVoiceMemoDuration(recordingDuration);
      setRecording(null);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  };

  const playVoiceMemo = async () => {
    if (!voiceMemoUri) return;

    try {
      if (sound) {
        if (isPlaying) {
          await sound.pauseAsync();
          setIsPlaying(false);
        } else {
          await sound.playAsync();
          setIsPlaying(true);
        }
        return;
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: voiceMemoUri },
        { shouldPlay: true }
      );

      setSound(newSound);
      setIsPlaying(true);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
        }
      });
    } catch (error) {
      console.error('Failed to play voice memo:', error);
    }
  };

  const deleteVoiceMemo = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Delete Voice Memo', 'Are you sure you want to delete this voice memo?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          if (sound) {
            sound.unloadAsync();
            setSound(null);
          }
          setVoiceMemoUri(undefined);
          setVoiceMemoDuration(0);
          setIsPlaying(false);
        },
      },
    ]);
  };

  // Cleanup sound on unmount
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSave = () => {
    if (!content.trim() && !voiceMemoUri) {
      Alert.alert('Empty Entry', 'Please write something or record a voice memo.');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const entryData = {
      date: new Date().toISOString(),
      title: title.trim() || undefined,
      content: content.trim(),
      voiceMemoUri,
      voiceMemoDuration: voiceMemoDuration || undefined,
      prompt: selectedPrompt,
      cyclePhase: currentPhase,
      dayOfCycle,
      tags: selectedTags,
    };

    if (editEntry) {
      updateEntry(editEntry.id, entryData);
    } else {
      addEntry(entryData);
    }

    resetForm();
    onClose();
  };

  const handleClose = () => {
    if (content.trim() || voiceMemoUri || title.trim()) {
      Alert.alert('Discard Entry?', 'You have unsaved changes. Are you sure you want to discard them?', [
        { text: 'Keep Editing', style: 'cancel' },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => {
            resetForm();
            onClose();
          },
        },
      ]);
    } else {
      resetForm();
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1, backgroundColor: theme.bg.primary }}>
          <LinearGradient
            colors={theme.gradient}
            locations={[0, 0.25, 0.5, 0.75, 1]}
            style={{ flex: 1 }}
          >
            {/* Header */}
            <View
              style={{ paddingTop: insets.top + 12 }}
              className="px-5 pb-4 flex-row items-center justify-between border-b"
            >
              <Pressable
                onPress={handleClose}
                className="w-10 h-10 rounded-full items-center justify-center"
                style={{ backgroundColor: `${theme.accent.purple}15` }}
              >
                <X size={20} color={theme.accent.purple} />
              </Pressable>

              <Text
                style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
                className="text-lg"
              >
                {editEntry ? 'Edit Entry' : 'New Entry'}
              </Text>

              <Pressable
                onPress={handleSave}
                className="px-4 py-2 rounded-full"
                style={{ backgroundColor: theme.accent.purple }}
              >
                <Text
                  style={{ fontFamily: 'Quicksand_600SemiBold', color: '#fff' }}
                  className="text-sm"
                >
                  Save
                </Text>
              </Pressable>
            </View>

            <ScrollView
              className="flex-1"
              contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Current Phase Badge */}
              <Animated.View entering={FadeInUp.delay(100)} className="flex-row items-center mb-4">
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
                    {phaseInfo[currentPhase]?.name || 'Unknown'} Phase · Day {dayOfCycle}
                  </Text>
                </View>
              </Animated.View>

              {/* Journal Prompt Selector */}
              <Animated.View entering={FadeInUp.delay(150)} className="mb-4">
                <Pressable
                  onPress={() => setShowPrompts(!showPrompts)}
                  className="flex-row items-center p-4 rounded-2xl border"
                  style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light }}
                >
                  <Sparkles size={18} color={theme.accent.purple} />
                  <Text
                    style={{ fontFamily: 'Quicksand_500Medium', color: theme.text.primary }}
                    className="text-sm ml-3 flex-1"
                  >
                    {selectedPrompt || 'Choose a prompt (optional)'}
                  </Text>
                </Pressable>

                {showPrompts && (
                  <Animated.View
                    entering={FadeIn}
                    className="mt-2 p-4 rounded-2xl border"
                    style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light }}
                  >
                    <Text
                      style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.accent.purple }}
                      className="text-xs uppercase tracking-wider mb-3"
                    >
                      {phasePrompts.theme}
                    </Text>
                    {phasePrompts.prompts.map((prompt, index) => (
                      <Pressable
                        key={index}
                        onPress={() => selectPrompt(prompt)}
                        className="py-3 border-b"
                        style={{ borderBottomColor: theme.border.light }}
                      >
                        <Text
                          style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.secondary }}
                          className="text-sm"
                        >
                          {prompt}
                        </Text>
                      </Pressable>
                    ))}
                  </Animated.View>
                )}
              </Animated.View>

              {/* Title Input */}
              <Animated.View entering={FadeInUp.delay(200)} className="mb-4">
                <TextInput
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Title (optional)"
                  placeholderTextColor={theme.text.tertiary}
                  style={{
                    fontFamily: 'Quicksand_600SemiBold',
                    color: theme.text.primary,
                    backgroundColor: theme.bg.card,
                    borderColor: theme.border.light,
                  }}
                  className="p-4 rounded-2xl border text-lg"
                />
              </Animated.View>

              {/* Content Input */}
              <Animated.View entering={FadeInUp.delay(250)} className="mb-4">
                <TextInput
                  value={content}
                  onChangeText={setContent}
                  placeholder={selectedPrompt || "What's on your mind today?"}
                  placeholderTextColor={theme.text.tertiary}
                  multiline
                  textAlignVertical="top"
                  style={{
                    fontFamily: 'Quicksand_400Regular',
                    color: theme.text.primary,
                    backgroundColor: theme.bg.card,
                    borderColor: theme.border.light,
                    minHeight: 150,
                  }}
                  className="p-4 rounded-2xl border text-base"
                />
              </Animated.View>

              {/* Voice Memo Section */}
              <Animated.View entering={FadeInUp.delay(300)} className="mb-4">
                <Text
                  style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
                  className="text-sm mb-3"
                >
                  Voice Memo
                </Text>

                {voiceMemoUri ? (
                  <View
                    className="flex-row items-center p-4 rounded-2xl border"
                    style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light }}
                  >
                    <Pressable
                      onPress={playVoiceMemo}
                      className="w-10 h-10 rounded-full items-center justify-center mr-3"
                      style={{ backgroundColor: `${theme.accent.purple}20` }}
                    >
                      {isPlaying ? (
                        <Pause size={18} color={theme.accent.purple} />
                      ) : (
                        <Play size={18} color={theme.accent.purple} />
                      )}
                    </Pressable>
                    <View className="flex-1">
                      <Text
                        style={{ fontFamily: 'Quicksand_500Medium', color: theme.text.primary }}
                        className="text-sm"
                      >
                        Voice Memo
                      </Text>
                      <Text
                        style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.tertiary }}
                        className="text-xs"
                      >
                        {formatDuration(voiceMemoDuration)}
                      </Text>
                    </View>
                    <Pressable
                      onPress={deleteVoiceMemo}
                      className="w-10 h-10 rounded-full items-center justify-center"
                      style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                    >
                      <Trash2 size={18} color="#ef4444" />
                    </Pressable>
                  </View>
                ) : (
                  <Pressable
                    onPress={isRecording ? stopRecording : startRecording}
                    className="flex-row items-center justify-center p-4 rounded-2xl border"
                    style={{
                      backgroundColor: isRecording ? 'rgba(239, 68, 68, 0.1)' : theme.bg.card,
                      borderColor: isRecording ? '#ef4444' : theme.border.light,
                    }}
                  >
                    <View
                      className="w-10 h-10 rounded-full items-center justify-center mr-3"
                      style={{ backgroundColor: isRecording ? '#ef4444' : `${theme.accent.purple}20` }}
                    >
                      {isRecording ? (
                        <MicOff size={18} color="#fff" />
                      ) : (
                        <Mic size={18} color={theme.accent.purple} />
                      )}
                    </View>
                    <Text
                      style={{
                        fontFamily: 'Quicksand_500Medium',
                        color: isRecording ? '#ef4444' : theme.text.primary,
                      }}
                      className="text-sm"
                    >
                      {isRecording
                        ? `Recording... ${formatDuration(recordingDuration)}`
                        : 'Tap to record'}
                    </Text>
                  </Pressable>
                )}
              </Animated.View>

              {/* Tags Section */}
              <Animated.View entering={FadeInUp.delay(350)}>
                <Text
                  style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
                  className="text-sm mb-3"
                >
                  How are you feeling?
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
              </Animated.View>
            </ScrollView>
          </LinearGradient>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

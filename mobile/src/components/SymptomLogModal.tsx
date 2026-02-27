import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown, FadeOut, SlideInDown } from 'react-native-reanimated';
import { X, Check, Calendar, ChevronLeft, ChevronRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useThemeStore, getTheme } from '@/lib/theme-store';
import { useCycleStore, CyclePhase, phaseInfo } from '@/lib/cycle-store';
import {
  useSymptomStore,
  availableSymptoms,
  getSymptomsByCategory,
  categoryNames,
  severityConfig,
  SymptomLog,
  SymptomSeverity,
  SymptomCategory,
  getSymptomById,
} from '@/lib/symptom-store';

interface SymptomLogModalProps {
  visible: boolean;
  onClose: () => void;
  initialDate?: string;
}

export function SymptomLogModal({ visible, onClose, initialDate }: SymptomLogModalProps) {
  const themeMode = useThemeStore((s) => s.mode);
  const theme = getTheme(themeMode);

  const getCurrentPhase = useCycleStore((s) => s.getCurrentPhase);
  const lastPeriodStartStore = useCycleStore((s) => s.lastPeriodStart);
  const cycleLength = useCycleStore((s) => s.cycleLength);

  // Calculate current phase and cycle day
  const currentPhase = getCurrentPhase();
  const cycleDay = (() => {
    if (!lastPeriodStartStore) return 1;
    const start = new Date(lastPeriodStartStore);
    const today = new Date();
    const daysSince = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return (daysSince % cycleLength) + 1;
  })();

  const logSymptoms = useSymptomStore((s) => s.logSymptoms);
  const getEntryByDate = useSymptomStore((s) => s.getEntryByDate);
  const getPredictedSymptoms = useSymptomStore((s) => s.getPredictedSymptoms);

  const [selectedDate, setSelectedDate] = useState(() => {
    if (initialDate) return initialDate;
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  const [selectedSymptoms, setSelectedSymptoms] = useState<SymptomLog[]>([]);
  const [notes, setNotes] = useState('');
  const [activeCategory, setActiveCategory] = useState<SymptomCategory>('physical');

  const categories: SymptomCategory[] = ['physical', 'emotional', 'energy', 'digestive', 'sleep', 'skin', 'other'];

  // Load existing entry for selected date
  useEffect(() => {
    if (visible) {
      const existingEntry = getEntryByDate(selectedDate);
      if (existingEntry) {
        setSelectedSymptoms(existingEntry.symptoms);
        setNotes(existingEntry.notes || '');
      } else {
        setSelectedSymptoms([]);
        setNotes('');
      }
    }
  }, [selectedDate, visible, getEntryByDate]);

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  const formatDisplayDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday) return 'Today';
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + (direction === 'prev' ? -1 : 1));
    // Don't allow future dates
    if (current <= new Date()) {
      setSelectedDate(current.toISOString().split('T')[0]);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const toggleSymptom = (symptomId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const existing = selectedSymptoms.find(s => s.symptomId === symptomId);
    if (existing) {
      setSelectedSymptoms(selectedSymptoms.filter(s => s.symptomId !== symptomId));
    } else {
      setSelectedSymptoms([...selectedSymptoms, { symptomId, severity: 'moderate' }]);
    }
  };

  const setSeverity = (symptomId: string, severity: SymptomSeverity) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedSymptoms(selectedSymptoms.map(s =>
      s.symptomId === symptomId ? { ...s, severity } : s
    ));
  };

  const handleSave = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Calculate cycle day for the selected date
    const lastPeriodStart = useCycleStore.getState().lastPeriodStart;
    let dayCycleForDate = cycleDay;
    if (lastPeriodStart && !isToday) {
      const start = new Date(lastPeriodStart);
      const selected = new Date(selectedDate);
      dayCycleForDate = Math.floor((selected.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    }

    logSymptoms(
      selectedDate,
      selectedSymptoms,
      currentPhase,
      dayCycleForDate,
      notes.trim() || undefined
    );
    onClose();
  };

  // Get predicted symptoms for current phase
  const predictions = currentPhase ? getPredictedSymptoms(currentPhase) : [];

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
          className="flex-row items-center justify-between px-5 py-4"
          style={{ borderBottomWidth: 1, borderBottomColor: theme.border.light }}
        >
          <Pressable onPress={onClose} className="p-2 -ml-2">
            <X size={24} color={theme.text.secondary} />
          </Pressable>
          <Text
            style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
            className="text-lg"
          >
            Log Symptoms
          </Text>
          <Pressable
            onPress={handleSave}
            className="px-4 py-2 rounded-full"
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

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {/* Date Selector */}
            <View className="px-5 py-4">
              <View
                className="flex-row items-center justify-between p-4 rounded-2xl"
                style={{ backgroundColor: theme.bg.secondary }}
              >
                <Pressable onPress={() => navigateDate('prev')} className="p-2">
                  <ChevronLeft size={20} color={theme.text.secondary} />
                </Pressable>
                <View className="items-center">
                  <View className="flex-row items-center">
                    <Calendar size={16} color={theme.accent.purple} style={{ marginRight: 8 }} />
                    <Text
                      style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
                      className="text-base"
                    >
                      {formatDisplayDate(selectedDate)}
                    </Text>
                  </View>
                  {isToday && (
                    <Text
                      style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.tertiary }}
                      className="text-xs mt-1"
                    >
                      {phaseInfo[currentPhase]?.name ?? 'Follicular'} Phase • Day {cycleDay}
                    </Text>
                  )}
                </View>
                <Pressable
                  onPress={() => navigateDate('next')}
                  className="p-2"
                  disabled={isToday}
                  style={{ opacity: isToday ? 0.3 : 1 }}
                >
                  <ChevronRight size={20} color={theme.text.secondary} />
                </Pressable>
              </View>
            </View>

            {/* Predicted Symptoms Banner */}
            {predictions.length > 0 && isToday && (
              <Animated.View entering={FadeInDown.delay(100)} className="px-5 mb-4">
                <View
                  className="p-4 rounded-2xl"
                  style={{ backgroundColor: `${theme.accent.purple}10`, borderWidth: 1, borderColor: `${theme.accent.purple}20` }}
                >
                  <Text
                    style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
                    className="text-sm mb-2"
                  >
                    Based on your history during {currentPhase} phase:
                  </Text>
                  <View className="flex-row flex-wrap" style={{ gap: 8 }}>
                    {predictions.slice(0, 4).map(p => {
                      const symptom = getSymptomById(p.symptomId);
                      if (!symptom) return null;
                      return (
                        <View
                          key={p.symptomId}
                          className="flex-row items-center px-3 py-1.5 rounded-full"
                          style={{ backgroundColor: `${theme.accent.pink}20` }}
                        >
                          <Text className="mr-1">{symptom.icon}</Text>
                          <Text
                            style={{ fontFamily: 'Quicksand_500Medium', color: theme.text.secondary }}
                            className="text-xs"
                          >
                            {symptom.name} ({Math.round(p.likelihood)}%)
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              </Animated.View>
            )}

            {/* Category Tabs */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="px-5 mb-4"
              contentContainerStyle={{ gap: 8 }}
            >
              {categories.map(cat => (
                <Pressable
                  key={cat}
                  onPress={() => {
                    setActiveCategory(cat);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  className="px-4 py-2 rounded-full"
                  style={{
                    backgroundColor: activeCategory === cat ? theme.accent.purple : theme.bg.secondary,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: 'Quicksand_500Medium',
                      color: activeCategory === cat ? '#fff' : theme.text.secondary,
                    }}
                    className="text-sm"
                  >
                    {categoryNames[cat]}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            {/* Symptoms Grid */}
            <View className="px-5 mb-4">
              <View className="flex-row flex-wrap" style={{ gap: 10 }}>
                {getSymptomsByCategory(activeCategory).map(symptom => {
                  const isSelected = selectedSymptoms.some(s => s.symptomId === symptom.id);
                  const selectedSymptom = selectedSymptoms.find(s => s.symptomId === symptom.id);

                  return (
                    <View key={symptom.id}>
                      <Pressable
                        onPress={() => toggleSymptom(symptom.id)}
                        className="items-center justify-center rounded-2xl"
                        style={{
                          width: 100,
                          height: 80,
                          backgroundColor: isSelected ? `${theme.accent.pink}20` : theme.bg.secondary,
                          borderWidth: isSelected ? 2 : 1,
                          borderColor: isSelected ? theme.accent.pink : theme.border.light,
                        }}
                      >
                        <Text className="text-2xl mb-1">{symptom.icon}</Text>
                        <Text
                          style={{
                            fontFamily: 'Quicksand_500Medium',
                            color: isSelected ? theme.accent.pink : theme.text.secondary,
                          }}
                          className="text-xs text-center px-1"
                          numberOfLines={1}
                        >
                          {symptom.name}
                        </Text>
                        {isSelected && (
                          <View
                            className="absolute top-1 right-1 w-5 h-5 rounded-full items-center justify-center"
                            style={{ backgroundColor: theme.accent.pink }}
                          >
                            <Check size={12} color="#fff" />
                          </View>
                        )}
                      </Pressable>

                      {/* Severity Selector */}
                      {isSelected && selectedSymptom && (
                        <Animated.View
                          entering={FadeIn.duration(200)}
                          className="flex-row justify-center mt-2"
                          style={{ gap: 4 }}
                        >
                          {(['mild', 'moderate', 'severe'] as SymptomSeverity[]).map(sev => (
                            <Pressable
                              key={sev}
                              onPress={() => setSeverity(symptom.id, sev)}
                              className="px-2 py-1 rounded-full"
                              style={{
                                backgroundColor: selectedSymptom.severity === sev
                                  ? severityConfig[sev].color
                                  : `${severityConfig[sev].color}20`,
                              }}
                            >
                              <Text
                                style={{
                                  fontFamily: 'Quicksand_500Medium',
                                  color: selectedSymptom.severity === sev ? '#fff' : severityConfig[sev].color,
                                }}
                                className="text-[10px]"
                              >
                                {sev.charAt(0).toUpperCase()}
                              </Text>
                            </Pressable>
                          ))}
                        </Animated.View>
                      )}
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Selected Symptoms Summary */}
            {selectedSymptoms.length > 0 && (
              <View className="px-5 mb-4">
                <Text
                  style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
                  className="text-sm mb-3"
                >
                  Selected ({selectedSymptoms.length})
                </Text>
                <View className="flex-row flex-wrap" style={{ gap: 8 }}>
                  {selectedSymptoms.map(s => {
                    const symptom = getSymptomById(s.symptomId);
                    if (!symptom) return null;
                    return (
                      <View
                        key={s.symptomId}
                        className="flex-row items-center px-3 py-2 rounded-full"
                        style={{
                          backgroundColor: `${severityConfig[s.severity].color}15`,
                          borderWidth: 1,
                          borderColor: `${severityConfig[s.severity].color}30`,
                        }}
                      >
                        <Text className="mr-1.5">{symptom.icon}</Text>
                        <Text
                          style={{ fontFamily: 'Quicksand_500Medium', color: theme.text.primary }}
                          className="text-sm mr-1.5"
                        >
                          {symptom.name}
                        </Text>
                        <View
                          className="px-1.5 py-0.5 rounded"
                          style={{ backgroundColor: severityConfig[s.severity].color }}
                        >
                          <Text
                            style={{ fontFamily: 'Quicksand_600SemiBold', color: '#fff' }}
                            className="text-[10px]"
                          >
                            {severityConfig[s.severity].label}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Notes */}
            <View className="px-5 mb-6">
              <Text
                style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
                className="text-sm mb-2"
              >
                Notes (optional)
              </Text>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="Add any notes about how you're feeling..."
                placeholderTextColor={theme.text.tertiary}
                multiline
                numberOfLines={3}
                className="p-4 rounded-2xl"
                style={{
                  backgroundColor: theme.bg.secondary,
                  color: theme.text.primary,
                  fontFamily: 'Quicksand_400Regular',
                  minHeight: 100,
                  textAlignVertical: 'top',
                }}
              />
            </View>

            {/* Severity Legend */}
            <View className="px-5 pb-8">
              <Text
                style={{ fontFamily: 'Quicksand_500Medium', color: theme.text.tertiary }}
                className="text-xs mb-2"
              >
                Severity Guide
              </Text>
              <View className="flex-row" style={{ gap: 12 }}>
                {(['mild', 'moderate', 'severe'] as SymptomSeverity[]).map(sev => (
                  <View key={sev} className="flex-row items-center">
                    <View
                      className="w-3 h-3 rounded-full mr-1.5"
                      style={{ backgroundColor: severityConfig[sev].color }}
                    />
                    <Text
                      style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.secondary }}
                      className="text-xs"
                    >
                      {severityConfig[sev].label}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

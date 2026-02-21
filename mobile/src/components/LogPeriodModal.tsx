import React, { useState } from 'react';
import { View, Text, Pressable, Modal, TextInput, ScrollView } from 'react-native';
import Animated, { FadeIn, SlideInUp } from 'react-native-reanimated';
import { X, Calendar, Check, Droplets, Clock, FileText } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useCycleStore } from '@/lib/cycle-store';
import { getTheme } from '@/lib/theme-store';
import * as Haptics from 'expo-haptics';

interface LogPeriodModalProps {
  visible: boolean;
  onClose: () => void;
  themeMode: 'light' | 'dark';
  initialDate?: Date;
  editingPeriodId?: string;
}

export function LogPeriodModal({
  visible,
  onClose,
  themeMode,
  initialDate,
  editingPeriodId,
}: LogPeriodModalProps) {
  const theme = getTheme(themeMode);
  const logPeriodStart = useCycleStore(s => s.logPeriodStart);
  const logPeriodEnd = useCycleStore(s => s.logPeriodEnd);
  const updatePeriodEntry = useCycleStore(s => s.updatePeriodEntry);
  const deletePeriodEntry = useCycleStore(s => s.deletePeriodEntry);
  const periodHistory = useCycleStore(s => s.periodHistory);

  const editingPeriod = editingPeriodId
    ? periodHistory.find(p => p.id === editingPeriodId)
    : null;

  const [startDate, setStartDate] = useState<Date>(
    editingPeriod ? new Date(editingPeriod.startDate) : initialDate || new Date()
  );
  const [endDate, setEndDate] = useState<Date | null>(
    editingPeriod?.endDate ? new Date(editingPeriod.endDate) : null
  );
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [notes, setNotes] = useState(editingPeriod?.notes || '');
  const [step, setStep] = useState<'start' | 'end' | 'notes'>('start');

  const handleSave = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    if (editingPeriodId) {
      // Update existing period
      updatePeriodEntry(editingPeriodId, {
        startDate: startDate.toISOString(),
        endDate: endDate?.toISOString(),
        periodLength: endDate
          ? Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
          : editingPeriod?.periodLength || 5,
        notes: notes || undefined,
      });
    } else {
      // Log new period
      logPeriodStart(startDate, notes || undefined);

      // If end date is provided, log it too
      if (endDate) {
        const newPeriod = periodHistory[periodHistory.length - 1];
        if (newPeriod) {
          logPeriodEnd(newPeriod.id, endDate);
        }
      }
    }

    onClose();
    resetForm();
  };

  const handleDelete = () => {
    if (editingPeriodId) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      deletePeriodEntry(editingPeriodId);
      onClose();
      resetForm();
    }
  };

  const resetForm = () => {
    setStartDate(new Date());
    setEndDate(null);
    setNotes('');
    setStep('start');
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const calculatePeriodLength = () => {
    if (!endDate) return null;
    return Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <Pressable className="flex-1" onPress={onClose} />

        <Animated.View
          entering={SlideInUp.duration(300)}
          className="rounded-t-3xl"
          style={{ backgroundColor: theme.bg.primary, maxHeight: '85%' }}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between px-6 py-4 border-b" style={{ borderBottomColor: theme.border.light }}>
            <Text
              style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
              className="text-lg"
            >
              {editingPeriodId ? 'Edit Period' : 'Log Period'}
            </Text>
            <Pressable
              onPress={onClose}
              className="w-8 h-8 rounded-full items-center justify-center"
              style={{ backgroundColor: `${theme.text.tertiary}20` }}
            >
              <X size={18} color={theme.text.tertiary} />
            </Pressable>
          </View>

          <ScrollView className="px-6 py-4" showsVerticalScrollIndicator={false}>
            {/* Start Date */}
            <View className="mb-6">
              <Text
                style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
                className="text-sm mb-3"
              >
                When did your period start?
              </Text>

              <Pressable
                onPress={() => setShowStartPicker(true)}
                className="flex-row items-center p-4 rounded-2xl border"
                style={{
                  backgroundColor: `${theme.accent.pink}10`,
                  borderColor: `${theme.accent.pink}30`,
                }}
              >
                <View
                  className="w-10 h-10 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: `${theme.accent.pink}20` }}
                >
                  <Droplets size={18} color={theme.accent.pink} />
                </View>
                <View className="flex-1">
                  <Text
                    style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.tertiary }}
                    className="text-xs"
                  >
                    Start date
                  </Text>
                  <Text
                    style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
                    className="text-base"
                  >
                    {formatDate(startDate)}
                  </Text>
                </View>
                <Calendar size={18} color={theme.accent.pink} />
              </Pressable>

              {showStartPicker && (
                <DateTimePicker
                  value={startDate}
                  mode="date"
                  display="spinner"
                  onChange={(event, date) => {
                    setShowStartPicker(false);
                    if (date) setStartDate(date);
                  }}
                  maximumDate={new Date()}
                />
              )}
            </View>

            {/* End Date (Optional) */}
            <View className="mb-6">
              <Text
                style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
                className="text-sm mb-1"
              >
                When did it end?
              </Text>
              <Text
                style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.tertiary }}
                className="text-xs mb-3"
              >
                Optional - you can update this later
              </Text>

              <Pressable
                onPress={() => setShowEndPicker(true)}
                className="flex-row items-center p-4 rounded-2xl border"
                style={{
                  backgroundColor: endDate ? `${theme.accent.purple}10` : theme.bg.card,
                  borderColor: endDate ? `${theme.accent.purple}30` : theme.border.light,
                }}
              >
                <View
                  className="w-10 h-10 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: endDate ? `${theme.accent.purple}20` : `${theme.text.tertiary}10` }}
                >
                  <Clock size={18} color={endDate ? theme.accent.purple : theme.text.tertiary} />
                </View>
                <View className="flex-1">
                  <Text
                    style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.tertiary }}
                    className="text-xs"
                  >
                    End date
                  </Text>
                  <Text
                    style={{
                      fontFamily: 'Quicksand_600SemiBold',
                      color: endDate ? theme.text.primary : theme.text.tertiary,
                    }}
                    className="text-base"
                  >
                    {endDate ? formatDate(endDate) : 'Tap to set'}
                  </Text>
                </View>
                {endDate && (
                  <View
                    className="px-2 py-1 rounded-full mr-2"
                    style={{ backgroundColor: `${theme.accent.purple}20` }}
                  >
                    <Text
                      style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.accent.purple }}
                      className="text-xs"
                    >
                      {calculatePeriodLength()} days
                    </Text>
                  </View>
                )}
                <Calendar size={18} color={endDate ? theme.accent.purple : theme.text.tertiary} />
              </Pressable>

              {endDate && (
                <Pressable
                  onPress={() => setEndDate(null)}
                  className="mt-2"
                >
                  <Text
                    style={{ fontFamily: 'Quicksand_500Medium', color: theme.text.tertiary }}
                    className="text-xs text-center"
                  >
                    Clear end date
                  </Text>
                </Pressable>
              )}

              {showEndPicker && (
                <DateTimePicker
                  value={endDate || new Date()}
                  mode="date"
                  display="spinner"
                  onChange={(event, date) => {
                    setShowEndPicker(false);
                    if (date && date >= startDate) setEndDate(date);
                  }}
                  minimumDate={startDate}
                  maximumDate={new Date()}
                />
              )}
            </View>

            {/* Notes (Optional) */}
            <View className="mb-6">
              <Text
                style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
                className="text-sm mb-1"
              >
                Notes
              </Text>
              <Text
                style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.tertiary }}
                className="text-xs mb-3"
              >
                Optional - add any symptoms or observations
              </Text>

              <View
                className="rounded-2xl border p-4"
                style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light }}
              >
                <View className="flex-row items-start">
                  <FileText size={16} color={theme.text.tertiary} style={{ marginTop: 2 }} />
                  <TextInput
                    value={notes}
                    onChangeText={setNotes}
                    placeholder="Heavy flow, cramps, mood changes..."
                    placeholderTextColor={theme.text.tertiary}
                    multiline
                    numberOfLines={3}
                    style={{
                      flex: 1,
                      marginLeft: 12,
                      fontFamily: 'Quicksand_400Regular',
                      color: theme.text.primary,
                      fontSize: 14,
                      textAlignVertical: 'top',
                    }}
                  />
                </View>
              </View>
            </View>

            {/* Quick Flow Intensity */}
            <View className="mb-6">
              <Text
                style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
                className="text-sm mb-3"
              >
                Flow intensity (optional)
              </Text>
              <View className="flex-row" style={{ gap: 8 }}>
                {['Light', 'Medium', 'Heavy'].map((level) => {
                  const isSelected = notes.toLowerCase().includes(level.toLowerCase());
                  return (
                    <Pressable
                      key={level}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        if (isSelected) {
                          setNotes(notes.replace(new RegExp(`${level} flow,?\\s*`, 'i'), ''));
                        } else {
                          setNotes(prev => prev ? `${level} flow, ${prev}` : `${level} flow`);
                        }
                      }}
                      className="flex-1 py-3 rounded-xl items-center border"
                      style={{
                        backgroundColor: isSelected ? `${theme.accent.pink}15` : theme.bg.card,
                        borderColor: isSelected ? theme.accent.pink : theme.border.light,
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: isSelected ? 'Quicksand_600SemiBold' : 'Quicksand_500Medium',
                          color: isSelected ? theme.accent.pink : theme.text.secondary,
                        }}
                        className="text-sm"
                      >
                        {level}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          {/* Actions */}
          <View className="px-6 py-4 border-t" style={{ borderTopColor: theme.border.light }}>
            {editingPeriodId && (
              <Pressable
                onPress={handleDelete}
                className="py-3 mb-3 rounded-full items-center border"
                style={{ borderColor: '#ef4444' }}
              >
                <Text
                  style={{ fontFamily: 'Quicksand_600SemiBold', color: '#ef4444' }}
                  className="text-base"
                >
                  Delete Period
                </Text>
              </Pressable>
            )}

            <Pressable
              onPress={handleSave}
              className="py-4 rounded-full items-center flex-row justify-center"
              style={{ backgroundColor: theme.accent.pink }}
            >
              <Check size={18} color="#fff" />
              <Text
                style={{ fontFamily: 'Quicksand_600SemiBold', color: '#fff' }}
                className="text-base ml-2"
              >
                {editingPeriodId ? 'Save Changes' : 'Log Period'}
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

// Quick log button for the home screen
export function QuickLogPeriodButton({
  themeMode,
  onPress,
}: {
  themeMode: 'light' | 'dark';
  onPress: () => void;
}) {
  const theme = getTheme(themeMode);

  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onPress();
      }}
      className="flex-row items-center justify-center py-4 rounded-2xl border"
      style={{
        backgroundColor: `${theme.accent.pink}15`,
        borderColor: `${theme.accent.pink}40`,
      }}
    >
      <Droplets size={20} color={theme.accent.pink} />
      <Text
        style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.accent.pink }}
        className="text-base ml-3"
      >
        Log Period Start
      </Text>
    </Pressable>
  );
}

import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, Alert, Share } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { ChevronLeft, Download, Share2, Calendar, Clock, TrendingUp, AlertTriangle, CheckCircle, Trash2, Edit3, FileText } from 'lucide-react-native';
import { router } from 'expo-router';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useCycleStore, PeriodLogEntry } from '@/lib/cycle-store';
import { useThemeStore, getTheme } from '@/lib/theme-store';
import { CycleCalendar } from '@/components/CycleCalendar';
import { LogPeriodModal } from '@/components/LogPeriodModal';
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

export default function CycleHistoryScreen() {
  const insets = useSafeAreaInsets();
  const themeMode = useThemeStore(s => s.mode);
  const theme = getTheme(themeMode);

  const periodHistory = useCycleStore(s => s.periodHistory);
  const getCycleStats = useCycleStore(s => s.getCycleStats);
  const deletePeriodEntry = useCycleStore(s => s.deletePeriodEntry);

  const [showLogModal, setShowLogModal] = useState(false);
  const [editingPeriodId, setEditingPeriodId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const [fontsLoaded] = useFonts({
    CormorantGaramond_400Regular,
    CormorantGaramond_600SemiBold,
    Quicksand_400Regular,
    Quicksand_500Medium,
    Quicksand_600SemiBold,
  });

  const stats = getCycleStats();

  // Sort history by date (newest first)
  const sortedHistory = useMemo(() => {
    return [...periodHistory].sort((a, b) =>
      new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );
  }, [periodHistory]);

  const handleEditPeriod = (periodId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEditingPeriodId(periodId);
    setShowLogModal(true);
  };

  const handleDeletePeriod = (periodId: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      'Delete Period',
      'Are you sure you want to delete this period entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deletePeriodEntry(periodId),
        },
      ]
    );
  };

  const handleDayPress = (date: Date) => {
    setSelectedDate(date);
    // Check if there's a period on this date
    const period = periodHistory.find(p => {
      const start = new Date(p.startDate.split('T')[0]);
      const end = p.endDate
        ? new Date(p.endDate.split('T')[0])
        : new Date(start.getTime() + (p.periodLength - 1) * 24 * 60 * 60 * 1000);
      const dateOnly = new Date(date.toISOString().split('T')[0]);
      return dateOnly >= start && dateOnly <= end;
    });

    if (period) {
      handleEditPeriod(period.id);
    } else if (date <= new Date()) {
      // Allow logging for past/current dates
      setShowLogModal(true);
    }
  };

  // Generate report text
  const generateReportText = (): string => {
    const lines: string[] = [];
    lines.push('LUNAFLOW CYCLE HISTORY REPORT');
    lines.push('Generated: ' + new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }));
    lines.push('');
    lines.push('=== CYCLE STATISTICS ===');
    lines.push(`Total Cycles Tracked: ${stats.totalCyclesTracked}`);
    lines.push(`Average Cycle Length: ${Math.round(stats.averageCycleLength)} days`);
    lines.push(`Average Period Length: ${Math.round(stats.averagePeriodLength)} days`);
    lines.push(`Cycle Variation: ${stats.cycleLengthVariation.min}-${stats.cycleLengthVariation.max} days`);
    lines.push(`Cycle Regularity: ${stats.isIrregular ? 'IRREGULAR' : 'REGULAR'}`);
    lines.push('');

    if (stats.isIrregular) {
      lines.push('NOTE: Irregular cycles detected. Cycle lengths vary by more than 7 days');
      lines.push('or fall outside the typical 21-35 day range. This may be related to');
      lines.push('conditions such as PCOS, stress, or hormonal changes. Please consult');
      lines.push('a healthcare provider for personalized guidance.');
      lines.push('');
    }

    lines.push('=== PERIOD HISTORY ===');
    lines.push('');

    sortedHistory.forEach((period, index) => {
      const startDate = new Date(period.startDate);
      const endDate = period.endDate ? new Date(period.endDate) : null;

      lines.push(`Period ${sortedHistory.length - index}:`);
      lines.push(`  Start: ${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`);
      if (endDate) {
        lines.push(`  End: ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`);
      }
      lines.push(`  Period Length: ${period.periodLength} days`);
      if (period.cycleLength) {
        const cycleStatus = period.cycleLength >= 21 && period.cycleLength <= 35 ? 'Normal' : 'Irregular';
        lines.push(`  Cycle Length: ${period.cycleLength} days (${cycleStatus})`);
      }
      if (period.notes) {
        lines.push(`  Notes: ${period.notes}`);
      }
      lines.push('');
    });

    lines.push('=== END OF REPORT ===');
    lines.push('');
    lines.push('DISCLAIMER: This report is for informational purposes only and');
    lines.push('should not be used for medical diagnosis. Please consult a');
    lines.push('healthcare provider for any health concerns.');

    return lines.join('\n');
  };

  const handleExportReport = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const reportText = generateReportText();
      const fileName = `LunaFlow_Cycle_Report_${new Date().toISOString().split('T')[0]}.txt`;
      const filePath = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(filePath, reportText, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(filePath, {
          mimeType: 'text/plain',
          dialogTitle: 'Share Cycle Report',
          UTI: 'public.plain-text',
        });
      } else {
        Alert.alert('Export Complete', `Report saved to ${fileName}`);
      }
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Export Error', 'Failed to export report. Please try again.');
    }
  };

  const handleShareReport = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const reportText = generateReportText();
      await Share.share({
        message: reportText,
        title: 'LunaFlow Cycle Report',
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  if (!fontsLoaded) return null;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getCycleStatus = (cycleLength?: number): { label: string; color: string; icon: typeof CheckCircle } => {
    if (!cycleLength) return { label: 'First', color: theme.text.tertiary, icon: Calendar };
    if (cycleLength >= 21 && cycleLength <= 35) {
      return { label: 'Normal', color: '#22c55e', icon: CheckCircle };
    }
    return { label: 'Irregular', color: '#f59e0b', icon: AlertTriangle };
  };

  return (
    <View className="flex-1">
      <LinearGradient
        colors={theme.gradient}
        locations={[0, 0.25, 0.5, 0.75, 1]}
        style={{ flex: 1 }}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View
            entering={FadeInDown.delay(100).duration(600)}
            style={{ paddingTop: insets.top + 16 }}
            className="px-6"
          >
            <View className="flex-row items-center justify-between mb-4">
              <Pressable
                onPress={() => router.back()}
                className="w-10 h-10 rounded-full items-center justify-center"
                style={{ backgroundColor: theme.bg.card }}
              >
                <ChevronLeft size={20} color={theme.text.primary} />
              </Pressable>

              <Text
                style={{ fontFamily: 'CormorantGaramond_600SemiBold', color: theme.text.primary }}
                className="text-2xl"
              >
                Cycle History
              </Text>

              <View className="flex-row">
                <Pressable
                  onPress={handleShareReport}
                  className="w-10 h-10 rounded-full items-center justify-center mr-2"
                  style={{ backgroundColor: theme.bg.card }}
                >
                  <Share2 size={18} color={theme.text.primary} />
                </Pressable>
                <Pressable
                  onPress={handleExportReport}
                  className="w-10 h-10 rounded-full items-center justify-center"
                  style={{ backgroundColor: theme.accent.pink }}
                >
                  <Download size={18} color="#fff" />
                </Pressable>
              </View>
            </View>
          </Animated.View>

          {/* Stats Summary */}
          <Animated.View
            entering={FadeInUp.delay(200).duration(600)}
            className="mx-6 mb-4"
          >
            <View
              className="rounded-2xl p-4 border"
              style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light }}
            >
              <View className="flex-row flex-wrap" style={{ gap: 12 }}>
                <View className="flex-1" style={{ minWidth: '45%' }}>
                  <Text style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.tertiary, fontSize: 11 }}>
                    Avg Cycle
                  </Text>
                  <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary, fontSize: 18 }}>
                    {Math.round(stats.averageCycleLength)} days
                  </Text>
                </View>
                <View className="flex-1" style={{ minWidth: '45%' }}>
                  <Text style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.tertiary, fontSize: 11 }}>
                    Avg Period
                  </Text>
                  <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary, fontSize: 18 }}>
                    {Math.round(stats.averagePeriodLength)} days
                  </Text>
                </View>
                <View className="flex-1" style={{ minWidth: '45%' }}>
                  <Text style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.tertiary, fontSize: 11 }}>
                    Variation
                  </Text>
                  <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary, fontSize: 18 }}>
                    {stats.cycleLengthVariation.min}-{stats.cycleLengthVariation.max}d
                  </Text>
                </View>
                <View className="flex-1" style={{ minWidth: '45%' }}>
                  <Text style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.tertiary, fontSize: 11 }}>
                    Cycles Logged
                  </Text>
                  <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary, fontSize: 18 }}>
                    {stats.totalCyclesTracked}
                  </Text>
                </View>
              </View>

              {stats.isIrregular && (
                <View className="flex-row items-center mt-3 pt-3 border-t" style={{ borderTopColor: theme.border.light }}>
                  <AlertTriangle size={14} color="#f59e0b" />
                  <Text style={{ fontFamily: 'Quicksand_400Regular', color: '#f59e0b', fontSize: 12, marginLeft: 6 }}>
                    Irregular cycles detected
                  </Text>
                </View>
              )}
            </View>
          </Animated.View>

          {/* Calendar */}
          <Animated.View
            entering={FadeInUp.delay(300).duration(600)}
            className="mx-6 mb-4"
          >
            <CycleCalendar
              themeMode={themeMode}
              onDayPress={handleDayPress}
              selectedDate={selectedDate}
            />
          </Animated.View>

          {/* Period History List */}
          <Animated.View
            entering={FadeInUp.delay(400).duration(600)}
            className="mx-6"
          >
            <View className="flex-row items-center justify-between mb-3">
              <Text
                style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
                className="text-base"
              >
                Period History
              </Text>
              <Pressable
                onPress={() => {
                  setEditingPeriodId(null);
                  setShowLogModal(true);
                }}
                className="px-3 py-1.5 rounded-full"
                style={{ backgroundColor: `${theme.accent.pink}15` }}
              >
                <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.accent.pink, fontSize: 12 }}>
                  + Log Period
                </Text>
              </Pressable>
            </View>

            {sortedHistory.length === 0 ? (
              <View
                className="rounded-2xl p-6 items-center border"
                style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light }}
              >
                <Calendar size={32} color={theme.text.tertiary} />
                <Text
                  style={{ fontFamily: 'Quicksand_500Medium', color: theme.text.secondary }}
                  className="text-sm mt-3 text-center"
                >
                  No periods logged yet.{'\n'}Tap "Log Period" to start tracking.
                </Text>
              </View>
            ) : (
              sortedHistory.map((period, index) => {
                const cycleStatus = getCycleStatus(period.cycleLength);
                const StatusIcon = cycleStatus.icon;

                return (
                  <View
                    key={period.id}
                    className="rounded-2xl p-4 mb-3 border"
                    style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light }}
                  >
                    <View className="flex-row items-start justify-between">
                      <View className="flex-1">
                        <View className="flex-row items-center mb-2">
                          <View
                            className="w-8 h-8 rounded-full items-center justify-center mr-3"
                            style={{ backgroundColor: `${theme.accent.pink}20` }}
                          >
                            <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.accent.pink, fontSize: 12 }}>
                              {sortedHistory.length - index}
                            </Text>
                          </View>
                          <View>
                            <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary, fontSize: 14 }}>
                              {formatDate(period.startDate)}
                              {period.endDate && ` - ${formatDate(period.endDate)}`}
                            </Text>
                            <Text style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.tertiary, fontSize: 12 }}>
                              {period.periodLength} day period
                            </Text>
                          </View>
                        </View>

                        {period.cycleLength && (
                          <View className="flex-row items-center ml-11">
                            <StatusIcon size={12} color={cycleStatus.color} />
                            <Text style={{ fontFamily: 'Quicksand_500Medium', color: cycleStatus.color, fontSize: 11, marginLeft: 4 }}>
                              {period.cycleLength} day cycle • {cycleStatus.label}
                            </Text>
                          </View>
                        )}

                        {period.notes && (
                          <View className="flex-row items-start ml-11 mt-2">
                            <FileText size={12} color={theme.text.tertiary} style={{ marginTop: 2 }} />
                            <Text style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.secondary, fontSize: 12, marginLeft: 4, flex: 1 }}>
                              {period.notes}
                            </Text>
                          </View>
                        )}
                      </View>

                      <View className="flex-row">
                        <Pressable
                          onPress={() => handleEditPeriod(period.id)}
                          className="w-8 h-8 rounded-full items-center justify-center mr-1"
                          style={{ backgroundColor: `${theme.accent.purple}15` }}
                        >
                          <Edit3 size={14} color={theme.accent.purple} />
                        </Pressable>
                        <Pressable
                          onPress={() => handleDeletePeriod(period.id)}
                          className="w-8 h-8 rounded-full items-center justify-center"
                          style={{ backgroundColor: `${theme.accent.pink}15` }}
                        >
                          <Trash2 size={14} color={theme.accent.pink} />
                        </Pressable>
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </Animated.View>

          {/* Export Info */}
          <Animated.View
            entering={FadeInUp.delay(500).duration(600)}
            className="mx-6 mt-4"
          >
            <View
              className="rounded-2xl p-4 border"
              style={{ backgroundColor: `${theme.accent.purple}10`, borderColor: `${theme.accent.purple}25` }}
            >
              <View className="flex-row items-start">
                <FileText size={16} color={theme.accent.purple} style={{ marginTop: 2 }} />
                <View className="flex-1 ml-3">
                  <Text style={{ fontFamily: 'Quicksand_500Medium', color: theme.text.primary, fontSize: 13 }}>
                    Export for your doctor
                  </Text>
                  <Text style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.secondary, fontSize: 12, marginTop: 2 }}>
                    Tap the download button to generate a detailed report of your cycle history to share with your healthcare provider.
                  </Text>
                </View>
              </View>
            </View>
          </Animated.View>

          {/* PCOS/Irregular Cycles Note */}
          {stats.isIrregular && (
            <Animated.View
              entering={FadeInUp.delay(600).duration(600)}
              className="mx-6 mt-4"
            >
              <View
                className="rounded-2xl p-4 border"
                style={{ backgroundColor: `${theme.accent.pink}10`, borderColor: `${theme.accent.pink}25` }}
              >
                <View className="flex-row items-start">
                  <AlertTriangle size={16} color={theme.accent.pink} style={{ marginTop: 2 }} />
                  <View className="flex-1 ml-3">
                    <Text style={{ fontFamily: 'Quicksand_500Medium', color: theme.text.primary, fontSize: 13 }}>
                      About irregular cycles
                    </Text>
                    <Text style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.secondary, fontSize: 12, marginTop: 2, lineHeight: 18 }}>
                      Irregular cycles may relate to conditions like PCOS, stress, thyroid issues, or hormonal changes. Track your symptoms consistently—predictions will improve with more data. This is not a diagnostic tool; please consult a healthcare provider for personalized guidance.
                    </Text>
                  </View>
                </View>
              </View>
            </Animated.View>
          )}
        </ScrollView>
      </LinearGradient>

      {/* Log Period Modal */}
      <LogPeriodModal
        visible={showLogModal}
        onClose={() => {
          setShowLogModal(false);
          setEditingPeriodId(null);
          setSelectedDate(null);
        }}
        themeMode={themeMode}
        initialDate={selectedDate || undefined}
        editingPeriodId={editingPeriodId || undefined}
      />
    </View>
  );
}

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, Switch, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { ArrowLeft, Bell, Calendar, Sparkles, Moon, Clock, ChevronRight, BellOff } from 'lucide-react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useThemeStore, getTheme } from '@/lib/theme-store';
import { useCycleStore, phaseInfo } from '@/lib/cycle-store';
import {
  NotificationSettings,
  defaultNotificationSettings,
  getNotificationSettings,
  saveNotificationSettings,
  requestNotificationPermissions,
  scheduleAllNotifications,
  cancelAllNotifications,
  sendTestNotification,
} from '@/lib/notifications';
import {
  useFonts,
  Quicksand_400Regular,
  Quicksand_500Medium,
  Quicksand_600SemiBold,
} from '@expo-google-fonts/quicksand';
import {
  CormorantGaramond_400Regular,
  CormorantGaramond_600SemiBold,
} from '@expo-google-fonts/cormorant-garamond';

const TIME_OPTIONS = [
  { label: '6:00 AM', value: '06:00' },
  { label: '7:00 AM', value: '07:00' },
  { label: '8:00 AM', value: '08:00' },
  { label: '9:00 AM', value: '09:00' },
  { label: '10:00 AM', value: '10:00' },
  { label: '12:00 PM', value: '12:00' },
  { label: '6:00 PM', value: '18:00' },
  { label: '8:00 PM', value: '20:00' },
];

const REMINDER_DAYS_OPTIONS = [
  { label: '1 day before', value: 1 },
  { label: '2 days before', value: 2 },
  { label: '3 days before', value: 3 },
  { label: '5 days before', value: 5 },
  { label: '1 week before', value: 7 },
];

export default function NotificationSettingsScreen() {
  const insets = useSafeAreaInsets();
  const themeMode = useThemeStore((s) => s.mode);
  const theme = getTheme(themeMode);
  const lifeStage = useCycleStore((s) => s.lifeStage);
  const getDaysUntilNextPeriod = useCycleStore((s) => s.getDaysUntilNextPeriod);
  const getCurrentPhase = useCycleStore((s) => s.getCurrentPhase);

  const [settings, setSettings] = useState<NotificationSettings>(defaultNotificationSettings);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showDaysPicker, setShowDaysPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [fontsLoaded] = useFonts({
    Quicksand_400Regular,
    Quicksand_500Medium,
    Quicksand_600SemiBold,
    CormorantGaramond_400Regular,
    CormorantGaramond_600SemiBold,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    const stored = await getNotificationSettings();
    setSettings(stored);

    // Check permission status
    const hasPermission = await requestNotificationPermissions();
    setPermissionGranted(hasPermission);
    setIsLoading(false);
  };

  const updateSetting = async <K extends keyof NotificationSettings>(
    key: K,
    value: NotificationSettings[K]
  ) => {
    Haptics.selectionAsync();
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    await saveNotificationSettings(newSettings);

    // Reschedule notifications with new settings
    if (newSettings.enabled && permissionGranted) {
      const currentPhase = getCurrentPhase();
      const currentPhaseInfo = phaseInfo[currentPhase];
      const phases = ['menstrual', 'follicular', 'ovulatory', 'luteal'];
      const currentIndex = phases.indexOf(currentPhase);
      const nextPhase = phases[(currentIndex + 1) % 4] as keyof typeof phaseInfo;
      const nextPhaseInfo = phaseInfo[nextPhase];

      await scheduleAllNotifications(newSettings, {
        daysUntilPeriod: getDaysUntilNextPeriod(),
        currentPhase,
        phaseEmoji: currentPhaseInfo.emoji,
        daysUntilNextPhase: Math.ceil((28 - getDaysUntilNextPeriod()) / 4), // Approximate
        nextPhaseName: nextPhaseInfo.name,
        nextPhaseEmoji: nextPhaseInfo.emoji,
      });
    } else if (!newSettings.enabled) {
      await cancelAllNotifications();
    }
  };

  const handleTestNotification = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!permissionGranted) {
      Alert.alert(
        'Notifications Disabled',
        'Please enable notifications in your device settings to receive reminders.',
        [{ text: 'OK' }]
      );
      return;
    }
    await sendTestNotification();
    Alert.alert('Test Sent', 'You should receive a test notification in a moment.');
  };

  const handleEnableNotifications = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const granted = await requestNotificationPermissions();
    setPermissionGranted(granted);

    if (granted) {
      await updateSetting('enabled', true);
    } else {
      Alert.alert(
        'Permission Required',
        'Please enable notifications in your device settings to receive reminders.',
        [{ text: 'OK' }]
      );
    }
  };

  const getTimeLabel = (value: string) => {
    return TIME_OPTIONS.find((t) => t.value === value)?.label || value;
  };

  const getDaysLabel = (value: number) => {
    return REMINDER_DAYS_OPTIONS.find((d) => d.value === value)?.label || `${value} days before`;
  };

  if (!fontsLoaded || isLoading) return null;

  return (
    <View className="flex-1">
      <LinearGradient colors={theme.gradient} locations={[0, 0.25, 0.5, 0.75, 1]} style={{ flex: 1 }}>
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View
            entering={FadeInDown.duration(400)}
            style={{ paddingTop: insets.top + 8 }}
            className="px-6 pb-6"
          >
            <View className="flex-row items-center mb-4">
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.back();
                }}
                className="w-10 h-10 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: theme.bg.card }}
              >
                <ArrowLeft size={20} color={theme.text.primary} />
              </Pressable>
              <View className="flex-1">
                <Text
                  style={{ fontFamily: 'CormorantGaramond_400Regular', color: theme.text.muted }}
                  className="text-sm tracking-widest uppercase"
                >
                  Settings
                </Text>
                <Text
                  style={{ fontFamily: 'CormorantGaramond_600SemiBold', color: theme.text.primary }}
                  className="text-2xl"
                >
                  Notifications
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* Permission Banner */}
          {!permissionGranted && (
            <Animated.View entering={FadeInUp.delay(100).duration(400)} className="px-6 mb-4">
              <Pressable
                onPress={handleEnableNotifications}
                className="p-4 rounded-2xl flex-row items-center"
                style={{ backgroundColor: `${theme.accent.purple}15`, borderWidth: 1, borderColor: `${theme.accent.purple}30` }}
              >
                <View
                  className="w-12 h-12 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: `${theme.accent.purple}20` }}
                >
                  <BellOff size={22} color={theme.accent.purple} />
                </View>
                <View className="flex-1">
                  <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }} className="text-sm">
                    Enable Notifications
                  </Text>
                  <Text style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.muted }} className="text-xs">
                    Tap to allow Luna Flow to send you reminders
                  </Text>
                </View>
                <ChevronRight size={18} color={theme.accent.purple} />
              </Pressable>
            </Animated.View>
          )}

          {/* Master Toggle */}
          <Animated.View entering={FadeInUp.delay(150).duration(400)} className="px-6 mb-6">
            <View
              className="p-4 rounded-2xl flex-row items-center justify-between"
              style={{ backgroundColor: theme.bg.card, borderWidth: 1, borderColor: theme.border.light }}
            >
              <View className="flex-row items-center flex-1">
                <View
                  className="w-10 h-10 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: settings.enabled ? `${theme.accent.purple}20` : `${theme.text.muted}20` }}
                >
                  <Bell size={18} color={settings.enabled ? theme.accent.purple : theme.text.muted} />
                </View>
                <View className="flex-1">
                  <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }} className="text-base">
                    All Notifications
                  </Text>
                  <Text style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.muted }} className="text-xs">
                    {settings.enabled ? 'Notifications are enabled' : 'All notifications are off'}
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.enabled}
                onValueChange={(value) => updateSetting('enabled', value)}
                trackColor={{ false: theme.border.light, true: `${theme.accent.purple}50` }}
                thumbColor={settings.enabled ? theme.accent.purple : theme.text.muted}
              />
            </View>
          </Animated.View>

          {settings.enabled && (
            <>
              {/* Period Reminders */}
              <Animated.View entering={FadeInUp.delay(200).duration(400)} className="px-6 mb-4">
                <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.muted }} className="text-xs mb-3 uppercase tracking-wide">
                  Period Reminders
                </Text>
                <View
                  className="rounded-2xl overflow-hidden"
                  style={{ backgroundColor: theme.bg.card, borderWidth: 1, borderColor: theme.border.light }}
                >
                  <View className="p-4 flex-row items-center justify-between border-b" style={{ borderColor: theme.border.light }}>
                    <View className="flex-row items-center flex-1">
                      <View
                        className="w-10 h-10 rounded-full items-center justify-center mr-3"
                        style={{ backgroundColor: `${theme.accent.pink}20` }}
                      >
                        <Calendar size={18} color={theme.accent.pink} />
                      </View>
                      <View className="flex-1">
                        <Text style={{ fontFamily: 'Quicksand_500Medium', color: theme.text.primary }} className="text-sm">
                          Period Reminders
                        </Text>
                        <Text style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.muted }} className="text-xs">
                          Get notified before your period starts
                        </Text>
                      </View>
                    </View>
                    <Switch
                      value={settings.periodReminders}
                      onValueChange={(value) => updateSetting('periodReminders', value)}
                      trackColor={{ false: theme.border.light, true: `${theme.accent.pink}50` }}
                      thumbColor={settings.periodReminders ? theme.accent.pink : theme.text.muted}
                    />
                  </View>

                  {settings.periodReminders && (
                    <Pressable
                      onPress={() => setShowDaysPicker(!showDaysPicker)}
                      className="p-4 flex-row items-center justify-between"
                    >
                      <Text style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.secondary }} className="text-sm">
                        Remind me
                      </Text>
                      <View className="flex-row items-center">
                        <Text style={{ fontFamily: 'Quicksand_500Medium', color: theme.accent.pink }} className="text-sm">
                          {getDaysLabel(settings.periodReminderDays)}
                        </Text>
                        <ChevronRight size={16} color={theme.text.muted} style={{ marginLeft: 4 }} />
                      </View>
                    </Pressable>
                  )}

                  {showDaysPicker && settings.periodReminders && (
                    <View className="px-4 pb-4">
                      {REMINDER_DAYS_OPTIONS.map((option) => (
                        <Pressable
                          key={option.value}
                          onPress={() => {
                            updateSetting('periodReminderDays', option.value);
                            setShowDaysPicker(false);
                          }}
                          className="py-2 px-3 rounded-lg mb-1"
                          style={{
                            backgroundColor: settings.periodReminderDays === option.value ? `${theme.accent.pink}15` : 'transparent',
                          }}
                        >
                          <Text
                            style={{
                              fontFamily: 'Quicksand_500Medium',
                              color: settings.periodReminderDays === option.value ? theme.accent.pink : theme.text.secondary,
                            }}
                            className="text-sm"
                          >
                            {option.label}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  )}
                </View>
              </Animated.View>

              {/* Daily Wellness Check-in */}
              <Animated.View entering={FadeInUp.delay(250).duration(400)} className="px-6 mb-4">
                <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.muted }} className="text-xs mb-3 uppercase tracking-wide">
                  Daily Wellness
                </Text>
                <View
                  className="rounded-2xl overflow-hidden"
                  style={{ backgroundColor: theme.bg.card, borderWidth: 1, borderColor: theme.border.light }}
                >
                  <View className="p-4 flex-row items-center justify-between border-b" style={{ borderColor: theme.border.light }}>
                    <View className="flex-row items-center flex-1">
                      <View
                        className="w-10 h-10 rounded-full items-center justify-center mr-3"
                        style={{ backgroundColor: `${theme.accent.purple}20` }}
                      >
                        <Sparkles size={18} color={theme.accent.purple} />
                      </View>
                      <View className="flex-1">
                        <Text style={{ fontFamily: 'Quicksand_500Medium', color: theme.text.primary }} className="text-sm">
                          Daily Check-In
                        </Text>
                        <Text style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.muted }} className="text-xs">
                          Gentle reminder to track how you feel
                        </Text>
                      </View>
                    </View>
                    <Switch
                      value={settings.dailyWellnessCheckIn}
                      onValueChange={(value) => updateSetting('dailyWellnessCheckIn', value)}
                      trackColor={{ false: theme.border.light, true: `${theme.accent.purple}50` }}
                      thumbColor={settings.dailyWellnessCheckIn ? theme.accent.purple : theme.text.muted}
                    />
                  </View>

                  {settings.dailyWellnessCheckIn && (
                    <Pressable
                      onPress={() => setShowTimePicker(!showTimePicker)}
                      className="p-4 flex-row items-center justify-between"
                    >
                      <View className="flex-row items-center">
                        <Clock size={16} color={theme.text.muted} style={{ marginRight: 8 }} />
                        <Text style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.secondary }} className="text-sm">
                          Reminder time
                        </Text>
                      </View>
                      <View className="flex-row items-center">
                        <Text style={{ fontFamily: 'Quicksand_500Medium', color: theme.accent.purple }} className="text-sm">
                          {getTimeLabel(settings.dailyCheckInTime)}
                        </Text>
                        <ChevronRight size={16} color={theme.text.muted} style={{ marginLeft: 4 }} />
                      </View>
                    </Pressable>
                  )}

                  {showTimePicker && settings.dailyWellnessCheckIn && (
                    <View className="px-4 pb-4">
                      <View className="flex-row flex-wrap" style={{ gap: 8 }}>
                        {TIME_OPTIONS.map((option) => (
                          <Pressable
                            key={option.value}
                            onPress={() => {
                              updateSetting('dailyCheckInTime', option.value);
                              setShowTimePicker(false);
                            }}
                            className="py-2 px-3 rounded-lg"
                            style={{
                              backgroundColor: settings.dailyCheckInTime === option.value ? `${theme.accent.purple}15` : theme.bg.primary,
                              borderWidth: 1,
                              borderColor: settings.dailyCheckInTime === option.value ? theme.accent.purple : theme.border.light,
                            }}
                          >
                            <Text
                              style={{
                                fontFamily: 'Quicksand_500Medium',
                                color: settings.dailyCheckInTime === option.value ? theme.accent.purple : theme.text.secondary,
                              }}
                              className="text-sm"
                            >
                              {option.label}
                            </Text>
                          </Pressable>
                        ))}
                      </View>
                    </View>
                  )}
                </View>
              </Animated.View>

              {/* Phase Change Alerts */}
              <Animated.View entering={FadeInUp.delay(300).duration(400)} className="px-6 mb-6">
                <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.muted }} className="text-xs mb-3 uppercase tracking-wide">
                  Cycle Phases
                </Text>
                <View
                  className="rounded-2xl p-4 flex-row items-center justify-between"
                  style={{ backgroundColor: theme.bg.card, borderWidth: 1, borderColor: theme.border.light }}
                >
                  <View className="flex-row items-center flex-1">
                    <View
                      className="w-10 h-10 rounded-full items-center justify-center mr-3"
                      style={{ backgroundColor: `${theme.accent.lavender}20` }}
                    >
                      <Moon size={18} color={theme.accent.lavender} />
                    </View>
                    <View className="flex-1">
                      <Text style={{ fontFamily: 'Quicksand_500Medium', color: theme.text.primary }} className="text-sm">
                        Phase Change Alerts
                      </Text>
                      <Text style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.muted }} className="text-xs">
                        Know when you're entering a new phase
                      </Text>
                    </View>
                  </View>
                  <Switch
                    value={settings.phaseChangeAlerts}
                    onValueChange={(value) => updateSetting('phaseChangeAlerts', value)}
                    trackColor={{ false: theme.border.light, true: `${theme.accent.lavender}50` }}
                    thumbColor={settings.phaseChangeAlerts ? theme.accent.lavender : theme.text.muted}
                  />
                </View>
              </Animated.View>

              {/* Test Notification */}
              <Animated.View entering={FadeInUp.delay(350).duration(400)} className="px-6">
                <Pressable
                  onPress={handleTestNotification}
                  className="p-4 rounded-2xl items-center"
                  style={{ backgroundColor: theme.bg.card, borderWidth: 1, borderColor: theme.border.light }}
                >
                  <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.accent.purple }} className="text-sm">
                    Send Test Notification
                  </Text>
                </Pressable>
              </Animated.View>
            </>
          )}
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

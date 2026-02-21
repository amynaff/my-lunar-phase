import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure how notifications are handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Storage keys
const NOTIFICATION_SETTINGS_KEY = '@luna_notification_settings';

export interface NotificationSettings {
  enabled: boolean;
  periodReminders: boolean;
  periodReminderDays: number; // days before period to remind
  dailyWellnessCheckIn: boolean;
  dailyCheckInTime: string; // HH:MM format
  phaseChangeAlerts: boolean;
}

export const defaultNotificationSettings: NotificationSettings = {
  enabled: true,
  periodReminders: true,
  periodReminderDays: 2,
  dailyWellnessCheckIn: true,
  dailyCheckInTime: '09:00',
  phaseChangeAlerts: true,
};

// Request notification permissions
export async function requestNotificationPermissions(): Promise<boolean> {
  if (!Device.isDevice) {
    console.log('Must use physical device for Push Notifications');
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Failed to get push token for push notification!');
    return false;
  }

  // Set up Android notification channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'My Lunar Phase',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#c4b5fd',
    });

    await Notifications.setNotificationChannelAsync('period-reminders', {
      name: 'Period Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#f9a8d4',
    });

    await Notifications.setNotificationChannelAsync('wellness-checkin', {
      name: 'Daily Wellness',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250],
      lightColor: '#c4b5fd',
    });

    await Notifications.setNotificationChannelAsync('phase-alerts', {
      name: 'Phase Change Alerts',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250],
      lightColor: '#8b5cf6',
    });
  }

  return true;
}

// Get stored notification settings
export async function getNotificationSettings(): Promise<NotificationSettings> {
  try {
    const stored = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
    if (stored) {
      return { ...defaultNotificationSettings, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error('Error loading notification settings:', error);
  }
  return defaultNotificationSettings;
}

// Save notification settings
export async function saveNotificationSettings(settings: NotificationSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving notification settings:', error);
  }
}

// Cancel all scheduled notifications
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

// Cancel notifications by identifier prefix
export async function cancelNotificationsByPrefix(prefix: string): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const notification of scheduled) {
    if (notification.identifier.startsWith(prefix)) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }
  }
}

// Schedule period reminder notification
export async function schedulePeriodReminder(
  daysUntilPeriod: number,
  reminderDaysBefore: number
): Promise<void> {
  // Cancel existing period reminders
  await cancelNotificationsByPrefix('period-reminder');

  if (daysUntilPeriod <= 0) return;

  const daysUntilReminder = daysUntilPeriod - reminderDaysBefore;

  if (daysUntilReminder <= 0) {
    // Period is coming very soon, send reminder now or tomorrow morning
    const trigger: Notifications.NotificationTriggerInput = daysUntilPeriod === 1
      ? { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 1 }
      : {
          type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
          hour: 9,
          minute: 0,
          repeats: false,
        };

    await Notifications.scheduleNotificationAsync({
      identifier: `period-reminder-${Date.now()}`,
      content: {
        title: '🌙 Period Coming Soon',
        body: daysUntilPeriod === 1
          ? "Your period is expected tomorrow. Take it easy and prepare for rest."
          : `Your period is expected in ${daysUntilPeriod} days. Time to prepare!`,
        data: { type: 'period-reminder', daysUntil: daysUntilPeriod },
        sound: true,
      },
      trigger,
    });
  } else {
    // Schedule for the future
    const secondsUntilReminder = daysUntilReminder * 24 * 60 * 60;

    await Notifications.scheduleNotificationAsync({
      identifier: `period-reminder-${Date.now()}`,
      content: {
        title: '🌙 Period Reminder',
        body: `Your period is expected in ${reminderDaysBefore} days. Time to prepare and be gentle with yourself.`,
        data: { type: 'period-reminder', daysUntil: reminderDaysBefore },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: secondsUntilReminder,
      },
    });
  }
}

// Schedule daily wellness check-in
export async function scheduleDailyWellnessCheckIn(timeString: string): Promise<void> {
  // Cancel existing wellness check-ins
  await cancelNotificationsByPrefix('wellness-checkin');

  const [hours, minutes] = timeString.split(':').map(Number);

  const messages = [
    { title: '✨ Good Morning', body: 'How are you feeling today? Take a moment to check in with your body.' },
    { title: '🌸 Wellness Check-In', body: 'Your body has wisdom. What is it telling you today?' },
    { title: '💜 Daily Reflection', body: 'Pause and notice how you feel. Your wellbeing matters.' },
    { title: '🌙 Luna Check-In', body: "Let's sync with your cycle. How is your energy today?" },
    { title: '🦋 Mindful Moment', body: 'Take a breath. How are you feeling physically and emotionally?' },
  ];

  // Pick a random message for variety
  const message = messages[Math.floor(Math.random() * messages.length)];

  await Notifications.scheduleNotificationAsync({
    identifier: `wellness-checkin-daily`,
    content: {
      title: message.title,
      body: message.body,
      data: { type: 'wellness-checkin' },
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
      hour: hours,
      minute: minutes,
      repeats: true,
    },
  });
}

// Schedule phase change alert
export async function schedulePhaseChangeAlert(
  phaseName: string,
  phaseEmoji: string,
  daysUntilChange: number
): Promise<void> {
  // Cancel existing phase alerts
  await cancelNotificationsByPrefix('phase-change');

  if (daysUntilChange <= 0) return;

  const secondsUntilChange = daysUntilChange * 24 * 60 * 60;

  const phaseMessages: Record<string, string> = {
    menstrual: 'Time to rest and restore. Honor your body with gentle movement and nourishing foods.',
    follicular: 'Rising energy ahead! Great time for new projects and fresh starts.',
    ovulatory: 'Peak energy phase! Your communication and creativity are at their highest.',
    luteal: 'Winding down phase. Focus on completion and self-care.',
  };

  const body = phaseMessages[phaseName.toLowerCase()] || `New phase beginning. Adjust your wellness routine accordingly.`;

  await Notifications.scheduleNotificationAsync({
    identifier: `phase-change-${Date.now()}`,
    content: {
      title: `${phaseEmoji} ${phaseName} Phase Starting`,
      body,
      data: { type: 'phase-change', phase: phaseName },
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: secondsUntilChange,
    },
  });
}

// Schedule all notifications based on cycle data
export async function scheduleAllNotifications(
  settings: NotificationSettings,
  cycleData: {
    daysUntilPeriod: number;
    currentPhase: string;
    phaseEmoji: string;
    daysUntilNextPhase: number;
    nextPhaseName: string;
    nextPhaseEmoji: string;
  }
): Promise<void> {
  if (!settings.enabled) {
    await cancelAllNotifications();
    return;
  }

  // Period reminders
  if (settings.periodReminders && cycleData.daysUntilPeriod > 0) {
    await schedulePeriodReminder(cycleData.daysUntilPeriod, settings.periodReminderDays);
  }

  // Daily wellness check-in
  if (settings.dailyWellnessCheckIn) {
    await scheduleDailyWellnessCheckIn(settings.dailyCheckInTime);
  }

  // Phase change alerts
  if (settings.phaseChangeAlerts && cycleData.daysUntilNextPhase > 0) {
    await schedulePhaseChangeAlert(
      cycleData.nextPhaseName,
      cycleData.nextPhaseEmoji,
      cycleData.daysUntilNextPhase
    );
  }
}

// Get all scheduled notifications (for debugging)
export async function getScheduledNotifications() {
  return await Notifications.getAllScheduledNotificationsAsync();
}

// Send immediate test notification
export async function sendTestNotification(): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    identifier: `test-${Date.now()}`,
    content: {
      title: '🌙 My Lunar Phase',
      body: 'Notifications are working! You will receive reminders based on your settings.',
      data: { type: 'test' },
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 1,
    },
  });
}

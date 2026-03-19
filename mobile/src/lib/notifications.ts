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
  fertileWindowAlerts: boolean;
  ovulationAlerts: boolean;
  dailyWellnessCheckIn: boolean;
  dailyCheckInTime: string; // HH:MM format
  phaseChangeAlerts: boolean;
  wellnessTips: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string; // HH:MM
  quietHoursEnd: string; // HH:MM
}

export const defaultNotificationSettings: NotificationSettings = {
  enabled: true,
  periodReminders: true,
  periodReminderDays: 2,
  fertileWindowAlerts: true,
  ovulationAlerts: true,
  dailyWellnessCheckIn: true,
  dailyCheckInTime: '09:00',
  phaseChangeAlerts: true,
  wellnessTips: true,
  quietHoursEnabled: true,
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00',
};

// Phase-specific wellness tips
const wellnessTipsByPhase: Record<string, string[]> = {
  menstrual: [
    "Rest is productive. Honor your body's need for gentle movement today.",
    "Iron-rich foods like spinach and lentils support your energy during menstruation.",
    "A warm bath with magnesium salts can help ease cramps naturally.",
    "This is your inner winter - journaling and reflection are powerful now.",
    "Gentle yoga or stretching can help relieve tension without depleting energy.",
  ],
  follicular: [
    "Your energy is rising! Perfect time to start that new project or workout routine.",
    "High-protein meals fuel your increasing energy and focus.",
    "This is your creative peak - brainstorm and plan ahead.",
    "Try a new workout class or activity - your body craves novelty now.",
    "Social connections flourish in this phase - reach out to a friend!",
  ],
  ovulatory: [
    "You're in your power phase! Communication skills peak now.",
    "High-intensity workouts feel amazing during ovulation.",
    "Stay hydrated - your body temperature rises slightly during this phase.",
    "Perfect time for important conversations or presentations.",
    "Light, fresh meals with lots of veggies support your vibrant energy.",
  ],
  luteal: [
    "Nesting instincts kick in - organize your space for calm.",
    "Complex carbs help maintain serotonin levels as progesterone rises.",
    "Strength training is ideal now - your muscles recover well.",
    "Prioritize tasks and delegate if possible - focus is key.",
    "Magnesium-rich foods like dark chocolate can ease PMS symptoms.",
  ],
};

// Menopause wellness tips
const menopauseWellnessTips = [
  "Strength training helps maintain bone density - aim for 2-3 sessions weekly.",
  "Cooling breathwork can help manage hot flashes naturally.",
  "Phytoestrogen-rich foods like flaxseed support hormonal balance.",
  "Quality sleep is foundational - create a cool, dark sleep environment.",
  "Heart-healthy omega-3s from salmon support brain and cardiovascular health.",
];

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

  // Set up Android notification channels
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

    await Notifications.setNotificationChannelAsync('fertility-alerts', {
      name: 'Fertility Alerts',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#c4b5fd',
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

// Check if time is within quiet hours
function isWithinQuietHours(hour: number, minute: number, settings: NotificationSettings): boolean {
  if (!settings.quietHoursEnabled) return false;

  const [startHour, startMin] = settings.quietHoursStart.split(':').map(Number);
  const [endHour, endMin] = settings.quietHoursEnd.split(':').map(Number);

  const currentMinutes = hour * 60 + minute;
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  // Handle overnight quiet hours (e.g., 22:00 to 08:00)
  if (startMinutes > endMinutes) {
    return currentMinutes >= startMinutes || currentMinutes < endMinutes;
  }
  return currentMinutes >= startMinutes && currentMinutes < endMinutes;
}

// Get notification time respecting quiet hours
function getNotificationHour(preferredHour: number, settings: NotificationSettings): number {
  if (!settings.quietHoursEnabled) return preferredHour;

  const [endHour] = settings.quietHoursEnd.split(':').map(Number);

  if (isWithinQuietHours(preferredHour, 0, settings)) {
    return endHour; // Schedule for end of quiet hours
  }
  return preferredHour;
}

// Schedule period reminder notification
export async function schedulePeriodReminder(
  daysUntilPeriod: number,
  settings: NotificationSettings
): Promise<void> {
  await cancelNotificationsByPrefix('period-reminder');

  if (!settings.periodReminders || daysUntilPeriod <= 0) return;

  const daysUntilReminder = daysUntilPeriod - settings.periodReminderDays;
  const notificationHour = getNotificationHour(9, settings);

  if (daysUntilReminder <= 0) {
    // Period is coming very soon
    const trigger: Notifications.NotificationTriggerInput = daysUntilPeriod === 1
      ? { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 1 }
      : {
          type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
          hour: notificationHour,
          minute: 0,
          repeats: false,
        };

    await Notifications.scheduleNotificationAsync({
      identifier: `period-reminder-${Date.now()}`,
      content: {
        title: '🌸 Period Coming Soon',
        body: daysUntilPeriod === 1
          ? "Your period is expected tomorrow. Take it easy and prepare for rest."
          : `Your period is expected in ${daysUntilPeriod} days. Time to prepare!`,
        data: { type: 'period-reminder', daysUntil: daysUntilPeriod },
        sound: true,
      },
      trigger,
    });
  } else {
    const secondsUntilReminder = daysUntilReminder * 24 * 60 * 60;

    await Notifications.scheduleNotificationAsync({
      identifier: `period-reminder-${Date.now()}`,
      content: {
        title: '🌸 Period Reminder',
        body: `Your period is expected in ${settings.periodReminderDays} days. Time to prepare and be gentle with yourself.`,
        data: { type: 'period-reminder', daysUntil: settings.periodReminderDays },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: secondsUntilReminder,
      },
    });
  }
}

// Schedule fertile window alert
export async function scheduleFertileWindowAlert(
  daysUntilOvulation: number,
  settings: NotificationSettings
): Promise<void> {
  await cancelNotificationsByPrefix('fertile-window');

  if (!settings.fertileWindowAlerts || daysUntilOvulation <= 0) return;

  // Fertile window starts ~5 days before ovulation
  const daysUntilFertileWindow = Math.max(0, daysUntilOvulation - 5);
  const notificationHour = getNotificationHour(9, settings);

  if (daysUntilFertileWindow <= 1) {
    // Fertile window starting soon or already started
    await Notifications.scheduleNotificationAsync({
      identifier: `fertile-window-${Date.now()}`,
      content: {
        title: '💜 Fertile Window Starting',
        body: 'Your fertile window is beginning. Your body is preparing for ovulation - you may notice increased energy and libido.',
        data: { type: 'fertile-window' },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        hour: notificationHour,
        minute: 0,
        repeats: false,
      },
    });
  } else {
    const secondsUntilAlert = daysUntilFertileWindow * 24 * 60 * 60;

    await Notifications.scheduleNotificationAsync({
      identifier: `fertile-window-${Date.now()}`,
      content: {
        title: '💜 Fertile Window Starting',
        body: 'Your fertile window is beginning. Your body is preparing for ovulation.',
        data: { type: 'fertile-window' },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: secondsUntilAlert,
      },
    });
  }
}

// Schedule ovulation day alert
export async function scheduleOvulationAlert(
  daysUntilOvulation: number,
  settings: NotificationSettings
): Promise<void> {
  await cancelNotificationsByPrefix('ovulation');

  if (!settings.ovulationAlerts || daysUntilOvulation <= 0) return;

  const notificationHour = getNotificationHour(9, settings);

  if (daysUntilOvulation === 1) {
    await Notifications.scheduleNotificationAsync({
      identifier: `ovulation-${Date.now()}`,
      content: {
        title: '✨ Ovulation Day Tomorrow',
        body: 'Tomorrow is your estimated ovulation day - your energy and confidence will be at their peak!',
        data: { type: 'ovulation' },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        hour: notificationHour,
        minute: 0,
        repeats: false,
      },
    });
  } else {
    const secondsUntilOvulation = (daysUntilOvulation - 1) * 24 * 60 * 60;

    await Notifications.scheduleNotificationAsync({
      identifier: `ovulation-${Date.now()}`,
      content: {
        title: '✨ Ovulation Day Tomorrow',
        body: 'Tomorrow is your estimated ovulation day - your energy and confidence will be at their peak!',
        data: { type: 'ovulation' },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: secondsUntilOvulation,
      },
    });
  }
}

// Schedule daily wellness check-in
export async function scheduleDailyWellnessCheckIn(settings: NotificationSettings): Promise<void> {
  await cancelNotificationsByPrefix('wellness-checkin');

  if (!settings.dailyWellnessCheckIn) return;

  const [hours, minutes] = settings.dailyCheckInTime.split(':').map(Number);
  const finalHour = getNotificationHour(hours, settings);

  const messages = [
    { title: '✨ Good Morning', body: 'How are you feeling today? Take a moment to check in with your body.' },
    { title: '🌸 Wellness Check-In', body: 'Your body has wisdom. What is it telling you today?' },
    { title: '💜 Daily Reflection', body: 'Pause and notice how you feel. Your wellbeing matters.' },
    { title: '🌙 Luna Check-In', body: "Let's sync with your cycle. How is your energy today?" },
    { title: '🦋 Mindful Moment', body: 'Take a breath. How are you feeling physically and emotionally?' },
  ];

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
      hour: finalHour,
      minute: minutes,
      repeats: true,
    },
  });
}

// Schedule phase change alert
export async function schedulePhaseChangeAlert(
  phaseName: string,
  phaseEmoji: string,
  daysUntilChange: number,
  settings: NotificationSettings
): Promise<void> {
  await cancelNotificationsByPrefix('phase-change');

  if (!settings.phaseChangeAlerts || daysUntilChange <= 0) return;

  const notificationHour = getNotificationHour(8, settings);

  const phaseMessages: Record<string, string> = {
    menstrual: 'Time to rest and restore. Honor your body with gentle movement and nourishing foods.',
    follicular: 'Rising energy ahead! Great time for new projects and fresh starts.',
    ovulatory: 'Peak energy phase! Your communication and creativity are at their highest.',
    luteal: 'Winding down phase. Focus on completion and self-care.',
  };

  const body = phaseMessages[phaseName.toLowerCase()] || 'New phase beginning. Adjust your wellness routine accordingly.';

  if (daysUntilChange === 1) {
    await Notifications.scheduleNotificationAsync({
      identifier: `phase-change-${Date.now()}`,
      content: {
        title: `${phaseEmoji} ${phaseName} Phase Starting`,
        body,
        data: { type: 'phase-change', phase: phaseName },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        hour: notificationHour,
        minute: 0,
        repeats: false,
      },
    });
  } else {
    const secondsUntilChange = (daysUntilChange - 1) * 24 * 60 * 60;

    await Notifications.scheduleNotificationAsync({
      identifier: `phase-change-${Date.now()}`,
      content: {
        title: `${phaseEmoji} ${phaseName} Phase Starting Tomorrow`,
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
}

// Schedule daily wellness tip based on current phase
export async function scheduleWellnessTip(
  currentPhase: string,
  settings: NotificationSettings
): Promise<void> {
  await cancelNotificationsByPrefix('wellness-tip');

  if (!settings.wellnessTips) return;

  const notificationHour = getNotificationHour(10, settings);

  // Get phase-specific tips
  const tips = wellnessTipsByPhase[currentPhase.toLowerCase()] || wellnessTipsByPhase.follicular;
  const tip = tips[Math.floor(Math.random() * tips.length)];

  const phaseEmojis: Record<string, string> = {
    menstrual: '🌙',
    follicular: '🌱',
    ovulatory: '✨',
    luteal: '🍂',
  };

  const emoji = phaseEmojis[currentPhase.toLowerCase()] || '💜';

  // Schedule for tomorrow
  await Notifications.scheduleNotificationAsync({
    identifier: `wellness-tip-${Date.now()}`,
    content: {
      title: `${emoji} ${currentPhase} Wellness Tip`,
      body: tip,
      data: { type: 'wellness-tip', phase: currentPhase },
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
      hour: notificationHour,
      minute: 0,
      repeats: false,
    },
  });
}

// Schedule menopause-specific wellness tip
export async function scheduleMenopauseWellnessTip(settings: NotificationSettings): Promise<void> {
  await cancelNotificationsByPrefix('wellness-tip');

  if (!settings.wellnessTips) return;

  const notificationHour = getNotificationHour(10, settings);
  const tip = menopauseWellnessTips[Math.floor(Math.random() * menopauseWellnessTips.length)];

  await Notifications.scheduleNotificationAsync({
    identifier: `wellness-tip-${Date.now()}`,
    content: {
      title: '☀️ Wellness Tip',
      body: tip,
      data: { type: 'wellness-tip', phase: 'menopause' },
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
      hour: notificationHour,
      minute: 0,
      repeats: false,
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
    daysUntilOvulation?: number;
    lifeStage?: string;
  }
): Promise<void> {
  if (!settings.enabled) {
    await cancelAllNotifications();
    return;
  }

  const isNonCycling = cycleData.lifeStage === 'menopause' || cycleData.lifeStage === 'postmenopause';

  if (isNonCycling) {
    // For menopause users, only schedule wellness tips and daily check-in
    if (settings.dailyWellnessCheckIn) {
      await scheduleDailyWellnessCheckIn(settings);
    }
    if (settings.wellnessTips) {
      await scheduleMenopauseWellnessTip(settings);
    }
    return;
  }

  // Period reminders
  if (settings.periodReminders && cycleData.daysUntilPeriod > 0) {
    await schedulePeriodReminder(cycleData.daysUntilPeriod, settings);
  }

  // Fertile window alerts
  if (settings.fertileWindowAlerts && cycleData.daysUntilOvulation !== undefined && cycleData.daysUntilOvulation > 0) {
    await scheduleFertileWindowAlert(cycleData.daysUntilOvulation, settings);
  }

  // Ovulation alerts
  if (settings.ovulationAlerts && cycleData.daysUntilOvulation !== undefined && cycleData.daysUntilOvulation > 0) {
    await scheduleOvulationAlert(cycleData.daysUntilOvulation, settings);
  }

  // Daily wellness check-in
  if (settings.dailyWellnessCheckIn) {
    await scheduleDailyWellnessCheckIn(settings);
  }

  // Phase change alerts
  if (settings.phaseChangeAlerts && cycleData.daysUntilNextPhase > 0) {
    await schedulePhaseChangeAlert(
      cycleData.nextPhaseName,
      cycleData.nextPhaseEmoji,
      cycleData.daysUntilNextPhase,
      settings
    );
  }

  // Wellness tips
  if (settings.wellnessTips) {
    await scheduleWellnessTip(cycleData.currentPhase, settings);
  }
}

// Initialize notifications on app start
export async function initializeNotifications(cycleData: {
  daysUntilPeriod: number;
  currentPhase: string;
  phaseEmoji: string;
  daysUntilNextPhase: number;
  nextPhaseName: string;
  nextPhaseEmoji: string;
  daysUntilOvulation?: number;
  lifeStage?: string;
}): Promise<void> {
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return;

  const settings = await getNotificationSettings();
  if (settings.enabled) {
    await scheduleAllNotifications(settings, cycleData);
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

// Listen for notification taps
export function addNotificationResponseListener(
  callback: (response: Notifications.NotificationResponse) => void
): Notifications.EventSubscription {
  return Notifications.addNotificationResponseReceivedListener(callback);
}

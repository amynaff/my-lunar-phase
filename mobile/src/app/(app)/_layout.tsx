import { Stack } from "expo-router";
import { useEffect } from "react";
import { useCycleStore, phaseInfo } from "@/lib/cycle-store";
import {
  requestNotificationPermissions,
  getNotificationSettings,
  scheduleAllNotifications,
  addNotificationResponseListener,
} from "@/lib/notifications";
import { router } from "expo-router";
import { getCustomerInfo } from "@/lib/revenuecatClient";
import { useSubscriptionStore } from "@/lib/subscription-store";

// Sync RevenueCat entitlements → subscription store on app launch
function useSubscriptionSync() {
  const upgradeToPremium = useSubscriptionStore((s) => s.upgradeToPremium);
  const setTier = useSubscriptionStore((s) => s.setTier);

  useEffect(() => {
    const sync = async () => {
      const result = await getCustomerInfo();
      if (!result.ok) return; // RevenueCat not configured or web — leave store as-is
      const active = result.data.entitlements.active ?? {};
      const hasPremium = Object.keys(active).length > 0;
      if (hasPremium) {
        upgradeToPremium();
      } else {
        setTier("free");
      }
    };
    sync();
  }, [upgradeToPremium, setTier]);
}

// Initialize notifications when app loads
function useNotificationSetup() {
  const lifeStage = useCycleStore((s) => s.lifeStage);
  const getDaysUntilNextPeriod = useCycleStore((s) => s.getDaysUntilNextPeriod);
  const getCurrentPhase = useCycleStore((s) => s.getCurrentPhase);
  const cycleLength = useCycleStore((s) => s.cycleLength);
  const getDayOfCycle = useCycleStore((s) => s.getDayOfCycle);

  useEffect(() => {
    const setupNotifications = async () => {
      const hasPermission = await requestNotificationPermissions();
      if (!hasPermission) return;

      const settings = await getNotificationSettings();
      if (!settings.enabled) return;

      const isNonCycling = lifeStage === 'menopause' || lifeStage === 'postmenopause';

      if (isNonCycling) {
        // For menopause users, schedule only wellness notifications
        await scheduleAllNotifications(settings, {
          daysUntilPeriod: 0,
          currentPhase: 'follicular',
          phaseEmoji: '🌙',
          daysUntilNextPhase: 0,
          nextPhaseName: 'Wellness',
          nextPhaseEmoji: '✨',
          lifeStage,
        });
        return;
      }

      const currentPhase = getCurrentPhase();
      const currentPhaseInfo = phaseInfo[currentPhase];
      const phases = ['menstrual', 'follicular', 'ovulatory', 'luteal'] as const;
      const currentIndex = phases.indexOf(currentPhase);
      const nextPhase = phases[(currentIndex + 1) % 4];
      const nextPhaseInfo = phaseInfo[nextPhase];

      // Calculate cycle metrics
      const daysUntilPeriod = getDaysUntilNextPeriod();
      const dayOfCycle = getDayOfCycle();

      // Calculate days until ovulation (roughly mid-cycle)
      const ovulationDay = Math.round(cycleLength / 2);
      const daysUntilOvulation = dayOfCycle < ovulationDay
        ? ovulationDay - dayOfCycle
        : cycleLength - dayOfCycle + ovulationDay;

      // Calculate days until next phase
      let daysUntilNextPhase = 0;
      if (currentPhase === 'menstrual') {
        daysUntilNextPhase = Math.max(0, 5 - dayOfCycle);
      } else if (currentPhase === 'follicular') {
        daysUntilNextPhase = Math.max(0, Math.round(cycleLength / 2) - 1 - dayOfCycle);
      } else if (currentPhase === 'ovulatory') {
        daysUntilNextPhase = Math.max(0, Math.round(cycleLength / 2) + 2 - dayOfCycle);
      } else {
        daysUntilNextPhase = daysUntilPeriod;
      }

      await scheduleAllNotifications(settings, {
        daysUntilPeriod,
        currentPhase,
        phaseEmoji: currentPhaseInfo.emoji,
        daysUntilNextPhase,
        nextPhaseName: nextPhaseInfo.name,
        nextPhaseEmoji: nextPhaseInfo.emoji,
        daysUntilOvulation,
        lifeStage,
      });
    };

    setupNotifications();

    // Handle notification taps - navigate to relevant screen
    const subscription = addNotificationResponseListener((response) => {
      const data = response.notification.request.content.data;

      if (data?.type === 'wellness-checkin' || data?.type === 'wellness-tip') {
        router.push('/log-mood');
      } else if (data?.type === 'period-reminder') {
        router.push('/(tabs)');
      } else if (data?.type === 'phase-change') {
        router.push('/(tabs)');
      } else if (data?.type === 'fertile-window' || data?.type === 'ovulation') {
        router.push('/(tabs)');
      }
    });

    return () => subscription.remove();
  }, [lifeStage, cycleLength]);
}

export default function AppLayout() {
  useNotificationSetup();
  useSubscriptionSync();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="settings" options={{ presentation: "modal" }} />
      <Stack.Screen name="paywall" options={{ presentation: "modal" }} />
      <Stack.Screen name="luna-ai" />
      <Stack.Screen name="modal" options={{ presentation: "modal" }} />
      <Stack.Screen name="partner-settings" options={{ presentation: "modal" }} />
      <Stack.Screen name="partner-view" />
      <Stack.Screen name="log-mood" options={{ presentation: "modal" }} />
      <Stack.Screen name="notification-settings" options={{ presentation: "modal" }} />
      <Stack.Screen name="community" />
      <Stack.Screen name="labs-guide" />
      <Stack.Screen name="hormonal-education" />
    </Stack>
  );
}

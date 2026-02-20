import { Stack } from "expo-router";
import { useEffect } from "react";
import { useCycleStore, phaseInfo } from "@/lib/cycle-store";
import {
  requestNotificationPermissions,
  getNotificationSettings,
  scheduleAllNotifications,
} from "@/lib/notifications";

// Initialize notifications when app loads
function useNotificationSetup() {
  const lifeStage = useCycleStore((s) => s.lifeStage);
  const getDaysUntilNextPeriod = useCycleStore((s) => s.getDaysUntilNextPeriod);
  const getCurrentPhase = useCycleStore((s) => s.getCurrentPhase);

  useEffect(() => {
    const setupNotifications = async () => {
      // Only for regular cycle tracking (not perimenopause/menopause for now)
      if (lifeStage !== 'regular') return;

      const hasPermission = await requestNotificationPermissions();
      if (!hasPermission) return;

      const settings = await getNotificationSettings();
      if (!settings.enabled) return;

      const currentPhase = getCurrentPhase();
      const currentPhaseInfo = phaseInfo[currentPhase];
      const phases = ['menstrual', 'follicular', 'ovulatory', 'luteal'] as const;
      const currentIndex = phases.indexOf(currentPhase);
      const nextPhase = phases[(currentIndex + 1) % 4];
      const nextPhaseInfo = phaseInfo[nextPhase];

      // Calculate days until next phase (approximate)
      const daysUntilPeriod = getDaysUntilNextPeriod();
      const dayOfCycle = 28 - daysUntilPeriod;
      let daysUntilNextPhase = 0;

      if (currentPhase === 'menstrual') {
        daysUntilNextPhase = Math.max(0, 5 - dayOfCycle);
      } else if (currentPhase === 'follicular') {
        daysUntilNextPhase = Math.max(0, 13 - dayOfCycle);
      } else if (currentPhase === 'ovulatory') {
        daysUntilNextPhase = Math.max(0, 16 - dayOfCycle);
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
      });
    };

    setupNotifications();
  }, [lifeStage]);
}

export default function AppLayout() {
  useNotificationSetup();

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
    </Stack>
  );
}

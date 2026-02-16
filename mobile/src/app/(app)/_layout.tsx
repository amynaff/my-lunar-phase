import { Stack } from "expo-router";

export default function AppLayout() {
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
    </Stack>
  );
}

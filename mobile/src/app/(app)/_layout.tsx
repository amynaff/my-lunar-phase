import { Stack, Redirect } from "expo-router";
import { useSession } from "@/lib/auth/use-session";

export default function AppLayout() {
  const { data: session, isLoading } = useSession();

  // Don't redirect while loading - let parent handle it
  if (isLoading) return null;

  // Redirect to sign-in if not authenticated
  if (!session?.user) {
    return <Redirect href="/sign-in" />;
  }

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

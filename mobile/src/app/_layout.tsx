import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useSegments, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useColorScheme } from '@/lib/useColorScheme';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { useSession } from '@/lib/auth/use-session';
import { Alert } from 'react-native';

// Global JS error handler — surfaces unhandled errors as alerts in TestFlight
// so we can diagnose crashes without Xcode. Remove before public release.
if (typeof ErrorUtils !== 'undefined') {
  const originalHandler = ErrorUtils.getGlobalHandler();
  ErrorUtils.setGlobalHandler((error: Error, isFatal?: boolean) => {
    if (isFatal) {
      SplashScreen.hideAsync().catch(() => {});
      Alert.alert(
        'Crash Report (TestFlight Debug)',
        `${error.name}: ${error.message}\n\n${error.stack?.slice(0, 500) ?? ''}`,
        [{ text: 'OK' }]
      );
    }
    originalHandler(error, isFatal);
  });
}

export const unstable_settings = {
  // Start directly in the app - no auth gate
  initialRouteName: '(app)',
};

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

// Auth guard: redirect authenticated users away from sign-in
function useProtectedRoute() {
  const { data: session, isLoading } = useSession();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const onSignInScreen = segments[0] === 'sign-in';

    if (session?.user && onSignInScreen) {
      // Authenticated user landed on sign-in — redirect into the app
      router.replace('/(app)');
    }
  }, [session, isLoading, segments]);
}

function RootLayoutNav({ colorScheme }: { colorScheme: 'light' | 'dark' | null | undefined }) {
  useProtectedRoute();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(app)" />
        <Stack.Screen name="sign-in" />
        <Stack.Screen name="login" />
        <Stack.Screen name="sign-up" />
        <Stack.Screen name="forgot-password" />
      </Stack>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <KeyboardProvider>
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
          <RootLayoutNav colorScheme={colorScheme} />
        </KeyboardProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}

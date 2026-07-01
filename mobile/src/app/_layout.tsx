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

// On a fatal JS error, make sure the native splash can't stay stuck on screen
// (defensive — the splash is normally hidden once auth state resolves below).
if (typeof ErrorUtils !== 'undefined') {
  const originalHandler = ErrorUtils.getGlobalHandler();
  ErrorUtils.setGlobalHandler((error: Error, isFatal?: boolean) => {
    if (isFatal) {
      SplashScreen.hideAsync().catch(() => {});
    }
    originalHandler(error, isFatal);
  });
}

export const unstable_settings = {
  initialRouteName: 'sign-in',
};

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

// Auth guard: redirect authenticated users away from sign-in
function useProtectedRoute() {
  const { data: session, isLoading } = useSession();
  const segments = useSegments();
  const router = useRouter();

  // Always hide the splash once auth state resolves. The splash is held open at
  // startup by preventAutoHideAsync(); the home tab hides it when fonts load, but
  // logged-out users land on the sign-in screen and would otherwise hang on the
  // splash forever — which presents as a silent launch "crash" with no crash report.
  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [isLoading]);

  useEffect(() => {
    if (isLoading) return;

    // reset-password must stay reachable even for an already-authenticated user
    // (e.g. resetting from a device that never signed out), so it's excluded
    // from the "bounce signed-in users out of the auth group" redirect below.
    const isResetPassword = segments[0] === 'reset-password';
    const inAuthGroup = segments[0] === 'sign-in' || segments[0] === 'login' || segments[0] === 'sign-up' || segments[0] === 'forgot-password' || isResetPassword;
    const inAppGroup = segments[0] === '(app)';

    if (session?.user && inAuthGroup && !isResetPassword) {
      router.replace('/(app)');
    } else if (!session?.user && inAppGroup) {
      router.replace('/sign-in');
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
        <Stack.Screen name="reset-password" />
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

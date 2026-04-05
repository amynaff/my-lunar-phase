import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Moon, Sparkles, ArrowRight, Mail } from 'lucide-react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useThemeStore, getTheme } from '@/lib/theme-store';
import { signInWithApple } from '@/lib/auth/auth-client';
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

// Decorative star positions for the celestial background
const STARS = [
  { top: '8%', left: '12%', size: 3, opacity: 0.4, delay: 0 },
  { top: '5%', right: '18%', size: 2, opacity: 0.6, delay: 100 },
  { top: '14%', right: '30%', size: 2.5, opacity: 0.3, delay: 200 },
  { top: '18%', left: '25%', size: 2, opacity: 0.5, delay: 300 },
  { top: '10%', left: '55%', size: 3, opacity: 0.35, delay: 150 },
  { top: '22%', right: '12%', size: 2, opacity: 0.45, delay: 250 },
  { top: '6%', left: '40%', size: 1.5, opacity: 0.5, delay: 350 },
  { top: '16%', left: '70%', size: 2, opacity: 0.3, delay: 400 },
  { top: '25%', left: '8%', size: 2.5, opacity: 0.4, delay: 50 },
  { top: '3%', right: '40%', size: 2, opacity: 0.55, delay: 180 },
];

/**
 * Sign-in screen - Welcome/splash screen with auth options.
 * Users can sign in with Apple, continue with email, or create an account.
 */
export default function SignInScreen() {
  const insets = useSafeAreaInsets();
  const mode = useThemeStore((s) => s.mode);
  const theme = getTheme(mode);
  const [error, setError] = useState<string | null>(null);
  const [appleLoading, setAppleLoading] = useState(false);

  const [fontsLoaded] = useFonts({
    CormorantGaramond_400Regular,
    CormorantGaramond_600SemiBold,
    Quicksand_400Regular,
    Quicksand_500Medium,
    Quicksand_600SemiBold,
  });

  const handleContinue = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.replace('/(app)');
  }, []);

  const handleAppleSignIn = useCallback(async () => {
    setError(null);
    setAppleLoading(true);
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      await signInWithApple(credential.identityToken!, credential.authorizationCode ?? undefined);
      router.replace('/(app)');
    } catch (err: any) {
      if (err?.code !== 'ERR_REQUEST_CANCELED') {
        setError(err?.message ?? 'Apple sign-in failed. Please try again.');
      }
    } finally {
      setAppleLoading(false);
    }
  }, []);

  const handleContinueWithEmail = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/login');
  }, []);

  const handleCreateAccount = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/sign-up');
  }, []);

  if (!fontsLoaded) return null;

  const isDark = mode === 'dark';

  // Resolved colors
  const bgGradient = isDark
    ? (['#0f0a1a', '#1a1230', '#1f152d', '#1a1230', '#0f0a1a'] as const)
    : (['#f8f7ff', '#efe9ff', '#f5eeff', '#fdf2f8', '#f8f7ff'] as const);

  const moonGlowColor = isDark ? 'rgba(196, 181, 253, 0.12)' : 'rgba(196, 181, 253, 0.2)';
  const moonRingColor = isDark ? 'rgba(157, 132, 237, 0.2)' : 'rgba(157, 132, 237, 0.15)';
  const starColor = isDark ? theme.accent.lavender : theme.text.muted;

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={[...bgGradient]}
        locations={[0, 0.2, 0.45, 0.75, 1]}
        style={{ flex: 1 }}
      >
        <View
          style={{
            flex: 1,
            paddingTop: insets.top,
            paddingBottom: insets.bottom + 20,
          }}
        >
          {/* Celestial star decorations */}
          {STARS.map((star, i) => (
            <Animated.View
              key={i}
              entering={FadeInDown.delay(600 + star.delay).duration(800)}
              style={{
                position: 'absolute',
                top: star.top as any,
                left: star.left as any,
                right: star.right as any,
                width: star.size,
                height: star.size,
                borderRadius: star.size / 2,
                backgroundColor: starColor,
                opacity: star.opacity,
              }}
            />
          ))}

          {/* Top section - Moon branding */}
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 }}>
            {/* Outer moon glow ring */}
            <Animated.View
              entering={FadeInDown.delay(100).duration(900).springify()}
              style={{
                width: 160,
                height: 160,
                borderRadius: 80,
                backgroundColor: moonRingColor,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 32,
              }}
            >
              {/* Inner moon glow */}
              <View
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: 60,
                  backgroundColor: moonGlowColor,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Moon size={52} color={theme.accent.purple} strokeWidth={1.5} />
              </View>
            </Animated.View>

            {/* App title */}
            <Animated.View entering={FadeInDown.delay(250).duration(700)}>
              <Text
                style={{
                  fontFamily: 'CormorantGaramond_600SemiBold',
                  fontSize: 38,
                  color: theme.text.primary,
                  textAlign: 'center',
                  letterSpacing: 1,
                }}
              >
                My Lunar Phase
              </Text>
            </Animated.View>

            {/* Subtitle */}
            <Animated.View entering={FadeInDown.delay(400).duration(700)}>
              <Text
                style={{
                  fontFamily: 'Quicksand_400Regular',
                  fontSize: 16,
                  color: theme.text.tertiary,
                  textAlign: 'center',
                  marginTop: 8,
                  lineHeight: 24,
                }}
              >
                Your wellness journey begins here
              </Text>
            </Animated.View>

            {/* Decorative sparkle accent */}
            <Animated.View
              entering={FadeInDown.delay(550).duration(600)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 16,
                gap: 8,
              }}
            >
              <View
                style={{
                  width: 32,
                  height: 1,
                  backgroundColor: theme.accent.lavender,
                  opacity: 0.5,
                }}
              />
              <Sparkles size={14} color={theme.accent.lavender} strokeWidth={1.5} />
              <View
                style={{
                  width: 32,
                  height: 1,
                  backgroundColor: theme.accent.lavender,
                  opacity: 0.5,
                }}
              />
            </Animated.View>
          </View>

          {/* Bottom section - Auth actions */}
          <View style={{ paddingHorizontal: 28, paddingBottom: 12, gap: 12 }}>
            {/* Error message */}
            {error && (
              <Animated.View entering={FadeInUp.duration(300)}>
                <Text
                  style={{
                    fontFamily: 'Quicksand_400Regular',
                    fontSize: 13,
                    color: theme.accent.rose,
                    textAlign: 'center',
                    marginBottom: 4,
                  }}
                >
                  {error}
                </Text>
              </Animated.View>
            )}

            {/* Get Started button */}
            <Animated.View entering={FadeInUp.delay(450).duration(700)}>
              <Pressable
                onPress={handleContinue}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.85 : 1,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                })}
              >
                <LinearGradient
                  colors={[theme.accent.rose, theme.accent.purple]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    paddingVertical: 18,
                    borderRadius: 16,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text
                    style={{
                      fontFamily: 'Quicksand_600SemiBold',
                      fontSize: 16,
                      color: '#ffffff',
                      marginRight: 8,
                    }}
                  >
                    Get Started
                  </Text>
                  <ArrowRight size={20} color="#ffffff" strokeWidth={2} />
                </LinearGradient>
              </Pressable>
            </Animated.View>

            {/* Apple Sign-In (iOS only) */}
            {Platform.OS === 'ios' && (
              <Animated.View entering={FadeInUp.delay(500).duration(700)}>
                <AppleAuthentication.AppleAuthenticationButton
                  buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                  buttonStyle={
                    isDark
                      ? AppleAuthentication.AppleAuthenticationButtonStyle.WHITE
                      : AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
                  }
                  cornerRadius={16}
                  style={{ height: 54, width: '100%' }}
                  onPress={handleAppleSignIn}
                />
              </Animated.View>
            )}

            {/* Continue with Email */}
            <Animated.View entering={FadeInUp.delay(550).duration(700)}>
              <Pressable
                onPress={handleContinueWithEmail}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.75 : 1,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                  backgroundColor: isDark
                    ? 'rgba(255,255,255,0.08)'
                    : 'rgba(0,0,0,0.06)',
                  borderRadius: 16,
                  paddingVertical: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: isDark
                    ? 'rgba(255,255,255,0.12)'
                    : 'rgba(0,0,0,0.1)',
                })}
              >
                <Mail size={18} color={theme.text.secondary} strokeWidth={1.8} style={{ marginRight: 8 }} />
                <Text
                  style={{
                    fontFamily: 'Quicksand_600SemiBold',
                    fontSize: 15,
                    color: theme.text.secondary,
                  }}
                >
                  Continue with Email
                </Text>
              </Pressable>
            </Animated.View>

            {/* Google SSO - Coming Soon */}
            <Animated.View entering={FadeInUp.delay(580).duration(700)}>
              <View
                style={{
                  borderRadius: 16,
                  paddingVertical: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: isDark
                    ? 'rgba(255,255,255,0.06)'
                    : 'rgba(0,0,0,0.06)',
                  opacity: 0.45,
                }}
              >
                <Text
                  style={{
                    fontFamily: 'Quicksand_500Medium',
                    fontSize: 14,
                    color: theme.text.muted,
                  }}
                >
                  Google Sign-In — Coming soon
                </Text>
              </View>
            </Animated.View>

            {/* Create account link */}
            <Animated.View entering={FadeInUp.delay(620).duration(700)} style={{ alignItems: 'center', marginTop: 4 }}>
              <Pressable onPress={handleCreateAccount} hitSlop={12}>
                <Text
                  style={{
                    fontFamily: 'Quicksand_400Regular',
                    fontSize: 14,
                    color: theme.text.muted,
                    textAlign: 'center',
                  }}
                >
                  New here?{' '}
                  <Text
                    style={{
                      fontFamily: 'Quicksand_600SemiBold',
                      color: theme.accent.purple,
                    }}
                  >
                    Create an account
                  </Text>
                </Text>
              </Pressable>
            </Animated.View>

            {/* Privacy text */}
            <Animated.View entering={FadeInUp.delay(660).duration(700)} style={{ marginTop: 8 }}>
              <Text
                style={{
                  fontFamily: 'Quicksand_400Regular',
                  fontSize: 12,
                  color: theme.text.muted,
                  textAlign: 'center',
                  lineHeight: 18,
                  paddingHorizontal: 16,
                }}
              >
                By continuing, you agree to our Terms of Service and Privacy Policy.
                Your data stays private on your device.
              </Text>
            </Animated.View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

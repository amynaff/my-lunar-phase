import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Moon, Mail, ArrowRight, Sparkles } from 'lucide-react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { authClient } from '@/lib/auth/auth-client';
import { useThemeStore, getTheme } from '@/lib/theme-store';
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

export default function SignInScreen() {
  const insets = useSafeAreaInsets();
  const mode = useThemeStore((s) => s.mode);
  const theme = getTheme(mode);

  const [email, setEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState<boolean>(false);

  const [fontsLoaded] = useFonts({
    CormorantGaramond_400Regular,
    CormorantGaramond_600SemiBold,
    Quicksand_400Regular,
    Quicksand_500Medium,
    Quicksand_600SemiBold,
  });

  const isValidEmail = useCallback((value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  }, []);

  const handleSendCode = useCallback(async () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError('Please enter your email address');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      setError('Please enter a valid email address');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setError(null);
    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await authClient.emailOtp.sendVerificationOtp({
        email: trimmedEmail,
        type: 'sign-in',
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.push({ pathname: '/verify-otp', params: { email: trimmedEmail } });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setError(message);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoading(false);
    }
  }, [email, isValidEmail]);

  if (!fontsLoaded) return null;

  const isDark = mode === 'dark';

  // Resolved colors
  const bgGradient = isDark
    ? (['#0f0a1a', '#1a1230', '#1f152d', '#1a1230', '#0f0a1a'] as const)
    : (['#f8f7ff', '#efe9ff', '#f5eeff', '#fdf2f8', '#f8f7ff'] as const);

  const moonGlowColor = isDark ? 'rgba(196, 181, 253, 0.12)' : 'rgba(196, 181, 253, 0.2)';
  const moonRingColor = isDark ? 'rgba(157, 132, 237, 0.2)' : 'rgba(157, 132, 237, 0.15)';
  const starColor = isDark ? theme.accent.lavender : theme.text.muted;
  const inputBg = isDark ? 'rgba(37, 29, 53, 0.8)' : 'rgba(255, 255, 255, 0.85)';
  const inputBorderDefault = isDark
    ? 'rgba(185, 166, 247, 0.2)'
    : 'rgba(185, 166, 247, 0.35)';
  const inputBorderFocused = isDark ? theme.accent.purple : theme.text.secondary;
  const placeholderColor = isDark ? 'rgba(185, 166, 247, 0.4)' : 'rgba(185, 166, 247, 0.6)';

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={[...bgGradient]}
        locations={[0, 0.2, 0.45, 0.75, 1]}
        style={{ flex: 1 }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              paddingTop: insets.top,
              paddingBottom: insets.bottom + 20,
            }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
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
                  Luna Flow
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

            {/* Bottom section - Form */}
            <View style={{ paddingHorizontal: 28, paddingBottom: 12 }}>
              {/* Email input */}
              <Animated.View entering={FadeInUp.delay(300).duration(700)}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: inputBg,
                    borderRadius: 16,
                    borderWidth: 1.5,
                    borderColor: error
                      ? theme.accent.pink
                      : isFocused
                        ? inputBorderFocused
                        : inputBorderDefault,
                    paddingHorizontal: 18,
                    paddingVertical: Platform.OS === 'ios' ? 16 : 6,
                  }}
                >
                  <Mail
                    size={20}
                    color={
                      error
                        ? theme.accent.pink
                        : isFocused
                          ? theme.accent.purple
                          : theme.text.muted
                    }
                    strokeWidth={1.5}
                  />
                  <TextInput
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      if (error) setError(null);
                    }}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder="Enter your email"
                    placeholderTextColor={placeholderColor}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="email"
                    editable={!isLoading}
                    style={{
                      flex: 1,
                      fontFamily: 'Quicksand_500Medium',
                      fontSize: 16,
                      color: theme.text.primary,
                      marginLeft: 12,
                      paddingVertical: Platform.OS === 'ios' ? 0 : 10,
                    }}
                  />
                </View>

                {/* Error message */}
                {error ? (
                  <Animated.View entering={FadeInDown.duration(300)}>
                    <Text
                      style={{
                        fontFamily: 'Quicksand_500Medium',
                        fontSize: 13,
                        color: theme.accent.pink,
                        marginTop: 10,
                        marginLeft: 4,
                      }}
                    >
                      {error}
                    </Text>
                  </Animated.View>
                ) : null}
              </Animated.View>

              {/* Send verification code button */}
              <Animated.View entering={FadeInUp.delay(450).duration(700)} style={{ marginTop: 20 }}>
                <Pressable
                  onPress={handleSendCode}
                  disabled={isLoading}
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.85 : 1,
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                  })}
                >
                  <LinearGradient
                    colors={
                      isLoading
                        ? [theme.accent.lavender, theme.accent.lavender]
                        : [theme.accent.rose, theme.accent.purple]
                    }
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
                    {isLoading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <Text
                          style={{
                            fontFamily: 'Quicksand_600SemiBold',
                            fontSize: 16,
                            color: '#ffffff',
                            marginRight: 8,
                          }}
                        >
                          Send verification code
                        </Text>
                        <ArrowRight size={20} color="#ffffff" strokeWidth={2} />
                      </>
                    )}
                  </LinearGradient>
                </Pressable>
              </Animated.View>

              {/* Privacy text */}
              <Animated.View entering={FadeInUp.delay(600).duration(700)} style={{ marginTop: 24 }}>
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
                  We will never share your personal data.
                </Text>
              </Animated.View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
}

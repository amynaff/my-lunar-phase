import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  Keyboard,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { ArrowLeft, Mail, Moon, Sparkles, RefreshCw } from 'lucide-react-native';
import { useLocalSearchParams, router } from 'expo-router';
import * as Haptics from 'expo-haptics';
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
import { useThemeStore, getTheme } from '@/lib/theme-store';
import { authClient } from '@/lib/auth/auth-client';
import { useInvalidateSession } from '@/lib/auth/use-session';

const RESEND_COOLDOWN_SECONDS = 60;
const OTP_LENGTH = 6;

export default function VerifyOtpScreen() {
  const insets = useSafeAreaInsets();
  const { email } = useLocalSearchParams<{ email: string }>();
  const themeMode = useThemeStore((s) => s.mode);
  const theme = getTheme(themeMode);
  const invalidateSession = useInvalidateSession();

  const [otp, setOtp] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [resendCooldown, setResendCooldown] = useState<number>(0);
  const [isResending, setIsResending] = useState<boolean>(false);
  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hiddenInputRef = useRef<TextInput>(null);

  const [fontsLoaded] = useFonts({
    CormorantGaramond_400Regular,
    CormorantGaramond_600SemiBold,
    Quicksand_400Regular,
    Quicksand_500Medium,
    Quicksand_600SemiBold,
  });

  // Start cooldown timer on mount (user just requested OTP)
  useEffect(() => {
    startCooldown();
    return () => {
      if (cooldownRef.current) {
        clearInterval(cooldownRef.current);
      }
    };
  }, []);

  const startCooldown = useCallback(() => {
    setResendCooldown(RESEND_COOLDOWN_SECONDS);
    if (cooldownRef.current) {
      clearInterval(cooldownRef.current);
    }
    cooldownRef.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          if (cooldownRef.current) {
            clearInterval(cooldownRef.current);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const handleVerifyOtp = useCallback(
    async (code: string) => {
      if (!email || code.length !== OTP_LENGTH) return;

      Keyboard.dismiss();
      setIsVerifying(true);
      setError('');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      try {
        const result = await authClient.signIn.emailOtp({
          email: email.trim(),
          otp: code,
        });

        if (result.error) {
          setError(result.error.message ?? 'Invalid code. Please try again.');
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          setIsVerifying(false);
          return;
        }

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        // Invalidate session then navigate directly - don't wait for the guard
        await invalidateSession();
        router.replace('/(app)');
      } catch (err) {
        setError('Something went wrong. Please try again.');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setIsVerifying(false);
      }
    },
    [email, invalidateSession]
  );

  const handleResendCode = useCallback(async () => {
    if (resendCooldown > 0 || isResending || !email) return;

    setIsResending(true);
    setError('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await authClient.emailOtp.sendVerificationOtp({
        email: email.trim(),
        type: 'sign-in',
      });
      startCooldown();
    } catch (err) {
      // Even if resend fails silently, start cooldown to prevent spam
      startCooldown();
    } finally {
      setIsResending(false);
    }
  }, [resendCooldown, isResending, email, startCooldown]);

  const handleOtpChange = useCallback(
    (text: string) => {
      // Only allow digits, strip spaces/dashes that might come from paste
      const cleaned = text.replace(/[^0-9]/g, '').slice(0, OTP_LENGTH);
      setOtp(cleaned);
      setFocusedIndex(cleaned.length < OTP_LENGTH ? cleaned.length : OTP_LENGTH - 1);
      if (error) setError('');

      if (cleaned.length === OTP_LENGTH) {
        handleVerifyOtp(cleaned);
      }
    },
    [error, handleVerifyOtp]
  );

  const handleCellPress = useCallback(() => {
    hiddenInputRef.current?.focus();
  }, []);

  if (!fontsLoaded) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.bg.primary,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator size="large" color={theme.accent.pink} />
      </View>
    );
  }

  const otpDigits = otp.split('');

  return (
    <View className="flex-1">
      <LinearGradient
        colors={theme.gradient}
        locations={[0, 0.25, 0.5, 0.75, 1]}
        style={{ flex: 1 }}
      >
        <Pressable style={{ flex: 1 }} onPress={Keyboard.dismiss}>
          <View style={{ flex: 1, paddingTop: insets.top + 8, paddingBottom: insets.bottom + 16 }}>
            {/* Back Button */}
            <Animated.View
              entering={FadeInDown.delay(100).duration(500)}
              className="px-5"
            >
              <Pressable
                className="w-11 h-11 rounded-full items-center justify-center border"
                style={{
                  backgroundColor: theme.bg.card,
                  borderColor: theme.border.light,
                }}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.back();
                }}
              >
                <ArrowLeft size={20} color={theme.text.secondary} />
              </Pressable>
            </Animated.View>

            {/* Decorative Elements */}
            <Animated.View
              entering={FadeInDown.delay(200).duration(700)}
              className="items-center mt-8"
            >
              <View
                className="w-20 h-20 rounded-full items-center justify-center"
                style={{ backgroundColor: `${theme.accent.purple}15` }}
              >
                <View
                  className="w-14 h-14 rounded-full items-center justify-center"
                  style={{ backgroundColor: `${theme.accent.purple}25` }}
                >
                  <Mail size={28} color={theme.accent.purple} />
                </View>
              </View>
            </Animated.View>

            {/* Header Text */}
            <Animated.View
              entering={FadeInDown.delay(300).duration(600)}
              className="items-center mt-6 px-6"
            >
              <Text
                style={{
                  fontFamily: 'CormorantGaramond_600SemiBold',
                  color: theme.text.primary,
                }}
                className="text-3xl text-center"
              >
                Check your email
              </Text>
              <Text
                style={{
                  fontFamily: 'Quicksand_400Regular',
                  color: theme.text.tertiary,
                }}
                className="text-sm text-center mt-3 leading-5"
              >
                We sent a verification code to
              </Text>
              <Text
                style={{
                  fontFamily: 'Quicksand_600SemiBold',
                  color: theme.text.secondary,
                }}
                className="text-sm text-center mt-1"
              >
                {email ?? ''}
              </Text>
            </Animated.View>

            {/* OTP Input */}
            <Animated.View
              entering={FadeInUp.delay(400).duration(600)}
              className="px-8 mt-10"
            >
              <Pressable onPress={handleCellPress} style={{ position: 'relative' }}>
                {/* Hidden TextInput that captures keyboard input and supports paste */}
                <TextInput
                  ref={hiddenInputRef}
                  value={otp}
                  onChangeText={handleOtpChange}
                  keyboardType="number-pad"
                  maxLength={OTP_LENGTH}
                  autoFocus
                  editable={!isVerifying}
                  textContentType="oneTimeCode"
                  autoComplete="one-time-code"
                  importantForAutofill="yes"
                  caretHidden
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    opacity: 0,
                    zIndex: 10,
                  }}
                />

                {/* Visual OTP cells */}
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    gap: 10,
                  }}
                >
                  {Array.from({ length: OTP_LENGTH }).map((_, index) => {
                    const digit = otpDigits[index] ?? '';
                    const isFocused = index === focusedIndex && !isVerifying;
                    const hasValue = digit !== '';

                    return (
                      <View
                        key={index}
                        style={{
                          width: 50,
                          height: 58,
                          borderRadius: 16,
                          borderWidth: isFocused ? 2 : 1.5,
                          borderColor: error
                            ? theme.accent.pink
                            : isFocused
                            ? theme.accent.purple
                            : theme.border.medium,
                          backgroundColor: isFocused
                            ? theme.bg.cardSolid
                            : theme.bg.input,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {hasValue ? (
                          <Text
                            style={{
                              fontFamily: 'Quicksand_600SemiBold',
                              fontSize: 22,
                              color: theme.text.primary,
                            }}
                          >
                            {digit}
                          </Text>
                        ) : isFocused ? (
                          <View
                            style={{
                              width: 2,
                              height: 24,
                              backgroundColor: theme.accent.purple,
                              borderRadius: 1,
                            }}
                          />
                        ) : null}
                      </View>
                    );
                  })}
                </View>
              </Pressable>
            </Animated.View>

            {/* Error Message */}
            {error ? (
              <Animated.View
                entering={FadeInUp.duration(300)}
                className="px-8 mt-4"
              >
                <View
                  className="flex-row items-center justify-center rounded-2xl py-3 px-4"
                  style={{
                    backgroundColor: `${theme.accent.pink}12`,
                    borderWidth: 1,
                    borderColor: `${theme.accent.pink}25`,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: 'Quicksand_500Medium',
                      color: theme.accent.pink,
                    }}
                    className="text-sm text-center"
                  >
                    {error}
                  </Text>
                </View>
              </Animated.View>
            ) : null}

            {/* Loading indicator */}
            {isVerifying ? (
              <Animated.View
                entering={FadeInUp.duration(300)}
                className="items-center mt-6"
              >
                <View className="flex-row items-center">
                  <ActivityIndicator size="small" color={theme.accent.purple} />
                  <Text
                    style={{
                      fontFamily: 'Quicksand_500Medium',
                      color: theme.text.tertiary,
                    }}
                    className="text-sm ml-3"
                  >
                    Verifying...
                  </Text>
                </View>
              </Animated.View>
            ) : null}

            {/* Spacer */}
            <View className="flex-1" />

            {/* Resend Section */}
            <Animated.View
              entering={FadeInUp.delay(500).duration(600)}
              className="items-center px-6"
            >
              <View className="flex-row items-center mb-4">
                <View
                  className="w-8 h-[1px]"
                  style={{ backgroundColor: theme.border.light }}
                />
                <View className="mx-3 flex-row items-center">
                  <Moon size={12} color={theme.text.muted} />
                  <Sparkles
                    size={10}
                    color={theme.text.muted}
                    style={{ marginLeft: 6 }}
                  />
                  <Moon size={12} color={theme.text.muted} style={{ marginLeft: 6 }} />
                </View>
                <View
                  className="w-8 h-[1px]"
                  style={{ backgroundColor: theme.border.light }}
                />
              </View>

              <Text
                style={{
                  fontFamily: 'Quicksand_400Regular',
                  color: theme.text.muted,
                }}
                className="text-sm mb-3"
              >
                Didn't receive the code?
              </Text>

              <Pressable
                onPress={handleResendCode}
                disabled={resendCooldown > 0 || isResending}
                className="py-3 px-6 rounded-full"
                style={{
                  backgroundColor:
                    resendCooldown > 0
                      ? `${theme.accent.purple}08`
                      : `${theme.accent.purple}15`,
                  borderWidth: 1,
                  borderColor:
                    resendCooldown > 0
                      ? theme.border.light
                      : `${theme.accent.purple}30`,
                }}
              >
                <View className="flex-row items-center">
                  {isResending ? (
                    <ActivityIndicator
                      size="small"
                      color={theme.accent.purple}
                      style={{ marginRight: 8 }}
                    />
                  ) : (
                    <RefreshCw
                      size={14}
                      color={
                        resendCooldown > 0
                          ? theme.text.muted
                          : theme.accent.purple
                      }
                      style={{ marginRight: 8 }}
                    />
                  )}
                  <Text
                    style={{
                      fontFamily: 'Quicksand_600SemiBold',
                      color:
                        resendCooldown > 0
                          ? theme.text.muted
                          : theme.accent.purple,
                    }}
                    className="text-sm"
                  >
                    {resendCooldown > 0
                      ? `Resend in ${resendCooldown}s`
                      : 'Resend code'}
                  </Text>
                </View>
              </Pressable>
            </Animated.View>
          </View>
        </Pressable>
      </LinearGradient>
    </View>
  );
}

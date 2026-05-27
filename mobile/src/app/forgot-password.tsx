import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Moon, ArrowLeft, CheckCircle } from 'lucide-react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useThemeStore, getTheme } from '@/lib/theme-store';
import { authClient } from '@/lib/auth/auth-client';
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

export default function ForgotPasswordScreen() {
  const insets = useSafeAreaInsets();
  const mode = useThemeStore((s) => s.mode);
  const theme = getTheme(mode);

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const [fontsLoaded] = useFonts({
    CormorantGaramond_400Regular,
    CormorantGaramond_600SemiBold,
    Quicksand_400Regular,
    Quicksand_500Medium,
    Quicksand_600SemiBold,
  });

  const handleSendReset = useCallback(async () => {
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    setError(null);
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const result = await authClient.forgetPassword({
        email: email.trim(),
        redirectTo: (process.env.EXPO_PUBLIC_BACKEND_URL ?? '') + '/reset-password',
      });
      if (result.error) {
        setError(result.error.message ?? 'Failed to send reset link. Please try again.');
      } else {
        setSent(true);
      }
    } catch (err: any) {
      setError(err?.message ?? 'Failed to send reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [email]);

  if (!fontsLoaded) return null;

  const isDark = mode === 'dark';

  const bgGradient = isDark
    ? (['#0f0a1a', '#1a1230', '#0f0a1a'] as const)
    : (['#f8f7ff', '#efe9ff', '#f8f7ff'] as const);

  const inputBg = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.04)';
  const inputBorder = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)';
  const placeholderColor = isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)';

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={[...bgGradient]}
        locations={[0, 0.5, 1]}
        style={{ flex: 1 }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              paddingTop: insets.top + 8,
              paddingBottom: insets.bottom + 24,
              paddingHorizontal: 28,
            }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Back button */}
            <Animated.View entering={FadeInDown.delay(50).duration(500)}>
              <Pressable
                onPress={() => router.back()}
                hitSlop={12}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.6 : 1,
                  alignSelf: 'flex-start',
                  padding: 8,
                  marginBottom: 8,
                })}
              >
                <ArrowLeft size={22} color={theme.text.secondary} strokeWidth={1.8} />
              </Pressable>
            </Animated.View>

            {/* Header */}
            <Animated.View
              entering={FadeInDown.delay(100).duration(600)}
              style={{ alignItems: 'center', marginBottom: 36 }}
            >
              <View
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 36,
                  backgroundColor: isDark
                    ? 'rgba(157,132,237,0.15)'
                    : 'rgba(157,132,237,0.12)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 20,
                }}
              >
                <Moon size={32} color={theme.accent.purple} strokeWidth={1.5} />
              </View>
              <Text
                style={{
                  fontFamily: 'CormorantGaramond_600SemiBold',
                  fontSize: 32,
                  color: theme.text.primary,
                  textAlign: 'center',
                  letterSpacing: 0.5,
                }}
              >
                Reset password
              </Text>
              <Text
                style={{
                  fontFamily: 'Quicksand_400Regular',
                  fontSize: 15,
                  color: theme.text.tertiary,
                  textAlign: 'center',
                  marginTop: 8,
                  lineHeight: 22,
                }}
              >
                Enter your email and we'll send you{'\n'}a link to reset your password.
              </Text>
            </Animated.View>

            {sent ? (
              /* Success state */
              <Animated.View
                entering={FadeInDown.duration(500)}
                style={{
                  alignItems: 'center',
                  paddingVertical: 32,
                  paddingHorizontal: 16,
                  backgroundColor: isDark
                    ? 'rgba(157,132,237,0.08)'
                    : 'rgba(157,132,237,0.06)',
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: isDark
                    ? 'rgba(157,132,237,0.2)'
                    : 'rgba(157,132,237,0.15)',
                  marginBottom: 32,
                }}
              >
                <CheckCircle size={48} color={theme.accent.purple} strokeWidth={1.5} style={{ marginBottom: 16 }} />
                <Text
                  style={{
                    fontFamily: 'CormorantGaramond_600SemiBold',
                    fontSize: 22,
                    color: theme.text.primary,
                    textAlign: 'center',
                    marginBottom: 10,
                  }}
                >
                  Check your email
                </Text>
                <Text
                  style={{
                    fontFamily: 'Quicksand_400Regular',
                    fontSize: 14,
                    color: theme.text.secondary,
                    textAlign: 'center',
                    lineHeight: 22,
                  }}
                >
                  We've sent a password reset link to{'\n'}
                  <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}>
                    {email}
                  </Text>
                </Text>
              </Animated.View>
            ) : (
              <>
                {/* Email input */}
                <Animated.View entering={FadeInDown.delay(200).duration(600)} style={{ marginBottom: 28 }}>
                  <Text
                    style={{
                      fontFamily: 'Quicksand_500Medium',
                      fontSize: 13,
                      color: theme.text.secondary,
                      marginBottom: 6,
                      marginLeft: 2,
                    }}
                  >
                    Email
                  </Text>
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="email"
                    placeholder="you@example.com"
                    placeholderTextColor={placeholderColor}
                    style={{
                      backgroundColor: inputBg,
                      borderWidth: 1,
                      borderColor: inputBorder,
                      borderRadius: 14,
                      paddingHorizontal: 16,
                      paddingVertical: 16,
                      fontFamily: 'Quicksand_400Regular',
                      fontSize: 15,
                      color: theme.text.primary,
                    }}
                  />
                </Animated.View>

                {/* Error message */}
                {error && (
                  <Animated.View entering={FadeInUp.duration(300)} style={{ marginBottom: 16 }}>
                    <Text
                      style={{
                        fontFamily: 'Quicksand_400Regular',
                        fontSize: 13,
                        color: theme.accent.rose,
                        textAlign: 'center',
                      }}
                    >
                      {error}
                    </Text>
                  </Animated.View>
                )}

                {/* Send reset link button */}
                <Animated.View entering={FadeInUp.delay(300).duration(600)}>
                  <Pressable
                    onPress={handleSendReset}
                    disabled={loading}
                    style={({ pressed }) => ({
                      opacity: loading ? 0.7 : pressed ? 0.85 : 1,
                      transform: [{ scale: pressed && !loading ? 0.98 : 1 }],
                    })}
                  >
                    <LinearGradient
                      colors={[theme.accent.rose, theme.accent.purple]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={{
                        paddingVertical: 18,
                        borderRadius: 16,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: 'Quicksand_600SemiBold',
                          fontSize: 16,
                          color: '#ffffff',
                        }}
                      >
                        {loading ? 'Sending...' : 'Send reset link'}
                      </Text>
                    </LinearGradient>
                  </Pressable>
                </Animated.View>
              </>
            )}

            {/* Back to login link */}
            <Animated.View
              entering={FadeInUp.delay(sent ? 100 : 380).duration(600)}
              style={{ alignItems: 'center', marginTop: sent ? 0 : 28 }}
            >
              <Pressable onPress={() => router.back()} hitSlop={12}>
                <Text
                  style={{
                    fontFamily: 'Quicksand_400Regular',
                    fontSize: 14,
                    color: theme.text.muted,
                    textAlign: 'center',
                  }}
                >
                  <Text
                    style={{
                      fontFamily: 'Quicksand_600SemiBold',
                      color: theme.accent.purple,
                    }}
                  >
                    Back to login
                  </Text>
                </Text>
              </Pressable>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
}

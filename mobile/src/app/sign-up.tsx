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
import { Moon, ArrowLeft, Eye, EyeOff } from 'lucide-react-native';
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

export default function SignUpScreen() {
  const insets = useSafeAreaInsets();
  const mode = useThemeStore((s) => s.mode);
  const theme = getTheme(mode);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [fontsLoaded] = useFonts({
    CormorantGaramond_400Regular,
    CormorantGaramond_600SemiBold,
    Quicksand_400Regular,
    Quicksand_500Medium,
    Quicksand_600SemiBold,
  });

  const handleSignUp = useCallback(async () => {
    if (!name.trim() || !email.trim() || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setError(null);
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const result = await authClient.signUp.email({
        name: name.trim(),
        email: email.trim(),
        password,
      });
      if (result.error) {
        setError(result.error.message ?? 'Sign-up failed. Please try again.');
      } else {
        router.replace('/(app)');
      }
    } catch (err: any) {
      setError(err?.message ?? 'Sign-up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [name, email, password]);

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
                Create your account
              </Text>
              <Text
                style={{
                  fontFamily: 'Quicksand_400Regular',
                  fontSize: 15,
                  color: theme.text.tertiary,
                  textAlign: 'center',
                  marginTop: 8,
                }}
              >
                Begin your lunar wellness journey
              </Text>
            </Animated.View>

            {/* Name input */}
            <Animated.View entering={FadeInDown.delay(180).duration(600)} style={{ marginBottom: 14 }}>
              <Text
                style={{
                  fontFamily: 'Quicksand_500Medium',
                  fontSize: 13,
                  color: theme.text.secondary,
                  marginBottom: 6,
                  marginLeft: 2,
                }}
              >
                Name
              </Text>
              <TextInput
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                autoCorrect={false}
                autoComplete="name"
                placeholder="Your name"
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

            {/* Email input */}
            <Animated.View entering={FadeInDown.delay(240).duration(600)} style={{ marginBottom: 14 }}>
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

            {/* Password input */}
            <Animated.View entering={FadeInDown.delay(300).duration(600)} style={{ marginBottom: 28 }}>
              <Text
                style={{
                  fontFamily: 'Quicksand_500Medium',
                  fontSize: 13,
                  color: theme.text.secondary,
                  marginBottom: 6,
                  marginLeft: 2,
                }}
              >
                Password
              </Text>
              <View style={{ position: 'relative' }}>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="new-password"
                  placeholder="Choose a password"
                  placeholderTextColor={placeholderColor}
                  style={{
                    backgroundColor: inputBg,
                    borderWidth: 1,
                    borderColor: inputBorder,
                    borderRadius: 14,
                    paddingHorizontal: 16,
                    paddingVertical: 16,
                    paddingRight: 52,
                    fontFamily: 'Quicksand_400Regular',
                    fontSize: 15,
                    color: theme.text.primary,
                  }}
                />
                <Pressable
                  onPress={() => setShowPassword((v) => !v)}
                  hitSlop={8}
                  style={{
                    position: 'absolute',
                    right: 14,
                    top: 0,
                    bottom: 0,
                    justifyContent: 'center',
                  }}
                >
                  {showPassword
                    ? <EyeOff size={18} color={theme.text.muted} strokeWidth={1.8} />
                    : <Eye size={18} color={theme.text.muted} strokeWidth={1.8} />
                  }
                </Pressable>
              </View>
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

            {/* Create Account button */}
            <Animated.View entering={FadeInUp.delay(360).duration(600)}>
              <Pressable
                onPress={handleSignUp}
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
                    {loading ? 'Creating account...' : 'Create Account'}
                  </Text>
                </LinearGradient>
              </Pressable>
            </Animated.View>

            {/* Sign in link */}
            <Animated.View
              entering={FadeInUp.delay(430).duration(600)}
              style={{ alignItems: 'center', marginTop: 28 }}
            >
              <Pressable onPress={() => router.replace('/login')} hitSlop={12}>
                <Text
                  style={{
                    fontFamily: 'Quicksand_400Regular',
                    fontSize: 14,
                    color: theme.text.muted,
                    textAlign: 'center',
                  }}
                >
                  Already have an account?{' '}
                  <Text
                    style={{
                      fontFamily: 'Quicksand_600SemiBold',
                      color: theme.accent.purple,
                    }}
                  >
                    Sign in
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

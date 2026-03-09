import React, { useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Moon, Sparkles, ArrowRight } from 'lucide-react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
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

/**
 * Sign-in screen - This is now OPTIONAL and not a gate.
 * Users are redirected here from settings if they want to sign in.
 * The app starts directly in onboarding without requiring sign-in.
 */
export default function SignInScreen() {
  const insets = useSafeAreaInsets();
  const mode = useThemeStore((s) => s.mode);
  const theme = getTheme(mode);

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

          {/* Bottom section - Get Started button */}
          <View style={{ paddingHorizontal: 28, paddingBottom: 12 }}>
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
                Your data stays private on your device.
              </Text>
            </Animated.View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

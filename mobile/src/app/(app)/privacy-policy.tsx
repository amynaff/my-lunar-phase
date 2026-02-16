import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { ArrowLeft, Shield, Lock, Eye, Database, Heart } from 'lucide-react-native';
import { router } from 'expo-router';
import { useThemeStore, getTheme } from '@/lib/theme-store';
import {
  useFonts,
  Quicksand_400Regular,
  Quicksand_500Medium,
  Quicksand_600SemiBold,
} from '@expo-google-fonts/quicksand';
import {
  CormorantGaramond_400Regular,
  CormorantGaramond_600SemiBold,
} from '@expo-google-fonts/cormorant-garamond';

const PRIVACY_SECTIONS = [
  {
    icon: Shield,
    title: 'Your Privacy Matters',
    content: 'Luna Flow is designed with your privacy as our top priority. We believe your health data belongs to you and only you.',
  },
  {
    icon: Database,
    title: 'Data Storage',
    content: 'All your personal cycle data, preferences, and settings are stored locally on your device. We do not have access to this information.',
  },
  {
    icon: Eye,
    title: 'What We Don\'t Collect',
    content: 'We do not collect, store, or have access to:\n\n• Your name or email\n• Your cycle or health data\n• Your location\n• Your contacts\n• Any personal identifiers',
  },
  {
    icon: Lock,
    title: 'Community Stories',
    content: 'If you choose to share a story in our Community section, it is completely anonymous. Stories are not linked to any account or device identifier. We cannot trace any story back to you.',
  },
  {
    icon: Heart,
    title: 'Our Commitment',
    content: 'Luna Flow was created by a woman, for women. We will never sell, share, or monetize your personal data. Your trust is more valuable to us than any data could ever be.',
  },
];

export default function PrivacyPolicyScreen() {
  const insets = useSafeAreaInsets();
  const themeMode = useThemeStore(s => s.mode);
  const theme = getTheme(themeMode);

  const [fontsLoaded] = useFonts({
    Quicksand_400Regular,
    Quicksand_500Medium,
    Quicksand_600SemiBold,
    CormorantGaramond_400Regular,
    CormorantGaramond_600SemiBold,
  });

  if (!fontsLoaded) return null;

  return (
    <View className="flex-1">
      <LinearGradient
        colors={theme.gradient}
        locations={[0, 0.25, 0.5, 0.75, 1]}
        style={{ flex: 1 }}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View
            entering={FadeInDown.delay(100).duration(600)}
            style={{ paddingTop: insets.top + 8 }}
            className="px-6"
          >
            <View className="flex-row items-center mb-6">
              <Pressable
                onPress={() => router.back()}
                className="w-9 h-9 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: theme.bg.card }}
              >
                <ArrowLeft size={18} color={theme.text.primary} />
              </Pressable>
              <View className="flex-1">
                <Text
                  style={{ fontFamily: 'CormorantGaramond_400Regular', color: theme.text.muted }}
                  className="text-sm tracking-widest uppercase"
                >
                  Legal
                </Text>
                <Text
                  style={{ fontFamily: 'CormorantGaramond_600SemiBold', color: theme.text.primary }}
                  className="text-2xl"
                >
                  Privacy Policy
                </Text>
              </View>
            </View>

            {/* Last Updated */}
            <View
              className="rounded-xl p-3 mb-6"
              style={{ backgroundColor: `${theme.accent.purple}10` }}
            >
              <Text
                style={{ fontFamily: 'Quicksand_500Medium', color: theme.accent.purple }}
                className="text-xs text-center"
              >
                Last Updated: February 2026
              </Text>
            </View>
          </Animated.View>

          {/* Privacy Sections */}
          {PRIVACY_SECTIONS.map((section, index) => {
            const IconComponent = section.icon;
            return (
              <Animated.View
                key={section.title}
                entering={FadeInUp.delay(200 + index * 100).duration(600)}
                className="mx-6 mb-4"
              >
                <View
                  className="rounded-2xl p-4 border"
                  style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light }}
                >
                  <View className="flex-row items-center mb-3">
                    <View
                      className="w-10 h-10 rounded-full items-center justify-center mr-3"
                      style={{ backgroundColor: `${theme.accent.purple}15` }}
                    >
                      <IconComponent size={18} color={theme.accent.purple} />
                    </View>
                    <Text
                      style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
                      className="text-base flex-1"
                    >
                      {section.title}
                    </Text>
                  </View>
                  <Text
                    style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.secondary, lineHeight: 22 }}
                    className="text-sm"
                  >
                    {section.content}
                  </Text>
                </View>
              </Animated.View>
            );
          })}

          {/* Contact Section */}
          <Animated.View
            entering={FadeInUp.delay(700).duration(600)}
            className="mx-6 mt-2 mb-6"
          >
            <View
              className="rounded-2xl p-4 border"
              style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light }}
            >
              <Text
                style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
                className="text-base mb-2"
              >
                Questions?
              </Text>
              <Text
                style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.secondary }}
                className="text-sm"
              >
                If you have any questions about our privacy practices, please reach out to us. We're happy to explain anything in more detail.
              </Text>
            </View>
          </Animated.View>

          {/* Footer */}
          <Animated.View
            entering={FadeInUp.delay(800).duration(600)}
            className="px-6"
          >
            <Text
              style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.muted }}
              className="text-xs text-center"
            >
              Made with love by a woman for women everywhere
            </Text>
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

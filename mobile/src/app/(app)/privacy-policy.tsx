import React from 'react';
import { View, Text, ScrollView, Pressable, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { ArrowLeft, Shield, Lock, Eye, Database, Sparkles, Trash2, Users, Mail } from 'lucide-react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
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
    content: 'My Lunar Phase helps you understand your body, and we take the privacy of your health information seriously. This policy explains what we collect, how we use it, and the control you have over it.',
  },
  {
    icon: Database,
    title: 'Information We Collect',
    content: 'To create your account and personalize the app, we collect:\n\n• Account details — your name and email address\n• Cycle & health data — periods, symptoms, and mood you log\n• Journal entries you write or record\n• Subscription status and basic device information (such as a notification token)',
  },
  {
    icon: Eye,
    title: 'How We Use Your Information',
    content: 'We use your information only to run and improve the app: to sync your data across sign-ins, generate personalized cycle and wellness insights, send the reminders you enable, and manage your subscription. We do not use it for advertising.',
  },
  {
    icon: Sparkles,
    title: 'AI-Powered Insights',
    content: 'When you use Luna AI or request journal insights, the entries you submit are sent to our AI provider (Anthropic) to generate a response. This content is not used to train AI models and is never sold.',
  },
  {
    icon: Lock,
    title: 'Storage & Who We Share With',
    content: 'Your data is stored on your device and on our secure servers in the United States. We share it only with the providers that help operate the app — Apple (sign-in and payments), RevenueCat (subscriptions), and Anthropic (AI features). We never sell or rent your personal data.',
  },
  {
    icon: Trash2,
    title: 'Your Control & Choices',
    content: 'You can view and edit your data anytime in the app. You can delete your account whenever you like from Settings → Delete Account, and we will permanently delete your personal data within 30 days.',
  },
  {
    icon: Users,
    title: "Children's Privacy",
    content: 'My Lunar Phase is not intended for anyone under 13, and we do not knowingly collect personal data from children under 13.',
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
                Last Updated: July 2026
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
                className="text-sm mb-4"
              >
                We may update this policy from time to time; changes will be posted here with a new date. If you have any questions about our privacy practices, please reach out to us.
              </Text>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  Linking.openURL('mailto:mylunarphase@pm.me?subject=My Lunar Phase Support');
                }}
              >
                <LinearGradient
                  colors={['#f9a8d4', '#c4b5fd']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ borderRadius: 12, padding: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Mail size={16} color="#fff" />
                  <Text style={{ fontFamily: 'Quicksand_600SemiBold' }} className="text-white text-sm ml-2">
                    Contact Us
                  </Text>
                </LinearGradient>
              </Pressable>
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

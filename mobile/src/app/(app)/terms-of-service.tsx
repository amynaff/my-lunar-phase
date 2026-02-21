import React from 'react';
import { View, Text, ScrollView, Pressable, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { ArrowLeft, FileText, AlertTriangle, Scale, Users, Sparkles, Mail } from 'lucide-react-native';
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

const TERMS_SECTIONS = [
  {
    icon: FileText,
    title: 'Acceptance of Terms',
    content: 'By downloading, installing, or using My Lunar Phase, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the app.',
  },
  {
    icon: Sparkles,
    title: 'Use of the App',
    content: 'My Lunar Phase is designed to help you track and understand your menstrual cycle and wellness. The app provides:\n\n• Cycle tracking and predictions\n• Nutrition and movement guidance\n• Self-care recommendations\n• Community features\n\nYou agree to use the app for personal, non-commercial purposes only.',
  },
  {
    icon: AlertTriangle,
    title: 'Medical Disclaimer',
    content: 'My Lunar Phase is not a medical device and is not intended to diagnose, treat, cure, or prevent any disease or health condition.\n\nThe information provided is for educational and informational purposes only. Always consult with a qualified healthcare provider for medical advice, diagnosis, or treatment.\n\nNever disregard professional medical advice or delay seeking it because of something you read in this app.',
  },
  {
    icon: Users,
    title: 'Community Guidelines',
    content: 'When using our community features, you agree to:\n\n• Be respectful and supportive of others\n• Not post harmful, abusive, or inappropriate content\n• Not share personal identifying information\n• Not promote products or services\n• Report any concerning content\n\nWe reserve the right to remove content that violates these guidelines.',
  },
  {
    icon: Scale,
    title: 'Limitation of Liability',
    content: 'My Lunar Phase and its creators shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the app.\n\nThe app is provided "as is" without warranties of any kind. We do not guarantee the accuracy of cycle predictions or any health-related information.',
  },
];

export default function TermsOfServiceScreen() {
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
                  Terms of Service
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

          {/* Terms Sections */}
          {TERMS_SECTIONS.map((section, index) => {
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
                If you have any questions about these terms, please contact us.
              </Text>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  Linking.openURL('mailto:lunaflowapp@proton.me?subject=My Lunar Phase Terms Question');
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

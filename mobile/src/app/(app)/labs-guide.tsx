import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import {
  X,
  ChevronDown,
  ChevronUp,
  FlaskConical,
  Heart,
  Zap,
  Brain,
  Sparkles,
  Shield,
  Activity,
  Droplets,
  Sun,
  ExternalLink,
} from 'lucide-react-native';
import { useThemeStore, getTheme } from '@/lib/theme-store';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as Linking from 'expo-linking';
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

interface LabCategory {
  id: string;
  title: string;
  icon: typeof Heart;
  color: string;
  labs: string[];
  description: string;
}

const labCategories: LabCategory[] = [
  {
    id: 'basic',
    title: 'Basic Panels',
    icon: Activity,
    color: '#f472b6',
    description: 'Foundation tests for overall health',
    labs: ['CBC (Complete Blood Count)', 'CMP (Comprehensive Metabolic Panel)'],
  },
  {
    id: 'hormones',
    title: 'Sex Hormones',
    icon: Heart,
    color: '#c084fc',
    description: 'Key reproductive hormones',
    labs: [
      'Free & Total Testosterone',
      'Estrone + Estradiol',
      'Progesterone',
      'DHEA-S',
      'SHBG',
      'FSH',
      'LH',
      'Prolactin',
    ],
  },
  {
    id: 'thyroid',
    title: 'Thyroid Function',
    icon: Zap,
    color: '#fbbf24',
    description: 'Comprehensive thyroid assessment',
    labs: [
      'TSH',
      'Free T3',
      'Free T4',
      'Reverse T3',
      'TPO Antibodies',
      'Thyroglobulin Antibodies',
    ],
  },
  {
    id: 'metabolic',
    title: 'Metabolic Health',
    icon: Sparkles,
    color: '#34d399',
    description: 'Metabolism and blood sugar markers',
    labs: ['Cortisol AM', 'Fasting Insulin', 'HbA1C'],
  },
  {
    id: 'cardiovascular',
    title: 'Cardiovascular',
    icon: Brain,
    color: '#60a5fa',
    description: 'Heart and inflammation markers',
    labs: ['Lipid Panel', 'ApoB', 'Lp(a)', 'ESR', 'hs-CRP'],
  },
  {
    id: 'optional',
    title: 'Consider Adding',
    icon: Droplets,
    color: '#a78bfa',
    description: 'Additional helpful markers',
    labs: ['Vitamin D', 'AMH (Anti-Müllerian Hormone)', 'Inhibin B'],
  },
];

export default function LabsGuideScreen() {
  const insets = useSafeAreaInsets();
  const themeMode = useThemeStore(s => s.mode);
  const theme = getTheme(themeMode);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['hormones']);

  const [fontsLoaded] = useFonts({
    CormorantGaramond_400Regular,
    CormorantGaramond_600SemiBold,
    Quicksand_400Regular,
    Quicksand_500Medium,
    Quicksand_600SemiBold,
  });

  if (!fontsLoaded) return null;

  const toggleCategory = (id: string) => {
    Haptics.selectionAsync();
    setExpandedCategories(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleFunctionHealthLink = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL('https://my.functionhealth.com/signup?code=ANAFF10');
  };

  return (
    <View className="flex-1">
      <LinearGradient
        colors={theme.gradient}
        locations={[0, 0.25, 0.5, 0.75, 1]}
        style={{ flex: 1 }}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View
            entering={FadeInDown.delay(100).duration(600)}
            style={{ paddingTop: insets.top + 16 }}
            className="px-6"
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View
                  className="w-10 h-10 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: `${theme.accent.purple}20` }}
                >
                  <FlaskConical size={20} color={theme.accent.purple} />
                </View>
                <Text
                  style={{ fontFamily: 'CormorantGaramond_600SemiBold', color: theme.text.primary }}
                  className="text-2xl"
                >
                  Labs Guide
                </Text>
              </View>
              <Pressable
                onPress={() => router.back()}
                className="w-10 h-10 rounded-full items-center justify-center border"
                style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light }}
              >
                <X size={20} color={theme.accent.purple} />
              </Pressable>
            </View>
          </Animated.View>

          {/* Introduction Card */}
          <Animated.View
            entering={FadeInUp.delay(150).duration(600)}
            className="mx-6 mt-6"
          >
            <View
              className="rounded-2xl p-5 border"
              style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light }}
            >
              <Text
                style={{ fontFamily: 'CormorantGaramond_600SemiBold', color: theme.text.primary }}
                className="text-xl mb-3"
              >
                Knowledge is Power
              </Text>
              <Text
                style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.secondary, lineHeight: 22 }}
                className="text-sm"
              >
                I recommend every woman get a full hormone blood panel at least every year, if not every six months starting at the age of 35.
              </Text>
              <Text
                style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.secondary, lineHeight: 22 }}
                className="text-sm mt-3"
              >
                If your insurance doesn't cover it, there are many places where you can get reasonably priced labs.
              </Text>

              {/* Function Health Link */}
              <Pressable
                onPress={handleFunctionHealthLink}
                className="flex-row items-center mt-4 p-3 rounded-xl"
                style={{ backgroundColor: `${theme.accent.purple}15` }}
              >
                <Sun size={18} color={theme.accent.purple} />
                <View className="flex-1 ml-2">
                  <Text
                    style={{ fontFamily: 'Quicksand_500Medium', color: theme.accent.purple }}
                    className="text-sm"
                  >
                    Function Health
                  </Text>
                  <Text
                    style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.muted }}
                    className="text-xs"
                  >
                    Affiliate link
                  </Text>
                </View>
                <ExternalLink size={14} color={theme.accent.purple} />
              </Pressable>
            </View>
          </Animated.View>

          {/* Lab Categories */}
          <Animated.View
            entering={FadeInUp.delay(200).duration(600)}
            className="mx-6 mt-6"
          >
            <Text
              style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.accent }}
              className="text-xs uppercase tracking-wider mb-4"
            >
              Recommended Tests
            </Text>

            {labCategories.map((category, index) => {
              const isExpanded = expandedCategories.includes(category.id);
              const IconComponent = category.icon;

              return (
                <Animated.View
                  key={category.id}
                  entering={FadeInUp.delay(250 + index * 50).duration(500)}
                >
                  <Pressable
                    onPress={() => toggleCategory(category.id)}
                    className="rounded-2xl mb-3 border overflow-hidden"
                    style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light }}
                  >
                    {/* Category Header */}
                    <View className="p-4 flex-row items-center justify-between">
                      <View className="flex-row items-center flex-1">
                        <View
                          className="w-10 h-10 rounded-full items-center justify-center mr-3"
                          style={{ backgroundColor: `${category.color}20` }}
                        >
                          <IconComponent size={18} color={category.color} />
                        </View>
                        <View className="flex-1">
                          <Text
                            style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
                            className="text-base"
                          >
                            {category.title}
                          </Text>
                          <Text
                            style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.tertiary }}
                            className="text-xs"
                          >
                            {category.description}
                          </Text>
                        </View>
                      </View>
                      <View
                        className="w-8 h-8 rounded-full items-center justify-center"
                        style={{ backgroundColor: theme.bg.secondary }}
                      >
                        {isExpanded ? (
                          <ChevronUp size={16} color={theme.text.muted} />
                        ) : (
                          <ChevronDown size={16} color={theme.text.muted} />
                        )}
                      </View>
                    </View>

                    {/* Expanded Labs List */}
                    {isExpanded && (
                      <View
                        className="px-4 pb-4"
                        style={{ borderTopWidth: 1, borderTopColor: theme.border.light }}
                      >
                        <View className="pt-3">
                          {category.labs.map((lab, labIndex) => (
                            <View
                              key={labIndex}
                              className="flex-row items-center py-2"
                            >
                              <View
                                className="w-2 h-2 rounded-full mr-3"
                                style={{ backgroundColor: category.color }}
                              />
                              <Text
                                style={{ fontFamily: 'Quicksand_500Medium', color: theme.text.secondary }}
                                className="text-sm"
                              >
                                {lab}
                              </Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    )}
                  </Pressable>
                </Animated.View>
              );
            })}
          </Animated.View>

          {/* Important Note */}
          <Animated.View
            entering={FadeInUp.delay(500).duration(600)}
            className="mx-6 mt-4"
          >
            <LinearGradient
              colors={[`${theme.accent.purple}15`, `${theme.accent.rose}15`]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ borderRadius: 20, padding: 20, borderWidth: 1, borderColor: `${theme.accent.purple}30` }}
            >
              <View className="flex-row items-start">
                <Shield size={20} color={theme.accent.purple} />
                <View className="ml-3 flex-1">
                  <Text
                    style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
                    className="text-sm mb-2"
                  >
                    Most Importantly
                  </Text>
                  <Text
                    style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.secondary, lineHeight: 20 }}
                    className="text-sm"
                  >
                    You need a provider or doctor that you can trust to analyze the labs, discuss where they should optimally be, and then come up with a custom, realistic, understandable plan to help you execute.
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Disclaimer */}
          <Animated.View
            entering={FadeInUp.delay(550).duration(600)}
            className="mx-6 mt-6 items-center"
          >
            <Text
              style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.muted, textAlign: 'center', lineHeight: 18 }}
              className="text-xs px-4"
            >
              This information is for educational purposes only and is not a substitute for professional medical advice. Always consult with a qualified healthcare provider.
            </Text>
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

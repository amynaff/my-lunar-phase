import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { ClipboardList, Smile, Droplets, ChevronRight, Heart, Brain, Activity, Wind } from 'lucide-react-native';
import { useThemeStore, getTheme } from '@/lib/theme-store';
import { useCycleStore, phaseInfo, getMoonPhase, moonPhaseInfo, lifeStageInfo } from '@/lib/cycle-store';
import { router } from 'expo-router';
import { SymptomLogModal } from '@/components/SymptomLogModal';
import { LogPeriodModal } from '@/components/LogPeriodModal';
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

export default function LogScreen() {
  const insets = useSafeAreaInsets();
  const themeMode = useThemeStore(s => s.mode);
  const theme = getTheme(themeMode);
  const getCurrentPhase = useCycleStore(s => s.getCurrentPhase);
  const lifeStage = useCycleStore(s => s.lifeStage);

  const [showSymptomModal, setShowSymptomModal] = useState(false);
  const [showPeriodModal, setShowPeriodModal] = useState(false);

  const [fontsLoaded] = useFonts({
    CormorantGaramond_400Regular,
    CormorantGaramond_600SemiBold,
    Quicksand_400Regular,
    Quicksand_500Medium,
    Quicksand_600SemiBold,
  });

  const isNonCycling = lifeStage === 'menopause' || lifeStage === 'postmenopause';
  const currentPhase = getCurrentPhase();
  const info = phaseInfo[currentPhase];
  const stageInfo = lifeStageInfo[lifeStage];
  const currentMoon = getMoonPhase();
  const moonInfo = moonPhaseInfo[currentMoon];

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  // Build actions based on life stage
  const actions = [
    {
      icon: ClipboardList,
      title: 'Log Symptoms',
      description: isNonCycling
        ? 'Track how you feel today — hot flashes, sleep, mood & more'
        : 'Track physical symptoms and how you feel today',
      color: theme.accent.pink,
      onPress: () => setShowSymptomModal(true),
    },
    {
      icon: Smile,
      title: 'Log Mood & Energy',
      description: 'Record your emotional state and energy levels',
      color: theme.accent.purple,
      onPress: () => router.push('/log-mood' as any),
    },
    // Only show Log Period for cycling users
    ...(isNonCycling ? [] : [{
      icon: Droplets,
      title: 'Log Period',
      description: 'Track your menstrual flow and cycle data',
      color: theme.accent.rose,
      onPress: () => setShowPeriodModal(true),
    }]),
  ];

  if (!fontsLoaded) return null;

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={theme.gradient}
        locations={[0, 0.25, 0.5, 0.75, 1]}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 140 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View
            entering={FadeInDown.delay(100).duration(600)}
            style={{ paddingTop: insets.top + 16 }}
            className="px-6"
          >
            <Text
              style={{ fontFamily: 'CormorantGaramond_400Regular', color: theme.text.muted }}
              className="text-sm tracking-widest uppercase"
            >
              {dateStr}
            </Text>
            <Text
              style={{ fontFamily: 'CormorantGaramond_600SemiBold', color: theme.text.primary }}
              className="text-3xl mt-1"
            >
              Daily Log
            </Text>
          </Animated.View>

          {/* Phase/Stage Prompt */}
          <Animated.View
            entering={FadeInUp.delay(200).duration(600)}
            className="mx-6 mt-5"
          >
            <LinearGradient
              colors={isNonCycling
                ? [`${stageInfo.color}25`, `${stageInfo.color}10`]
                : [`${info.color}25`, `${info.color}10`]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ borderRadius: 20, padding: 18, borderWidth: 1, borderColor: isNonCycling ? `${stageInfo.color}30` : `${info.color}30` }}
            >
              <View className="flex-row items-center mb-2">
                <Text className="text-2xl mr-2">{isNonCycling ? moonInfo.emoji : info.emoji}</Text>
                <Text
                  style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
                  className="text-base"
                >
                  {isNonCycling ? stageInfo.name : `${info.name} Phase`}
                </Text>
              </View>
              <Text
                style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.secondary }}
                className="text-sm leading-5"
              >
                {isNonCycling
                  ? 'How are you feeling today? Take a moment to check in with your body and track your wellness.'
                  : `How are you feeling in your ${info.name.toLowerCase()} phase? Take a moment to check in with your body.`
                }
              </Text>
            </LinearGradient>
          </Animated.View>

          {/* Action Cards */}
          <Animated.View
            entering={FadeInUp.delay(300).duration(600)}
            className="mx-6 mt-6"
          >
            <Text
              style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
              className="text-lg mb-4"
            >
              What would you like to log?
            </Text>

            {actions.map((action, index) => (
              <Animated.View
                key={action.title}
                entering={FadeInUp.delay(350 + index * 80).duration(500)}
                className="mb-3"
              >
                <Pressable
                  onPress={action.onPress}
                  className="rounded-2xl p-5 border flex-row items-center"
                  style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light }}
                >
                  <View
                    className="w-14 h-14 rounded-2xl items-center justify-center mr-4"
                    style={{ backgroundColor: `${action.color}15` }}
                  >
                    <action.icon size={26} color={action.color} />
                  </View>
                  <View className="flex-1">
                    <Text
                      style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
                      className="text-base mb-0.5"
                    >
                      {action.title}
                    </Text>
                    <Text
                      style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.tertiary }}
                      className="text-xs leading-4"
                    >
                      {action.description}
                    </Text>
                  </View>
                  <ChevronRight size={18} color={theme.text.muted} />
                </Pressable>
              </Animated.View>
            ))}
          </Animated.View>
        </ScrollView>
      </LinearGradient>

      <SymptomLogModal
        visible={showSymptomModal}
        onClose={() => setShowSymptomModal(false)}
      />

      <LogPeriodModal
        visible={showPeriodModal}
        onClose={() => setShowPeriodModal(false)}
        themeMode={themeMode}
      />
    </View>
  );
}

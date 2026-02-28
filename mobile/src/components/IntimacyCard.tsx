import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { Heart, ChevronDown, ChevronUp, Sparkles, Users, Info, Flame } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useThemeStore, getTheme, ThemeMode } from '@/lib/theme-store';
import {
  useCycleStore,
  phaseInfo,
  phaseIntimacyInfo,
  perimenopauseIntimacyInfo,
  menopauseIntimacyInfo,
  postmenopauseIntimacyInfo,
  CyclePhase,
  LifeStage,
} from '@/lib/cycle-store';

interface IntimacyCardProps {
  themeMode?: ThemeMode;
}

export function IntimacyCard({ themeMode: propThemeMode }: IntimacyCardProps) {
  const storeThemeMode = useThemeStore((s) => s.mode);
  const themeMode = propThemeMode ?? storeThemeMode;
  const theme = getTheme(themeMode);
  const getCurrentPhase = useCycleStore((s) => s.getCurrentPhase);
  const lifeStage = useCycleStore((s) => s.lifeStage);

  const [showTips, setShowTips] = useState(false);
  const [showPartnerTips, setShowPartnerTips] = useState(false);
  const [showPhysiology, setShowPhysiology] = useState(false);

  const currentPhase = getCurrentPhase();

  // Get the appropriate info based on life stage
  const getIntimacyInfo = () => {
    switch (lifeStage) {
      case 'perimenopause':
        return { type: 'perimenopause', data: perimenopauseIntimacyInfo };
      case 'menopause':
        return { type: 'menopause', data: menopauseIntimacyInfo };
      case 'postmenopause':
        return { type: 'postmenopause', data: postmenopauseIntimacyInfo };
      default:
        return { type: 'cycle', data: phaseIntimacyInfo[currentPhase] };
    }
  };

  const info = getIntimacyInfo();

  const toggleSection = (section: 'tips' | 'partner' | 'physiology') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (section === 'tips') setShowTips(!showTips);
    if (section === 'partner') setShowPartnerTips(!showPartnerTips);
    if (section === 'physiology') setShowPhysiology(!showPhysiology);
  };

  const getLibidoColor = (level: string) => {
    switch (level) {
      case 'peak':
        return '#ec4899';
      case 'rising':
        return '#f59e0b';
      case 'low':
        return '#6b7280';
      case 'variable':
        return '#8b5cf6';
      default:
        return theme.accent.purple;
    }
  };

  const getLibidoLabel = (level: string) => {
    switch (level) {
      case 'peak':
        return 'Peak Desire';
      case 'rising':
        return 'Rising';
      case 'low':
        return 'Lower';
      case 'variable':
        return 'Variable';
      default:
        return 'Normal';
    }
  };

  // Render for menstrual cycle phases
  if (info.type === 'cycle') {
    const cycleInfo = info.data as typeof phaseIntimacyInfo['menstrual'];
    const libidoColor = getLibidoColor(cycleInfo.libidoLevel);

    return (
      <View
        className="rounded-3xl overflow-hidden"
        style={{ borderWidth: 1, borderColor: theme.border.light }}
      >
        <LinearGradient
          colors={[`${theme.accent.pink}15`, `${theme.accent.purple}10`]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ padding: 20 }}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <View
                className="w-10 h-10 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: `${theme.accent.pink}25` }}
              >
                <Heart size={20} color={theme.accent.pink} />
              </View>
              <View>
                <Text
                  style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
                  className="text-base"
                >
                  Intimacy & Desire
                </Text>
                <Text
                  style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.tertiary }}
                  className="text-xs"
                >
                  {cycleInfo.title}
                </Text>
              </View>
            </View>
            {/* Libido Level Badge */}
            <View
              className="px-3 py-1.5 rounded-full flex-row items-center"
              style={{ backgroundColor: `${libidoColor}20` }}
            >
              <Flame size={12} color={libidoColor} />
              <Text
                style={{ fontFamily: 'Quicksand_600SemiBold', color: libidoColor }}
                className="text-xs ml-1"
              >
                {getLibidoLabel(cycleInfo.libidoLevel)}
              </Text>
            </View>
          </View>

          {/* Description */}
          <Text
            style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.secondary }}
            className="text-sm leading-5 mb-4"
          >
            {cycleInfo.description}
          </Text>

          {/* Physiology Section (Collapsible) */}
          <Pressable
            onPress={() => toggleSection('physiology')}
            className="flex-row items-center justify-between py-3 border-t"
            style={{ borderTopColor: theme.border.light }}
          >
            <View className="flex-row items-center">
              <Info size={16} color={theme.accent.purple} />
              <Text
                style={{ fontFamily: 'Quicksand_500Medium', color: theme.text.primary }}
                className="text-sm ml-2"
              >
                What's happening in your body
              </Text>
            </View>
            {showPhysiology ? (
              <ChevronUp size={18} color={theme.text.tertiary} />
            ) : (
              <ChevronDown size={18} color={theme.text.tertiary} />
            )}
          </Pressable>
          {showPhysiology && (
            <Animated.View entering={FadeIn.duration(200)} className="pb-3">
              <Text
                style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.secondary }}
                className="text-sm leading-5"
              >
                {cycleInfo.physiology}
              </Text>
            </Animated.View>
          )}

          {/* Tips Section (Collapsible) */}
          <Pressable
            onPress={() => toggleSection('tips')}
            className="flex-row items-center justify-between py-3 border-t"
            style={{ borderTopColor: theme.border.light }}
          >
            <View className="flex-row items-center">
              <Sparkles size={16} color={theme.accent.pink} />
              <Text
                style={{ fontFamily: 'Quicksand_500Medium', color: theme.text.primary }}
                className="text-sm ml-2"
              >
                Tips for you
              </Text>
            </View>
            {showTips ? (
              <ChevronUp size={18} color={theme.text.tertiary} />
            ) : (
              <ChevronDown size={18} color={theme.text.tertiary} />
            )}
          </Pressable>
          {showTips && (
            <Animated.View entering={FadeIn.duration(200)} className="pb-3">
              {cycleInfo.tips.map((tip, index) => (
                <View key={index} className="flex-row items-start mb-2">
                  <View
                    className="w-5 h-5 rounded-full items-center justify-center mr-2 mt-0.5"
                    style={{ backgroundColor: `${theme.accent.pink}15` }}
                  >
                    <Text style={{ color: theme.accent.pink, fontSize: 10, fontWeight: '600' }}>
                      {index + 1}
                    </Text>
                  </View>
                  <Text
                    style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.secondary, flex: 1 }}
                    className="text-sm leading-5"
                  >
                    {tip}
                  </Text>
                </View>
              ))}
            </Animated.View>
          )}

          {/* Partner Tips Section (Collapsible) */}
          <Pressable
            onPress={() => toggleSection('partner')}
            className="flex-row items-center justify-between py-3 border-t"
            style={{ borderTopColor: theme.border.light }}
          >
            <View className="flex-row items-center">
              <Users size={16} color={theme.accent.purple} />
              <Text
                style={{ fontFamily: 'Quicksand_500Medium', color: theme.text.primary }}
                className="text-sm ml-2"
              >
                For your partner
              </Text>
            </View>
            {showPartnerTips ? (
              <ChevronUp size={18} color={theme.text.tertiary} />
            ) : (
              <ChevronDown size={18} color={theme.text.tertiary} />
            )}
          </Pressable>
          {showPartnerTips && (
            <Animated.View entering={FadeIn.duration(200)}>
              {cycleInfo.partnerTips.map((tip, index) => (
                <View key={index} className="flex-row items-start mb-2">
                  <View
                    className="w-5 h-5 rounded-full items-center justify-center mr-2 mt-0.5"
                    style={{ backgroundColor: `${theme.accent.purple}15` }}
                  >
                    <Text style={{ color: theme.accent.purple, fontSize: 10, fontWeight: '600' }}>
                      {index + 1}
                    </Text>
                  </View>
                  <Text
                    style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.secondary, flex: 1 }}
                    className="text-sm leading-5"
                  >
                    {tip}
                  </Text>
                </View>
              ))}
            </Animated.View>
          )}
        </LinearGradient>
      </View>
    );
  }

  // Render for perimenopause/menopause/postmenopause
  const lifeStageInfo = info.data as typeof perimenopauseIntimacyInfo;

  return (
    <View
      className="rounded-3xl overflow-hidden"
      style={{ borderWidth: 1, borderColor: theme.border.light }}
    >
      <LinearGradient
        colors={[`${theme.accent.pink}15`, `${theme.accent.purple}10`]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ padding: 20 }}
      >
        {/* Header */}
        <View className="flex-row items-center mb-3">
          <View
            className="w-10 h-10 rounded-full items-center justify-center mr-3"
            style={{ backgroundColor: `${theme.accent.pink}25` }}
          >
            <Heart size={20} color={theme.accent.pink} />
          </View>
          <View className="flex-1">
            <Text
              style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
              className="text-base"
            >
              Intimacy & Connection
            </Text>
            <Text
              style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.tertiary }}
              className="text-xs"
            >
              {lifeStageInfo.title}
            </Text>
          </View>
        </View>

        {/* Description */}
        <Text
          style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.secondary }}
          className="text-sm leading-5 mb-4"
        >
          {lifeStageInfo.description}
        </Text>

        {/* Physiology Section */}
        <Pressable
          onPress={() => toggleSection('physiology')}
          className="flex-row items-center justify-between py-3 border-t"
          style={{ borderTopColor: theme.border.light }}
        >
          <View className="flex-row items-center">
            <Info size={16} color={theme.accent.purple} />
            <Text
              style={{ fontFamily: 'Quicksand_500Medium', color: theme.text.primary }}
              className="text-sm ml-2"
            >
              Understanding the changes
            </Text>
          </View>
          {showPhysiology ? (
            <ChevronUp size={18} color={theme.text.tertiary} />
          ) : (
            <ChevronDown size={18} color={theme.text.tertiary} />
          )}
        </Pressable>
        {showPhysiology && (
          <Animated.View entering={FadeIn.duration(200)} className="pb-3">
            <Text
              style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.secondary }}
              className="text-sm leading-5 mb-3"
            >
              {lifeStageInfo.physiology}
            </Text>
            {'commonChanges' in lifeStageInfo && (
              <View className="mt-2">
                <Text
                  style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
                  className="text-xs uppercase tracking-wider mb-2"
                >
                  Common Changes
                </Text>
                {(lifeStageInfo as typeof perimenopauseIntimacyInfo).commonChanges.map((change, index) => (
                  <View key={index} className="flex-row items-center mb-1.5">
                    <View
                      className="w-1.5 h-1.5 rounded-full mr-2"
                      style={{ backgroundColor: theme.accent.pink }}
                    />
                    <Text
                      style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.secondary }}
                      className="text-sm"
                    >
                      {change}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </Animated.View>
        )}

        {/* Tips Section */}
        <Pressable
          onPress={() => toggleSection('tips')}
          className="flex-row items-center justify-between py-3 border-t"
          style={{ borderTopColor: theme.border.light }}
        >
          <View className="flex-row items-center">
            <Sparkles size={16} color={theme.accent.pink} />
            <Text
              style={{ fontFamily: 'Quicksand_500Medium', color: theme.text.primary }}
              className="text-sm ml-2"
            >
              Tips for intimacy
            </Text>
          </View>
          {showTips ? (
            <ChevronUp size={18} color={theme.text.tertiary} />
          ) : (
            <ChevronDown size={18} color={theme.text.tertiary} />
          )}
        </Pressable>
        {showTips && (
          <Animated.View entering={FadeIn.duration(200)} className="pb-3">
            {lifeStageInfo.tips.map((tip, index) => (
              <View key={index} className="flex-row items-start mb-2">
                <View
                  className="w-5 h-5 rounded-full items-center justify-center mr-2 mt-0.5"
                  style={{ backgroundColor: `${theme.accent.pink}15` }}
                >
                  <Text style={{ color: theme.accent.pink, fontSize: 10, fontWeight: '600' }}>
                    {index + 1}
                  </Text>
                </View>
                <Text
                  style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.secondary, flex: 1 }}
                  className="text-sm leading-5"
                >
                  {tip}
                </Text>
              </View>
            ))}
          </Animated.View>
        )}

        {/* Partner Tips Section */}
        <Pressable
          onPress={() => toggleSection('partner')}
          className="flex-row items-center justify-between py-3 border-t"
          style={{ borderTopColor: theme.border.light }}
        >
          <View className="flex-row items-center">
            <Users size={16} color={theme.accent.purple} />
            <Text
              style={{ fontFamily: 'Quicksand_500Medium', color: theme.text.primary }}
              className="text-sm ml-2"
            >
              For your partner
            </Text>
          </View>
          {showPartnerTips ? (
            <ChevronUp size={18} color={theme.text.tertiary} />
          ) : (
            <ChevronDown size={18} color={theme.text.tertiary} />
          )}
        </Pressable>
        {showPartnerTips && (
          <Animated.View entering={FadeIn.duration(200)}>
            {lifeStageInfo.partnerTips.map((tip, index) => (
              <View key={index} className="flex-row items-start mb-2">
                <View
                  className="w-5 h-5 rounded-full items-center justify-center mr-2 mt-0.5"
                  style={{ backgroundColor: `${theme.accent.purple}15` }}
                >
                  <Text style={{ color: theme.accent.purple, fontSize: 10, fontWeight: '600' }}>
                    {index + 1}
                  </Text>
                </View>
                <Text
                  style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.secondary, flex: 1 }}
                  className="text-sm leading-5"
                >
                  {tip}
                </Text>
              </View>
            ))}
          </Animated.View>
        )}

        {/* Positives section for menopause/postmenopause */}
        {'positives' in lifeStageInfo && (
          <View className="mt-4 pt-4 border-t" style={{ borderTopColor: theme.border.light }}>
            <View className="flex-row items-center mb-3">
              <Sparkles size={14} color="#f59e0b" />
              <Text
                style={{ fontFamily: 'Quicksand_600SemiBold', color: '#f59e0b' }}
                className="text-xs uppercase tracking-wider ml-2"
              >
                The Silver Lining
              </Text>
            </View>
            <View className="flex-row flex-wrap" style={{ gap: 8 }}>
              {(lifeStageInfo as typeof menopauseIntimacyInfo).positives.map((positive, index) => (
                <View
                  key={index}
                  className="px-3 py-1.5 rounded-full"
                  style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)' }}
                >
                  <Text
                    style={{ fontFamily: 'Quicksand_400Regular', color: '#f59e0b' }}
                    className="text-xs"
                  >
                    {positive}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </LinearGradient>
    </View>
  );
}

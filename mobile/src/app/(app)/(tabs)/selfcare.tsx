import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import {
  Heart,
  Sparkles,
  Moon,
  Sun,
  Bath,
  BookOpen,
  Music,
  Coffee,
  Bed,
  Smile,
  MessageCircle,
  Flower2,
  Leaf,
  Brain,
  Wind,
  Users,
} from 'lucide-react-native';
import { useCycleStore, phaseInfo, CyclePhase, lifeStageInfo, getMoonPhase, moonPhaseInfo, getMoonPhaseCycleEquivalent } from '@/lib/cycle-store';
import { MoonPhaseCard, moonCycleEducation } from '@/components/MoonPhaseCard';
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

interface SelfCareActivity {
  name: string;
  description: string;
  icon: typeof Heart;
}

interface EmotionalSupport {
  feeling: string;
  normalcy: string;
  tip: string;
}

const phaseSelfCare: Record<CyclePhase, {
  theme: string;
  description: string;
  activities: SelfCareActivity[];
  emotions: EmotionalSupport[];
  affirmations: string[];
  journalPrompts: string[];
}> = {
  menstrual: {
    theme: 'Rest & Reflect',
    description: 'This is your inner winter. Give yourself permission to slow down, rest deeply, and turn inward.',
    activities: [
      { name: 'Warm Bath', description: 'Add epsom salts for muscle relief', icon: Bath },
      { name: 'Gentle Journaling', description: 'Reflect on the past month', icon: BookOpen },
      { name: 'Cozy Movies', description: 'Comfort watching without guilt', icon: Music },
      { name: 'Napping', description: 'Extra sleep is healing', icon: Bed },
      { name: 'Hot Drinks', description: 'Herbal tea or warm cocoa', icon: Coffee },
      { name: 'Saying No', description: 'Cancel plans guilt-free', icon: Moon },
    ],
    emotions: [
      { feeling: 'Fatigue', normalcy: 'Completely normal', tip: 'Rest is productive during this phase' },
      { feeling: 'Introspection', normalcy: 'Natural tendency', tip: 'Use this time for self-reflection' },
      { feeling: 'Emotional sensitivity', normalcy: 'Hormonal shift', tip: 'Be extra gentle with yourself' },
    ],
    affirmations: [
      'I deserve rest and restoration',
      'My body knows what it needs',
      'Slowing down is a form of self-love',
      'I release what no longer serves me',
    ],
    journalPrompts: [
      'What do I need to release from this cycle?',
      'How can I be gentler with myself today?',
      'What brought me joy this past month?',
    ],
  },
  follicular: {
    theme: 'Create & Explore',
    description: 'Your inner spring has arrived! Fresh energy wants to be channeled into new projects and experiences.',
    activities: [
      { name: 'Start New Projects', description: 'Your creativity is peaking', icon: Sparkles },
      { name: 'Social Plans', description: 'Energy for connecting', icon: MessageCircle },
      { name: 'Try Something New', description: 'Learn a skill, visit somewhere', icon: Sun },
      { name: 'Creative Expression', description: 'Art, writing, crafts', icon: Flower2 },
      { name: 'Plan & Organize', description: 'Great mental clarity now', icon: BookOpen },
      { name: 'Morning Rituals', description: 'Establish energizing routines', icon: Coffee },
    ],
    emotions: [
      { feeling: 'Optimism', normalcy: 'Rising estrogen', tip: 'Capture this energy in plans' },
      { feeling: 'Curiosity', normalcy: 'Brain is sharp', tip: 'Learn something new' },
      { feeling: 'Confidence growing', normalcy: 'Natural progression', tip: 'Take on new challenges' },
    ],
    affirmations: [
      'I am open to new possibilities',
      'My creativity flows freely',
      'I embrace new beginnings with joy',
      'I have the energy to pursue my dreams',
    ],
    journalPrompts: [
      'What new project excites me most?',
      'What do I want to create this cycle?',
      'Where does my curiosity lead me?',
    ],
  },
  ovulatory: {
    theme: 'Connect & Shine',
    description: 'Your inner summer is here! You\'re magnetic and communicative. Perfect time for important conversations.',
    activities: [
      { name: 'Important Conversations', description: 'Communication skills peak', icon: MessageCircle },
      { name: 'Date Nights', description: 'Connection feels natural', icon: Heart },
      { name: 'Networking', description: 'Your charisma is high', icon: Smile },
      { name: 'Public Speaking', description: 'Confidence is highest', icon: Sun },
      { name: 'Celebrations', description: 'Host or attend gatherings', icon: Sparkles },
      { name: 'Self-Expression', description: 'Dress up, feel radiant', icon: Flower2 },
    ],
    emotions: [
      { feeling: 'Confidence', normalcy: 'Peak estrogen effect', tip: 'Use it for bold moves' },
      { feeling: 'Social energy', normalcy: 'Biological design', tip: 'Connect deeply with others' },
      { feeling: 'Radiance', normalcy: 'Natural glow time', tip: 'Schedule photos, events' },
    ],
    affirmations: [
      'I radiate confidence and warmth',
      'My voice deserves to be heard',
      'I attract wonderful connections',
      'I celebrate my power and presence',
    ],
    journalPrompts: [
      'What important truth do I need to speak?',
      'How can I nurture my relationships?',
      'What makes me feel most confident?',
    ],
  },
  luteal: {
    theme: 'Complete & Nurture',
    description: 'Your inner autumn calls for completion and self-nurturing. Finish projects, nest at home, and honor your need for comfort.',
    activities: [
      { name: 'Finish Projects', description: 'Detail-oriented thinking', icon: BookOpen },
      { name: 'Home Nesting', description: 'Organize, clean, cozy up', icon: Moon },
      { name: 'Comfort Activities', description: 'Baking, crafts, hobbies', icon: Coffee },
      { name: 'Boundary Setting', description: 'It\'s okay to need space', icon: Heart },
      { name: 'Gentle Movement', description: 'Yoga, walks, stretching', icon: Flower2 },
      { name: 'Early Bedtimes', description: 'Honor your need for rest', icon: Bed },
    ],
    emotions: [
      { feeling: 'Need for solitude', normalcy: 'Progesterone effect', tip: 'Honor your boundaries' },
      { feeling: 'Irritability', normalcy: 'Hormone fluctuation', tip: 'This will pass - be patient' },
      { feeling: 'Detail-focused', normalcy: 'Natural strength now', tip: 'Review and complete tasks' },
    ],
    affirmations: [
      'I honor my need for rest and space',
      'My feelings are valid and temporary',
      'I am enough exactly as I am',
      'I trust my body\'s wisdom',
    ],
    journalPrompts: [
      'What do I need to complete before my next cycle?',
      'How can I create more comfort in my life?',
      'What boundaries do I need to set?',
    ],
  },
};

// Perimenopause self-care
const perimenopauseSelfCare = {
  theme: 'Navigate & Nurture',
  description: 'Perimenopause is a profound transition. Honor the changes with compassion, support your body, and embrace this powerful shift.',
  activities: [
    { name: 'Stress Management', description: 'Meditation, breathing exercises', icon: Wind },
    { name: 'Sleep Hygiene', description: 'Cool room, consistent schedule', icon: Bed },
    { name: 'Connection', description: 'Talk to others going through this', icon: Users },
    { name: 'Journaling', description: 'Track symptoms and patterns', icon: BookOpen },
    { name: 'Cooling Practices', description: 'Cold water, fans, light clothing', icon: Coffee },
    { name: 'Brain Games', description: 'Puzzles, learning to support cognition', icon: Brain },
  ],
  emotions: [
    { feeling: 'Mood swings', normalcy: 'Hormone fluctuations', tip: 'Practice self-compassion - this is temporary' },
    { feeling: 'Anxiety', normalcy: 'Common during transition', tip: 'Try breathing exercises and grounding' },
    { feeling: 'Brain fog', normalcy: 'Estrogen affects cognition', tip: 'Lists, routines, and sleep help' },
    { feeling: 'Irritability', normalcy: 'Part of the process', tip: 'Take breaks, communicate your needs' },
  ],
  affirmations: [
    'My body is transitioning, not failing',
    'I embrace this powerful phase of life',
    'I deserve patience and understanding',
    'My wisdom grows with each passing day',
    'This transition is leading me to freedom',
  ],
  journalPrompts: [
    'What symptoms am I noticing, and what triggers them?',
    'How can I be more patient with myself during this transition?',
    'What support do I need right now?',
    'What wisdom have I gained that I want to carry forward?',
  ],
};

// Menopause self-care
const menopauseSelfCare = {
  theme: 'Embrace & Thrive',
  description: 'Welcome to your second spring! Menopause is not an ending but a new beginning. Focus on what lights you up and live fully.',
  activities: [
    { name: 'Pursue Passions', description: 'Time to focus on you', icon: Sparkles },
    { name: 'Community', description: 'Connect with like-minded women', icon: Users },
    { name: 'Self-Care Rituals', description: 'Skincare, massage, pampering', icon: Flower2 },
    { name: 'Mindfulness', description: 'Meditation and presence', icon: Wind },
    { name: 'Creative Expression', description: 'Art, writing, music', icon: Music },
    { name: 'Adventure', description: 'Travel, new experiences', icon: Sun },
  ],
  emotions: [
    { feeling: 'Liberation', normalcy: 'Common experience', tip: 'Embrace the freedom of this stage' },
    { feeling: 'Identity shifts', normalcy: 'Natural process', tip: 'Explore who you are becoming' },
    { feeling: 'Wisdom', normalcy: 'Life experience shining', tip: 'Share your knowledge with others' },
    { feeling: 'Occasional sadness', normalcy: 'Grief for the past', tip: 'Allow it, then look forward' },
  ],
  affirmations: [
    'I am entering the most powerful phase of my life',
    'My best years are ahead of me',
    'I am wise, beautiful, and full of purpose',
    'I celebrate the woman I have become',
    'My experience makes me invaluable',
  ],
  journalPrompts: [
    'What do I want this chapter of my life to look like?',
    'What dreams have I set aside that I can pursue now?',
    'How do I want to share my wisdom with the world?',
    'What brings me the most joy and fulfillment?',
  ],
};

export default function SelfCareScreen() {
  const insets = useSafeAreaInsets();
  const getCurrentPhase = useCycleStore(s => s.getCurrentPhase);
  const lifeStage = useCycleStore(s => s.lifeStage);
  const themeMode = useThemeStore(s => s.mode);
  const theme = getTheme(themeMode);

  const [fontsLoaded] = useFonts({
    CormorantGaramond_400Regular,
    CormorantGaramond_600SemiBold,
    Quicksand_400Regular,
    Quicksand_500Medium,
    Quicksand_600SemiBold,
  });

  if (!fontsLoaded) return null;

  const currentPhase = getCurrentPhase();
  const info = phaseInfo[currentPhase];
  const stageInfo = lifeStageInfo[lifeStage];

  // Get accent color based on life stage
  const getAccentColor = () => {
    switch (lifeStage) {
      case 'perimenopause': return '#f59e0b';
      case 'menopause': return '#8b5cf6';
      default: return theme.accent.purple;
    }
  };
  const accentColor = getAccentColor();

  // Get title based on life stage
  const getTitle = () => {
    switch (lifeStage) {
      case 'perimenopause': return 'Lunar Self-Care';
      case 'menopause': return 'Moon-Guided Wellness';
      default: return 'Nurture Your Soul';
    }
  };

  // Get gradient colors based on life stage
  const getGradientColors = (): [string, string] => {
    switch (lifeStage) {
      case 'perimenopause': return ['rgba(251, 191, 36, 0.2)', 'rgba(245, 158, 11, 0.1)'];
      case 'menopause': return ['rgba(139, 92, 246, 0.2)', 'rgba(167, 139, 250, 0.1)'];
      default: return ['rgba(249, 168, 212, 0.2)', 'rgba(196, 181, 253, 0.2)'];
    }
  };

  const renderLifeStageContent = () => {
    if (lifeStage === 'regular') {
      const selfCare = phaseSelfCare[currentPhase];
      return (
        <>
          {/* Phase Card */}
          <Animated.View entering={FadeInUp.delay(200).duration(600)} className="mx-6 mt-6">
            <View className="rounded-2xl p-4 border" style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light }}>
              <View className="flex-row items-center mb-3">
                <View className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{ backgroundColor: `${info.color}20` }}>
                  <Text className="text-xl">{info.emoji}</Text>
                </View>
                <View className="flex-1">
                  <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }} className="text-base">
                    {info.name} Phase
                  </Text>
                  <Text style={{ fontFamily: 'Quicksand_500Medium', color: theme.text.accent }} className="text-sm">
                    {selfCare.theme}
                  </Text>
                </View>
              </View>
              <Text style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.secondary }} className="text-sm leading-5">
                {selfCare.description}
              </Text>
            </View>
          </Animated.View>

          {/* Activities Grid */}
          <Animated.View entering={FadeInUp.delay(300).duration(600)} className="mt-8 px-6">
            <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }} className="text-lg mb-4">
              Self-Care Activities
            </Text>
            <View className="flex-row flex-wrap justify-between">
              {selfCare.activities.map((activity, index) => (
                <Animated.View key={activity.name} entering={FadeInUp.delay(400 + index * 50).duration(500)} style={{ width: '48%' }} className="mb-3">
                  <View className="rounded-2xl p-4 border" style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light }}>
                    <View className="w-10 h-10 rounded-full items-center justify-center mb-3" style={{ backgroundColor: `${info.color}20` }}>
                      <activity.icon size={20} color={info.color} />
                    </View>
                    <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }} className="text-sm">
                      {activity.name}
                    </Text>
                    <Text style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.tertiary }} className="text-xs mt-1">
                      {activity.description}
                    </Text>
                  </View>
                </Animated.View>
              ))}
            </View>
          </Animated.View>

          {/* Emotional Support */}
          <Animated.View entering={FadeInUp.delay(700).duration(600)} className="mx-6 mt-6">
            <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }} className="text-lg mb-4">
              Emotional Support
            </Text>
            <View className="rounded-2xl border overflow-hidden" style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light }}>
              {selfCare.emotions.map((emotion, index) => (
                <View key={emotion.feeling} className={`p-4 ${index > 0 ? 'border-t' : ''}`} style={{ borderTopColor: theme.border.light }}>
                  <View className="flex-row items-center justify-between mb-2">
                    <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }} className="text-sm">
                      {emotion.feeling}
                    </Text>
                    <View className="px-2 py-1 rounded-full" style={{ backgroundColor: `${theme.accent.purple}15` }}>
                      <Text style={{ fontFamily: 'Quicksand_500Medium', color: theme.accent.purple }} className="text-xs">
                        {emotion.normalcy}
                      </Text>
                    </View>
                  </View>
                  <Text style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.tertiary }} className="text-xs">
                    {emotion.tip}
                  </Text>
                </View>
              ))}
            </View>
          </Animated.View>

          {/* Affirmations */}
          {renderAffirmations(selfCare.affirmations)}

          {/* Journal Prompts */}
          {renderJournalPrompts(selfCare.journalPrompts)}
        </>
      );
    } else {
      const selfCare = lifeStage === 'perimenopause' ? perimenopauseSelfCare : menopauseSelfCare;
      const iconComponent = lifeStage === 'perimenopause' ? Leaf : Sun;

      // Get moon phase info for peri/menopause
      const currentMoon = getMoonPhase();
      const moonInfo = moonPhaseInfo[currentMoon];
      const moonCyclePhase = getMoonPhaseCycleEquivalent(currentMoon);
      const moonCycleInfo = phaseInfo[moonCyclePhase];
      const moonPhaseSelfCare = phaseSelfCare[moonCyclePhase];
      const moonPractices = moonCycleEducation.phases[currentMoon];

      return (
        <>
          {/* Moon Phase Card */}
          <Animated.View entering={FadeInUp.delay(200).duration(600)} className="mx-6 mt-6">
            <MoonPhaseCard compact showEducation={false} />
          </Animated.View>

          {/* Moon-Based Self-Care Guidance */}
          <Animated.View entering={FadeInUp.delay(250).duration(600)} className="mx-6 mt-4">
            <View
              className="rounded-2xl p-4 border"
              style={{ backgroundColor: `${moonInfo.color}10`, borderColor: `${moonInfo.color}30` }}
            >
              <View className="flex-row items-center mb-2">
                <Moon size={16} color={accentColor} />
                <Text
                  style={{ fontFamily: 'Quicksand_600SemiBold', color: accentColor }}
                  className="text-xs uppercase tracking-wider ml-2"
                >
                  {moonPractices.focus}
                </Text>
              </View>
              <Text
                style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.secondary }}
                className="text-sm leading-5"
              >
                The {moonInfo.name.toLowerCase()} invites {moonInfo.energy.toLowerCase()} energy.
                Let this guide your self-care today alongside your {lifeStage === 'perimenopause' ? 'transition' : 'menopause'} practices.
              </Text>
            </View>
          </Animated.View>

          {/* Moon Phase Practices */}
          <Animated.View entering={FadeInUp.delay(300).duration(600)} className="mt-6 px-6">
            <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }} className="text-lg mb-4">
              {moonInfo.emoji} {moonInfo.name} Self-Care
            </Text>
            <View className="flex-row flex-wrap justify-between">
              {moonPhaseSelfCare.activities.slice(0, 4).map((activity, index) => (
                <Animated.View key={activity.name} entering={FadeInUp.delay(350 + index * 50).duration(500)} style={{ width: '48%' }} className="mb-3">
                  <View className="rounded-2xl p-4 border" style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light }}>
                    <View className="w-10 h-10 rounded-full items-center justify-center mb-3" style={{ backgroundColor: `${moonCycleInfo.color}20` }}>
                      <activity.icon size={20} color={moonCycleInfo.color} />
                    </View>
                    <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }} className="text-sm">
                      {activity.name}
                    </Text>
                    <Text style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.tertiary }} className="text-xs mt-1">
                      {activity.description}
                    </Text>
                  </View>
                </Animated.View>
              ))}
            </View>
          </Animated.View>

          {/* Life Stage Activities */}
          <Animated.View entering={FadeInUp.delay(500).duration(600)} className="mt-4 px-6">
            <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }} className="text-lg mb-4">
              {lifeStage === 'perimenopause' ? 'Perimenopause' : 'Menopause'} Self-Care
            </Text>
            <View className="flex-row flex-wrap justify-between">
              {selfCare.activities.map((activity, index) => (
                <Animated.View key={activity.name} entering={FadeInUp.delay(550 + index * 50).duration(500)} style={{ width: '48%' }} className="mb-3">
                  <View className="rounded-2xl p-4 border" style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light }}>
                    <View className="w-10 h-10 rounded-full items-center justify-center mb-3" style={{ backgroundColor: `${accentColor}20` }}>
                      <activity.icon size={20} color={accentColor} />
                    </View>
                    <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }} className="text-sm">
                      {activity.name}
                    </Text>
                    <Text style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.tertiary }} className="text-xs mt-1">
                      {activity.description}
                    </Text>
                  </View>
                </Animated.View>
              ))}
            </View>
          </Animated.View>

          {/* Emotional Support */}
          <Animated.View entering={FadeInUp.delay(700).duration(600)} className="mx-6 mt-6">
            <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }} className="text-lg mb-4">
              Emotional Support
            </Text>
            <View className="rounded-2xl border overflow-hidden" style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light }}>
              {selfCare.emotions.map((emotion, index) => (
                <View key={emotion.feeling} className={`p-4 ${index > 0 ? 'border-t' : ''}`} style={{ borderTopColor: theme.border.light }}>
                  <View className="flex-row items-center justify-between mb-2">
                    <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }} className="text-sm">
                      {emotion.feeling}
                    </Text>
                    <View className="px-2 py-1 rounded-full" style={{ backgroundColor: `${accentColor}15` }}>
                      <Text style={{ fontFamily: 'Quicksand_500Medium', color: accentColor }} className="text-xs">
                        {emotion.normalcy}
                      </Text>
                    </View>
                  </View>
                  <Text style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.tertiary }} className="text-xs">
                    {emotion.tip}
                  </Text>
                </View>
              ))}
            </View>
          </Animated.View>

          {/* Affirmations */}
          {renderAffirmations(selfCare.affirmations)}

          {/* Journal Prompts */}
          {renderJournalPrompts(selfCare.journalPrompts)}
        </>
      );
    }
  };

  const renderAffirmations = (affirmations: string[]) => (
    <Animated.View entering={FadeInUp.delay(800).duration(600)} className="mt-8">
      <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }} className="text-lg mb-4 px-6">
        Daily Affirmations
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 24, paddingRight: 24 }} style={{ flexGrow: 0 }}>
        {affirmations.map((affirmation, index) => (
          <Animated.View key={affirmation} entering={FadeInUp.delay(850 + index * 50).duration(500)} style={{ marginRight: 12 }}>
            <LinearGradient colors={getGradientColors()} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: 16, padding: 16, width: 220 }}>
              <Heart size={16} color={accentColor} />
              <Text style={{ fontFamily: 'CormorantGaramond_400Regular', color: theme.text.primary }} className="text-base mt-3 leading-6">
                "{affirmation}"
              </Text>
            </LinearGradient>
          </Animated.View>
        ))}
      </ScrollView>
    </Animated.View>
  );

  const renderJournalPrompts = (prompts: string[]) => (
    <Animated.View entering={FadeInUp.delay(900).duration(600)} className="mx-6 mt-8">
      <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }} className="text-lg mb-4">
        Journal Prompts
      </Text>
      <LinearGradient colors={getGradientColors()} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: 20, padding: 20 }}>
        {prompts.map((prompt, index) => (
          <View key={prompt} className={`flex-row items-start ${index > 0 ? 'mt-4' : ''}`}>
            <View className="w-6 h-6 rounded-full items-center justify-center mr-3" style={{ backgroundColor: `${accentColor}20` }}>
              <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: accentColor }} className="text-xs">{index + 1}</Text>
            </View>
            <Text style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.secondary }} className="text-sm flex-1 leading-5">
              {prompt}
            </Text>
          </View>
        ))}
      </LinearGradient>
    </Animated.View>
  );

  return (
    <View className="flex-1">
      <LinearGradient colors={theme.gradient} locations={[0, 0.25, 0.5, 0.75, 1]} style={{ flex: 1 }}>
        <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <Animated.View entering={FadeInDown.delay(100).duration(600)} style={{ paddingTop: insets.top + 16 }} className="px-6">
            <Text style={{ fontFamily: 'CormorantGaramond_400Regular', color: theme.text.muted }} className="text-sm tracking-widest uppercase">
              Self-Care
            </Text>
            <Text style={{ fontFamily: 'CormorantGaramond_600SemiBold', color: theme.text.primary }} className="text-3xl mt-1">
              {getTitle()}
            </Text>
          </Animated.View>

          {renderLifeStageContent()}
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

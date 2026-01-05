import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
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
} from 'lucide-react-native';
import { useCycleStore, phaseInfo, CyclePhase } from '@/lib/cycle-store';
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
    description: 'Your inner summer is here! You\'re magnetic and communicative. Perfect time for important conversations and social connection.',
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

export default function SelfCareScreen() {
  const insets = useSafeAreaInsets();
  const getCurrentPhase = useCycleStore(s => s.getCurrentPhase);

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
  const selfCare = phaseSelfCare[currentPhase];

  return (
    <View className="flex-1">
      <LinearGradient
        colors={['#0f0720', '#1e0a3c', '#2d1050', '#1e0a3c', '#0f0720']}
        locations={[0, 0.3, 0.5, 0.7, 1]}
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
            style={{ paddingTop: insets.top + 16 }}
            className="px-6"
          >
            <Text
              style={{ fontFamily: 'CormorantGaramond_400Regular' }}
              className="text-luna-300/60 text-sm tracking-widest uppercase"
            >
              Self-Care
            </Text>
            <Text
              style={{ fontFamily: 'CormorantGaramond_600SemiBold' }}
              className="text-white text-3xl mt-1"
            >
              Nurture Your Soul
            </Text>
          </Animated.View>

          {/* Phase Card */}
          <Animated.View
            entering={FadeInUp.delay(200).duration(600)}
            className="mx-6 mt-6"
          >
            <LinearGradient
              colors={[`${info.color}30`, `${info.color}10`]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ borderRadius: 24, padding: 20 }}
            >
              <View className="flex-row items-center mb-3">
                <Text className="text-2xl mr-2">{info.emoji}</Text>
                <View>
                  <Text
                    style={{ fontFamily: 'Quicksand_600SemiBold' }}
                    className="text-white text-lg"
                  >
                    {info.name} Phase
                  </Text>
                  <Text
                    style={{ fontFamily: 'Quicksand_500Medium' }}
                    className="text-luna-300 text-sm"
                  >
                    {selfCare.theme}
                  </Text>
                </View>
              </View>
              <Text
                style={{ fontFamily: 'Quicksand_400Regular' }}
                className="text-luna-200/80 text-sm leading-5"
              >
                {selfCare.description}
              </Text>
            </LinearGradient>
          </Animated.View>

          {/* Activities Grid */}
          <Animated.View
            entering={FadeInUp.delay(300).duration(600)}
            className="mt-8 px-6"
          >
            <Text
              style={{ fontFamily: 'Quicksand_600SemiBold' }}
              className="text-white text-lg mb-4"
            >
              Self-Care Activities
            </Text>

            <View className="flex-row flex-wrap justify-between">
              {selfCare.activities.map((activity, index) => (
                <Animated.View
                  key={activity.name}
                  entering={FadeInUp.delay(400 + index * 50).duration(500)}
                  style={{ width: '48%' }}
                  className="mb-3"
                >
                  <View className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <View
                      className="w-10 h-10 rounded-full items-center justify-center mb-3"
                      style={{ backgroundColor: `${info.color}30` }}
                    >
                      <activity.icon size={20} color={info.color} />
                    </View>
                    <Text
                      style={{ fontFamily: 'Quicksand_600SemiBold' }}
                      className="text-white text-sm"
                    >
                      {activity.name}
                    </Text>
                    <Text
                      style={{ fontFamily: 'Quicksand_400Regular' }}
                      className="text-luna-300/70 text-xs mt-1"
                    >
                      {activity.description}
                    </Text>
                  </View>
                </Animated.View>
              ))}
            </View>
          </Animated.View>

          {/* Emotional Support */}
          <Animated.View
            entering={FadeInUp.delay(700).duration(600)}
            className="mx-6 mt-6"
          >
            <Text
              style={{ fontFamily: 'Quicksand_600SemiBold' }}
              className="text-white text-lg mb-4"
            >
              Emotional Support
            </Text>
            <View className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
              {selfCare.emotions.map((emotion, index) => (
                <View
                  key={emotion.feeling}
                  className={`p-4 ${index > 0 ? 'border-t border-white/10' : ''}`}
                >
                  <View className="flex-row items-center justify-between mb-2">
                    <Text
                      style={{ fontFamily: 'Quicksand_600SemiBold' }}
                      className="text-white text-sm"
                    >
                      {emotion.feeling}
                    </Text>
                    <View className="bg-luna-500/20 px-2 py-1 rounded-full">
                      <Text className="text-luna-400 text-xs">
                        {emotion.normalcy}
                      </Text>
                    </View>
                  </View>
                  <Text
                    style={{ fontFamily: 'Quicksand_400Regular' }}
                    className="text-luna-300/70 text-xs"
                  >
                    {emotion.tip}
                  </Text>
                </View>
              ))}
            </View>
          </Animated.View>

          {/* Affirmations */}
          <Animated.View
            entering={FadeInUp.delay(800).duration(600)}
            className="mt-8"
          >
            <Text
              style={{ fontFamily: 'Quicksand_600SemiBold' }}
              className="text-white text-lg mb-4 px-6"
            >
              Daily Affirmations
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 24 }}
              style={{ flexGrow: 0 }}
            >
              {selfCare.affirmations.map((affirmation, index) => (
                <Animated.View
                  key={affirmation}
                  entering={FadeInUp.delay(850 + index * 50).duration(500)}
                  className="mr-3"
                >
                  <LinearGradient
                    colors={['rgba(236, 72, 153, 0.15)', 'rgba(147, 51, 234, 0.15)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ borderRadius: 16, padding: 16, width: 220 }}
                  >
                    <Heart size={16} color="#f472b6" />
                    <Text
                      style={{ fontFamily: 'CormorantGaramond_400Regular' }}
                      className="text-white text-base mt-3 leading-6"
                    >
                      "{affirmation}"
                    </Text>
                  </LinearGradient>
                </Animated.View>
              ))}
            </ScrollView>
          </Animated.View>

          {/* Journal Prompts */}
          <Animated.View
            entering={FadeInUp.delay(900).duration(600)}
            className="mx-6 mt-8"
          >
            <Text
              style={{ fontFamily: 'Quicksand_600SemiBold' }}
              className="text-white text-lg mb-4"
            >
              Journal Prompts
            </Text>
            <LinearGradient
              colors={['rgba(192, 132, 252, 0.1)', 'rgba(236, 72, 153, 0.1)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ borderRadius: 20, padding: 20 }}
            >
              {selfCare.journalPrompts.map((prompt, index) => (
                <View
                  key={prompt}
                  className={`flex-row items-start ${index > 0 ? 'mt-4' : ''}`}
                >
                  <View className="w-6 h-6 rounded-full bg-white/10 items-center justify-center mr-3">
                    <Text className="text-luna-400 text-xs">{index + 1}</Text>
                  </View>
                  <Text
                    style={{ fontFamily: 'Quicksand_400Regular' }}
                    className="text-luna-200/80 text-sm flex-1 leading-5"
                  >
                    {prompt}
                  </Text>
                </View>
              ))}
            </LinearGradient>
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

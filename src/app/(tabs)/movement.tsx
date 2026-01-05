import React from 'react';
import { View, Text, ScrollView, Pressable, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Flame, Clock, Zap, Heart, Dumbbell, Wind, Footprints } from 'lucide-react-native';
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

interface Workout {
  name: string;
  duration: string;
  intensity: 'Low' | 'Moderate' | 'High';
  description: string;
  icon: typeof Dumbbell;
}

const phaseMovement: Record<CyclePhase, {
  recommendation: string;
  description: string;
  energyLevel: string;
  workouts: Workout[];
  tips: string[];
}> = {
  menstrual: {
    recommendation: 'Rest & Restore',
    description: 'Your body is doing important work. Honor it with gentle movement that feels nurturing, not depleting.',
    energyLevel: 'Low - Listen to your body',
    workouts: [
      { name: 'Gentle Yoga', duration: '20-30 min', intensity: 'Low', description: 'Restorative poses, hip openers, forward folds', icon: Wind },
      { name: 'Light Walking', duration: '15-20 min', intensity: 'Low', description: 'Slow, mindful outdoor stroll', icon: Footprints },
      { name: 'Stretching', duration: '15 min', intensity: 'Low', description: 'Gentle full-body stretches', icon: Heart },
      { name: 'Meditation', duration: '10-15 min', intensity: 'Low', description: 'Breathwork and body scan', icon: Wind },
    ],
    tips: [
      'Skip high-intensity workouts - your body needs rest',
      'Focus on movements that feel good, not goals',
      'Hot baths or heating pads before movement can help',
      'It\'s okay to take complete rest days',
    ],
  },
  follicular: {
    recommendation: 'Build & Explore',
    description: 'Energy is rising! Your body is ready to try new things and build strength. This is your time to challenge yourself.',
    energyLevel: 'Rising - Push your limits',
    workouts: [
      { name: 'Strength Training', duration: '45-60 min', intensity: 'High', description: 'Weight lifting, resistance training', icon: Dumbbell },
      { name: 'HIIT', duration: '25-30 min', intensity: 'High', description: 'High-intensity intervals', icon: Flame },
      { name: 'Running', duration: '30-45 min', intensity: 'Moderate', description: 'Cardio runs or intervals', icon: Zap },
      { name: 'Dance/Aerobics', duration: '45 min', intensity: 'Moderate', description: 'Fun cardio movement', icon: Heart },
    ],
    tips: [
      'Try new workout classes or routines',
      'Your body responds well to strength training now',
      'Energy is high - take advantage!',
      'Great time to set new fitness goals',
    ],
  },
  ovulatory: {
    recommendation: 'Peak Performance',
    description: 'You\'re at your most powerful! High-energy workouts feel amazing. Social fitness activities are extra rewarding.',
    energyLevel: 'Peak - Go for it!',
    workouts: [
      { name: 'Intense Cardio', duration: '45-60 min', intensity: 'High', description: 'Spinning, running, rowing', icon: Flame },
      { name: 'Group Fitness', duration: '45-60 min', intensity: 'High', description: 'Classes with others', icon: Heart },
      { name: 'CrossFit/Circuit', duration: '45 min', intensity: 'High', description: 'High-intensity circuit training', icon: Dumbbell },
      { name: 'Sports', duration: '60+ min', intensity: 'High', description: 'Tennis, soccer, volleyball', icon: Zap },
    ],
    tips: [
      'This is your most athletic phase - embrace it!',
      'Group workouts feel especially motivating',
      'Competition and challenges are fun now',
      'Great time for personal records',
    ],
  },
  luteal: {
    recommendation: 'Maintain & Moderate',
    description: 'Energy begins to shift inward. Steady, moderate movement supports your changing hormones without depleting you.',
    energyLevel: 'Decreasing - Be gentle',
    workouts: [
      { name: 'Pilates', duration: '45 min', intensity: 'Moderate', description: 'Core and stability work', icon: Heart },
      { name: 'Swimming', duration: '30-45 min', intensity: 'Moderate', description: 'Low-impact full body', icon: Wind },
      { name: 'Yoga Flow', duration: '45 min', intensity: 'Moderate', description: 'Vinyasa or hatha yoga', icon: Wind },
      { name: 'Moderate Weights', duration: '30-40 min', intensity: 'Moderate', description: 'Lighter weights, higher reps', icon: Dumbbell },
    ],
    tips: [
      'Reduce intensity as you approach your period',
      'Focus on maintaining, not achieving',
      'Listen to fatigue signals',
      'Yoga and pilates help with PMS symptoms',
    ],
  },
};

const intensityColors: Record<string, string> = {
  Low: '#22c55e',
  Moderate: '#f59e0b',
  High: '#ef4444',
};

export default function MovementScreen() {
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
  const movement = phaseMovement[currentPhase];

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
              Movement Guide
            </Text>
            <Text
              style={{ fontFamily: 'CormorantGaramond_600SemiBold' }}
              className="text-white text-3xl mt-1"
            >
              Move with Your Cycle
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
                    {movement.recommendation}
                  </Text>
                </View>
              </View>
              <Text
                style={{ fontFamily: 'Quicksand_400Regular' }}
                className="text-luna-200/80 text-sm leading-5"
              >
                {movement.description}
              </Text>

              <View className="mt-4 flex-row items-center">
                <Zap size={14} color="#f9a8d4" />
                <Text
                  style={{ fontFamily: 'Quicksand_500Medium' }}
                  className="text-luna-300 text-xs ml-2"
                >
                  {movement.energyLevel}
                </Text>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Workouts Section */}
          <Animated.View
            entering={FadeInUp.delay(300).duration(600)}
            className="mt-8 px-6"
          >
            <Text
              style={{ fontFamily: 'Quicksand_600SemiBold' }}
              className="text-white text-lg mb-4"
            >
              Recommended Workouts
            </Text>

            {movement.workouts.map((workout, index) => (
              <Animated.View
                key={workout.name}
                entering={FadeInUp.delay(400 + index * 100).duration(500)}
              >
                <Pressable className="bg-white/5 rounded-2xl p-4 mb-3 border border-white/10 flex-row items-center">
                  <View
                    className="w-14 h-14 rounded-2xl items-center justify-center mr-4"
                    style={{ backgroundColor: `${info.color}30` }}
                  >
                    <workout.icon size={24} color={info.color} />
                  </View>
                  <View className="flex-1">
                    <Text
                      style={{ fontFamily: 'Quicksand_600SemiBold' }}
                      className="text-white text-base"
                    >
                      {workout.name}
                    </Text>
                    <Text
                      style={{ fontFamily: 'Quicksand_400Regular' }}
                      className="text-luna-300/70 text-xs mt-1"
                    >
                      {workout.description}
                    </Text>
                    <View className="flex-row items-center mt-2">
                      <View className="flex-row items-center mr-4">
                        <Clock size={12} color="#a78bfa" />
                        <Text
                          style={{ fontFamily: 'Quicksand_500Medium' }}
                          className="text-luna-400 text-xs ml-1"
                        >
                          {workout.duration}
                        </Text>
                      </View>
                      <View
                        className="px-2 py-1 rounded-full"
                        style={{ backgroundColor: `${intensityColors[workout.intensity]}20` }}
                      >
                        <Text
                          style={{ fontFamily: 'Quicksand_500Medium', color: intensityColors[workout.intensity] }}
                          className="text-xs"
                        >
                          {workout.intensity}
                        </Text>
                      </View>
                    </View>
                  </View>
                </Pressable>
              </Animated.View>
            ))}
          </Animated.View>

          {/* Tips Section */}
          <Animated.View
            entering={FadeInUp.delay(800).duration(600)}
            className="mx-6 mt-6"
          >
            <Text
              style={{ fontFamily: 'Quicksand_600SemiBold' }}
              className="text-white text-lg mb-4"
            >
              Movement Tips
            </Text>
            <View className="bg-white/5 rounded-2xl p-4 border border-white/10">
              {movement.tips.map((tip, index) => (
                <View
                  key={tip}
                  className={`flex-row items-start ${index > 0 ? 'mt-3' : ''}`}
                >
                  <View className="w-6 h-6 rounded-full bg-cosmic-500/20 items-center justify-center mr-3 mt-0.5">
                    <Heart size={12} color="#c084fc" />
                  </View>
                  <Text
                    style={{ fontFamily: 'Quicksand_400Regular' }}
                    className="text-luna-200/80 text-sm flex-1 leading-5"
                  >
                    {tip}
                  </Text>
                </View>
              ))}
            </View>
          </Animated.View>

          {/* Quote */}
          <Animated.View
            entering={FadeInUp.delay(900).duration(600)}
            className="mx-6 mt-8"
          >
            <LinearGradient
              colors={['rgba(192, 132, 252, 0.1)', 'rgba(236, 72, 153, 0.1)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ borderRadius: 20, padding: 20 }}
            >
              <Text
                style={{ fontFamily: 'CormorantGaramond_400Regular' }}
                className="text-white text-xl leading-7 text-center"
              >
                "Movement should feel like a celebration of what your body can do, not a punishment for what you ate."
              </Text>
            </LinearGradient>
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

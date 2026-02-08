import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Flame, Clock, Zap, Heart, Dumbbell, Wind, Footprints, Sun, Leaf, Moon, Sparkles } from 'lucide-react-native';
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

// Perimenopause movement
const perimenopauseMovement = {
  recommendation: 'Build Strength & Balance',
  description: 'During perimenopause, focus shifts to maintaining muscle mass, bone density, and managing symptoms through movement. Strength training becomes especially important.',
  energyLevel: 'Variable - Honor your daily energy',
  workouts: [
    { name: 'Strength Training', duration: '30-45 min', intensity: 'Moderate' as const, description: 'Weight-bearing exercises for bones and muscle', icon: Dumbbell },
    { name: 'Walking', duration: '30-45 min', intensity: 'Low' as const, description: 'Daily walks for heart health and mood', icon: Footprints },
    { name: 'Yoga', duration: '30-45 min', intensity: 'Low' as const, description: 'Balance, flexibility, and stress relief', icon: Wind },
    { name: 'Swimming/Water Aerobics', duration: '30-45 min', intensity: 'Moderate' as const, description: 'Joint-friendly cardio, helps with hot flashes', icon: Heart },
    { name: 'Pilates', duration: '30-45 min', intensity: 'Moderate' as const, description: 'Core strength and posture', icon: Heart },
    { name: 'Cycling', duration: '30-45 min', intensity: 'Moderate' as const, description: 'Low-impact cardio', icon: Zap },
  ],
  tips: [
    'Strength training 2-3x weekly is crucial for bone density',
    'Start with lighter weights and focus on form',
    'Swimming and water aerobics help with hot flashes',
    'Yoga helps manage stress and improves sleep',
    'Listen to your body - energy may fluctuate day to day',
    'Morning exercise may help with sleep quality',
  ],
  focusAreas: [
    { title: 'Bone Health', description: 'Weight-bearing exercises like walking, dancing, and strength training' },
    { title: 'Muscle Maintenance', description: 'Resistance training to preserve muscle mass' },
    { title: 'Balance & Flexibility', description: 'Yoga and tai chi to prevent falls' },
    { title: 'Heart Health', description: 'Regular cardio - aim for 150 min/week moderate activity' },
  ],
};

// Menopause movement
const menopauseMovement = {
  recommendation: 'Maintain & Strengthen',
  description: 'Post-menopause, exercise is your best friend for bone health, heart health, and maintaining strength. Consistency matters more than intensity.',
  energyLevel: 'Steady - Build sustainable habits',
  workouts: [
    { name: 'Strength Training', duration: '30-45 min', intensity: 'Moderate' as const, description: 'Essential for bone and muscle health', icon: Dumbbell },
    { name: 'Walking/Hiking', duration: '30-60 min', intensity: 'Moderate' as const, description: 'Weight-bearing cardio for bones', icon: Footprints },
    { name: 'Yoga/Tai Chi', duration: '30-45 min', intensity: 'Low' as const, description: 'Balance, flexibility, stress relief', icon: Wind },
    { name: 'Swimming', duration: '30-45 min', intensity: 'Moderate' as const, description: 'Great for joints and heart', icon: Heart },
    { name: 'Dance Classes', duration: '45-60 min', intensity: 'Moderate' as const, description: 'Fun, social, weight-bearing', icon: Heart },
    { name: 'Resistance Bands', duration: '20-30 min', intensity: 'Low' as const, description: 'Gentle strength building', icon: Dumbbell },
  ],
  tips: [
    'Aim for strength training at least 2x per week',
    'Include balance exercises to prevent falls',
    'Weight-bearing exercise is crucial for bone density',
    'Consistency trumps intensity - daily movement matters',
    'Stay hydrated before, during, and after exercise',
    'Consider working with a trainer familiar with menopause',
  ],
  focusAreas: [
    { title: 'Bone Preservation', description: 'Weight-bearing and resistance exercises are non-negotiable' },
    { title: 'Heart Health', description: 'Cardio exercise helps offset increased cardiovascular risk' },
    { title: 'Muscle Strength', description: 'Combat age-related muscle loss with regular strength work' },
    { title: 'Balance & Stability', description: 'Reduce fall risk with balance training' },
  ],
};

const intensityColors: Record<string, string> = {
  Low: '#22c55e',
  Moderate: '#f59e0b',
  High: '#ef4444',
};

export default function MovementScreen() {
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
      case 'perimenopause': return 'Move with the Moon';
      case 'menopause': return 'Lunar Movement';
      default: return 'Move with Your Cycle';
    }
  };

  // Get quote based on life stage
  const getQuote = () => {
    switch (lifeStage) {
      case 'perimenopause':
        return '"Strength doesn\'t come from what you can do. It comes from overcoming the things you once thought you couldn\'t."';
      case 'menopause':
        return '"Movement is medicine. The more you move, the more you can move. Start where you are."';
      default:
        return '"Movement should feel like a celebration of what your body can do, not a punishment for what you ate."';
    }
  };

  const renderLifeStageContent = () => {
    if (lifeStage === 'regular') {
      const movement = phaseMovement[currentPhase];
      return (
        <>
          {/* Phase Card */}
          <Animated.View entering={FadeInUp.delay(200).duration(600)} className="mx-6 mt-6">
            <View className="rounded-3xl p-5 border" style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light }}>
              <View className="flex-row items-center mb-3">
                <View className="w-12 h-12 rounded-full items-center justify-center mr-3" style={{ backgroundColor: `${info.color}20` }}>
                  <Text className="text-2xl">{info.emoji}</Text>
                </View>
                <View>
                  <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }} className="text-lg">
                    {info.name} Phase
                  </Text>
                  <Text style={{ fontFamily: 'Quicksand_500Medium', color: theme.text.accent }} className="text-sm">
                    {movement.recommendation}
                  </Text>
                </View>
              </View>
              <Text style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.secondary }} className="text-sm leading-5">
                {movement.description}
              </Text>
              <View className="mt-4 flex-row items-center">
                <Zap size={14} color={theme.accent.rose} />
                <Text style={{ fontFamily: 'Quicksand_500Medium', color: theme.text.accent }} className="text-xs ml-2">
                  {movement.energyLevel}
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* Workouts */}
          <Animated.View entering={FadeInUp.delay(300).duration(600)} className="mt-8 px-6">
            <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }} className="text-lg mb-4">
              Recommended Workouts
            </Text>
            {movement.workouts.map((workout, index) => (
              <Animated.View key={workout.name} entering={FadeInUp.delay(400 + index * 100).duration(500)}>
                <View className="rounded-2xl p-4 mb-3 border flex-row items-center" style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light }}>
                  <View className="w-14 h-14 rounded-2xl items-center justify-center mr-4" style={{ backgroundColor: `${info.color}20` }}>
                    <workout.icon size={24} color={info.color} />
                  </View>
                  <View className="flex-1">
                    <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }} className="text-base">
                      {workout.name}
                    </Text>
                    <Text style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.tertiary }} className="text-xs mt-1">
                      {workout.description}
                    </Text>
                    <View className="flex-row items-center mt-2">
                      <View className="flex-row items-center mr-4">
                        <Clock size={12} color={theme.accent.purple} />
                        <Text style={{ fontFamily: 'Quicksand_500Medium', color: theme.accent.purple }} className="text-xs ml-1">
                          {workout.duration}
                        </Text>
                      </View>
                      <View className="px-2 py-1 rounded-full" style={{ backgroundColor: `${intensityColors[workout.intensity]}20` }}>
                        <Text style={{ fontFamily: 'Quicksand_500Medium', color: intensityColors[workout.intensity] }} className="text-xs">
                          {workout.intensity}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </Animated.View>
            ))}
          </Animated.View>

          {/* Tips */}
          <Animated.View entering={FadeInUp.delay(800).duration(600)} className="mx-6 mt-6">
            <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }} className="text-lg mb-4">
              Movement Tips
            </Text>
            <View className="rounded-2xl p-4 border" style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light }}>
              {movement.tips.map((tip, index) => (
                <View key={tip} className={`flex-row items-start ${index > 0 ? 'mt-3' : ''}`}>
                  <View className="w-6 h-6 rounded-full items-center justify-center mr-3 mt-0.5" style={{ backgroundColor: `${theme.accent.purple}15` }}>
                    <Heart size={12} color={theme.accent.purple} />
                  </View>
                  <Text style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.secondary }} className="text-sm flex-1 leading-5">
                    {tip}
                  </Text>
                </View>
              ))}
            </View>
          </Animated.View>
        </>
      );
    } else if (lifeStage === 'perimenopause') {
      const currentMoon = getMoonPhase();
      const moonInfo = moonPhaseInfo[currentMoon];
      const moonCyclePhase = getMoonPhaseCycleEquivalent(currentMoon);
      const moonCycleInfo = phaseInfo[moonCyclePhase];
      const moonPhaseMovement = phaseMovement[moonCyclePhase];
      const moonPractices = moonCycleEducation.phases[currentMoon];

      return (
        <>
          {/* Moon Phase Card */}
          <Animated.View entering={FadeInUp.delay(200).duration(600)} className="mx-6 mt-6">
            <MoonPhaseCard compact showEducation={false} />
          </Animated.View>

          {/* Moon-Based Movement Guidance */}
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
                  Movement with the Moon
                </Text>
              </View>
              <Text
                style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.secondary }}
                className="text-sm leading-5"
              >
                The {moonInfo.name.toLowerCase()} brings {moonInfo.energy.toLowerCase()} energy.
                Honor this by matching your movement to {moonCycleInfo.name.toLowerCase()} phase intensity while building strength for perimenopause.
              </Text>
            </View>
          </Animated.View>

          {/* Moon Phase Movement */}
          <Animated.View entering={FadeInUp.delay(300).duration(600)} className="mx-6 mt-6">
            <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }} className="text-lg mb-2">
              {moonInfo.emoji} {moonInfo.name} Movement
            </Text>
            <Text style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.tertiary }} className="text-xs mb-4">
              {moonPhaseMovement.recommendation} - {moonPhaseMovement.energyLevel}
            </Text>

            {moonPhaseMovement.workouts.slice(0, 3).map((workout, index) => (
              <View key={workout.name} className="rounded-2xl p-4 mb-3 border flex-row items-center" style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light }}>
                <View className="w-14 h-14 rounded-2xl items-center justify-center mr-4" style={{ backgroundColor: `${moonCycleInfo.color}20` }}>
                  <workout.icon size={24} color={moonCycleInfo.color} />
                </View>
                <View className="flex-1">
                  <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }} className="text-base">
                    {workout.name}
                  </Text>
                  <Text style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.tertiary }} className="text-xs mt-1">
                    {workout.description}
                  </Text>
                  <View className="flex-row items-center mt-2">
                    <View className="flex-row items-center mr-4">
                      <Clock size={12} color={moonCycleInfo.color} />
                      <Text style={{ fontFamily: 'Quicksand_500Medium', color: moonCycleInfo.color }} className="text-xs ml-1">
                        {workout.duration}
                      </Text>
                    </View>
                    <View className="px-2 py-1 rounded-full" style={{ backgroundColor: `${intensityColors[workout.intensity]}20` }}>
                      <Text style={{ fontFamily: 'Quicksand_500Medium', color: intensityColors[workout.intensity] }} className="text-xs">
                        {workout.intensity}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </Animated.View>

          {/* Focus Areas */}
          <Animated.View entering={FadeInUp.delay(400).duration(600)} className="mx-6 mt-4">
            <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }} className="text-lg mb-4">
              Perimenopause Focus Areas
            </Text>
            <View className="flex-row flex-wrap" style={{ gap: 10 }}>
              {perimenopauseMovement.focusAreas.map((area) => (
                <View key={area.title} className="rounded-2xl p-4 border" style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light, width: '48%' }}>
                  <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: accentColor }} className="text-sm mb-1">
                    {area.title}
                  </Text>
                  <Text style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.tertiary }} className="text-xs leading-4">
                    {area.description}
                  </Text>
                </View>
              ))}
            </View>
          </Animated.View>

          {/* Tips */}
          <Animated.View entering={FadeInUp.delay(500).duration(600)} className="mx-6 mt-6">
            <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }} className="text-lg mb-4">
              Movement Tips
            </Text>
            <View className="rounded-2xl p-4 border" style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light }}>
              {perimenopauseMovement.tips.map((tip, index) => (
                <View key={tip} className={`flex-row items-start ${index > 0 ? 'mt-3' : ''}`}>
                  <View className="w-6 h-6 rounded-full items-center justify-center mr-3 mt-0.5" style={{ backgroundColor: `${accentColor}15` }}>
                    <Heart size={12} color={accentColor} />
                  </View>
                  <Text style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.secondary }} className="text-sm flex-1 leading-5">
                    {tip}
                  </Text>
                </View>
              ))}
            </View>
          </Animated.View>
        </>
      );
    } else {
      // Menopause
      const currentMoon = getMoonPhase();
      const moonInfo = moonPhaseInfo[currentMoon];
      const moonCyclePhase = getMoonPhaseCycleEquivalent(currentMoon);
      const moonCycleInfo = phaseInfo[moonCyclePhase];
      const moonPhaseMovement = phaseMovement[moonCyclePhase];
      const moonPractices = moonCycleEducation.phases[currentMoon];

      return (
        <>
          {/* Moon Phase Card */}
          <Animated.View entering={FadeInUp.delay(200).duration(600)} className="mx-6 mt-6">
            <MoonPhaseCard compact showEducation={false} />
          </Animated.View>

          {/* Moon-Based Movement Explanation */}
          <Animated.View entering={FadeInUp.delay(250).duration(600)} className="mx-6 mt-4">
            <LinearGradient
              colors={['rgba(139, 92, 246, 0.12)', 'rgba(196, 181, 253, 0.08)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(139, 92, 246, 0.25)' }}
            >
              <View className="flex-row items-center mb-2">
                <Sparkles size={16} color="#8b5cf6" />
                <Text
                  style={{ fontFamily: 'Quicksand_600SemiBold', color: '#8b5cf6' }}
                  className="text-xs uppercase tracking-wider ml-2"
                >
                  Lunar Movement Guide
                </Text>
              </View>
              <Text
                style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.secondary }}
                className="text-sm leading-5"
              >
                The {moonInfo.name.toLowerCase()} invites {moonInfo.energy.toLowerCase()} energy.
                Let the moon guide your intensity while focusing on the strength, balance, and bone health essential for menopause.
              </Text>
            </LinearGradient>
          </Animated.View>

          {/* Moon Phase Movement */}
          <Animated.View entering={FadeInUp.delay(300).duration(600)} className="mx-6 mt-6">
            <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }} className="text-lg mb-2">
              {moonInfo.emoji} {moonInfo.name} Movement
            </Text>
            <Text style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.tertiary }} className="text-xs mb-4">
              {moonPhaseMovement.recommendation} - {moonPhaseMovement.energyLevel}
            </Text>

            {moonPhaseMovement.workouts.slice(0, 3).map((workout, index) => (
              <View key={workout.name} className="rounded-2xl p-4 mb-3 border flex-row items-center" style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light }}>
                <View className="w-14 h-14 rounded-2xl items-center justify-center mr-4" style={{ backgroundColor: `${moonCycleInfo.color}20` }}>
                  <workout.icon size={24} color={moonCycleInfo.color} />
                </View>
                <View className="flex-1">
                  <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }} className="text-base">
                    {workout.name}
                  </Text>
                  <Text style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.tertiary }} className="text-xs mt-1">
                    {workout.description}
                  </Text>
                  <View className="flex-row items-center mt-2">
                    <View className="flex-row items-center mr-4">
                      <Clock size={12} color={moonCycleInfo.color} />
                      <Text style={{ fontFamily: 'Quicksand_500Medium', color: moonCycleInfo.color }} className="text-xs ml-1">
                        {workout.duration}
                      </Text>
                    </View>
                    <View className="px-2 py-1 rounded-full" style={{ backgroundColor: `${intensityColors[workout.intensity]}20` }}>
                      <Text style={{ fontFamily: 'Quicksand_500Medium', color: intensityColors[workout.intensity] }} className="text-xs">
                        {workout.intensity}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </Animated.View>

          {/* Focus Areas */}
          <Animated.View entering={FadeInUp.delay(400).duration(600)} className="mx-6 mt-4">
            <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }} className="text-lg mb-4">
              Menopause Focus Areas
            </Text>
            <View className="flex-row flex-wrap" style={{ gap: 10 }}>
              {menopauseMovement.focusAreas.map((area) => (
                <View key={area.title} className="rounded-2xl p-4 border" style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light, width: '48%' }}>
                  <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: accentColor }} className="text-sm mb-1">
                    {area.title}
                  </Text>
                  <Text style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.tertiary }} className="text-xs leading-4">
                    {area.description}
                  </Text>
                </View>
              ))}
            </View>
          </Animated.View>

          {/* Tips */}
          <Animated.View entering={FadeInUp.delay(500).duration(600)} className="mx-6 mt-6">
            <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }} className="text-lg mb-4">
              Movement Tips
            </Text>
            <View className="rounded-2xl p-4 border" style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light }}>
              {menopauseMovement.tips.map((tip, index) => (
                <View key={tip} className={`flex-row items-start ${index > 0 ? 'mt-3' : ''}`}>
                  <View className="w-6 h-6 rounded-full items-center justify-center mr-3 mt-0.5" style={{ backgroundColor: `${accentColor}15` }}>
                    <Heart size={12} color={accentColor} />
                  </View>
                  <Text style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.secondary }} className="text-sm flex-1 leading-5">
                    {tip}
                  </Text>
                </View>
              ))}
            </View>
          </Animated.View>
        </>
      );
    }
  };

  return (
    <View className="flex-1">
      <LinearGradient colors={theme.gradient} locations={[0, 0.25, 0.5, 0.75, 1]} style={{ flex: 1 }}>
        <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <Animated.View entering={FadeInDown.delay(100).duration(600)} style={{ paddingTop: insets.top + 16 }} className="px-6">
            <Text style={{ fontFamily: 'CormorantGaramond_400Regular', color: theme.text.muted }} className="text-sm tracking-widest uppercase">
              Movement Guide
            </Text>
            <Text style={{ fontFamily: 'CormorantGaramond_600SemiBold', color: theme.text.primary }} className="text-3xl mt-1">
              {getTitle()}
            </Text>
          </Animated.View>

          {renderLifeStageContent()}

          {/* Quote */}
          <Animated.View entering={FadeInUp.delay(900).duration(600)} className="mx-6 mt-8">
            <LinearGradient
              colors={lifeStage === 'perimenopause'
                ? ['rgba(251, 191, 36, 0.2)', 'rgba(245, 158, 11, 0.1)']
                : lifeStage === 'menopause'
                ? ['rgba(139, 92, 246, 0.2)', 'rgba(167, 139, 250, 0.1)']
                : ['rgba(249, 168, 212, 0.2)', 'rgba(196, 181, 253, 0.2)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ borderRadius: 20, padding: 20 }}
            >
              <Text style={{ fontFamily: 'CormorantGaramond_400Regular', color: theme.text.primary }} className="text-xl leading-7 text-center">
                {getQuote()}
              </Text>
            </LinearGradient>
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

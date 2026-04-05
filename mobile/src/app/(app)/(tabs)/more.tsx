import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import {
  Apple,
  Dumbbell,
  Heart,
  BookOpen,
  MessageCircle,
  FlaskConical,
  Settings,
  LogOut,
  LogIn,
  User,
} from 'lucide-react-native';
import { useThemeStore, getTheme } from '@/lib/theme-store';
import { useSession } from '@/lib/auth/use-session';
import { router } from 'expo-router';
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

export default function MoreScreen() {
  const insets = useSafeAreaInsets();
  const themeMode = useThemeStore(s => s.mode);
  const theme = getTheme(themeMode);
  const { data: session } = useSession();

  const [fontsLoaded] = useFonts({
    CormorantGaramond_400Regular,
    CormorantGaramond_600SemiBold,
    Quicksand_400Regular,
    Quicksand_500Medium,
    Quicksand_600SemiBold,
  });

  const userName = session?.user?.name ?? session?.user?.email ?? 'Guest';

  const navCards = [
    {
      icon: Apple,
      title: 'Nutrition',
      description: 'Phase-aligned eating',
      color: theme.accent.pink,
      onPress: () => router.push('/(app)/(tabs)/nutrition' as any),
    },
    {
      icon: Dumbbell,
      title: 'Movement',
      description: 'Cycle-synced workouts',
      color: theme.accent.purple,
      onPress: () => router.push('/(app)/(tabs)/movement' as any),
    },
    {
      icon: Heart,
      title: 'Self-Care',
      description: 'Rituals & rest',
      color: theme.accent.rose,
      onPress: () => router.push('/(app)/(tabs)/selfcare' as any),
    },
    {
      icon: BookOpen,
      title: 'Journal',
      description: 'Reflect & explore',
      color: theme.accent.blush,
      onPress: () => router.push('/(app)/(tabs)/journal' as any),
    },
    {
      icon: MessageCircle,
      title: 'Luna AI',
      description: 'Your wellness guide',
      color: theme.accent.purple,
      onPress: () => router.push('/luna-ai' as any),
    },
    {
      icon: FlaskConical,
      title: 'Labs Guide',
      description: 'Understand your labs',
      color: '#06b6d4',
      onPress: () => router.push('/labs-guide' as any),
    },
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
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View
                  className="w-12 h-12 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: `${theme.accent.purple}20`, borderWidth: 1, borderColor: `${theme.accent.purple}30` }}
                >
                  <User size={22} color={theme.accent.purple} />
                </View>
                <View className="flex-1">
                  <Text
                    style={{ fontFamily: 'CormorantGaramond_400Regular', color: theme.text.muted }}
                    className="text-xs tracking-widest uppercase"
                  >
                    Welcome back
                  </Text>
                  <Text
                    style={{ fontFamily: 'CormorantGaramond_600SemiBold', color: theme.text.primary }}
                    className="text-2xl mt-0.5"
                    numberOfLines={1}
                  >
                    {userName}
                  </Text>
                </View>
              </View>
              <Pressable
                className="w-10 h-10 rounded-full items-center justify-center border"
                style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light }}
                onPress={() => router.push('/settings' as any)}
              >
                <Settings size={18} color={theme.accent.purple} />
              </Pressable>
            </View>
          </Animated.View>

          {/* Navigation Grid */}
          <Animated.View
            entering={FadeInUp.delay(200).duration(600)}
            className="mx-6 mt-6"
          >
            <Text
              style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
              className="text-lg mb-4"
            >
              Explore
            </Text>
            <View className="flex-row flex-wrap" style={{ marginHorizontal: -6 }}>
              {navCards.map((card, index) => (
                <View key={card.title} style={{ width: '50%', padding: 6 }}>
                  <Animated.View entering={FadeInUp.delay(250 + index * 60).duration(400)}>
                    <Pressable
                      onPress={card.onPress}
                      className="rounded-2xl p-4 border"
                      style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light }}
                    >
                      <View
                        className="w-11 h-11 rounded-full items-center justify-center mb-3"
                        style={{ backgroundColor: `${card.color}15` }}
                      >
                        <card.icon size={20} color={card.color} />
                      </View>
                      <Text
                        style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
                        className="text-sm mb-0.5"
                      >
                        {card.title}
                      </Text>
                      <Text
                        style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.tertiary }}
                        className="text-xs"
                      >
                        {card.description}
                      </Text>
                    </Pressable>
                  </Animated.View>
                </View>
              ))}
            </View>
          </Animated.View>

          {/* Settings Row */}
          <Animated.View
            entering={FadeInUp.delay(550).duration(500)}
            className="mx-6 mt-4"
          >
            <Pressable
              onPress={() => router.push('/settings' as any)}
              className="flex-row items-center rounded-2xl p-4 border"
              style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light }}
            >
              <View
                className="w-10 h-10 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: `${theme.accent.purple}12` }}
              >
                <Settings size={18} color={theme.accent.purple} />
              </View>
              <Text
                style={{ fontFamily: 'Quicksand_500Medium', color: theme.text.primary }}
                className="flex-1 text-sm"
              >
                Settings
              </Text>
            </Pressable>
          </Animated.View>

          {/* Sign In / Sign Out */}
          <Animated.View
            entering={FadeInUp.delay(600).duration(500)}
            className="mx-6 mt-3"
          >
            {session?.user ? (
              <Pressable
                onPress={() => router.push('/sign-in' as any)}
                className="flex-row items-center rounded-2xl p-4 border"
                style={{ backgroundColor: `${theme.accent.rose}08`, borderColor: `${theme.accent.rose}25` }}
              >
                <View
                  className="w-10 h-10 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: `${theme.accent.rose}15` }}
                >
                  <LogOut size={18} color={theme.accent.rose} />
                </View>
                <Text
                  style={{ fontFamily: 'Quicksand_500Medium', color: theme.accent.rose }}
                  className="flex-1 text-sm"
                >
                  Sign Out
                </Text>
              </Pressable>
            ) : (
              <Pressable
                onPress={() => router.push('/sign-in' as any)}
                className="flex-row items-center rounded-2xl p-4 border"
                style={{ backgroundColor: `${theme.accent.purple}08`, borderColor: `${theme.accent.purple}25` }}
              >
                <View
                  className="w-10 h-10 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: `${theme.accent.purple}15` }}
                >
                  <LogIn size={18} color={theme.accent.purple} />
                </View>
                <Text
                  style={{ fontFamily: 'Quicksand_500Medium', color: theme.accent.purple }}
                  className="flex-1 text-sm"
                >
                  Sign In
                </Text>
              </Pressable>
            )}
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

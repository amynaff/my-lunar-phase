import React from 'react';
import { View, Pressable, Text } from 'react-native';
import { Tabs } from 'expo-router';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {
  Moon,
  Apple,
  Heart,
  Dumbbell,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useThemeStore, getTheme } from '@/lib/theme-store';

interface TabIconProps {
  icon: typeof Moon;
  label: string;
  focused: boolean;
  color: string;
}

function TabIcon({ icon: Icon, label, focused, color }: TabIconProps) {
  const themeMode = useThemeStore(s => s.mode);
  const theme = getTheme(themeMode);

  const scale = useSharedValue(focused ? 1 : 0.9);
  const opacity = useSharedValue(focused ? 1 : 0.6);

  React.useEffect(() => {
    scale.value = withSpring(focused ? 1 : 0.9, { damping: 15, stiffness: 150 });
    opacity.value = withTiming(focused ? 1 : 0.6, { duration: 200 });
  }, [focused]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={animatedStyle} className="items-center justify-center">
      <View
        className="items-center justify-center rounded-full"
        style={{
          width: 40,
          height: 40,
          backgroundColor: focused ? `${theme.accent.rose}20` : 'transparent',
        }}
      >
        <Icon size={22} color={focused ? theme.accent.purple : theme.text.muted} strokeWidth={focused ? 2.5 : 2} />
      </View>
      <Text
        numberOfLines={1}
        style={{
          fontWeight: focused ? '600' : '400',
          fontSize: 10,
          color: focused ? theme.text.secondary : theme.text.muted,
          marginTop: 2,
        }}
      >
        {label}
      </Text>
    </Animated.View>
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const themeMode = useThemeStore(s => s.mode);
  const theme = getTheme(themeMode);

  const handleTabPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
          height: 65 + insets.bottom,
          paddingBottom: insets.bottom,
        },
        tabBarBackground: () => (
          <BlurView
            intensity={80}
            tint={themeMode === 'dark' ? 'dark' : 'light'}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: theme.tabBar,
              borderTopWidth: 1,
              borderTopColor: theme.border.light,
            }}
          />
        ),
        tabBarActiveTintColor: theme.accent.purple,
        tabBarInactiveTintColor: theme.text.muted,
        tabBarShowLabel: false,
      }}
      screenListeners={{
        tabPress: handleTabPress,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon icon={Moon} label="Home" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="nutrition"
        options={{
          title: 'Nutrition',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon icon={Apple} label="Nutrition" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="movement"
        options={{
          title: 'Movement',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon icon={Dumbbell} label="Movement" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="selfcare"
        options={{
          title: 'Self-Care',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon icon={Heart} label="Care" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

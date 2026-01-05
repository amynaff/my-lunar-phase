import React from 'react';
import { View, Pressable, Text, Platform } from 'react-native';
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
  ShoppingCart,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

interface TabIconProps {
  icon: typeof Moon;
  label: string;
  focused: boolean;
  color: string;
}

function TabIcon({ icon: Icon, label, focused, color }: TabIconProps) {
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
          width: 44,
          height: 44,
          backgroundColor: focused ? 'rgba(249, 168, 212, 0.15)' : 'transparent',
        }}
      >
        <Icon size={22} color={focused ? '#9d84ed' : '#b9a6f7'} strokeWidth={focused ? 2.5 : 2} />
      </View>
      <Text
        style={{
          fontWeight: focused ? '600' : '400',
          fontSize: 10,
          color: focused ? '#6d4fc4' : '#b9a6f7',
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
          height: 70 + insets.bottom,
          paddingBottom: insets.bottom,
        },
        tabBarBackground: () => (
          <BlurView
            intensity={80}
            tint="light"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(255, 255, 255, 0.85)',
              borderTopWidth: 1,
              borderTopColor: 'rgba(209, 199, 255, 0.3)',
            }}
          />
        ),
        tabBarActiveTintColor: '#9d84ed',
        tabBarInactiveTintColor: '#b9a6f7',
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
        name="grocery"
        options={{
          title: 'Grocery',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon icon={ShoppingCart} label="Shop" focused={focused} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

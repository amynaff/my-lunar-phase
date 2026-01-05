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

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface TabIconProps {
  icon: typeof Moon;
  label: string;
  focused: boolean;
  color: string;
}

function TabIcon({ icon: Icon, label, focused, color }: TabIconProps) {
  const scale = useSharedValue(focused ? 1 : 0.9);
  const opacity = useSharedValue(focused ? 1 : 0.5);

  React.useEffect(() => {
    scale.value = withSpring(focused ? 1 : 0.9, { damping: 15, stiffness: 150 });
    opacity.value = withTiming(focused ? 1 : 0.5, { duration: 200 });
  }, [focused]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={animatedStyle} className="items-center justify-center">
      <View
        className={`items-center justify-center rounded-full p-2 ${
          focused ? 'bg-luna-500/20' : ''
        }`}
        style={{
          width: 44,
          height: 44,
        }}
      >
        <Icon size={22} color={focused ? '#f472b6' : '#a78bfa'} strokeWidth={focused ? 2.5 : 2} />
      </View>
      <Text
        className={`text-xs mt-0.5 ${focused ? 'text-luna-400' : 'text-luna-400/50'}`}
        style={{ fontWeight: focused ? '600' : '400', fontSize: 10 }}
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
            intensity={40}
            tint="dark"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(15, 7, 32, 0.85)',
              borderTopWidth: 1,
              borderTopColor: 'rgba(249, 168, 212, 0.1)',
            }}
          />
        ),
        tabBarActiveTintColor: '#f472b6',
        tabBarInactiveTintColor: '#a78bfa',
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

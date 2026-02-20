import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { X, Check, Sparkles, Crown, Shield, Star } from 'lucide-react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useSubscriptionStore, premiumFeatures, subscriptionPricing } from '@/lib/subscription-store';
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

const { width } = Dimensions.get('window');

const features = [
  {
    icon: '📊',
    title: 'Symptom Tracking',
    description: 'Track hot flashes, mood, sleep & more',
  },
  {
    icon: '💡',
    title: 'Personalized Insights',
    description: 'Get recommendations tailored to you',
  },
  {
    icon: '📅',
    title: 'Unlimited History',
    description: 'Access all your health data anytime',
  },
  {
    icon: '📤',
    title: 'Export Your Data',
    description: 'Share with your healthcare provider',
  },
  {
    icon: '✨',
    title: 'Premium Content',
    description: 'In-depth guides for every stage',
  },
  {
    icon: '💬',
    title: 'Priority Support',
    description: 'Get help when you need it',
  },
];

export default function PaywallScreen() {
  const insets = useSafeAreaInsets();
  const [selectedPlan, setSelectedPlan] = useState<'yearly' | 'monthly'>('yearly');
  const upgradeToPremium = useSubscriptionStore(s => s.upgradeToPremium);

  const [fontsLoaded] = useFonts({
    CormorantGaramond_400Regular,
    CormorantGaramond_600SemiBold,
    Quicksand_400Regular,
    Quicksand_500Medium,
    Quicksand_600SemiBold,
  });

  if (!fontsLoaded) return null;

  const handleSubscribe = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // In a real app, this would integrate with RevenueCat
    // For now, we'll just upgrade directly for demo purposes
    upgradeToPremium();
    router.back();
  };

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  return (
    <View className="flex-1">
      <LinearGradient
        colors={['#1e1b4b', '#312e81', '#4c1d95', '#581c87']}
        locations={[0, 0.3, 0.7, 1]}
        style={{ flex: 1 }}
      >
        {/* Close button */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(400)}
          style={{ paddingTop: insets.top + 8 }}
          className="px-4 flex-row justify-end"
        >
          <Pressable
            onPress={handleClose}
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
          >
            <X size={20} color="rgba(255,255,255,0.7)" />
          </Pressable>
        </Animated.View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View
            entering={FadeInDown.delay(200).duration(600)}
            className="items-center px-6 mt-4"
          >
            <View
              className="w-20 h-20 rounded-full items-center justify-center mb-4"
              style={{ backgroundColor: 'rgba(249, 168, 212, 0.2)' }}
            >
              <Crown size={40} color="#f9a8d4" />
            </View>

            <Text
              style={{ fontFamily: 'CormorantGaramond_600SemiBold', color: '#fff' }}
              className="text-4xl text-center"
            >
              My Lunar Phase Premium
            </Text>
            <Text
              style={{ fontFamily: 'Quicksand_400Regular', color: 'rgba(255,255,255,0.7)' }}
              className="text-base text-center mt-2"
            >
              Unlock your full wellness potential
            </Text>
          </Animated.View>

          {/* Features */}
          <Animated.View
            entering={FadeInUp.delay(400).duration(600)}
            className="px-6 mt-8"
          >
            <View
              className="rounded-3xl p-5"
              style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
            >
              {features.map((feature, index) => (
                <View
                  key={feature.title}
                  className={`flex-row items-center ${index < features.length - 1 ? 'mb-4 pb-4 border-b' : ''}`}
                  style={{ borderBottomColor: 'rgba(255,255,255,0.1)' }}
                >
                  <View
                    className="w-12 h-12 rounded-full items-center justify-center mr-4"
                    style={{ backgroundColor: 'rgba(249, 168, 212, 0.15)' }}
                  >
                    <Text className="text-2xl">{feature.icon}</Text>
                  </View>
                  <View className="flex-1">
                    <Text
                      style={{ fontFamily: 'Quicksand_600SemiBold', color: '#fff' }}
                      className="text-base"
                    >
                      {feature.title}
                    </Text>
                    <Text
                      style={{ fontFamily: 'Quicksand_400Regular', color: 'rgba(255,255,255,0.6)' }}
                      className="text-xs mt-0.5"
                    >
                      {feature.description}
                    </Text>
                  </View>
                  <Check size={20} color="#f9a8d4" />
                </View>
              ))}
            </View>
          </Animated.View>

          {/* Pricing Options */}
          <Animated.View
            entering={FadeInUp.delay(600).duration(600)}
            className="px-6 mt-6"
          >
            <Text
              style={{ fontFamily: 'Quicksand_600SemiBold', color: 'rgba(255,255,255,0.9)' }}
              className="text-sm text-center mb-4"
            >
              Choose your plan
            </Text>

            {/* Yearly Plan */}
            <Pressable
              onPress={() => {
                Haptics.selectionAsync();
                setSelectedPlan('yearly');
              }}
              className="mb-3"
            >
              <LinearGradient
                colors={selectedPlan === 'yearly' ? ['#f9a8d4', '#c4b5fd'] : ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  borderRadius: 20,
                  padding: 20,
                  borderWidth: 2,
                  borderColor: selectedPlan === 'yearly' ? '#f9a8d4' : 'rgba(255,255,255,0.1)',
                }}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <View
                      className="w-6 h-6 rounded-full border-2 items-center justify-center mr-3"
                      style={{
                        borderColor: selectedPlan === 'yearly' ? '#fff' : 'rgba(255,255,255,0.3)',
                        backgroundColor: selectedPlan === 'yearly' ? '#fff' : 'transparent',
                      }}
                    >
                      {selectedPlan === 'yearly' && (
                        <View className="w-3 h-3 rounded-full" style={{ backgroundColor: '#f9a8d4' }} />
                      )}
                    </View>
                    <View>
                      <View className="flex-row items-center">
                        <Text
                          style={{
                            fontFamily: 'Quicksand_600SemiBold',
                            color: selectedPlan === 'yearly' ? '#fff' : 'rgba(255,255,255,0.9)',
                          }}
                          className="text-lg"
                        >
                          Yearly
                        </Text>
                        <View
                          className="ml-2 px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: selectedPlan === 'yearly' ? 'rgba(255,255,255,0.3)' : 'rgba(249, 168, 212, 0.3)' }}
                        >
                          <Text
                            style={{
                              fontFamily: 'Quicksand_600SemiBold',
                              color: selectedPlan === 'yearly' ? '#fff' : '#f9a8d4',
                            }}
                            className="text-xs"
                          >
                            SAVE 50%
                          </Text>
                        </View>
                      </View>
                      <Text
                        style={{
                          fontFamily: 'Quicksand_400Regular',
                          color: selectedPlan === 'yearly' ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.5)',
                        }}
                        className="text-xs"
                      >
                        ${subscriptionPricing.yearly.monthlyEquivalent}/month, billed annually
                      </Text>
                    </View>
                  </View>
                  <Text
                    style={{
                      fontFamily: 'Quicksand_600SemiBold',
                      color: selectedPlan === 'yearly' ? '#fff' : 'rgba(255,255,255,0.9)',
                    }}
                    className="text-xl"
                  >
                    ${subscriptionPricing.yearly.price}
                  </Text>
                </View>
              </LinearGradient>
            </Pressable>

            {/* Monthly Plan */}
            <Pressable
              onPress={() => {
                Haptics.selectionAsync();
                setSelectedPlan('monthly');
              }}
            >
              <View
                className="rounded-[20px] p-5 border-2"
                style={{
                  backgroundColor: selectedPlan === 'monthly' ? 'rgba(249, 168, 212, 0.2)' : 'rgba(255,255,255,0.05)',
                  borderColor: selectedPlan === 'monthly' ? '#f9a8d4' : 'rgba(255,255,255,0.1)',
                }}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <View
                      className="w-6 h-6 rounded-full border-2 items-center justify-center mr-3"
                      style={{
                        borderColor: selectedPlan === 'monthly' ? '#f9a8d4' : 'rgba(255,255,255,0.3)',
                        backgroundColor: selectedPlan === 'monthly' ? '#f9a8d4' : 'transparent',
                      }}
                    >
                      {selectedPlan === 'monthly' && (
                        <View className="w-3 h-3 rounded-full" style={{ backgroundColor: '#fff' }} />
                      )}
                    </View>
                    <View>
                      <Text
                        style={{
                          fontFamily: 'Quicksand_600SemiBold',
                          color: 'rgba(255,255,255,0.9)',
                        }}
                        className="text-lg"
                      >
                        Monthly
                      </Text>
                      <Text
                        style={{
                          fontFamily: 'Quicksand_400Regular',
                          color: 'rgba(255,255,255,0.5)',
                        }}
                        className="text-xs"
                      >
                        Cancel anytime
                      </Text>
                    </View>
                  </View>
                  <Text
                    style={{
                      fontFamily: 'Quicksand_600SemiBold',
                      color: 'rgba(255,255,255,0.9)',
                    }}
                    className="text-xl"
                  >
                    ${subscriptionPricing.monthly.price}
                  </Text>
                </View>
              </View>
            </Pressable>
          </Animated.View>

          {/* Trust badges */}
          <Animated.View
            entering={FadeInUp.delay(800).duration(600)}
            className="flex-row justify-center mt-6 px-6"
          >
            <View className="flex-row items-center mr-6">
              <Shield size={14} color="rgba(255,255,255,0.5)" />
              <Text
                style={{ fontFamily: 'Quicksand_400Regular', color: 'rgba(255,255,255,0.5)' }}
                className="text-xs ml-1"
              >
                Secure payment
              </Text>
            </View>
            <View className="flex-row items-center">
              <Star size={14} color="rgba(255,255,255,0.5)" />
              <Text
                style={{ fontFamily: 'Quicksand_400Regular', color: 'rgba(255,255,255,0.5)' }}
                className="text-xs ml-1"
              >
                FSA/HSA eligible
              </Text>
            </View>
          </Animated.View>
        </ScrollView>

        {/* Subscribe Button */}
        <View
          style={{ paddingBottom: insets.bottom + 16 }}
          className="px-6 absolute bottom-0 left-0 right-0"
        >
          <LinearGradient
            colors={['transparent', 'rgba(30, 27, 75, 0.95)', '#1e1b4b']}
            style={{ position: 'absolute', top: -40, left: 0, right: 0, height: 60 }}
          />
          <Pressable onPress={handleSubscribe}>
            <LinearGradient
              colors={['#f9a8d4', '#c4b5fd']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                padding: 18,
                borderRadius: 16,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={20} color="#fff" />
              <Text
                style={{ fontFamily: 'Quicksand_600SemiBold', color: '#fff' }}
                className="text-base ml-2"
              >
                Start Free Trial
              </Text>
            </LinearGradient>
          </Pressable>
          <Text
            style={{ fontFamily: 'Quicksand_400Regular', color: 'rgba(255,255,255,0.5)' }}
            className="text-xs text-center mt-3"
          >
            7-day free trial, then {selectedPlan === 'yearly' ? `$${subscriptionPricing.yearly.price}/year` : `$${subscriptionPricing.monthly.price}/month`}
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
}

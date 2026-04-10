import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, Dimensions, ActivityIndicator, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp, FadeIn } from 'react-native-reanimated';
import { X, Check, Sparkles, Crown, Shield, Star, Moon, Zap, Heart, ChevronRight } from 'lucide-react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useSubscriptionStore, subscriptionPricing } from '@/lib/subscription-store';
import {
  getOfferings,
  purchasePackage,
  restorePurchases,
  hasEntitlement,
  isRevenueCatEnabled,
} from '@/lib/revenuecatClient';
import type { PurchasesPackage } from 'react-native-purchases';
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

type PlanType = 'monthly' | 'yearly' | 'lifetime';

const features = [
  {
    icon: Moon,
    title: 'Unlimited Cycle Tracking',
    description: 'Track your full cycle history forever',
    color: '#c4b5fd',
  },
  {
    icon: Sparkles,
    title: 'Luna AI Assistant',
    description: 'Personalized insights powered by AI',
    color: '#f9a8d4',
  },
  {
    icon: Heart,
    title: 'Symptom Analytics',
    description: 'Deep insights into your patterns',
    color: '#fb7185',
  },
  {
    icon: Zap,
    title: 'Premium Content',
    description: 'Exclusive guides & wellness tips',
    color: '#fbbf24',
  },
];

export default function PaywallScreen() {
  const insets = useSafeAreaInsets();
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('yearly');
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [packages, setPackages] = useState<{
    monthly?: PurchasesPackage;
    yearly?: PurchasesPackage;
    lifetime?: PurchasesPackage;
  }>({});
  const [error, setError] = useState<string | null>(null);
  const upgradeToPremium = useSubscriptionStore(s => s.upgradeToPremium);

  const [fontsLoaded] = useFonts({
    CormorantGaramond_400Regular,
    CormorantGaramond_600SemiBold,
    Quicksand_400Regular,
    Quicksand_500Medium,
    Quicksand_600SemiBold,
  });

  // Load offerings from RevenueCat
  useEffect(() => {
    const loadOfferings = async () => {
      if (!isRevenueCatEnabled()) {
        setIsLoading(false);
        return;
      }

      const result = await getOfferings();
      if (result.ok && result.data.current) {
        const availablePackages = result.data.current.availablePackages;
        const pkgMap: typeof packages = {};

        availablePackages.forEach((pkg) => {
          const id = pkg.identifier.toLowerCase();
          const productId = pkg.product?.identifier?.toLowerCase() ?? '';
          const isMonthly =
            id === '$rc_monthly' || id.includes('monthly') || productId.includes('monthly');
          const isYearly =
            id === '$rc_annual' || id.includes('annual') || id.includes('yearly') || productId.includes('annual') || productId.includes('yearly');
          const isLifetime =
            id === '$rc_lifetime' || id.includes('lifetime') || productId.includes('lifetime');

          if (isLifetime) {
            pkgMap.lifetime = pkg;
          } else if (isYearly) {
            pkgMap.yearly = pkg;
          } else if (isMonthly) {
            pkgMap.monthly = pkg;
          }
        });

        setPackages(pkgMap);
      }
      setIsLoading(false);
    };

    loadOfferings();
  }, []);

  if (!fontsLoaded) return null;

  const handlePurchase = async () => {
    console.log('[Paywall] handlePurchase called, selectedPlan:', selectedPlan);

    // Web platform handling
    if (Platform.OS === 'web') {
      setError('Purchases are only available in the mobile app. Please open the app on your iPhone to subscribe.');
      return;
    }

    const selectedPackage = packages[selectedPlan];
    console.log('[Paywall] selectedPackage:', selectedPackage?.identifier);

    if (!selectedPackage) {
      setError('Unable to load subscription. Please try again.');
      return;
    }

    setIsPurchasing(true);
    setError(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const result = await purchasePackage(selectedPackage);

    if (result.ok) {
      // Check if premium entitlement is now active
      const entitlementResult = await hasEntitlement('premium');
      if (entitlementResult.ok && entitlementResult.data) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        upgradeToPremium();
        router.back();
      }
    } else {
      if (result.reason === 'web_not_supported') {
        setError('Purchases are only available in the mobile app');
      } else if (result.reason === 'not_configured') {
        setError('Payment system is not configured');
      } else {
        // User cancelled or other error
        const errorMsg = result.error instanceof Error ? result.error.message : 'Purchase failed';
        if (!errorMsg.includes('cancelled') && !errorMsg.includes('canceled')) {
          setError(errorMsg);
        }
      }
    }

    setIsPurchasing(false);
  };

  const handleRestore = async () => {
    setIsRestoring(true);
    setError(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const result = await restorePurchases();

    if (result.ok) {
      const entitlementResult = await hasEntitlement('premium');
      if (entitlementResult.ok && entitlementResult.data) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        upgradeToPremium();
        router.back();
      } else {
        setError('No previous purchases found');
      }
    } else {
      if (result.reason === 'web_not_supported') {
        setError('Restore is only available in the mobile app');
      } else {
        setError('Failed to restore purchases');
      }
    }

    setIsRestoring(false);
  };

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const getPrice = (plan: PlanType) => {
    const pkg = packages[plan];
    if (pkg?.product?.priceString) {
      return pkg.product.priceString;
    }
    return `$${subscriptionPricing[plan].price}`;
  };

  const getPlanSubtitle = (plan: PlanType) => {
    if (plan === 'yearly') {
      const pkg = packages.yearly;
      if (pkg?.product?.price) {
        const monthlyEquiv = (pkg.product.price / 12).toFixed(2);
        return `$${monthlyEquiv}/month, billed annually`;
      }
      return `$${subscriptionPricing.yearly.monthlyEquivalent}/month, billed annually`;
    }
    if (plan === 'monthly') {
      return 'Cancel anytime';
    }
    return 'One-time purchase, forever yours';
  };

  return (
    <View className="flex-1">
      <LinearGradient
        colors={['#0f0a1e', '#1a1033', '#2d1f4e', '#1a1033']}
        locations={[0, 0.3, 0.6, 1]}
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
          contentContainerStyle={{ paddingBottom: insets.bottom + 180 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View
            entering={FadeInDown.delay(200).duration(600)}
            className="items-center px-6 mt-2"
          >
            <View
              className="w-24 h-24 rounded-full items-center justify-center mb-5"
              style={{ backgroundColor: 'rgba(196, 181, 253, 0.15)' }}
            >
              <LinearGradient
                colors={['#c4b5fd', '#f9a8d4']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Crown size={40} color="#fff" />
              </LinearGradient>
            </View>

            <Text
              style={{ fontFamily: 'CormorantGaramond_600SemiBold', color: '#fff' }}
              className="text-4xl text-center"
            >
              Unlock Premium
            </Text>
            <Text
              style={{ fontFamily: 'Quicksand_400Regular', color: 'rgba(255,255,255,0.6)' }}
              className="text-base text-center mt-2"
            >
              Your complete lunar wellness journey
            </Text>
          </Animated.View>

          {/* Features */}
          <Animated.View
            entering={FadeInUp.delay(400).duration(600)}
            className="px-6 mt-8"
          >
            {features.map((feature, index) => (
              <Animated.View
                key={feature.title}
                entering={FadeInUp.delay(450 + index * 80).duration(500)}
                className="flex-row items-center mb-4"
              >
                <View
                  className="w-12 h-12 rounded-2xl items-center justify-center mr-4"
                  style={{ backgroundColor: `${feature.color}15` }}
                >
                  <feature.icon size={22} color={feature.color} />
                </View>
                <View className="flex-1">
                  <Text
                    style={{ fontFamily: 'Quicksand_600SemiBold', color: '#fff' }}
                    className="text-base"
                  >
                    {feature.title}
                  </Text>
                  <Text
                    style={{ fontFamily: 'Quicksand_400Regular', color: 'rgba(255,255,255,0.5)' }}
                    className="text-sm mt-0.5"
                  >
                    {feature.description}
                  </Text>
                </View>
                <Check size={18} color="#c4b5fd" />
              </Animated.View>
            ))}
          </Animated.View>

          {/* Pricing Options */}
          <Animated.View
            entering={FadeInUp.delay(700).duration(600)}
            className="px-6 mt-6"
          >
            {isLoading ? (
              <View className="items-center py-8">
                <ActivityIndicator size="large" color="#c4b5fd" />
                <Text
                  style={{ fontFamily: 'Quicksand_400Regular', color: 'rgba(255,255,255,0.5)' }}
                  className="text-sm mt-3"
                >
                  Loading plans...
                </Text>
              </View>
            ) : (
              <>
                {/* Yearly Plan - Best Value */}
                <Pressable
                  onPress={() => {
                    Haptics.selectionAsync();
                    setSelectedPlan('yearly');
                  }}
                  className="mb-3"
                >
                  <LinearGradient
                    colors={selectedPlan === 'yearly'
                      ? ['rgba(196, 181, 253, 0.3)', 'rgba(249, 168, 212, 0.2)']
                      : ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.04)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                      borderRadius: 20,
                      padding: 18,
                      borderWidth: 2,
                      borderColor: selectedPlan === 'yearly' ? '#c4b5fd' : 'rgba(255,255,255,0.1)',
                    }}
                  >
                    {/* Best Value Badge */}
                    <View
                      className="absolute -top-3 left-4 px-3 py-1 rounded-full"
                      style={{ backgroundColor: '#c4b5fd' }}
                    >
                      <Text
                        style={{ fontFamily: 'Quicksand_600SemiBold', color: '#1a1033' }}
                        className="text-xs"
                      >
                        BEST VALUE
                      </Text>
                    </View>

                    <View className="flex-row items-center justify-between mt-1">
                      <View className="flex-row items-center flex-1">
                        <View
                          className="w-6 h-6 rounded-full border-2 items-center justify-center mr-3"
                          style={{
                            borderColor: selectedPlan === 'yearly' ? '#c4b5fd' : 'rgba(255,255,255,0.3)',
                            backgroundColor: selectedPlan === 'yearly' ? '#c4b5fd' : 'transparent',
                          }}
                        >
                          {selectedPlan === 'yearly' && (
                            <Check size={14} color="#1a1033" />
                          )}
                        </View>
                        <View>
                          <View className="flex-row items-center">
                            <Text
                              style={{
                                fontFamily: 'Quicksand_600SemiBold',
                                color: '#fff',
                              }}
                              className="text-lg"
                            >
                              Yearly
                            </Text>
                            <View
                              className="ml-2 px-2 py-0.5 rounded-full"
                              style={{ backgroundColor: 'rgba(249, 168, 212, 0.2)' }}
                            >
                              <Text
                                style={{ fontFamily: 'Quicksand_600SemiBold', color: '#f9a8d4' }}
                                className="text-xs"
                              >
                                SAVE 44%
                              </Text>
                            </View>
                            <View
                              className="ml-2 px-2 py-0.5 rounded-full"
                              style={{ backgroundColor: 'rgba(196, 181, 253, 0.25)' }}
                            >
                              <Text
                                style={{ fontFamily: 'Quicksand_600SemiBold', color: '#c4b5fd' }}
                                className="text-xs"
                              >
                                7-DAY FREE TRIAL
                              </Text>
                            </View>
                          </View>
                          <Text
                            style={{ fontFamily: 'Quicksand_400Regular', color: 'rgba(255,255,255,0.5)' }}
                            className="text-xs mt-0.5"
                          >
                            {getPlanSubtitle('yearly')}
                          </Text>
                        </View>
                      </View>
                      <Text
                        style={{ fontFamily: 'Quicksand_600SemiBold', color: '#fff' }}
                        className="text-xl"
                      >
                        {getPrice('yearly')}
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
                  className="mb-3"
                >
                  <View
                    className="rounded-[20px] p-[18px] border-2"
                    style={{
                      backgroundColor: selectedPlan === 'monthly' ? 'rgba(196, 181, 253, 0.1)' : 'rgba(255,255,255,0.04)',
                      borderColor: selectedPlan === 'monthly' ? '#c4b5fd' : 'rgba(255,255,255,0.1)',
                    }}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center flex-1">
                        <View
                          className="w-6 h-6 rounded-full border-2 items-center justify-center mr-3"
                          style={{
                            borderColor: selectedPlan === 'monthly' ? '#c4b5fd' : 'rgba(255,255,255,0.3)',
                            backgroundColor: selectedPlan === 'monthly' ? '#c4b5fd' : 'transparent',
                          }}
                        >
                          {selectedPlan === 'monthly' && (
                            <Check size={14} color="#1a1033" />
                          )}
                        </View>
                        <View>
                          <Text
                            style={{ fontFamily: 'Quicksand_600SemiBold', color: '#fff' }}
                            className="text-lg"
                          >
                            Monthly
                          </Text>
                          <Text
                            style={{ fontFamily: 'Quicksand_400Regular', color: 'rgba(255,255,255,0.5)' }}
                            className="text-xs mt-0.5"
                          >
                            {getPlanSubtitle('monthly')}
                          </Text>
                        </View>
                      </View>
                      <Text
                        style={{ fontFamily: 'Quicksand_600SemiBold', color: '#fff' }}
                        className="text-xl"
                      >
                        {getPrice('monthly')}
                      </Text>
                    </View>
                  </View>
                </Pressable>

                {/* Lifetime Plan */}
                <Pressable
                  onPress={() => {
                    Haptics.selectionAsync();
                    setSelectedPlan('lifetime');
                  }}
                >
                  <View
                    className="rounded-[20px] p-[18px] border-2"
                    style={{
                      backgroundColor: selectedPlan === 'lifetime' ? 'rgba(196, 181, 253, 0.1)' : 'rgba(255,255,255,0.04)',
                      borderColor: selectedPlan === 'lifetime' ? '#c4b5fd' : 'rgba(255,255,255,0.1)',
                    }}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center flex-1">
                        <View
                          className="w-6 h-6 rounded-full border-2 items-center justify-center mr-3"
                          style={{
                            borderColor: selectedPlan === 'lifetime' ? '#c4b5fd' : 'rgba(255,255,255,0.3)',
                            backgroundColor: selectedPlan === 'lifetime' ? '#c4b5fd' : 'transparent',
                          }}
                        >
                          {selectedPlan === 'lifetime' && (
                            <Check size={14} color="#1a1033" />
                          )}
                        </View>
                        <View>
                          <View className="flex-row items-center">
                            <Text
                              style={{ fontFamily: 'Quicksand_600SemiBold', color: '#fff' }}
                              className="text-lg"
                            >
                              Lifetime
                            </Text>
                            <View
                              className="ml-2 px-2 py-0.5 rounded-full"
                              style={{ backgroundColor: 'rgba(251, 191, 36, 0.2)' }}
                            >
                              <Text
                                style={{ fontFamily: 'Quicksand_600SemiBold', color: '#fbbf24' }}
                                className="text-xs"
                              >
                                ONE TIME
                              </Text>
                            </View>
                          </View>
                          <Text
                            style={{ fontFamily: 'Quicksand_400Regular', color: 'rgba(255,255,255,0.5)' }}
                            className="text-xs mt-0.5"
                          >
                            {getPlanSubtitle('lifetime')}
                          </Text>
                        </View>
                      </View>
                      <Text
                        style={{ fontFamily: 'Quicksand_600SemiBold', color: '#fff' }}
                        className="text-xl"
                      >
                        {getPrice('lifetime')}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              </>
            )}
          </Animated.View>

          {/* Error Message */}
          {error && (
            <Animated.View entering={FadeIn.duration(200)} className="px-6 mt-4">
              <View
                className="rounded-xl p-3"
                style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)' }}
              >
                <Text
                  style={{ fontFamily: 'Quicksand_500Medium', color: '#ef4444' }}
                  className="text-sm text-center"
                >
                  {error}
                </Text>
              </View>
            </Animated.View>
          )}

          {/* Trust badges */}
          <Animated.View
            entering={FadeInUp.delay(900).duration(600)}
            className="flex-row justify-center mt-6 px-6"
          >
            <View className="flex-row items-center mr-6">
              <Shield size={14} color="rgba(255,255,255,0.4)" />
              <Text
                style={{ fontFamily: 'Quicksand_400Regular', color: 'rgba(255,255,255,0.4)' }}
                className="text-xs ml-1"
              >
                Secure payment
              </Text>
            </View>
            <View className="flex-row items-center">
              <Star size={14} color="rgba(255,255,255,0.4)" />
              <Text
                style={{ fontFamily: 'Quicksand_400Regular', color: 'rgba(255,255,255,0.4)' }}
                className="text-xs ml-1"
              >
                Cancel anytime
              </Text>
            </View>
          </Animated.View>

          {/* Restore purchases */}
          <Animated.View
            entering={FadeInUp.delay(1000).duration(600)}
            className="mt-4"
          >
            <Pressable
              onPress={handleRestore}
              disabled={isRestoring}
              className="py-2"
            >
              <Text
                style={{ fontFamily: 'Quicksand_500Medium', color: 'rgba(255,255,255,0.5)' }}
                className="text-sm text-center"
              >
                {isRestoring ? 'Restoring...' : 'Restore purchases'}
              </Text>
            </Pressable>
          </Animated.View>
        </ScrollView>

        {/* Subscribe Button */}
        <View
          style={{ paddingBottom: insets.bottom + 16, backgroundColor: '#0f0a1e' }}
          className="px-6 absolute bottom-0 left-0 right-0"
        >
          <LinearGradient
            colors={['transparent', 'rgba(15, 10, 30, 0.95)', '#0f0a1e']}
            style={{ position: 'absolute', top: -60, left: 0, right: 0, height: 80 }}
            pointerEvents="none"
          />
          <Pressable
            onPress={handlePurchase}
            disabled={isPurchasing || isLoading}
            style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
          >
            <LinearGradient
              colors={['#c4b5fd', '#f9a8d4']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                padding: 18,
                borderRadius: 16,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: isPurchasing || isLoading ? 0.7 : 1,
              }}
            >
              {isPurchasing ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Sparkles size={20} color="#fff" />
                  <Text
                    style={{ fontFamily: 'Quicksand_600SemiBold', color: '#fff' }}
                    className="text-base ml-2"
                  >
                    Continue
                  </Text>
                </>
              )}
            </LinearGradient>
          </Pressable>
          <Text
            style={{ fontFamily: 'Quicksand_400Regular', color: 'rgba(255,255,255,0.4)' }}
            className="text-xs text-center mt-3"
          >
            {selectedPlan === 'lifetime'
              ? 'One-time payment, access forever'
              : selectedPlan === 'yearly'
              ? `${getPrice('yearly')}/year after 7-day free trial`
              : `${getPrice('monthly')}/month`}
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
}

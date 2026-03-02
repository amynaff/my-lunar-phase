import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type SubscriptionTier = 'free' | 'premium';

export interface SubscriptionStore {
  tier: SubscriptionTier;
  isPremium: boolean;

  // Actions
  setTier: (tier: SubscriptionTier) => void;
  upgradeToPremium: () => void;

  // Feature access helpers
  canAccessSymptomTracking: () => boolean;
  canAccessDetailedInsights: () => boolean;
  canAccessPersonalizedContent: () => boolean;
  canAccessExportData: () => boolean;
}

// Define which features are premium
export const premiumFeatures = {
  symptomTracking: {
    name: 'Symptom Tracking',
    description: 'Track and analyze your symptoms over time',
    icon: '📊',
  },
  detailedInsights: {
    name: 'Detailed Insights',
    description: 'Get personalized insights based on your data',
    icon: '💡',
  },
  personalizedContent: {
    name: 'Personalized Content',
    description: 'Receive recommendations tailored to your stage',
    icon: '✨',
  },
  exportData: {
    name: 'Export Data',
    description: 'Export your health data for your records',
    icon: '📤',
  },
  unlimitedHistory: {
    name: 'Unlimited History',
    description: 'Access all your historical data',
    icon: '📅',
  },
  prioritySupport: {
    name: 'Priority Support',
    description: 'Get help when you need it',
    icon: '💬',
  },
};

// Free tier limitations
export const freeTierLimits = {
  historyDays: 30, // Only 30 days of history
  symptomsPerDay: 3, // Can only track 3 symptoms per day
};

export const useSubscriptionStore = create<SubscriptionStore>()(
  persist(
    (set, get) => ({
      tier: 'free' as SubscriptionTier,

      get isPremium() {
        return get().tier === 'premium';
      },

      setTier: (tier: SubscriptionTier) => set({ tier }),

      upgradeToPremium: () => set({ tier: 'premium' }),

      canAccessSymptomTracking: () => get().tier === 'premium',
      canAccessDetailedInsights: () => get().tier === 'premium',
      canAccessPersonalizedContent: () => get().tier === 'premium',
      canAccessExportData: () => get().tier === 'premium',
    }),
    {
      name: 'luna-flow-subscription-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Subscription pricing (for display purposes)
export const subscriptionPricing = {
  monthly: {
    price: 2.99,
    period: 'month',
    savings: null,
    identifier: '$rc_monthly',
  },
  yearly: {
    price: 19.99,
    period: 'year',
    savings: '44%',
    monthlyEquivalent: 1.67,
    identifier: '$rc_annual',
  },
  lifetime: {
    price: 39.99,
    period: 'lifetime',
    savings: null,
    identifier: '$rc_lifetime',
  },
};

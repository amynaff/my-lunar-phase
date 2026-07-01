import { useCycleStore } from '@/lib/cycle-store';
import { useSymptomStore } from '@/lib/symptom-store';
import { useMoodStore } from '@/lib/mood-store';
import { useJournalStore } from '@/lib/journal-store';
import { useSubscriptionStore } from '@/lib/subscription-store';

/**
 * Clears all per-user local data so a different account never inherits the
 * previous user's onboarding state, life stage, cycle history, or logs.
 *
 * The cycle/symptom/mood/journal/subscription stores are persisted device-wide
 * in AsyncStorage and are NOT scoped per user, so without this a new sign-up or
 * a different sign-in lands on the previous user's home screen (e.g. straight
 * into perimenopause) and skips onboarding. Call after a successful sign-up and
 * on sign-out.
 */
export function resetUserData() {
  // Cycle: resets hasCompletedOnboarding, lifeStage, periods → new users get onboarding
  const cycle = useCycleStore.getState();
  cycle.resetOnboarding();
  cycle.clearGroceryList();

  // Logged data
  useSymptomStore.setState({ entries: [] });
  useJournalStore.setState({ entries: [] });
  useMoodStore.setState({ entries: {} });

  // Subscription falls back to free; RevenueCat re-syncs entitlements on next launch
  useSubscriptionStore.getState().setTier('free');
}

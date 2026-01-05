import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type CyclePhase = 'menstrual' | 'follicular' | 'ovulatory' | 'luteal';

export interface CycleData {
  lastPeriodStart: Date | null;
  cycleLength: number; // typically 28 days
  periodLength: number; // typically 5 days
  hasCompletedOnboarding: boolean;
}

export interface GroceryItem {
  id: string;
  name: string;
  phase: CyclePhase;
  category: string;
  isChecked: boolean;
}

interface CycleStore {
  // Cycle data
  lastPeriodStart: string | null;
  cycleLength: number;
  periodLength: number;
  hasCompletedOnboarding: boolean;

  // Grocery list
  groceryList: GroceryItem[];

  // Actions
  setLastPeriodStart: (date: Date) => void;
  setCycleLength: (days: number) => void;
  setPeriodLength: (days: number) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;

  // Grocery actions
  addGroceryItem: (item: Omit<GroceryItem, 'id'>) => void;
  removeGroceryItem: (id: string) => void;
  toggleGroceryItem: (id: string) => void;
  clearGroceryList: () => void;
  addPhaseGroceries: (phase: CyclePhase) => void;

  // Computed helpers
  getCurrentPhase: () => CyclePhase;
  getDayOfCycle: () => number;
  getPhaseProgress: () => number;
  getNextPeriodDate: () => Date | null;
  getDaysUntilNextPeriod: () => number;
}

// Phase-specific grocery suggestions
const phaseGroceries: Record<CyclePhase, Array<{ name: string; category: string }>> = {
  menstrual: [
    { name: 'Dark leafy greens (spinach, kale)', category: 'Vegetables' },
    { name: 'Red meat or lentils (iron)', category: 'Protein' },
    { name: 'Dark chocolate', category: 'Treats' },
    { name: 'Ginger tea', category: 'Beverages' },
    { name: 'Salmon', category: 'Protein' },
    { name: 'Beets', category: 'Vegetables' },
    { name: 'Bone broth', category: 'Beverages' },
    { name: 'Turmeric', category: 'Spices' },
  ],
  follicular: [
    { name: 'Fresh berries', category: 'Fruits' },
    { name: 'Avocados', category: 'Healthy Fats' },
    { name: 'Eggs', category: 'Protein' },
    { name: 'Fermented foods (kimchi, sauerkraut)', category: 'Probiotics' },
    { name: 'Broccoli', category: 'Vegetables' },
    { name: 'Citrus fruits', category: 'Fruits' },
    { name: 'Quinoa', category: 'Grains' },
    { name: 'Sprouts', category: 'Vegetables' },
  ],
  ovulatory: [
    { name: 'Raw vegetables', category: 'Vegetables' },
    { name: 'Fiber-rich grains', category: 'Grains' },
    { name: 'Almonds', category: 'Nuts' },
    { name: 'Light proteins (fish, chicken)', category: 'Protein' },
    { name: 'Asparagus', category: 'Vegetables' },
    { name: 'Coconut water', category: 'Beverages' },
    { name: 'Flaxseeds', category: 'Seeds' },
    { name: 'Tomatoes', category: 'Vegetables' },
  ],
  luteal: [
    { name: 'Complex carbs (sweet potato, brown rice)', category: 'Grains' },
    { name: 'Magnesium-rich foods (pumpkin seeds)', category: 'Seeds' },
    { name: 'Chickpeas', category: 'Protein' },
    { name: 'Cauliflower', category: 'Vegetables' },
    { name: 'Turkey', category: 'Protein' },
    { name: 'Sunflower seeds', category: 'Seeds' },
    { name: 'Chamomile tea', category: 'Beverages' },
    { name: 'Bananas', category: 'Fruits' },
  ],
};

export const useCycleStore = create<CycleStore>()(
  persist(
    (set, get) => ({
      lastPeriodStart: null,
      cycleLength: 28,
      periodLength: 5,
      hasCompletedOnboarding: false,
      groceryList: [],

      setLastPeriodStart: (date: Date) => set({ lastPeriodStart: date.toISOString() }),
      setCycleLength: (days: number) => set({ cycleLength: days }),
      setPeriodLength: (days: number) => set({ periodLength: days }),
      completeOnboarding: () => set({ hasCompletedOnboarding: true }),
      resetOnboarding: () => set({ hasCompletedOnboarding: false, lastPeriodStart: null }),

      addGroceryItem: (item) => set((state) => ({
        groceryList: [...state.groceryList, { ...item, id: Date.now().toString() }]
      })),

      removeGroceryItem: (id) => set((state) => ({
        groceryList: state.groceryList.filter(item => item.id !== id)
      })),

      toggleGroceryItem: (id) => set((state) => ({
        groceryList: state.groceryList.map(item =>
          item.id === id ? { ...item, isChecked: !item.isChecked } : item
        )
      })),

      clearGroceryList: () => set({ groceryList: [] }),

      addPhaseGroceries: (phase) => set((state) => {
        const newItems = phaseGroceries[phase].map((item, index) => ({
          id: `${Date.now()}-${index}`,
          name: item.name,
          phase,
          category: item.category,
          isChecked: false,
        }));
        return { groceryList: [...state.groceryList, ...newItems] };
      }),

      getCurrentPhase: () => {
        const { lastPeriodStart, cycleLength, periodLength } = get();
        if (!lastPeriodStart) return 'follicular';

        const start = new Date(lastPeriodStart);
        const today = new Date();
        const daysSinceStart = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        const dayOfCycle = (daysSinceStart % cycleLength) + 1;

        // Menstrual: days 1-5 (period length)
        if (dayOfCycle <= periodLength) return 'menstrual';
        // Follicular: days 6-13
        if (dayOfCycle <= 13) return 'follicular';
        // Ovulatory: days 14-17
        if (dayOfCycle <= 17) return 'ovulatory';
        // Luteal: days 18-28
        return 'luteal';
      },

      getDayOfCycle: () => {
        const { lastPeriodStart, cycleLength } = get();
        if (!lastPeriodStart) return 1;

        const start = new Date(lastPeriodStart);
        const today = new Date();
        const daysSinceStart = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        return (daysSinceStart % cycleLength) + 1;
      },

      getPhaseProgress: () => {
        const { lastPeriodStart, cycleLength, periodLength } = get();
        if (!lastPeriodStart) return 0;

        const dayOfCycle = get().getDayOfCycle();
        const phase = get().getCurrentPhase();

        switch (phase) {
          case 'menstrual':
            return dayOfCycle / periodLength;
          case 'follicular':
            return (dayOfCycle - periodLength) / (13 - periodLength);
          case 'ovulatory':
            return (dayOfCycle - 13) / 4;
          case 'luteal':
            return (dayOfCycle - 17) / (cycleLength - 17);
          default:
            return 0;
        }
      },

      getNextPeriodDate: () => {
        const { lastPeriodStart, cycleLength } = get();
        if (!lastPeriodStart) return null;

        const start = new Date(lastPeriodStart);
        const today = new Date();
        const daysSinceStart = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        const currentCycleNumber = Math.floor(daysSinceStart / cycleLength);
        const nextPeriod = new Date(start);
        nextPeriod.setDate(nextPeriod.getDate() + (currentCycleNumber + 1) * cycleLength);
        return nextPeriod;
      },

      getDaysUntilNextPeriod: () => {
        const nextPeriod = get().getNextPeriodDate();
        if (!nextPeriod) return 0;

        const today = new Date();
        return Math.ceil((nextPeriod.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      },
    }),
    {
      name: 'luna-flow-cycle-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Phase information for display
export const phaseInfo: Record<CyclePhase, {
  name: string;
  emoji: string;
  color: string;
  description: string;
  energy: string;
  superpower: string;
}> = {
  menstrual: {
    name: 'Menstrual',
    emoji: '🌑',
    color: '#be185d',
    description: 'Inner Winter - A time for rest, reflection, and gentle self-care.',
    energy: 'Low & Inward',
    superpower: 'Deep intuition & self-awareness',
  },
  follicular: {
    name: 'Follicular',
    emoji: '🌒',
    color: '#ec4899',
    description: 'Inner Spring - Fresh energy emerges. Perfect for new beginnings.',
    energy: 'Rising & Creative',
    superpower: 'New ideas & fresh perspectives',
  },
  ovulatory: {
    name: 'Ovulatory',
    emoji: '🌕',
    color: '#f9a8d4',
    description: 'Inner Summer - Peak energy and social magnetism.',
    energy: 'High & Outward',
    superpower: 'Communication & connection',
  },
  luteal: {
    name: 'Luteal',
    emoji: '🌖',
    color: '#9333ea',
    description: 'Inner Autumn - Time to complete tasks and turn inward.',
    energy: 'Winding Down',
    superpower: 'Focus & attention to detail',
  },
};

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type CyclePhase = 'menstrual' | 'follicular' | 'ovulatory' | 'luteal';
export type LifeStage = 'regular' | 'perimenopause' | 'menopause' | 'postmenopause';
export type MoonPhase = 'new_moon' | 'waxing_crescent' | 'first_quarter' | 'waxing_gibbous' | 'full_moon' | 'waning_gibbous' | 'last_quarter' | 'waning_crescent';

// Moon phase calculation based on lunar cycle (29.53 days)
export const getMoonPhase = (date: Date = new Date()): MoonPhase => {
  // Known new moon: January 6, 2000
  const knownNewMoon = new Date(2000, 0, 6, 18, 14, 0);
  const lunarCycle = 29.53058867; // days

  const daysSinceNewMoon = (date.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24);
  const moonAge = daysSinceNewMoon % lunarCycle;

  // Divide the lunar cycle into 8 phases
  if (moonAge < 1.85) return 'new_moon';
  if (moonAge < 7.38) return 'waxing_crescent';
  if (moonAge < 9.23) return 'first_quarter';
  if (moonAge < 14.77) return 'waxing_gibbous';
  if (moonAge < 16.61) return 'full_moon';
  if (moonAge < 22.15) return 'waning_gibbous';
  if (moonAge < 23.99) return 'last_quarter';
  return 'waning_crescent';
};

// Moon phase information with corresponding cycle phase energy
export const moonPhaseInfo: Record<MoonPhase, {
  name: string;
  emoji: string;
  color: string;
  description: string;
  energy: string;
  correspondingCyclePhase: CyclePhase;
}> = {
  new_moon: {
    name: 'New Moon',
    emoji: '🌑',
    color: '#1e1b4b',
    description: 'A time for rest, reflection, and setting intentions.',
    energy: 'Inward & Restorative',
    correspondingCyclePhase: 'menstrual',
  },
  waxing_crescent: {
    name: 'Waxing Crescent',
    emoji: '🌒',
    color: '#4c1d95',
    description: 'Fresh energy emerges. Plant seeds for new beginnings.',
    energy: 'Rising & Hopeful',
    correspondingCyclePhase: 'follicular',
  },
  first_quarter: {
    name: 'First Quarter',
    emoji: '🌓',
    color: '#6d28d9',
    description: 'Take action on your intentions. Build momentum.',
    energy: 'Active & Determined',
    correspondingCyclePhase: 'follicular',
  },
  waxing_gibbous: {
    name: 'Waxing Gibbous',
    emoji: '🌔',
    color: '#7c3aed',
    description: 'Refine and adjust. Trust the process.',
    energy: 'Building & Refining',
    correspondingCyclePhase: 'ovulatory',
  },
  full_moon: {
    name: 'Full Moon',
    emoji: '🌕',
    color: '#f5f3ff',
    description: 'Peak energy and illumination. Celebrate your progress.',
    energy: 'High & Radiant',
    correspondingCyclePhase: 'ovulatory',
  },
  waning_gibbous: {
    name: 'Waning Gibbous',
    emoji: '🌖',
    color: '#8b5cf6',
    description: 'Share your wisdom. Practice gratitude.',
    energy: 'Generous & Grateful',
    correspondingCyclePhase: 'luteal',
  },
  last_quarter: {
    name: 'Last Quarter',
    emoji: '🌗',
    color: '#a78bfa',
    description: 'Release what no longer serves you. Forgive and let go.',
    energy: 'Releasing & Clearing',
    correspondingCyclePhase: 'luteal',
  },
  waning_crescent: {
    name: 'Waning Crescent',
    emoji: '🌘',
    color: '#c4b5fd',
    description: 'Rest and surrender. Prepare for renewal.',
    energy: 'Restful & Surrendering',
    correspondingCyclePhase: 'menstrual',
  },
};

// Get the cycle phase equivalent for the current moon phase (for peri/menopause)
export const getMoonPhaseCycleEquivalent = (moonPhase: MoonPhase): CyclePhase => {
  return moonPhaseInfo[moonPhase].correspondingCyclePhase;
};

export interface CycleData {
  lastPeriodStart: Date | null;
  cycleLength: number; // typically 28 days
  periodLength: number; // typically 5 days
  hasCompletedOnboarding: boolean;
  lifeStage: LifeStage;
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
  lifeStage: LifeStage;

  // Grocery list
  groceryList: GroceryItem[];

  // Actions
  setLastPeriodStart: (date: Date) => void;
  setCycleLength: (days: number) => void;
  setPeriodLength: (days: number) => void;
  setLifeStage: (stage: LifeStage) => void;
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

// Phase-specific grocery suggestions (foods only, no supplements/herbs)
const phaseGroceries: Record<CyclePhase, Array<{ name: string; category: string }>> = {
  menstrual: [
    // Iron-rich proteins
    { name: 'Grass-fed beef', category: 'Protein' },
    { name: 'Salmon', category: 'Protein' },
    { name: 'Fish (any)', category: 'Protein' },
    { name: 'Chicken or poultry', category: 'Protein' },
    // Iron-rich plant foods
    { name: 'Lentils', category: 'Protein' },
    { name: 'Garbanzos (chickpeas)', category: 'Protein' },
    { name: 'Millet', category: 'Grains' },
    { name: 'Beans', category: 'Protein' },
    // Leafy greens (iron & folic acid)
    { name: 'Spinach', category: 'Vegetables' },
    { name: 'Kale', category: 'Vegetables' },
    { name: 'Swiss chard', category: 'Vegetables' },
    { name: 'Dark leafy greens', category: 'Vegetables' },
    // Seeds (iron)
    { name: 'Pumpkin seeds', category: 'Seeds' },
    { name: 'Sesame seeds', category: 'Seeds' },
    { name: 'Sunflower seeds', category: 'Seeds' },
    // Folic acid foods
    { name: 'Beets', category: 'Vegetables' },
    { name: 'Avocados', category: 'Produce' },
    { name: 'Orange juice', category: 'Beverages' },
    { name: 'Brewers yeast', category: 'Pantry' },
    // Seaweed & miso (iron & minerals)
    { name: 'Seaweed (nori, wakame)', category: 'Vegetables' },
    { name: 'Miso paste', category: 'Pantry' },
    // Vitamin C (iron absorption)
    { name: 'Oranges', category: 'Fruits' },
    { name: 'Lemons', category: 'Fruits' },
    { name: 'Apricots', category: 'Fruits' },
    { name: 'Cherries', category: 'Fruits' },
    // Other iron-rich
    { name: 'Molasses (blackstrap)', category: 'Pantry' },
    { name: 'Raisins', category: 'Fruits' },
    // Supportive
    { name: 'Ginger root', category: 'Produce' },
    { name: 'Turmeric', category: 'Spices' },
  ],
  follicular: [
    // Iodine sources
    { name: 'Fish (any)', category: 'Protein' },
    { name: 'Seaweed (kelp, dulse)', category: 'Vegetables' },
    { name: 'Lemons', category: 'Fruits' },
    // Vitamin E sources
    { name: 'Wheat germ oil', category: 'Oils' },
    { name: 'Whole grains', category: 'Grains' },
    { name: 'Sweet potatoes', category: 'Vegetables' },
    { name: 'Mixed nuts', category: 'Nuts' },
    // Linoleic acid sources
    { name: 'Raw safflower oil', category: 'Oils' },
    { name: 'Fertile eggs (pasture-raised)', category: 'Protein' },
    { name: 'Liver', category: 'Protein' },
    { name: 'Walnuts', category: 'Nuts' },
    { name: 'Sunflower seeds', category: 'Seeds' },
    { name: 'Pumpkin seeds', category: 'Seeds' },
    // Protein sources
    { name: 'Wild salmon', category: 'Protein' },
    { name: 'Chicken', category: 'Protein' },
    { name: 'Tofu', category: 'Protein' },
    { name: 'Legumes', category: 'Protein' },
    { name: 'Tahini', category: 'Pantry' },
    // Best days for dairy
    { name: 'Greek yogurt', category: 'Dairy' },
    { name: 'Cheese', category: 'Dairy' },
    { name: 'Milk', category: 'Dairy' },
    // Greens
    { name: 'Dark leafy greens', category: 'Vegetables' },
    { name: 'Parsley', category: 'Produce' },
    { name: 'Dandelion greens', category: 'Vegetables' },
    // Lecithin
    { name: 'Lecithin granules', category: 'Supplements' },
    { name: 'Fenugreek seeds', category: 'Seeds' },
  ],
  ovulatory: [
    // Vitamin B6 sources (eat raw when possible)
    { name: 'Fish (fresh)', category: 'Protein' },
    { name: 'Mixed nuts', category: 'Nuts' },
    { name: 'Avocados', category: 'Produce' },
    { name: 'Bananas', category: 'Fruits' },
    { name: 'Sprouted soybeans', category: 'Produce' },
    // Zinc sources
    { name: 'Chicken', category: 'Protein' },
    { name: 'Tuna', category: 'Protein' },
    { name: 'Pumpkin seeds', category: 'Seeds' },
    { name: 'White cornmeal', category: 'Grains' },
    { name: 'Paprika', category: 'Spices' },
    { name: 'Garlic', category: 'Produce' },
    // Niacin sources
    { name: 'Tofu', category: 'Protein' },
    { name: 'Soybeans', category: 'Protein' },
    { name: 'Sunflower seeds', category: 'Seeds' },
    { name: 'Peanut butter', category: 'Pantry' },
    { name: 'Spirulina', category: 'Supplements' },
    // Manganese sources
    { name: 'Walnuts', category: 'Nuts' },
    { name: 'Spinach', category: 'Vegetables' },
    // Kelp & greens
    { name: 'Kelp', category: 'Vegetables' },
    { name: 'Dandelion greens', category: 'Vegetables' },
    { name: 'Parsley', category: 'Produce' },
    { name: 'Watercress', category: 'Vegetables' },
    { name: 'Blueberries', category: 'Fruits' },
    // Seed cycling switch
    { name: 'Sesame seeds', category: 'Seeds' },
  ],
  luteal: [
    // Calcium sources
    { name: 'Tofu', category: 'Protein' },
    { name: 'Dark leafy greens', category: 'Vegetables' },
    { name: 'Carob powder', category: 'Pantry' },
    { name: 'Seaweed (hijiki)', category: 'Vegetables' },
    { name: 'Sesame seeds', category: 'Seeds' },
    { name: 'Soybeans/Edamame', category: 'Protein' },
    { name: 'Tahini', category: 'Pantry' },
    { name: 'Spirulina', category: 'Supplements' },
    { name: 'Greek yogurt', category: 'Dairy' },
    { name: 'Cheese', category: 'Dairy' },
    { name: 'Brewers yeast', category: 'Pantry' },
    // Magnesium sources
    { name: 'Figs', category: 'Fruits' },
    { name: 'Apricots (dried)', category: 'Fruits' },
    { name: 'Kelp', category: 'Vegetables' },
    { name: 'Blackstrap molasses', category: 'Pantry' },
    { name: 'Dates', category: 'Fruits' },
    // Phosphorus sources
    { name: 'Lecithin', category: 'Supplements' },
    { name: 'Nuts (mixed)', category: 'Nuts' },
    { name: 'Wheat germ', category: 'Grains' },
    // Potassium sources
    { name: 'Bananas', category: 'Fruits' },
    { name: 'Avocados', category: 'Produce' },
    { name: 'Potatoes', category: 'Vegetables' },
    { name: 'Carrots (for juicing)', category: 'Vegetables' },
    { name: 'Sunflower seeds', category: 'Seeds' },
    // Herbs for tea
    { name: 'Nettle tea', category: 'Beverages' },
    { name: 'Dandelion tea', category: 'Beverages' },
    { name: 'Chamomile tea', category: 'Beverages' },
  ],
};

export const useCycleStore = create<CycleStore>()(
  persist(
    (set, get) => ({
      lastPeriodStart: null,
      cycleLength: 28,
      periodLength: 5,
      hasCompletedOnboarding: false,
      lifeStage: 'regular' as LifeStage,
      groceryList: [],

      setLastPeriodStart: (date: Date) => set({ lastPeriodStart: date.toISOString() }),
      setCycleLength: (days: number) => set({ cycleLength: days }),
      setPeriodLength: (days: number) => set({ periodLength: days }),
      setLifeStage: (stage: LifeStage) => set({ lifeStage: stage }),
      completeOnboarding: () => set({ hasCompletedOnboarding: true }),
      resetOnboarding: () => set({ hasCompletedOnboarding: false, lastPeriodStart: null, lifeStage: 'regular' }),

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

// Life stage information for display
export const lifeStageInfo: Record<LifeStage, {
  name: string;
  emoji: string;
  color: string;
  description: string;
  ageRange: string;
}> = {
  regular: {
    name: 'Regular Cycles',
    emoji: '🌙',
    color: '#9d84ed',
    description: 'Your monthly rhythm guides your wellness journey.',
    ageRange: 'Reproductive years',
  },
  perimenopause: {
    name: 'Perimenopause',
    emoji: '🌗',
    color: '#f59e0b',
    description: 'A powerful transition. Your body is preparing for a new chapter.',
    ageRange: 'Usually 40s-50s',
  },
  menopause: {
    name: 'Menopause',
    emoji: '✨',
    color: '#8b5cf6',
    description: 'A time of wisdom and freedom. Embrace your second spring.',
    ageRange: '12+ months without period',
  },
  postmenopause: {
    name: 'Post Menopause',
    emoji: '🌟',
    color: '#ec4899',
    description: 'Your wisdom years. A time of renewal, clarity, and vibrant living.',
    ageRange: 'After menopause transition',
  },
};

// Perimenopause symptoms for tracking
export const perimenopauseSymptoms = [
  { id: 'hot_flashes', name: 'Hot Flashes', emoji: '🔥', category: 'vasomotor' },
  { id: 'night_sweats', name: 'Night Sweats', emoji: '💧', category: 'vasomotor' },
  { id: 'irregular_periods', name: 'Irregular Periods', emoji: '📅', category: 'menstrual' },
  { id: 'heavy_bleeding', name: 'Heavy Bleeding', emoji: '🩸', category: 'menstrual' },
  { id: 'mood_swings', name: 'Mood Swings', emoji: '🎭', category: 'mood' },
  { id: 'anxiety', name: 'Anxiety', emoji: '😰', category: 'mood' },
  { id: 'brain_fog', name: 'Brain Fog', emoji: '🌫️', category: 'cognitive' },
  { id: 'sleep_issues', name: 'Sleep Issues', emoji: '😴', category: 'sleep' },
  { id: 'fatigue', name: 'Fatigue', emoji: '🔋', category: 'energy' },
  { id: 'joint_pain', name: 'Joint Pain', emoji: '🦴', category: 'physical' },
  { id: 'weight_changes', name: 'Weight Changes', emoji: '⚖️', category: 'physical' },
  { id: 'low_libido', name: 'Low Libido', emoji: '💜', category: 'intimate' },
  { id: 'vaginal_dryness', name: 'Vaginal Dryness', emoji: '🌵', category: 'intimate' },
  { id: 'headaches', name: 'Headaches', emoji: '🤕', category: 'physical' },
  { id: 'heart_palpitations', name: 'Heart Palpitations', emoji: '💓', category: 'vasomotor' },
];

// Menopause symptoms for tracking (similar but some different focus)
export const menopauseSymptoms = [
  { id: 'hot_flashes', name: 'Hot Flashes', emoji: '🔥', category: 'vasomotor' },
  { id: 'night_sweats', name: 'Night Sweats', emoji: '💧', category: 'vasomotor' },
  { id: 'mood_changes', name: 'Mood Changes', emoji: '🎭', category: 'mood' },
  { id: 'anxiety', name: 'Anxiety', emoji: '😰', category: 'mood' },
  { id: 'depression', name: 'Low Mood', emoji: '😔', category: 'mood' },
  { id: 'brain_fog', name: 'Brain Fog', emoji: '🌫️', category: 'cognitive' },
  { id: 'memory_issues', name: 'Memory Issues', emoji: '🧠', category: 'cognitive' },
  { id: 'sleep_issues', name: 'Sleep Issues', emoji: '😴', category: 'sleep' },
  { id: 'fatigue', name: 'Fatigue', emoji: '🔋', category: 'energy' },
  { id: 'joint_pain', name: 'Joint Pain', emoji: '🦴', category: 'physical' },
  { id: 'bone_health', name: 'Bone Health Concerns', emoji: '💪', category: 'physical' },
  { id: 'weight_changes', name: 'Weight Changes', emoji: '⚖️', category: 'physical' },
  { id: 'low_libido', name: 'Low Libido', emoji: '💜', category: 'intimate' },
  { id: 'vaginal_dryness', name: 'Vaginal Dryness', emoji: '🌵', category: 'intimate' },
  { id: 'urinary_issues', name: 'Urinary Changes', emoji: '🚿', category: 'physical' },
  { id: 'skin_changes', name: 'Skin Changes', emoji: '✨', category: 'physical' },
  { id: 'hair_changes', name: 'Hair Changes', emoji: '💇', category: 'physical' },
];

// Post menopause symptoms for tracking (focus on long-term wellness)
export const postmenopauseSymptoms = [
  { id: 'bone_health', name: 'Bone Health', emoji: '🦴', category: 'physical' },
  { id: 'heart_health', name: 'Heart Health', emoji: '❤️', category: 'physical' },
  { id: 'joint_stiffness', name: 'Joint Stiffness', emoji: '🦵', category: 'physical' },
  { id: 'sleep_quality', name: 'Sleep Quality', emoji: '😴', category: 'sleep' },
  { id: 'energy_levels', name: 'Energy Levels', emoji: '⚡', category: 'energy' },
  { id: 'mood_wellness', name: 'Mood & Wellness', emoji: '🌈', category: 'mood' },
  { id: 'cognitive_clarity', name: 'Mental Clarity', emoji: '🧠', category: 'cognitive' },
  { id: 'vaginal_health', name: 'Vaginal Health', emoji: '🌸', category: 'intimate' },
  { id: 'urinary_health', name: 'Urinary Health', emoji: '💧', category: 'physical' },
  { id: 'skin_elasticity', name: 'Skin Health', emoji: '✨', category: 'physical' },
  { id: 'weight_management', name: 'Weight Management', emoji: '⚖️', category: 'physical' },
  { id: 'stress_levels', name: 'Stress Levels', emoji: '🧘', category: 'mood' },
  { id: 'social_connection', name: 'Social Connection', emoji: '👥', category: 'mood' },
  { id: 'libido', name: 'Intimacy & Libido', emoji: '💜', category: 'intimate' },
];

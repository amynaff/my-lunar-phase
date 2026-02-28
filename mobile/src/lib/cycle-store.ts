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

// Period log entry for tracking cycle history
export interface PeriodLogEntry {
  id: string;
  startDate: string; // ISO date string
  endDate?: string; // ISO date string, optional - can be updated later
  periodLength: number; // calculated from start to end
  cycleLength?: number; // calculated from previous period start to this one
  notes?: string;
}

// Cycle statistics for analysis
export interface CycleStats {
  averageCycleLength: number;
  averagePeriodLength: number;
  cycleLengthVariation: { min: number; max: number };
  isIrregular: boolean; // true if variation > 7 days or cycles outside 21-35 days
  totalCyclesTracked: number;
  lastCycleLength?: number;
  lastPeriodLength?: number;
}

interface CycleStore {
  // Cycle data
  lastPeriodStart: string | null;
  cycleLength: number;
  periodLength: number;
  hasCompletedOnboarding: boolean;
  lifeStage: LifeStage;

  // Period history
  periodHistory: PeriodLogEntry[];

  // Grocery list
  groceryList: GroceryItem[];

  // Actions
  setLastPeriodStart: (date: Date) => void;
  setCycleLength: (days: number) => void;
  setPeriodLength: (days: number) => void;
  setLifeStage: (stage: LifeStage) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;

  // Period logging actions
  logPeriodStart: (date: Date, notes?: string) => void;
  logPeriodEnd: (periodId: string, endDate: Date) => void;
  updatePeriodEntry: (periodId: string, updates: Partial<PeriodLogEntry>) => void;
  deletePeriodEntry: (periodId: string) => void;
  getCycleStats: () => CycleStats;
  getOvulationEstimate: (cycleStartDate: Date) => Date;
  getFertileWindow: (cycleStartDate: Date) => { start: Date; end: Date };
  isDateInPeriod: (date: Date) => boolean;
  isDateInFertileWindow: (date: Date) => boolean;
  isDateOvulation: (date: Date) => boolean;
  getPeriodForDate: (date: Date) => PeriodLogEntry | null;

  // Grocery actions
  addGroceryItem: (item: Omit<GroceryItem, 'id'>) => void;
  removeGroceryItem: (id: string) => void;
  toggleGroceryItem: (id: string) => void;
  clearGroceryList: () => void;
  addPhaseGroceries: (phase: CyclePhase) => void;
  addLifeStageGroceries: (lifeStage: LifeStage) => void;

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

// Life stage specific grocery suggestions
const lifeStageGroceries: Record<Exclude<LifeStage, 'regular'>, Array<{ name: string; category: string }>> = {
  perimenopause: [
    // Hormone balance & hot flash support
    { name: 'Salmon', category: 'Protein' },
    { name: 'Mackerel', category: 'Protein' },
    { name: 'Flaxseeds', category: 'Seeds' },
    { name: 'Chia seeds', category: 'Seeds' },
    // Leafy greens for bone health
    { name: 'Kale', category: 'Vegetables' },
    { name: 'Spinach', category: 'Vegetables' },
    { name: 'Broccoli', category: 'Vegetables' },
    { name: 'Brussels sprouts', category: 'Vegetables' },
    // Berries for brain health
    { name: 'Blueberries', category: 'Fruits' },
    { name: 'Strawberries', category: 'Fruits' },
    { name: 'Blackberries', category: 'Fruits' },
    // Nuts & seeds
    { name: 'Almonds', category: 'Nuts' },
    { name: 'Walnuts', category: 'Nuts' },
    { name: 'Pumpkin seeds', category: 'Seeds' },
    // Legumes & whole grains
    { name: 'Chickpeas', category: 'Protein' },
    { name: 'Lentils', category: 'Protein' },
    { name: 'Quinoa', category: 'Grains' },
    { name: 'Oats', category: 'Grains' },
    // Fermented & dairy
    { name: 'Greek yogurt', category: 'Dairy' },
    { name: 'Kefir', category: 'Dairy' },
    { name: 'Sauerkraut', category: 'Fermented' },
    { name: 'Kimchi', category: 'Fermented' },
    // Other essentials
    { name: 'Eggs', category: 'Protein' },
    { name: 'Olive oil', category: 'Oils' },
    { name: 'Sweet potatoes', category: 'Vegetables' },
    { name: 'Bone broth', category: 'Pantry' },
    { name: 'Dark chocolate (70%+)', category: 'Pantry' },
    // Cooling foods
    { name: 'Cucumber', category: 'Vegetables' },
    { name: 'Watermelon', category: 'Fruits' },
    { name: 'Chamomile tea', category: 'Beverages' },
  ],
  menopause: [
    // Bone health essentials
    { name: 'Salmon', category: 'Protein' },
    { name: 'Sardines with bones', category: 'Protein' },
    { name: 'Mackerel', category: 'Protein' },
    // Leafy greens
    { name: 'Kale', category: 'Vegetables' },
    { name: 'Spinach', category: 'Vegetables' },
    { name: 'Collard greens', category: 'Vegetables' },
    { name: 'Broccoli', category: 'Vegetables' },
    // Brain health
    { name: 'Blueberries', category: 'Fruits' },
    { name: 'Strawberries', category: 'Fruits' },
    { name: 'Oranges', category: 'Fruits' },
    // Heart-healthy fats
    { name: 'Almonds', category: 'Nuts' },
    { name: 'Walnuts', category: 'Nuts' },
    { name: 'Flaxseeds', category: 'Seeds' },
    { name: 'Chia seeds', category: 'Seeds' },
    { name: 'Olive oil', category: 'Oils' },
    { name: 'Avocados', category: 'Produce' },
    // Protein sources
    { name: 'Eggs', category: 'Protein' },
    { name: 'Tofu', category: 'Protein' },
    { name: 'Tempeh', category: 'Protein' },
    { name: 'Legumes', category: 'Protein' },
    // Whole grains & fiber
    { name: 'Quinoa', category: 'Grains' },
    { name: 'Oats', category: 'Grains' },
    { name: 'Brown rice', category: 'Grains' },
    // Calcium & probiotics
    { name: 'Greek yogurt', category: 'Dairy' },
    { name: 'Kefir', category: 'Dairy' },
    // Collagen support
    { name: 'Bone broth', category: 'Pantry' },
    { name: 'Citrus fruits', category: 'Fruits' },
  ],
  postmenopause: [
    // Heart & bone essentials
    { name: 'Salmon', category: 'Protein' },
    { name: 'Sardines with bones', category: 'Protein' },
    { name: 'Mackerel', category: 'Protein' },
    // Leafy greens
    { name: 'Kale', category: 'Vegetables' },
    { name: 'Spinach', category: 'Vegetables' },
    { name: 'Swiss chard', category: 'Vegetables' },
    // Brain health
    { name: 'Blueberries', category: 'Fruits' },
    { name: 'Walnuts', category: 'Nuts' },
    { name: 'Almonds', category: 'Nuts' },
    // Heart-healthy
    { name: 'Olive oil', category: 'Oils' },
    { name: 'Avocados', category: 'Produce' },
    { name: 'Flaxseeds', category: 'Seeds' },
    // High protein
    { name: 'Eggs', category: 'Protein' },
    { name: 'Greek yogurt', category: 'Dairy' },
    { name: 'Tofu', category: 'Protein' },
    { name: 'Legumes', category: 'Protein' },
    // Fiber & grains
    { name: 'Quinoa', category: 'Grains' },
    { name: 'Oats', category: 'Grains' },
    // Collagen & skin
    { name: 'Bone broth', category: 'Pantry' },
    { name: 'Oranges', category: 'Fruits' },
    { name: 'Bell peppers', category: 'Vegetables' },
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
      periodHistory: [],

      setLastPeriodStart: (date: Date) => set({ lastPeriodStart: date.toISOString() }),
      setCycleLength: (days: number) => set({ cycleLength: days }),
      setPeriodLength: (days: number) => set({ periodLength: days }),
      setLifeStage: (stage: LifeStage) => set({ lifeStage: stage }),
      completeOnboarding: () => set({ hasCompletedOnboarding: true }),
      resetOnboarding: () => set({ hasCompletedOnboarding: false, lastPeriodStart: null, lifeStage: 'regular', periodHistory: [] }),

      // Period logging
      logPeriodStart: (date: Date, notes?: string) => {
        const { periodHistory, periodLength } = get();
        const dateStr = date.toISOString().split('T')[0];

        // Check if we already have a period starting on this date
        const existing = periodHistory.find(p => p.startDate.split('T')[0] === dateStr);
        if (existing) return;

        // Calculate cycle length from previous period
        let cycleLength: number | undefined;
        if (periodHistory.length > 0) {
          const sortedHistory = [...periodHistory].sort((a, b) =>
            new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
          );
          const lastPeriod = sortedHistory[0];
          const daysDiff = Math.floor(
            (date.getTime() - new Date(lastPeriod.startDate).getTime()) / (1000 * 60 * 60 * 24)
          );
          if (daysDiff > 0 && daysDiff < 100) { // Reasonable cycle length
            cycleLength = daysDiff;
          }
        }

        const newEntry: PeriodLogEntry = {
          id: Date.now().toString(),
          startDate: date.toISOString(),
          periodLength: periodLength, // Default, can be updated when period ends
          cycleLength,
          notes,
        };

        set({
          periodHistory: [...periodHistory, newEntry],
          lastPeriodStart: date.toISOString(),
        });

        // Update average cycle length if we have data
        const stats = get().getCycleStats();
        if (stats.totalCyclesTracked >= 2) {
          set({ cycleLength: Math.round(stats.averageCycleLength) });
        }
      },

      logPeriodEnd: (periodId: string, endDate: Date) => {
        const { periodHistory } = get();
        const updatedHistory = periodHistory.map(entry => {
          if (entry.id === periodId) {
            const startDate = new Date(entry.startDate);
            const periodLength = Math.floor(
              (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
            ) + 1; // Include both start and end days
            return {
              ...entry,
              endDate: endDate.toISOString(),
              periodLength: Math.max(1, Math.min(periodLength, 14)), // Clamp between 1-14 days
            };
          }
          return entry;
        });
        set({ periodHistory: updatedHistory });

        // Update average period length
        const stats = get().getCycleStats();
        if (stats.totalCyclesTracked >= 1) {
          set({ periodLength: Math.round(stats.averagePeriodLength) });
        }
      },

      updatePeriodEntry: (periodId: string, updates: Partial<PeriodLogEntry>) => {
        const { periodHistory } = get();
        const updatedHistory = periodHistory.map(entry =>
          entry.id === periodId ? { ...entry, ...updates } : entry
        );
        set({ periodHistory: updatedHistory });
      },

      deletePeriodEntry: (periodId: string) => {
        const { periodHistory } = get();
        set({ periodHistory: periodHistory.filter(entry => entry.id !== periodId) });
      },

      getCycleStats: (): CycleStats => {
        const { periodHistory, cycleLength, periodLength } = get();

        if (periodHistory.length === 0) {
          return {
            averageCycleLength: cycleLength,
            averagePeriodLength: periodLength,
            cycleLengthVariation: { min: cycleLength, max: cycleLength },
            isIrregular: false,
            totalCyclesTracked: 0,
          };
        }

        // Sort by date
        const sorted = [...periodHistory].sort((a, b) =>
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        );

        // Calculate cycle lengths (from one period start to the next)
        const cycleLengths: number[] = [];
        for (let i = 1; i < sorted.length; i++) {
          const days = Math.floor(
            (new Date(sorted[i].startDate).getTime() - new Date(sorted[i-1].startDate).getTime())
            / (1000 * 60 * 60 * 24)
          );
          if (days > 0 && days < 100) { // Reasonable range
            cycleLengths.push(days);
          }
        }

        // Calculate period lengths
        const periodLengths = sorted
          .filter(p => p.periodLength > 0)
          .map(p => p.periodLength);

        const avgCycleLength = cycleLengths.length > 0
          ? cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length
          : cycleLength;

        const avgPeriodLength = periodLengths.length > 0
          ? periodLengths.reduce((a, b) => a + b, 0) / periodLengths.length
          : periodLength;

        const minCycle = cycleLengths.length > 0 ? Math.min(...cycleLengths) : cycleLength;
        const maxCycle = cycleLengths.length > 0 ? Math.max(...cycleLengths) : cycleLength;
        const variation = maxCycle - minCycle;

        // Check if irregular: variation > 7 days OR any cycle outside 21-35 day range
        const hasOutOfRangeCycle = cycleLengths.some(c => c < 21 || c > 35);
        const isIrregular = variation > 7 || hasOutOfRangeCycle;

        const lastPeriod = sorted[sorted.length - 1];
        const lastCycleLength = cycleLengths.length > 0 ? cycleLengths[cycleLengths.length - 1] : undefined;

        return {
          averageCycleLength: avgCycleLength,
          averagePeriodLength: avgPeriodLength,
          cycleLengthVariation: { min: minCycle, max: maxCycle },
          isIrregular,
          totalCyclesTracked: sorted.length,
          lastCycleLength,
          lastPeriodLength: lastPeriod?.periodLength,
        };
      },

      getOvulationEstimate: (cycleStartDate: Date): Date => {
        const { cycleLength } = get();
        // Ovulation typically occurs 14 days before the next period
        const ovulationDay = cycleLength - 14;
        const ovulationDate = new Date(cycleStartDate);
        ovulationDate.setDate(ovulationDate.getDate() + ovulationDay);
        return ovulationDate;
      },

      getFertileWindow: (cycleStartDate: Date): { start: Date; end: Date } => {
        const ovulation = get().getOvulationEstimate(cycleStartDate);
        const start = new Date(ovulation);
        start.setDate(start.getDate() - 5); // 5 days before ovulation
        const end = new Date(ovulation);
        end.setDate(end.getDate() + 1); // 1 day after ovulation
        return { start, end };
      },

      isDateInPeriod: (date: Date): boolean => {
        const { periodHistory, periodLength, lastPeriodStart, cycleLength } = get();
        const dateOnly = new Date(date.toISOString().split('T')[0]);

        // Check logged periods
        for (const period of periodHistory) {
          const start = new Date(period.startDate.split('T')[0]);
          const end = period.endDate
            ? new Date(period.endDate.split('T')[0])
            : new Date(start.getTime() + (period.periodLength - 1) * 24 * 60 * 60 * 1000);

          if (dateOnly >= start && dateOnly <= end) return true;
        }

        // Check predicted current period
        if (lastPeriodStart) {
          const lastStart = new Date(lastPeriodStart);
          const today = new Date();
          const daysSinceStart = Math.floor((today.getTime() - lastStart.getTime()) / (1000 * 60 * 60 * 24));
          const currentCycleNumber = Math.floor(daysSinceStart / cycleLength);

          const currentPeriodStart = new Date(lastStart);
          currentPeriodStart.setDate(currentPeriodStart.getDate() + currentCycleNumber * cycleLength);
          const currentPeriodEnd = new Date(currentPeriodStart);
          currentPeriodEnd.setDate(currentPeriodEnd.getDate() + periodLength - 1);

          if (dateOnly >= currentPeriodStart && dateOnly <= currentPeriodEnd) return true;
        }

        return false;
      },

      isDateInFertileWindow: (date: Date): boolean => {
        const { lastPeriodStart, cycleLength } = get();
        if (!lastPeriodStart) return false;

        const dateOnly = new Date(date.toISOString().split('T')[0]);
        const lastStart = new Date(lastPeriodStart);
        const today = new Date();
        const daysSinceStart = Math.floor((today.getTime() - lastStart.getTime()) / (1000 * 60 * 60 * 24));
        const currentCycleNumber = Math.floor(daysSinceStart / cycleLength);

        const currentCycleStart = new Date(lastStart);
        currentCycleStart.setDate(currentCycleStart.getDate() + currentCycleNumber * cycleLength);

        const fertile = get().getFertileWindow(currentCycleStart);
        return dateOnly >= fertile.start && dateOnly <= fertile.end;
      },

      isDateOvulation: (date: Date): boolean => {
        const { lastPeriodStart, cycleLength } = get();
        if (!lastPeriodStart) return false;

        const dateOnly = new Date(date.toISOString().split('T')[0]);
        const lastStart = new Date(lastPeriodStart);
        const today = new Date();
        const daysSinceStart = Math.floor((today.getTime() - lastStart.getTime()) / (1000 * 60 * 60 * 24));
        const currentCycleNumber = Math.floor(daysSinceStart / cycleLength);

        const currentCycleStart = new Date(lastStart);
        currentCycleStart.setDate(currentCycleStart.getDate() + currentCycleNumber * cycleLength);

        const ovulation = get().getOvulationEstimate(currentCycleStart);
        const ovulationOnly = new Date(ovulation.toISOString().split('T')[0]);

        return dateOnly.getTime() === ovulationOnly.getTime();
      },

      getPeriodForDate: (date: Date): PeriodLogEntry | null => {
        const { periodHistory } = get();
        const dateOnly = new Date(date.toISOString().split('T')[0]);

        for (const period of periodHistory) {
          const start = new Date(period.startDate.split('T')[0]);
          const end = period.endDate
            ? new Date(period.endDate.split('T')[0])
            : new Date(start.getTime() + (period.periodLength - 1) * 24 * 60 * 60 * 1000);

          if (dateOnly >= start && dateOnly <= end) return period;
        }
        return null;
      },

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
        const existingNames = new Set(state.groceryList.map(item => item.name.toLowerCase()));
        const newItems = phaseGroceries[phase]
          .filter(item => !existingNames.has(item.name.toLowerCase()))
          .map((item, index) => ({
            id: `${Date.now()}-${index}`,
            name: item.name,
            phase,
            category: item.category,
            isChecked: false,
          }));
        return { groceryList: [...state.groceryList, ...newItems] };
      }),

      addLifeStageGroceries: (lifeStage) => set((state) => {
        if (lifeStage === 'regular') return state; // Regular uses phase groceries
        const groceries = lifeStageGroceries[lifeStage];
        const existingNames = new Set(state.groceryList.map(item => item.name.toLowerCase()));
        const newItems = groceries
          .filter(item => !existingNames.has(item.name.toLowerCase()))
          .map((item, index) => ({
            id: `${Date.now()}-${index}`,
            name: item.name,
            phase: 'follicular' as CyclePhase, // Default phase for life stage items
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

// Intimacy & libido information by cycle phase
export const phaseIntimacyInfo: Record<CyclePhase, {
  libidoLevel: 'low' | 'rising' | 'peak' | 'variable';
  title: string;
  description: string;
  physiology: string;
  tips: string[];
  partnerTips: string[];
}> = {
  menstrual: {
    libidoLevel: 'variable',
    title: 'Rest & Reconnect',
    description: 'Libido varies during menstruation - some feel heightened desire while others prefer rest. Both are normal.',
    physiology: 'Hormones are at their lowest point. Some experience increased sensitivity and desire, while others feel more inward. Orgasms may help relieve cramps through natural endorphin release.',
    tips: [
      'Honor what feels right for your body - there\'s no "should"',
      'If interested, orgasms can help relieve menstrual cramps',
      'Focus on emotional intimacy if physical isn\'t appealing',
      'Warm baths or massage can feel nurturing',
      'Period sex is safe - use a towel if desired',
    ],
    partnerTips: [
      'Ask what feels supportive - don\'t assume',
      'Offer non-sexual physical comfort like cuddling',
      'Be understanding if energy is low',
      'Warm compresses or gentle massage can help',
    ],
  },
  follicular: {
    libidoLevel: 'rising',
    title: 'Awakening Desire',
    description: 'As estrogen rises, so does your desire. This is a time of increasing interest in connection and intimacy.',
    physiology: 'Rising estrogen increases vaginal lubrication, sensitivity, and desire. Your body is preparing for potential ovulation. Energy and confidence are building.',
    tips: [
      'Great time to initiate or plan intimate moments',
      'Explore new ideas or fantasies as curiosity peaks',
      'Communication feels easier - share your desires',
      'Energy is building - enjoy playful connection',
      'Your increasing confidence makes this a great time for date nights',
    ],
    partnerTips: [
      'Her energy and interest are increasing',
      'She may be more receptive to spontaneity',
      'Great time for playful flirtation',
      'Plan romantic activities together',
    ],
  },
  ovulatory: {
    libidoLevel: 'peak',
    title: 'Peak Desire',
    description: 'This is your biological peak for desire. High estrogen and testosterone create heightened attraction and pleasure.',
    physiology: 'Estrogen peaks, testosterone surges. Cervical mucus increases lubrication. You may feel more attractive and attracted to others. This is fertility\'s peak.',
    tips: [
      'Embrace this natural peak in desire',
      'Communication and confidence are highest - express needs',
      'Sensation and pleasure are enhanced',
      'If trying to conceive, this is your fertile window',
      'If not trying to conceive, use protection - fertility is highest',
      'You may notice increased attraction to your partner',
    ],
    partnerTips: [
      'She\'s at her most confident and radiant',
      'Desire is naturally highest now',
      'She may initiate more during this time',
      'Great time for deeper emotional and physical connection',
      'Be aware: this is peak fertility',
    ],
  },
  luteal: {
    libidoLevel: 'variable',
    title: 'Tender Connection',
    description: 'Progesterone brings a desire for deeper emotional connection. Physical intimacy may feel more meaningful when paired with emotional closeness.',
    physiology: 'Progesterone rises, potentially reducing libido for some. Others experience stable or increased desire. PMS symptoms may affect comfort levels. Need for emotional security often increases.',
    tips: [
      'Focus on emotional intimacy and connection',
      'Slower, more sensual experiences may feel best',
      'Communicate if you need more foreplay or patience',
      'Self-pleasure can help with mood and sleep',
      'Honor if your needs shift toward comfort over passion',
      'Physical touch like cuddling may feel more appealing',
    ],
    partnerTips: [
      'Emotional connection becomes more important',
      'She may need more patience and tenderness',
      'Don\'t take lower libido personally - it\'s hormonal',
      'Non-sexual physical affection is valued',
      'Creating comfort and security matters more now',
    ],
  },
};

// Intimacy information for perimenopause
export const perimenopauseIntimacyInfo = {
  title: 'Navigating Change',
  description: 'Perimenopause brings hormonal fluctuations that can affect desire, comfort, and pleasure. With understanding and adaptation, intimacy can remain fulfilling.',
  physiology: 'Fluctuating estrogen can cause vaginal dryness, reduced natural lubrication, and changes in arousal patterns. These are normal physiological changes, not signs of inadequacy.',
  commonChanges: [
    'Vaginal dryness and reduced lubrication',
    'Changes in arousal time - may take longer',
    'Fluctuating desire - high one week, low the next',
    'Hot flashes may interrupt intimate moments',
    'Sleep disruption affecting energy for intimacy',
    'Body image changes affecting confidence',
  ],
  tips: [
    'Lubricants are your friend - water or silicone-based',
    'Extended foreplay helps with arousal changes',
    'Communicate openly about what feels good now',
    'Explore new forms of pleasure and connection',
    'Regular sexual activity helps maintain vaginal health',
    'Consider vaginal moisturizers for daily comfort',
    'Temperature control during intimacy (cool room, fans)',
    'Focus on pleasure, not performance',
  ],
  partnerTips: [
    'Patience and understanding are essential',
    'Don\'t take changes personally - it\'s biology',
    'Ask what feels good - it may have changed',
    'Longer foreplay shows care, not inconvenience',
    'Emotional connection matters more than ever',
    'Be supportive about her changing body',
  ],
  selfCareTips: [
    'Kegel exercises support pelvic floor health',
    'Stay hydrated for overall vaginal health',
    'Omega-3 fatty acids may help with lubrication',
    'Regular movement increases blood flow',
    'Stress reduction supports healthy libido',
  ],
};

// Intimacy information for menopause
export const menopauseIntimacyInfo = {
  title: 'A New Chapter',
  description: 'Post-menopause, many women discover a renewed sense of freedom in intimacy - no more periods, no pregnancy concerns. With proper care, this can be a liberating time.',
  physiology: 'Lower estrogen means less natural lubrication and potential vaginal atrophy. However, regular intimacy and proper care can maintain comfort and pleasure. Desire may shift but doesn\'t disappear.',
  commonChanges: [
    'Vaginal dryness is common but manageable',
    'Vaginal tissues may thin (vaginal atrophy)',
    'Arousal may take longer',
    'Orgasms may feel different but still pleasurable',
    'Freedom from periods and pregnancy concerns',
    'Potential for deeper emotional intimacy',
  ],
  tips: [
    'Use lubricant every time - make it part of the routine',
    'Vaginal moisturizers used regularly help tissue health',
    'Regular sexual activity maintains vaginal elasticity',
    'Talk to your doctor about vaginal estrogen if needed',
    'Explore what feels good now - bodies change',
    'Embrace the freedom from contraception concerns',
    'Focus on pleasure over performance',
    'Pelvic floor exercises maintain sensation',
  ],
  partnerTips: [
    'This phase can bring renewed connection',
    'Patience with arousal changes shows love',
    'Explore new ways to connect physically',
    'Her comfort is paramount - use lubricant generously',
    'Celebrate the freedom of this phase together',
    'Focus on intimacy, not just intercourse',
  ],
  positives: [
    'No more worry about pregnancy',
    'No periods to interrupt intimacy',
    'Often more time and privacy',
    'Deeper self-knowledge about pleasure',
    'Opportunity for renewed connection',
    'Freedom to explore without constraints',
  ],
};

// Intimacy information for postmenopause
export const postmenopauseIntimacyInfo = {
  title: 'Wisdom & Pleasure',
  description: 'In postmenopause, you know yourself better than ever. Many women report satisfying intimacy well into their later years with the right care and communication.',
  physiology: 'Hormone levels have stabilized at lower levels. Vaginal health requires ongoing attention, but with proper care, pleasurable intimacy continues. Emotional and physical intimacy become deeply intertwined.',
  tips: [
    'Continued use of lubricants and moisturizers',
    'Regular intimate activity maintains vaginal health',
    'Pelvic floor exercises preserve sensation',
    'Open communication with partners about needs',
    'Explore all forms of intimacy and pleasure',
    'Consider HRT if recommended by your doctor',
    'Stay curious and open to what feels good',
  ],
  partnerTips: [
    'Connection and communication are key',
    'Physical intimacy may look different but remain meaningful',
    'Patience and presence matter most',
    'Celebrate your intimate connection',
    'Focus on pleasure in all its forms',
  ],
  wellness: [
    'Regular movement supports blood flow',
    'Heart health supports sexual health',
    'Stress management enhances desire',
    'Quality sleep improves energy for intimacy',
    'Self-acceptance enhances confidence',
  ],
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
    name: 'Menstrual Cycle',
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

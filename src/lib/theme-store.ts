import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeMode = 'light' | 'dark';

interface ThemeStore {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      mode: 'light',
      setMode: (mode) => set({ mode }),
      toggleMode: () => set({ mode: get().mode === 'light' ? 'dark' : 'light' }),
    }),
    {
      name: 'luna-flow-theme-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Theme colors
export const lightTheme = {
  // Backgrounds
  bg: {
    primary: '#f8f7ff',
    secondary: '#f0edff',
    tertiary: '#fdf2f8',
    card: 'rgba(255,255,255,0.7)',
    cardSolid: '#ffffff',
    input: 'rgba(255,255,255,0.8)',
  },
  gradient: ['#f8f7ff', '#f0edff', '#fdf2f8', '#f5f0ff', '#f8f7ff'] as [string, string, string, string, string],
  // Text
  text: {
    primary: '#4a3485',
    secondary: '#6d4fc4',
    tertiary: '#8466db',
    muted: '#b9a6f7',
    accent: '#9d84ed',
  },
  // Borders
  border: {
    light: 'rgba(185, 166, 247, 0.3)',
    medium: 'rgba(185, 166, 247, 0.5)',
  },
  // Accents
  accent: {
    pink: '#ff6289',
    purple: '#9d84ed',
    lavender: '#c4b5fd',
    rose: '#f9a8d4',
    blush: '#ff8aa6',
  },
  // Overlay
  overlay: 'rgba(0,0,0,0.4)',
  // Tab bar
  tabBar: 'rgba(255,255,255,0.95)',
};

export const darkTheme = {
  // Backgrounds
  bg: {
    primary: '#0f0a1a',
    secondary: '#1a1428',
    tertiary: '#251d35',
    card: 'rgba(37, 29, 53, 0.9)',
    cardSolid: '#251d35',
    input: 'rgba(37, 29, 53, 0.95)',
  },
  gradient: ['#0f0a1a', '#1a1428', '#1f152d', '#1a1428', '#0f0a1a'] as [string, string, string, string, string],
  // Text
  text: {
    primary: '#f0ebff',
    secondary: '#d4c7f7',
    tertiary: '#b9a6f7',
    muted: '#7a6a9e',
    accent: '#c4b5fd',
  },
  // Borders
  border: {
    light: 'rgba(185, 166, 247, 0.15)',
    medium: 'rgba(185, 166, 247, 0.25)',
  },
  // Accents (kept vibrant for contrast)
  accent: {
    pink: '#ff6289',
    purple: '#a78bfa',
    lavender: '#c4b5fd',
    rose: '#f9a8d4',
    blush: '#ff8aa6',
  },
  // Overlay
  overlay: 'rgba(0,0,0,0.6)',
  // Tab bar
  tabBar: 'rgba(15, 10, 26, 0.98)',
};

export type Theme = typeof lightTheme;

export const getTheme = (mode: ThemeMode): Theme => {
  return mode === 'light' ? lightTheme : darkTheme;
};

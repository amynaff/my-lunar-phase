# Luna Flow - Complete Code Export for Web App

Copy this entire file and paste it into Claude.ai to build a matching web app.

---

## 1. Theme System (Colors & Styles)

```typescript
// Theme colors for light and dark modes

type ThemeMode = 'light' | 'dark';

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
  gradient: ['#f8f7ff', '#f0edff', '#fdf2f8', '#f5f0ff', '#f8f7ff'],
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
  overlay: 'rgba(0,0,0,0.4)',
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
  gradient: ['#0f0a1a', '#1a1428', '#1f152d', '#1a1428', '#0f0a1a'],
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
  // Accents
  accent: {
    pink: '#ff6289',
    purple: '#a78bfa',
    lavender: '#c4b5fd',
    rose: '#f9a8d4',
    blush: '#ff8aa6',
  },
  overlay: 'rgba(0,0,0,0.6)',
  tabBar: 'rgba(15, 10, 26, 0.98)',
};
```

---

## 2. Cycle Phases & Life Stages

```typescript
export type CyclePhase = 'menstrual' | 'follicular' | 'ovulatory' | 'luteal';
export type LifeStage = 'regular' | 'perimenopause' | 'menopause';
export type MoonPhase = 'new_moon' | 'waxing_crescent' | 'first_quarter' | 'waxing_gibbous' | 'full_moon' | 'waning_gibbous' | 'last_quarter' | 'waning_crescent';

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

// Life stage information
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
};

// Moon phase information
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
```

---

## 3. Self-Care Content by Phase

```typescript
const phaseSelfCare = {
  menstrual: {
    theme: 'Rest & Reflect',
    description: 'This is your inner winter. Give yourself permission to slow down, rest deeply, and turn inward.',
    activities: [
      { name: 'Warm Bath', description: 'Add epsom salts for muscle relief' },
      { name: 'Gentle Journaling', description: 'Reflect on the past month' },
      { name: 'Cozy Movies', description: 'Comfort watching without guilt' },
      { name: 'Napping', description: 'Extra sleep is healing' },
      { name: 'Hot Drinks', description: 'Herbal tea or warm cocoa' },
      { name: 'Saying No', description: 'Cancel plans guilt-free' },
    ],
    emotions: [
      { feeling: 'Fatigue', normalcy: 'Completely normal', tip: 'Rest is productive during this phase' },
      { feeling: 'Introspection', normalcy: 'Natural tendency', tip: 'Use this time for self-reflection' },
      { feeling: 'Emotional sensitivity', normalcy: 'Hormonal shift', tip: 'Be extra gentle with yourself' },
    ],
    affirmations: [
      'I deserve rest and restoration',
      'My body knows what it needs',
      'Slowing down is a form of self-love',
      'I release what no longer serves me',
    ],
    journalPrompts: [
      'What do I need to release from this cycle?',
      'How can I be gentler with myself today?',
      'What brought me joy this past month?',
    ],
  },
  follicular: {
    theme: 'Create & Explore',
    description: 'Your inner spring has arrived! Fresh energy wants to be channeled into new projects and experiences.',
    activities: [
      { name: 'Start New Projects', description: 'Your creativity is peaking' },
      { name: 'Social Plans', description: 'Energy for connecting' },
      { name: 'Try Something New', description: 'Learn a skill, visit somewhere' },
      { name: 'Creative Expression', description: 'Art, writing, crafts' },
      { name: 'Plan & Organize', description: 'Great mental clarity now' },
      { name: 'Morning Rituals', description: 'Establish energizing routines' },
    ],
    emotions: [
      { feeling: 'Optimism', normalcy: 'Rising estrogen', tip: 'Capture this energy in plans' },
      { feeling: 'Curiosity', normalcy: 'Brain is sharp', tip: 'Learn something new' },
      { feeling: 'Confidence growing', normalcy: 'Natural progression', tip: 'Take on new challenges' },
    ],
    affirmations: [
      'I am open to new possibilities',
      'My creativity flows freely',
      'I embrace new beginnings with joy',
      'I have the energy to pursue my dreams',
    ],
    journalPrompts: [
      'What new project excites me most?',
      'What do I want to create this cycle?',
      'Where does my curiosity lead me?',
    ],
  },
  ovulatory: {
    theme: 'Connect & Shine',
    description: "Your inner summer is here! You're magnetic and communicative. Perfect time for important conversations.",
    activities: [
      { name: 'Important Conversations', description: 'Communication skills peak' },
      { name: 'Date Nights', description: 'Connection feels natural' },
      { name: 'Networking', description: 'Your charisma is high' },
      { name: 'Public Speaking', description: 'Confidence is highest' },
      { name: 'Celebrations', description: 'Host or attend gatherings' },
      { name: 'Self-Expression', description: 'Dress up, feel radiant' },
    ],
    emotions: [
      { feeling: 'Confidence', normalcy: 'Peak estrogen effect', tip: 'Use it for bold moves' },
      { feeling: 'Social energy', normalcy: 'Biological design', tip: 'Connect deeply with others' },
      { feeling: 'Radiance', normalcy: 'Natural glow time', tip: 'Schedule photos, events' },
    ],
    affirmations: [
      'I radiate confidence and warmth',
      'My voice deserves to be heard',
      'I attract wonderful connections',
      'I celebrate my power and presence',
    ],
    journalPrompts: [
      'What important truth do I need to speak?',
      'How can I nurture my relationships?',
      'What makes me feel most confident?',
    ],
  },
  luteal: {
    theme: 'Complete & Nurture',
    description: 'Your inner autumn calls for completion and self-nurturing. Finish projects, nest at home, and honor your need for comfort.',
    activities: [
      { name: 'Finish Projects', description: 'Detail-oriented thinking' },
      { name: 'Home Nesting', description: 'Organize, clean, cozy up' },
      { name: 'Comfort Activities', description: 'Baking, crafts, hobbies' },
      { name: 'Boundary Setting', description: "It's okay to need space" },
      { name: 'Gentle Movement', description: 'Yoga, walks, stretching' },
      { name: 'Early Bedtimes', description: 'Honor your need for rest' },
    ],
    emotions: [
      { feeling: 'Need for solitude', normalcy: 'Progesterone effect', tip: 'Honor your boundaries' },
      { feeling: 'Irritability', normalcy: 'Hormone fluctuation', tip: 'This will pass - be patient' },
      { feeling: 'Detail-focused', normalcy: 'Natural strength now', tip: 'Review and complete tasks' },
    ],
    affirmations: [
      'I honor my need for rest and space',
      'My feelings are valid and temporary',
      'I am enough exactly as I am',
      "I trust my body's wisdom",
    ],
    journalPrompts: [
      'What do I need to complete before my next cycle?',
      'How can I create more comfort in my life?',
      'What boundaries do I need to set?',
    ],
  },
};

// Perimenopause self-care
const perimenopauseSelfCare = {
  theme: 'Navigate & Nurture',
  description: 'Perimenopause is a profound transition. Honor the changes with compassion, support your body, and embrace this powerful shift.',
  activities: [
    { name: 'Stress Management', description: 'Meditation, breathing exercises' },
    { name: 'Sleep Hygiene', description: 'Cool room, consistent schedule' },
    { name: 'Connection', description: 'Talk to others going through this' },
    { name: 'Journaling', description: 'Track symptoms and patterns' },
    { name: 'Cooling Practices', description: 'Cold water, fans, light clothing' },
    { name: 'Brain Games', description: 'Puzzles, learning to support cognition' },
  ],
  emotions: [
    { feeling: 'Mood swings', normalcy: 'Hormone fluctuations', tip: 'Practice self-compassion - this is temporary' },
    { feeling: 'Anxiety', normalcy: 'Common during transition', tip: 'Try breathing exercises and grounding' },
    { feeling: 'Brain fog', normalcy: 'Estrogen affects cognition', tip: 'Lists, routines, and sleep help' },
    { feeling: 'Irritability', normalcy: 'Part of the process', tip: 'Take breaks, communicate your needs' },
  ],
  affirmations: [
    'My body is transitioning, not failing',
    'I embrace this powerful phase of life',
    'I deserve patience and understanding',
    'My wisdom grows with each passing day',
    'This transition is leading me to freedom',
  ],
  journalPrompts: [
    'What symptoms am I noticing, and what triggers them?',
    'How can I be more patient with myself during this transition?',
    'What support do I need right now?',
    'What wisdom have I gained that I want to carry forward?',
  ],
};

// Menopause self-care
const menopauseSelfCare = {
  theme: 'Embrace & Thrive',
  description: 'Welcome to your second spring! Menopause is not an ending but a new beginning. Focus on what lights you up and live fully.',
  activities: [
    { name: 'Pursue Passions', description: 'Time to focus on you' },
    { name: 'Community', description: 'Connect with like-minded women' },
    { name: 'Self-Care Rituals', description: 'Skincare, massage, pampering' },
    { name: 'Mindfulness', description: 'Meditation and presence' },
    { name: 'Creative Expression', description: 'Art, writing, music' },
    { name: 'Adventure', description: 'Travel, new experiences' },
  ],
  emotions: [
    { feeling: 'Liberation', normalcy: 'Common experience', tip: 'Embrace the freedom of this stage' },
    { feeling: 'Identity shifts', normalcy: 'Natural process', tip: 'Explore who you are becoming' },
    { feeling: 'Wisdom', normalcy: 'Life experience shining', tip: 'Share your knowledge with others' },
    { feeling: 'Occasional sadness', normalcy: 'Grief for the past', tip: 'Allow it, then look forward' },
  ],
  affirmations: [
    'I am entering the most powerful phase of my life',
    'My best years are ahead of me',
    'I am wise, beautiful, and full of purpose',
    'I celebrate the woman I have become',
    'My experience makes me invaluable',
  ],
  journalPrompts: [
    'What do I want this chapter of my life to look like?',
    'What dreams have I set aside that I can pursue now?',
    'How do I want to share my wisdom with the world?',
    'What brings me the most joy and fulfillment?',
  ],
};
```

---

## 4. Labs Guide Content

```typescript
const labCategories = [
  {
    id: 'basic',
    title: 'Basic Panels',
    color: '#f472b6',
    description: 'Foundation tests for overall health',
    labs: ['CBC (Complete Blood Count)', 'CMP (Comprehensive Metabolic Panel)'],
  },
  {
    id: 'hormones',
    title: 'Sex Hormones',
    color: '#c084fc',
    description: 'Key reproductive hormones',
    labs: [
      'Free & Total Testosterone',
      'Estrone + Estradiol',
      'Progesterone',
      'DHEA-S',
      'SHBG',
      'FSH',
      'LH',
      'Prolactin',
    ],
  },
  {
    id: 'thyroid',
    title: 'Thyroid Function',
    color: '#fbbf24',
    description: 'Comprehensive thyroid assessment',
    labs: [
      'TSH',
      'Free T3',
      'Free T4',
      'Reverse T3',
      'TPO Antibodies',
      'Thyroglobulin Antibodies',
    ],
  },
  {
    id: 'metabolic',
    title: 'Metabolic Health',
    color: '#34d399',
    description: 'Metabolism and blood sugar markers',
    labs: ['Cortisol AM', 'Fasting Insulin', 'HbA1C'],
  },
  {
    id: 'cardiovascular',
    title: 'Cardiovascular',
    color: '#60a5fa',
    description: 'Heart and inflammation markers',
    labs: ['Lipid Panel', 'ApoB', 'Lp(a)', 'ESR', 'hs-CRP'],
  },
  {
    id: 'optional',
    title: 'Consider Adding',
    color: '#a78bfa',
    description: 'Additional helpful markers',
    labs: ['Vitamin D', 'AMH (Anti-Müllerian Hormone)', 'Inhibin B'],
  },
];

const labsGuideIntro = {
  title: 'Take Control of Your Health',
  message1: 'We check cholesterol. We check blood sugar. But hormones that affect everything? Apparently optional.',
  message2: "It's recommended that every woman get a full hormone blood panel at least yearly—if not every six months—starting at age 35. If your insurance won't cover it, there are places to get reasonably priced labs.",
  importantNote: 'You need a provider or doctor that you can trust to analyze the labs, discuss where they should optimally be, and then come up with a custom, realistic, understandable plan to help you execute.',
};
```

---

## 5. Typography

**Fonts to use:**
- **Cormorant Garamond** (Google Fonts) - Headers, titles, affirmations
  - Weights: 400 (Regular), 600 (SemiBold)
- **Quicksand** (Google Fonts) - Body text, UI elements
  - Weights: 400 (Regular), 500 (Medium), 600 (SemiBold)

**Font Sizes:**
- App title: 38px
- Screen titles: 28-32px
- Section headers: 18px
- Card titles: 16px
- Body text: 14px
- Labels/captions: 12px
- Tiny labels: 10px

---

## 6. Component Patterns (CSS/Tailwind)

```css
/* Cards */
.card {
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  border-radius: 16px;
  padding: 16px;
}

/* Primary Button */
.btn-primary {
  background: linear-gradient(90deg, #f9a8d4, #9d84ed);
  border-radius: 16px;
  padding: 18px 24px;
  color: white;
  font-family: 'Quicksand', sans-serif;
  font-weight: 600;
}

/* Premium Badge (Illuminated Moon Effect) */
.premium-badge {
  background: linear-gradient(135deg, #fff9e6, #ffe066, #ffc107);
  border: 1px solid #ffd54f;
  border-radius: 20px;
}
.premium-badge .title { color: #92400e; }
.premium-badge .subtitle { color: #b45309; }

/* Section Headers */
.section-header {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-accent);
  margin-bottom: 16px;
  font-family: 'Quicksand', sans-serif;
  font-weight: 600;
}

/* Gradient Background */
.gradient-bg {
  background: linear-gradient(
    180deg,
    #f8f7ff 0%,
    #f0edff 25%,
    #fdf2f8 50%,
    #f5f0ff 75%,
    #f8f7ff 100%
  );
}
```

---

## 7. Icons

Use **Lucide Icons** (lucide-react for web):
- Moon, Sun - Cycle/theme
- Heart - Care/favorites
- Crown - Premium
- ChevronRight - Navigation
- FlaskConical - Labs
- Users - Partner support
- Calendar - Dates
- Sparkles - Special features
- X - Close

---

## 8. App Screens

**Main Tabs:**
1. Home - Dashboard with current phase, cycle day, moon phase
2. Nutrition - Phase-specific food recommendations
3. Movement - Exercise suggestions
4. Care - Self-care, affirmations, journal prompts

**Sub-screens:**
- Settings
- Partner Support (invite/connect)
- Labs Guide
- Community (anonymous stories)
- Privacy Policy
- Onboarding
- Paywall

---

## 9. Content Tone

- Empowering, supportive, warm
- Use "Inner Winter/Spring/Summer/Autumn" metaphors
- Affirmations in elegant quotes
- Focus on wisdom, self-care, body trust
- Inclusive of all life stages (regular cycles, perimenopause, menopause)

---

This export contains everything needed to build a matching Luna Flow web experience!

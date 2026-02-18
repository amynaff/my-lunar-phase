# Luna Flow - Design System

A comprehensive design system for building a matching web app for Luna Flow, a women's wellness and cycle tracking application.

---

## App Overview

**Luna Flow** is a women's wellness app that helps users understand and work with their body's natural rhythms. It supports three life stages:
- **Regular Cycles** - Monthly menstrual cycle tracking
- **Perimenopause** - Transition support (usually 40s-50s)
- **Menopause** - Post-menstrual wellness (moon-phase guided)

---

## Typography

### Fonts

1. **Cormorant Garamond** - Headers, titles, elegant display text
   - Weights: 400 (Regular), 600 (SemiBold)
   - Use for: App title, screen titles, quotes, affirmations

2. **Quicksand** - Body text, UI elements
   - Weights: 400 (Regular), 500 (Medium), 600 (SemiBold)
   - Use for: Labels, buttons, body text, navigation

### Font Sizes (Mobile)
- App title: 38px
- Screen titles: 28-32px (text-3xl)
- Section headers: 18px (text-lg)
- Card titles: 16px (text-base)
- Body text: 14px (text-sm)
- Labels/captions: 12px (text-xs)
- Tiny labels: 10px (text-[10px])

---

## Color System

### Light Theme

```css
/* Backgrounds */
--bg-primary: #f8f7ff;      /* Main background */
--bg-secondary: #f0edff;    /* Secondary surfaces */
--bg-tertiary: #fdf2f8;     /* Pink-tinted areas */
--bg-card: rgba(255,255,255,0.7);  /* Cards with transparency */
--bg-card-solid: #ffffff;   /* Solid card backgrounds */
--bg-input: rgba(255,255,255,0.8); /* Input fields */

/* Background Gradient (5 stops) */
--gradient: ['#f8f7ff', '#f0edff', '#fdf2f8', '#f5f0ff', '#f8f7ff']

/* Text Colors */
--text-primary: #4a3485;    /* Main text - deep purple */
--text-secondary: #6d4fc4;  /* Secondary text */
--text-tertiary: #8466db;   /* Tertiary text */
--text-muted: #b9a6f7;      /* Muted/placeholder */
--text-accent: #9d84ed;     /* Accent text */

/* Border Colors */
--border-light: rgba(185, 166, 247, 0.3);
--border-medium: rgba(185, 166, 247, 0.5);

/* Accent Colors */
--accent-pink: #ff6289;     /* Warnings, period phase */
--accent-purple: #9d84ed;   /* Primary accent */
--accent-lavender: #c4b5fd; /* Soft accent */
--accent-rose: #f9a8d4;     /* Soft pink accent */
--accent-blush: #ff8aa6;    /* Warm pink */

/* Utility */
--overlay: rgba(0,0,0,0.4);
--tab-bar: rgba(255,255,255,0.95);
```

### Dark Theme

```css
/* Backgrounds */
--bg-primary: #0f0a1a;      /* Main background - deep purple-black */
--bg-secondary: #1a1428;    /* Secondary surfaces */
--bg-tertiary: #251d35;     /* Tertiary surfaces */
--bg-card: rgba(37, 29, 53, 0.9);  /* Cards */
--bg-card-solid: #251d35;   /* Solid cards */
--bg-input: rgba(37, 29, 53, 0.95);

/* Background Gradient */
--gradient: ['#0f0a1a', '#1a1428', '#1f152d', '#1a1428', '#0f0a1a']

/* Text Colors */
--text-primary: #f0ebff;    /* Main text - soft white */
--text-secondary: #d4c7f7;  /* Secondary */
--text-tertiary: #b9a6f7;   /* Tertiary */
--text-muted: #7a6a9e;      /* Muted */
--text-accent: #c4b5fd;     /* Accent */

/* Border Colors */
--border-light: rgba(185, 166, 247, 0.15);
--border-medium: rgba(185, 166, 247, 0.25);

/* Accent Colors (same as light for vibrancy) */
--accent-pink: #ff6289;
--accent-purple: #a78bfa;
--accent-lavender: #c4b5fd;
--accent-rose: #f9a8d4;
--accent-blush: #ff8aa6;

/* Utility */
--overlay: rgba(0,0,0,0.6);
--tab-bar: rgba(15, 10, 26, 0.98);
```

---

## Cycle Phase Colors

Each menstrual cycle phase has a distinct color:

| Phase | Color | Emoji | Description |
|-------|-------|-------|-------------|
| Menstrual | `#be185d` | 🌑 | Inner Winter - Rest & reflection |
| Follicular | `#ec4899` | 🌒 | Inner Spring - New beginnings |
| Ovulatory | `#f9a8d4` | 🌕 | Inner Summer - Peak energy |
| Luteal | `#9333ea` | 🌖 | Inner Autumn - Winding down |

---

## Life Stage Colors

| Stage | Color | Emoji |
|-------|-------|-------|
| Regular Cycles | `#9d84ed` | 🌙 |
| Perimenopause | `#f59e0b` (amber) | 🌗 |
| Menopause | `#8b5cf6` (violet) | ✨ |

---

## Moon Phase Colors

| Phase | Color | Emoji |
|-------|-------|-------|
| New Moon | `#1e1b4b` | 🌑 |
| Waxing Crescent | `#4c1d95` | 🌒 |
| First Quarter | `#6d28d9` | 🌓 |
| Waxing Gibbous | `#7c3aed` | 🌔 |
| Full Moon | `#f5f3ff` | 🌕 |
| Waning Gibbous | `#8b5cf6` | 🌖 |
| Last Quarter | `#a78bfa` | 🌗 |
| Waning Crescent | `#c4b5fd` | 🌘 |

---

## Component Patterns

### Cards

```css
/* Standard Card */
.card {
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  border-radius: 16px; /* rounded-2xl */
  padding: 16px;
}

/* Feature Card */
.feature-card {
  border-radius: 20px; /* rounded-[20px] */
  padding: 20px;
}

/* Gradient Card */
.gradient-card {
  background: linear-gradient(135deg, rgba(249, 168, 212, 0.2), rgba(196, 181, 253, 0.2));
  border-radius: 20px;
}
```

### Buttons

```css
/* Primary Button */
.btn-primary {
  background: linear-gradient(90deg, var(--accent-rose), var(--accent-purple));
  border-radius: 16px;
  padding: 18px 24px;
  color: white;
  font-family: 'Quicksand', sans-serif;
  font-weight: 600;
}

/* Secondary Button */
.btn-secondary {
  background: var(--bg-secondary);
  border: 1px solid var(--border-light);
  border-radius: 16px;
  padding: 14px 20px;
}

/* Icon Button */
.btn-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--bg-card);
  border: 1px solid var(--border-light);
}
```

### Premium Member Badge (Illuminated Moon Effect)

```css
.premium-badge {
  background: linear-gradient(135deg, #fff9e6, #ffe066, #ffc107);
  border: 1px solid #ffd54f;
  border-radius: 20px;
}

.premium-badge .icon-container {
  background: rgba(255, 255, 255, 0.6);
}

.premium-badge .title {
  color: #92400e; /* warm brown */
}

.premium-badge .subtitle {
  color: #b45309;
}
```

### Input Fields

```css
.input {
  background: var(--bg-input);
  border: 1.5px solid var(--border-light);
  border-radius: 16px;
  padding: 14px 18px;
  font-family: 'Quicksand', sans-serif;
  font-size: 16px;
}

.input:focus {
  border-color: var(--accent-purple);
}
```

### Icon Containers

```css
/* Circular icon badge */
.icon-badge {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(var(--phase-color), 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Larger icon badge */
.icon-badge-lg {
  width: 64px;
  height: 64px;
  border-radius: 50%;
}
```

---

## Layout Patterns

### Screen Structure

```
┌─────────────────────────────┐
│  SafeAreaView (top inset)   │
├─────────────────────────────┤
│  Header (px-6, pt-4)        │
│  - Title (Cormorant)        │
│  - Close/Action button      │
├─────────────────────────────┤
│  ScrollView Content         │
│  - Cards (mx-6, mt-6)       │
│  - Sections with headers    │
│  - paddingBottom: 140px     │
│    (for tab bar)            │
├─────────────────────────────┤
│  Tab Bar                    │
│  (sticky bottom)            │
└─────────────────────────────┘
```

### Spacing Scale

- `4px` - Tiny gaps
- `8px` - Small gaps (mt-2)
- `12px` - Medium gaps (mt-3)
- `16px` - Standard spacing (mt-4, p-4)
- `20px` - Card padding
- `24px` - Screen horizontal padding (px-6)
- `32px` - Section gaps (mt-8)

### Border Radius Scale

- `8px` - Small elements
- `12px` - Chips, tags (rounded-xl)
- `16px` - Cards, buttons (rounded-2xl)
- `20px` - Large cards (rounded-[20px])
- `24px` - Feature cards (rounded-3xl)
- `50%` - Circles

---

## Tab Bar

4 main tabs:
1. **Home** - Moon/cycle icon - Main dashboard
2. **Nutrition** - Apple icon - Food recommendations
3. **Movement** - Activity icon - Exercise suggestions
4. **Care** - Heart icon - Self-care & affirmations

---

## App Screens

### Main Tabs
1. **Home** - Dashboard with current phase, cycle day, moon phase
2. **Nutrition** - Phase-specific food recommendations, grocery lists
3. **Movement** - Exercise suggestions for current phase
4. **Care (Self-Care)** - Affirmations, journal prompts, emotional support

### Settings & Sub-screens
- **Settings** - Life stage, cycle info, appearance, partner support
- **Partner Settings** - Invite/connect with partner
- **Partner View** - View partner's cycle (for connected partners)
- **Labs Guide** - Recommended hormone panel tests
- **Community** - Anonymous women's stories
- **Privacy Policy**
- **Onboarding** - Initial setup flow
- **Paywall** - Premium subscription
- **Luna AI** - AI chat assistant

---

## Animations

Using `react-native-reanimated`:

```javascript
// Fade in from top
FadeInDown.delay(100).duration(600)

// Fade in from bottom
FadeInUp.delay(200).duration(600)

// Staggered list items
FadeInUp.delay(index * 50).duration(500)

// Spring effect
FadeInDown.delay(100).duration(900).springify()
```

---

## Icons

Using `lucide-react` (web) or `lucide-react-native`:

Common icons used:
- `Moon` - Cycle/lunar
- `Heart` - Care/favorites
- `Crown` - Premium
- `Settings` / `X` - Close/settings
- `ChevronRight` - Navigation
- `FlaskConical` - Labs
- `Users` - Partner support
- `Calendar` - Dates
- `Sun` / `Moon` - Theme toggle
- `Sparkles` - Special features

---

## Key UI Patterns

### Section Headers
```html
<p class="text-xs uppercase tracking-wider text-accent mb-4 font-quicksand-semibold">
  Section Title
</p>
```

### Horizontal Scroll Cards (Affirmations)
- Cards: 220px width, 16px padding
- Gap between cards: 12px
- Horizontal padding: 24px on container
- Show partial next card to indicate scrollability

### Expandable Categories (Labs Guide)
- Tap to expand/collapse
- Chevron icon rotates
- Smooth height animation
- Bullet points with colored dots

### Gradient Backgrounds
Always use 5-stop gradients for main backgrounds to create depth.

---

## Content Tone

- Empowering, supportive, warm
- Use "Inner Winter/Spring/Summer/Autumn" metaphors for phases
- Affirmations in quotes with elegant font
- Focus on wisdom, self-care, body trust
- Inclusive of all life stages

---

## Sample Affirmations by Phase

**Menstrual:**
- "I deserve rest and restoration"
- "My body knows what it needs"

**Follicular:**
- "I am open to new possibilities"
- "My creativity flows freely"

**Ovulatory:**
- "I radiate confidence and warmth"
- "My voice deserves to be heard"

**Luteal:**
- "I honor my need for rest and space"
- "My feelings are valid and temporary"

**Menopause:**
- "I am entering the most powerful phase of my life"
- "My best years are ahead of me"

---

## Technical Notes for Web

- Use CSS custom properties for theme switching
- Implement responsive design (mobile-first)
- Use CSS gradients for backgrounds
- Consider using Framer Motion for animations (web equivalent)
- Use system fonts with Google Fonts fallback
- Implement dark mode via CSS `prefers-color-scheme` + toggle

---

This design system should give Claude.ai everything needed to build a matching web experience for Luna Flow!

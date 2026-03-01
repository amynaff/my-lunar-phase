import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import {
  X,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Moon,
  Sun,
  Leaf,
  Heart,
  Brain,
  Shield,
  AlertTriangle,
  Stethoscope,
  Pill,
  Activity,
  Zap,
  Wind,
  Droplets,
  Scale,
} from 'lucide-react-native';
import { useThemeStore, getTheme } from '@/lib/theme-store';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
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

interface EducationSection {
  id: string;
  title: string;
  subtitle: string;
  icon: typeof Heart;
  color: string;
  content: ContentBlock[];
}

interface ContentBlock {
  type: 'paragraph' | 'heading' | 'bullet' | 'warning' | 'tip';
  text: string;
}

const educationSections: EducationSection[] = [
  {
    id: 'understanding',
    title: 'Understanding Hormonal Balance',
    subtitle: 'The foundation of wellness',
    icon: Scale,
    color: '#c084fc',
    content: [
      {
        type: 'paragraph',
        text: 'Many women experience hormonal imbalances at various life stages—whether dealing with PCOS, endometriosis, PMS, perimenopause, or postmenopause. Common symptoms include irregular periods, heavy bleeding, mood changes, weight challenges, fatigue, brain fog, and inflammation.',
      },
      {
        type: 'heading',
        text: 'The Role of Estrogen Dominance',
      },
      {
        type: 'paragraph',
        text: 'A common misunderstanding is that symptoms stem from simple estrogen deficiency. In reality, low or inconsistent progesterone often creates relative estrogen dominance—where estrogen\'s effects become unopposed or exaggerated, even when estrogen levels appear normal or low.',
      },
      {
        type: 'heading',
        text: 'Why This Happens',
      },
      {
        type: 'paragraph',
        text: 'Progesterone levels can be disrupted by irregular ovulation (PCOS), decline dramatically in perimenopause, or drop to near-zero after menopause. Several factors worsen this pattern:',
      },
      {
        type: 'bullet',
        text: 'Chronic stress elevates cortisol, stealing progesterone precursors',
      },
      {
        type: 'bullet',
        text: 'Nutrient deficiencies impair hormone production',
      },
      {
        type: 'bullet',
        text: 'Irregular ovulation reduces natural progesterone',
      },
      {
        type: 'bullet',
        text: 'Environmental estrogens (xenoestrogens) add to estrogen load',
      },
      {
        type: 'heading',
        text: 'The Progesterone-to-Estrogen Ratio',
      },
      {
        type: 'paragraph',
        text: 'A disrupted progesterone-to-estrogen ratio (ideally aiming for 200–500 or higher) allows estrogen to promote cell proliferation, suppress thyroid function, encourage fat storage, thicken blood, impair mitochondrial energy production, and contribute to insulin resistance.',
      },
    ],
  },
  {
    id: 'progesterone',
    title: 'Progesterone: The Protective Hormone',
    subtitle: 'Often the first priority',
    icon: Shield,
    color: '#34d399',
    content: [
      {
        type: 'paragraph',
        text: 'Bioidentical progesterone is often the primary foundation of hormone support. This hormone addresses many symptoms directly and provides crucial protective effects.',
      },
      {
        type: 'heading',
        text: 'Key Benefits of Progesterone',
      },
      {
        type: 'bullet',
        text: 'Balances relative estrogen effects',
      },
      {
        type: 'bullet',
        text: 'Eases night sweats and sleep disturbances',
      },
      {
        type: 'bullet',
        text: 'Supports mood and stress resilience',
      },
      {
        type: 'bullet',
        text: 'Reduces inflammation throughout the body',
      },
      {
        type: 'bullet',
        text: 'Protects against unchecked cell growth',
      },
      {
        type: 'bullet',
        text: 'Benefits mitochondrial function and energy',
      },
      {
        type: 'bullet',
        text: 'Supports bone health',
      },
      {
        type: 'tip',
        text: 'Topical creams or other non-oral forms are commonly preferred for better absorption and fewer side effects.',
      },
    ],
  },
  {
    id: 'supportive',
    title: 'Supportive Hormones',
    subtitle: 'DHEA, Pregnenolone & Thyroid',
    icon: Zap,
    color: '#fbbf24',
    content: [
      {
        type: 'heading',
        text: 'DHEA (Low Doses)',
      },
      {
        type: 'paragraph',
        text: 'As a precursor hormone and "youth supporter," DHEA can help lower elevated cortisol and improve energy, libido, and overall vitality.',
      },
      {
        type: 'heading',
        text: 'Pregnenolone',
      },
      {
        type: 'paragraph',
        text: 'This upstream precursor to many steroid hormones fills age-related gaps, supporting brain function, mood, and energy production.',
      },
      {
        type: 'heading',
        text: 'Thyroid Support',
      },
      {
        type: 'paragraph',
        text: 'Thyroid function frequently declines with age, contributing to fatigue, weight challenges, and cognitive fog. Natural desiccated thyroid (if indicated by testing) can make a significant difference.',
      },
      {
        type: 'tip',
        text: 'Always test thyroid comprehensively: TSH, Free T3, Free T4, Reverse T3, and antibodies.',
      },
    ],
  },
  {
    id: 'estrogen',
    title: 'When to Consider Estrogen',
    subtitle: 'After foundational support',
    icon: Droplets,
    color: '#f472b6',
    content: [
      {
        type: 'paragraph',
        text: 'Only after optimizing protective elements—progesterone, DHEA, pregnenolone, thyroid, and lifestyle—should estrogen be considered if symptoms persist.',
      },
      {
        type: 'heading',
        text: 'Indications for Estrogen',
      },
      {
        type: 'bullet',
        text: 'Persistent vaginal dryness unresponsive to other treatments',
      },
      {
        type: 'bullet',
        text: 'Severe hot flashes affecting quality of life',
      },
      {
        type: 'bullet',
        text: 'Low energy despite other optimizations',
      },
      {
        type: 'heading',
        text: 'Safe Use Guidelines',
      },
      {
        type: 'bullet',
        text: 'Use bioidentical forms (topical cream preferred)',
      },
      {
        type: 'bullet',
        text: 'Never oral or applied to the face for systemic safety',
      },
      {
        type: 'bullet',
        text: 'Always pair with adequate progesterone',
      },
      {
        type: 'bullet',
        text: 'Symptom-guided, as-needed dosing often favored',
      },
      {
        type: 'warning',
        text: 'Estrogen should always be balanced with progesterone to minimize risks like tissue proliferation or clotting.',
      },
    ],
  },
  {
    id: 'lifestyle',
    title: 'Lifestyle Foundations',
    subtitle: 'Natural hormone support',
    icon: Leaf,
    color: '#22c55e',
    content: [
      {
        type: 'paragraph',
        text: 'Lifestyle fundamentals form the base of any hormone optimization strategy, supporting natural hormone production and detoxification.',
      },
      {
        type: 'heading',
        text: 'Sleep Optimization',
      },
      {
        type: 'paragraph',
        text: 'Quality sleep is essential for hormone production. Aim for 7-9 hours in a cool, dark room. Poor sleep elevates cortisol and disrupts the entire hormonal cascade.',
      },
      {
        type: 'heading',
        text: 'Natural Light Exposure',
      },
      {
        type: 'paragraph',
        text: 'Morning sunlight helps regulate cortisol awakening response and supports vitamin D production, which acts as a hormone itself.',
      },
      {
        type: 'heading',
        text: 'Movement',
      },
      {
        type: 'paragraph',
        text: 'Regular physical activity improves insulin sensitivity, supports bone health, and helps manage stress. Include both strength training and gentle movement.',
      },
      {
        type: 'heading',
        text: 'Nutrient-Dense Nutrition',
      },
      {
        type: 'bullet',
        text: 'Quality proteins for hormone building blocks',
      },
      {
        type: 'bullet',
        text: 'Healthy fats for hormone production',
      },
      {
        type: 'bullet',
        text: 'Fiber for estrogen detoxification',
      },
      {
        type: 'bullet',
        text: 'Minimize processed foods and alcohol',
      },
    ],
  },
  {
    id: 'cautions',
    title: 'What to Approach with Caution',
    subtitle: 'Not all natural is helpful',
    icon: AlertTriangle,
    color: '#ef4444',
    content: [
      {
        type: 'paragraph',
        text: 'Some commonly recommended supplements may not be as helpful as believed, or may even worsen certain imbalances.',
      },
      {
        type: 'heading',
        text: 'Wild Yam Cream',
      },
      {
        type: 'paragraph',
        text: 'Does not reliably convert to progesterone in the body and may have estrogenic activity. Not a substitute for bioidentical progesterone.',
      },
      {
        type: 'heading',
        text: 'Vitex/Chasteberry',
      },
      {
        type: 'paragraph',
        text: 'While sometimes helpful for cycling women, its effects in menopause are unpredictable and may not address the root imbalance.',
      },
      {
        type: 'heading',
        text: 'DIM and Flaxseed',
      },
      {
        type: 'paragraph',
        text: 'These may not sufficiently balance estrogen or could increase estrogen load in some cases. Individual response varies significantly.',
      },
      {
        type: 'warning',
        text: 'Hormones form an interconnected network—adjusting one impacts others. Isolated replacement can sometimes create new imbalances.',
      },
    ],
  },
  {
    id: 'pcos',
    title: 'PCOS Support',
    subtitle: 'Polycystic ovary syndrome',
    icon: Heart,
    color: '#f472b6',
    content: [
      {
        type: 'paragraph',
        text: 'PCOS frequently involves estrogen dominance (unopposed due to irregular ovulation), high androgens, insulin resistance, and chronic inflammation. This can lead to irregular/heavy periods, acne, hair growth/loss, weight challenges, fatigue, and fertility concerns.',
      },
      {
        type: 'heading',
        text: 'Bioidentical Progesterone',
      },
      {
        type: 'paragraph',
        text: 'Often emphasized as first-line support. It helps oppose excess estrogen, supports regular ovulation (which can lower androgens), lightens heavy flows, improves sleep/mood, and protects tissues.',
      },
      {
        type: 'bullet',
        text: 'Cyclic use (e.g., days 14–28) via topical cream or oral micronized capsules',
      },
      {
        type: 'bullet',
        text: 'Better tolerated with fewer side effects than synthetics',
      },
      {
        type: 'heading',
        text: 'Address Insulin Resistance',
      },
      {
        type: 'paragraph',
        text: 'This is crucial for PCOS. Insulin resistance drives androgen production and worsens symptoms.',
      },
      {
        type: 'bullet',
        text: 'Low-glycemic, nutrient-dense nutrition',
      },
      {
        type: 'bullet',
        text: 'Regular movement (both strength and cardio)',
      },
      {
        type: 'bullet',
        text: 'Supportive supplements: myo-inositol, berberine, omega-3s',
      },
      {
        type: 'bullet',
        text: 'Spearmint tea may help lower androgens',
      },
      {
        type: 'warning',
        text: 'Avoid synthetic progestins which can have androgenic effects. Estrogen should only be added with caution after optimizing progesterone, always balanced to avoid worsening dominance.',
      },
    ],
  },
  {
    id: 'endometriosis',
    title: 'Endometriosis Support',
    subtitle: 'Managing inflammation & pain',
    icon: Shield,
    color: '#a78bfa',
    content: [
      {
        type: 'paragraph',
        text: 'Endometriosis involves estrogen dominance, chronic inflammation, and immune dysfunction. The focus is on opposing excess estrogen effects and reducing inflammation rather than simply suppressing cycles.',
      },
      {
        type: 'heading',
        text: 'Progesterone as Primary Support',
      },
      {
        type: 'bullet',
        text: 'Helps oppose excess estrogen at tissue level',
      },
      {
        type: 'bullet',
        text: 'Reduces inflammation throughout the body',
      },
      {
        type: 'bullet',
        text: 'May help suppress lesion growth and immune dysfunction',
      },
      {
        type: 'bullet',
        text: 'Eases cramps and pelvic pain',
      },
      {
        type: 'bullet',
        text: 'Lightens heavy flows',
      },
      {
        type: 'heading',
        text: 'Anti-Inflammatory Foundation',
      },
      {
        type: 'bullet',
        text: 'Anti-inflammatory diet: high fiber, omega-3s, low processed foods',
      },
      {
        type: 'bullet',
        text: 'Gut health support for proper estrogen detoxification',
      },
      {
        type: 'bullet',
        text: 'Stress reduction (cortisol worsens inflammation)',
      },
      {
        type: 'bullet',
        text: 'Sleep optimization for immune function',
      },
      {
        type: 'tip',
        text: 'Endometriosis is estrogen-sensitive—routine estrogen addition is often avoided. Focus on progesterone and anti-inflammatory supports first.',
      },
    ],
  },
  {
    id: 'pms',
    title: 'PMS & Cycle Support',
    subtitle: 'For regular menstrual cycles',
    icon: Moon,
    color: '#06b6d4',
    content: [
      {
        type: 'paragraph',
        text: 'For typical PMS (mood swings, bloating, cramps, irritability), the focus is on gentle cycle support and reducing hormonal fluctuations during the luteal phase.',
      },
      {
        type: 'heading',
        text: 'Cyclic Progesterone Support',
      },
      {
        type: 'paragraph',
        text: 'Bioidentical progesterone in the luteal phase (second half of cycle) can help:',
      },
      {
        type: 'bullet',
        text: 'Calm the brain and stabilize mood',
      },
      {
        type: 'bullet',
        text: 'Reduce inflammation and ease cramps',
      },
      {
        type: 'bullet',
        text: 'Relieve breast tenderness and bloating',
      },
      {
        type: 'bullet',
        text: 'Improve sleep quality',
      },
      {
        type: 'heading',
        text: 'Foundational Nutrients',
      },
      {
        type: 'bullet',
        text: 'Magnesium (200–400 mg daily) for cramps and mood',
      },
      {
        type: 'bullet',
        text: 'Vitamin B6 for mood and water balance',
      },
      {
        type: 'bullet',
        text: 'Calcium for overall comfort',
      },
      {
        type: 'bullet',
        text: 'Evening primrose oil for breast tenderness',
      },
      {
        type: 'heading',
        text: 'Lifestyle Emphasis',
      },
      {
        type: 'bullet',
        text: 'Consistent sleep schedule',
      },
      {
        type: 'bullet',
        text: 'Regular movement',
      },
      {
        type: 'bullet',
        text: 'Reduced caffeine, sugar, and alcohol',
      },
      {
        type: 'bullet',
        text: 'Stress management practices',
      },
      {
        type: 'tip',
        text: 'Chasteberry (Vitex) may support natural progesterone production in cycling women, though effects vary individually.',
      },
    ],
  },
  {
    id: 'testing',
    title: 'Testing & Monitoring',
    subtitle: 'Track ratios, not just levels',
    icon: Activity,
    color: '#60a5fa',
    content: [
      {
        type: 'paragraph',
        text: 'Effective hormone management requires looking at the full picture—ratios between hormones matter more than isolated levels.',
      },
      {
        type: 'heading',
        text: 'Key Tests to Request',
      },
      {
        type: 'bullet',
        text: 'Estradiol and Estrone (both estrogen forms)',
      },
      {
        type: 'bullet',
        text: 'Progesterone (ideally day 19-21 if cycling)',
      },
      {
        type: 'bullet',
        text: 'DHEA-S',
      },
      {
        type: 'bullet',
        text: 'Cortisol (AM and/or 4-point saliva)',
      },
      {
        type: 'bullet',
        text: 'Complete thyroid panel',
      },
      {
        type: 'bullet',
        text: 'Fasting insulin and glucose',
      },
      {
        type: 'heading',
        text: 'The Goal',
      },
      {
        type: 'paragraph',
        text: 'Rather than chasing "normal" ranges, aim for optimal ratios and symptom resolution.',
      },
      {
        type: 'tip',
        text: 'For personalized recommendations, consult a knowledgeable practitioner for testing, monitoring, and tailored dosing.',
      },
    ],
  },
];

export default function HormonalEducationScreen() {
  const insets = useSafeAreaInsets();
  const themeMode = useThemeStore((s) => s.mode);
  const theme = getTheme(themeMode);
  const [expandedSections, setExpandedSections] = useState<string[]>(['understanding']);

  const [fontsLoaded] = useFonts({
    CormorantGaramond_400Regular,
    CormorantGaramond_600SemiBold,
    Quicksand_400Regular,
    Quicksand_500Medium,
    Quicksand_600SemiBold,
  });

  if (!fontsLoaded) return null;

  const toggleSection = (id: string) => {
    Haptics.selectionAsync();
    setExpandedSections((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const renderContentBlock = (block: ContentBlock, index: number) => {
    switch (block.type) {
      case 'heading':
        return (
          <Text
            key={index}
            style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
            className="text-sm mt-4 mb-2"
          >
            {block.text}
          </Text>
        );
      case 'paragraph':
        return (
          <Text
            key={index}
            style={{
              fontFamily: 'Quicksand_400Regular',
              color: theme.text.secondary,
              lineHeight: 22,
            }}
            className="text-sm mb-2"
          >
            {block.text}
          </Text>
        );
      case 'bullet':
        return (
          <View key={index} className="flex-row items-start mb-1.5 pl-2">
            <Text
              style={{ fontFamily: 'Quicksand_400Regular', color: theme.accent.purple }}
              className="mr-2"
            >
              •
            </Text>
            <Text
              style={{
                fontFamily: 'Quicksand_400Regular',
                color: theme.text.secondary,
                lineHeight: 20,
              }}
              className="text-sm flex-1"
            >
              {block.text}
            </Text>
          </View>
        );
      case 'warning':
        return (
          <View
            key={index}
            className="flex-row items-start p-3 rounded-xl mt-3"
            style={{ backgroundColor: `${theme.accent.pink}15` }}
          >
            <AlertTriangle size={16} color={theme.accent.pink} style={{ marginTop: 2 }} />
            <Text
              style={{
                fontFamily: 'Quicksand_500Medium',
                color: theme.accent.pink,
                lineHeight: 20,
              }}
              className="text-xs flex-1 ml-2"
            >
              {block.text}
            </Text>
          </View>
        );
      case 'tip':
        return (
          <View
            key={index}
            className="flex-row items-start p-3 rounded-xl mt-3"
            style={{ backgroundColor: `${theme.accent.purple}10` }}
          >
            <Sparkles size={16} color={theme.accent.purple} style={{ marginTop: 2 }} />
            <Text
              style={{
                fontFamily: 'Quicksand_500Medium',
                color: theme.accent.purple,
                lineHeight: 20,
              }}
              className="text-xs flex-1 ml-2"
            >
              {block.text}
            </Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View className="flex-1">
      <LinearGradient
        colors={theme.gradient}
        locations={[0, 0.25, 0.5, 0.75, 1]}
        style={{ flex: 1 }}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View
            entering={FadeInDown.delay(100).duration(600)}
            style={{ paddingTop: insets.top + 16 }}
            className="px-6"
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View
                  className="w-10 h-10 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: `${theme.accent.purple}20` }}
                >
                  <Brain size={20} color={theme.accent.purple} />
                </View>
                <View className="flex-1">
                  <Text
                    style={{ fontFamily: 'CormorantGaramond_600SemiBold', color: theme.text.primary }}
                    className="text-2xl"
                  >
                    Hormonal Health
                  </Text>
                  <Text
                    style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.muted }}
                    className="text-xs"
                  >
                    Education & Understanding
                  </Text>
                </View>
              </View>
              <Pressable
                onPress={() => router.back()}
                className="w-10 h-10 rounded-full items-center justify-center border"
                style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light }}
              >
                <X size={20} color={theme.accent.purple} />
              </Pressable>
            </View>
          </Animated.View>

          {/* Medical Disclaimer */}
          <Animated.View
            entering={FadeInUp.delay(150).duration(600)}
            className="mx-6 mt-6"
          >
            <View
              className="rounded-2xl p-4 border flex-row items-start"
              style={{ backgroundColor: `${theme.accent.pink}08`, borderColor: `${theme.accent.pink}30` }}
            >
              <Stethoscope size={20} color={theme.accent.pink} style={{ marginTop: 2 }} />
              <View className="flex-1 ml-3">
                <Text
                  style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.accent.pink }}
                  className="text-sm mb-1"
                >
                  Work with a Qualified Practitioner
                </Text>
                <Text
                  style={{
                    fontFamily: 'Quicksand_400Regular',
                    color: theme.text.secondary,
                    lineHeight: 20,
                  }}
                  className="text-xs"
                >
                  For personalized recommendations, consult a knowledgeable practitioner for testing, monitoring, and tailored dosing.
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* Introduction */}
          <Animated.View
            entering={FadeInUp.delay(200).duration(600)}
            className="mx-6 mt-4"
          >
            <View
              className="rounded-2xl p-5 border"
              style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light }}
            >
              <Text
                style={{ fontFamily: 'CormorantGaramond_600SemiBold', color: theme.text.primary }}
                className="text-xl mb-3"
              >
                A Balanced Approach
              </Text>
              <Text
                style={{
                  fontFamily: 'Quicksand_400Regular',
                  color: theme.text.secondary,
                  lineHeight: 22,
                }}
                className="text-sm"
              >
                Whether you're navigating PCOS, endometriosis, PMS, perimenopause, or postmenopause, a protective approach focuses on restoring hormonal harmony rather than simply adding estrogen. This means prioritizing foundational supports first, using bioidentical hormones tailored to your individual needs.
              </Text>
              <Text
                style={{
                  fontFamily: 'Quicksand_400Regular',
                  color: theme.text.secondary,
                  lineHeight: 22,
                }}
                className="text-sm mt-3"
              >
                Many women find improved energy, mood, sleep, metabolism, and overall vitality through this individualized, root-cause-focused method.
              </Text>
            </View>
          </Animated.View>

          {/* Priority Strategy Card */}
          <Animated.View
            entering={FadeInUp.delay(250).duration(600)}
            className="mx-6 mt-4"
          >
            <View
              className="rounded-2xl p-4 border"
              style={{ backgroundColor: `${theme.accent.purple}08`, borderColor: `${theme.accent.purple}20` }}
            >
              <View className="flex-row items-center mb-3">
                <Pill size={18} color={theme.accent.purple} />
                <Text
                  style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.accent.purple }}
                  className="text-sm ml-2"
                >
                  Prioritized Support Strategy
                </Text>
              </View>
              <View className="flex-row flex-wrap" style={{ gap: 8 }}>
                {['Progesterone', 'DHEA', 'Pregnenolone', 'Thyroid', 'Lifestyle'].map(
                  (item, index) => (
                    <View
                      key={item}
                      className="flex-row items-center px-3 py-1.5 rounded-full"
                      style={{ backgroundColor: theme.bg.card }}
                    >
                      <Text
                        style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.accent.purple }}
                        className="text-xs mr-1"
                      >
                        {index + 1}.
                      </Text>
                      <Text
                        style={{ fontFamily: 'Quicksand_500Medium', color: theme.text.secondary }}
                        className="text-xs"
                      >
                        {item}
                      </Text>
                    </View>
                  )
                )}
                <View
                  className="flex-row items-center px-3 py-1.5 rounded-full"
                  style={{ backgroundColor: `${theme.accent.pink}15` }}
                >
                  <Text
                    style={{ fontFamily: 'Quicksand_500Medium', color: theme.accent.pink }}
                    className="text-xs"
                  >
                    Then Estrogen (if needed)
                  </Text>
                </View>
              </View>
            </View>
          </Animated.View>

          {/* Education Sections */}
          <Animated.View
            entering={FadeInUp.delay(300).duration(600)}
            className="mx-6 mt-6"
          >
            <Text
              style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.accent }}
              className="text-xs uppercase tracking-wider mb-4"
            >
              Learn More
            </Text>

            {educationSections.map((section, index) => {
              const isExpanded = expandedSections.includes(section.id);
              const Icon = section.icon;

              return (
                <Animated.View
                  key={section.id}
                  entering={FadeInUp.delay(350 + index * 50).duration(400)}
                  className="mb-3"
                >
                  <Pressable
                    onPress={() => toggleSection(section.id)}
                    className="rounded-2xl border overflow-hidden"
                    style={{
                      backgroundColor: theme.bg.card,
                      borderColor: isExpanded ? `${section.color}40` : theme.border.light,
                    }}
                  >
                    {/* Section Header */}
                    <View className="flex-row items-center p-4">
                      <View
                        className="w-10 h-10 rounded-xl items-center justify-center"
                        style={{ backgroundColor: `${section.color}20` }}
                      >
                        <Icon size={20} color={section.color} />
                      </View>
                      <View className="flex-1 ml-3">
                        <Text
                          style={{
                            fontFamily: 'Quicksand_600SemiBold',
                            color: theme.text.primary,
                          }}
                          className="text-sm"
                        >
                          {section.title}
                        </Text>
                        <Text
                          style={{
                            fontFamily: 'Quicksand_400Regular',
                            color: theme.text.muted,
                          }}
                          className="text-xs"
                        >
                          {section.subtitle}
                        </Text>
                      </View>
                      {isExpanded ? (
                        <ChevronUp size={20} color={theme.text.tertiary} />
                      ) : (
                        <ChevronDown size={20} color={theme.text.tertiary} />
                      )}
                    </View>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <View
                        className="px-4 pb-4 pt-0"
                        style={{ borderTopWidth: 1, borderTopColor: theme.border.light }}
                      >
                        <View className="pt-3">
                          {section.content.map((block, blockIndex) =>
                            renderContentBlock(block, blockIndex)
                          )}
                        </View>
                      </View>
                    )}
                  </Pressable>
                </Animated.View>
              );
            })}
          </Animated.View>

          {/* Bioidentical vs Synthetic Note */}
          <Animated.View
            entering={FadeInUp.delay(600).duration(600)}
            className="mx-6 mt-4"
          >
            <View
              className="rounded-2xl p-4 border"
              style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light }}
            >
              <View className="flex-row items-center mb-2">
                <Heart size={16} color={theme.accent.purple} />
                <Text
                  style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }}
                  className="text-sm ml-2"
                >
                  Why Bioidentical?
                </Text>
              </View>
              <Text
                style={{
                  fontFamily: 'Quicksand_400Regular',
                  color: theme.text.secondary,
                  lineHeight: 20,
                }}
                className="text-xs"
              >
                Bioidentical hormones are molecularly identical to what your body naturally produces. They are often better tolerated than synthetics and can be dosed precisely to your individual needs.
              </Text>
            </View>
          </Animated.View>

          {/* Final Disclaimer */}
          <Animated.View
            entering={FadeInUp.delay(650).duration(600)}
            className="mx-6 mt-6"
          >
            <Text
              style={{
                fontFamily: 'Quicksand_400Regular',
                color: theme.text.muted,
                lineHeight: 18,
              }}
              className="text-xs text-center"
            >
              This content is educational. For personalized recommendations, consult a knowledgeable practitioner for testing, monitoring, and tailored dosing.
            </Text>
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

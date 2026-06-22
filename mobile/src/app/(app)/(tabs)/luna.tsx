import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInUp, FadeInDown, FadeIn } from 'react-native-reanimated';
import { Send, Sparkles, Moon, Trash2, Stethoscope, X, Check, AlertCircle } from 'lucide-react-native';
import { useCycleStore, getMoonPhase, moonPhaseInfo, phaseInfo, type CyclePhase, type LifeStage } from '@/lib/cycle-store';
import { useThemeStore, getTheme } from '@/lib/theme-store';
import { useLocalSearchParams, router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
  useFonts,
  Quicksand_400Regular,
  Quicksand_500Medium,
  Quicksand_600SemiBold,
} from '@expo-google-fonts/quicksand';
import {
  CormorantGaramond_400Regular,
  CormorantGaramond_600SemiBold,
} from '@expo-google-fonts/cormorant-garamond';
import { fetch } from 'expo/fetch';
import { getAuthCookie } from '@/lib/auth/auth-client';
import { useSession } from '@/lib/auth/use-session';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL!;

const getJsonHeaders = () => ({
  'Content-Type': 'application/json',
  Cookie: getAuthCookie(),
});

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Phase-specific prompt suggestions
const getPhasePrompts = (lifeStage: LifeStage, currentPhase: CyclePhase): string[] => {
  if (lifeStage === 'regular') {
    switch (currentPhase) {
      case 'menstrual':
        return [
          "I'm on my period and feeling exhausted — what should I eat?",
          "Gentle movement ideas while I'm menstruating",
          "I'm menstruating and having bad cramps, any natural relief?",
          "Best teas and warming foods during my period",
          "What is PCOS and how does it affect my cycle?",
          "What is endometriosis and what are the symptoms?",
          "How to manage PCOS naturally with diet and lifestyle",
          "How to treat endometriosis pain naturally",
          "How can I support my iron levels during menstruation?",
          "I'm on my period and craving chocolate — healthy swaps?",
        ];
      case 'follicular':
        return [
          "I'm in my follicular phase — what should I eat to boost energy?",
          "Best workouts for my follicular phase",
          "I'm feeling creative and energized — how do I channel this?",
          "What foods support estrogen production right now?",
          "Follicular phase meal plan ideas",
          "How do I make the most of this high-energy phase?",
        ];
      case 'ovulatory':
        return [
          "I'm ovulating today — what's the best workout?",
          "What should I eat during ovulation?",
          "I'm ovulating and feeling social — how do I harness this energy?",
          "Peak performance foods for my ovulatory phase",
          "High intensity or low intensity exercise today?",
          "How does ovulation affect my mood and skin?",
        ];
      case 'luteal':
        return [
          "I'm in my luteal phase and feeling irritable — what helps?",
          "Healthy comfort foods for my luteal phase",
          "I'm PMS-ing and bloated — what should I eat?",
          "Gentle exercises for the luteal phase",
          "How do I manage mood swings before my period?",
          "Why am I so tired in my luteal phase?",
        ];
    }
  }

  if (lifeStage === 'perimenopause') {
    return [
      "I'm in perimenopause and can't sleep — what helps?",
      "Managing hot flashes naturally during perimenopause",
      "Best foods for perimenopause hormone balance",
      "I'm perimenopausal and feeling anxious — what should I do?",
      "Exercise that helps with perimenopause symptoms",
      "Brain fog during perimenopause — any tips?",
      "Why is my period so irregular right now?",
      "Best supplements for perimenopause",
    ];
  }

  if (lifeStage === 'menopause') {
    return [
      "I'm in menopause and having hot flashes — what foods help?",
      "Best exercises for menopause weight management",
      "How do I protect my bone health during menopause?",
      "Night sweats keeping me up — natural solutions?",
      "Menopause and mood changes — what can I do?",
      "Heart-healthy foods for menopause",
      "How to maintain muscle during menopause",
      "Managing menopause fatigue naturally",
    ];
  }

  // postmenopause
  return [
    "I'm postmenopausal and my joints ache — what should I eat?",
    "Best exercises for postmenopausal bone density",
    "How do I keep my heart healthy after menopause?",
    "I'm postmenopausal and feeling tired — what foods give energy?",
    "Maintaining muscle strength after menopause",
    "Brain health foods for postmenopause",
    "Best supplements for postmenopausal women",
    "How to stay active and strong after menopause",
  ];
};

// Common symptoms by life stage
const getSymptomOptions = (lifeStage: string) => {
  const commonSymptoms = [
    { id: 'fatigue', name: 'Fatigue', emoji: '😴' },
    { id: 'headache', name: 'Headache', emoji: '🤕' },
    { id: 'bloating', name: 'Bloating', emoji: '🎈' },
    { id: 'mood_swings', name: 'Mood Swings', emoji: '🎭' },
    { id: 'sleep_issues', name: 'Sleep Issues', emoji: '😵' },
    { id: 'cramps', name: 'Cramps', emoji: '💫' },
  ];

  if (lifeStage === 'perimenopause') {
    return [
      ...commonSymptoms,
      { id: 'hot_flashes', name: 'Hot Flashes', emoji: '🔥' },
      { id: 'night_sweats', name: 'Night Sweats', emoji: '💦' },
      { id: 'irregular_periods', name: 'Irregular Periods', emoji: '📅' },
      { id: 'brain_fog', name: 'Brain Fog', emoji: '🌫️' },
      { id: 'anxiety', name: 'Anxiety', emoji: '😰' },
      { id: 'joint_pain', name: 'Joint Pain', emoji: '🦴' },
    ];
  }

  if (lifeStage === 'menopause' || lifeStage === 'postmenopause') {
    return [
      { id: 'hot_flashes', name: 'Hot Flashes', emoji: '🔥' },
      { id: 'night_sweats', name: 'Night Sweats', emoji: '💦' },
      { id: 'sleep_issues', name: 'Sleep Issues', emoji: '😵' },
      { id: 'brain_fog', name: 'Brain Fog', emoji: '🌫️' },
      { id: 'mood_changes', name: 'Mood Changes', emoji: '🎭' },
      { id: 'fatigue', name: 'Fatigue', emoji: '😴' },
      { id: 'joint_pain', name: 'Joint Pain', emoji: '🦴' },
      { id: 'vaginal_dryness', name: 'Vaginal Dryness', emoji: '💧' },
      { id: 'weight_changes', name: 'Weight Changes', emoji: '⚖️' },
      { id: 'hair_changes', name: 'Hair Changes', emoji: '💇' },
    ];
  }

  return [
    ...commonSymptoms,
    { id: 'breast_tenderness', name: 'Breast Tenderness', emoji: '💗' },
    { id: 'acne', name: 'Acne', emoji: '✨' },
    { id: 'cravings', name: 'Food Cravings', emoji: '🍫' },
    { id: 'back_pain', name: 'Back Pain', emoji: '🔙' },
    { id: 'anxiety', name: 'Anxiety', emoji: '😰' },
    { id: 'irritability', name: 'Irritability', emoji: '😤' },
  ];
};

export default function LunaTabScreen() {
  const insets = useSafeAreaInsets();
  const themeMode = useThemeStore((s) => s.mode);
  const theme = getTheme(themeMode);
  const { data: session, isLoading: sessionLoading } = useSession();
  const isGuest = !sessionLoading && !session;
  const lifeStage = useCycleStore((s) => s.lifeStage);
  const getCurrentPhase = useCycleStore((s) => s.getCurrentPhase);
  const scrollViewRef = useRef<ScrollView>(null);
  const { prompt: initialPrompt } = useLocalSearchParams<{ prompt?: string }>();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Symptom Checker state
  const [showSymptomChecker, setShowSymptomChecker] = useState(false);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [symptomSeverity, setSymptomSeverity] = useState<'mild' | 'moderate' | 'severe'>('moderate');
  const [isCheckingSymptoms, setIsCheckingSymptoms] = useState(false);

  const symptomOptions = getSymptomOptions(lifeStage);

  const [fontsLoaded] = useFonts({
    Quicksand_400Regular,
    Quicksand_500Medium,
    Quicksand_600SemiBold,
    CormorantGaramond_400Regular,
    CormorantGaramond_600SemiBold,
  });

  const currentPhase = getCurrentPhase();
  const currentMoon = getMoonPhase();
  const moonInfo = moonPhaseInfo[currentMoon];
  const phaseInfoData = phaseInfo[currentPhase];

  // Phase-specific prompts
  const prompts = getPhasePrompts(lifeStage, currentPhase);

  // Get context info for display
  const getContextDisplay = () => {
    if (lifeStage === 'regular') {
      return {
        emoji: phaseInfoData.emoji,
        label: `${phaseInfoData.name} Phase`,
        color: phaseInfoData.color,
      };
    }
    return {
      emoji: moonInfo.emoji,
      label: moonInfo.name,
      color: moonInfo.color,
    };
  };

  const contextInfo = getContextDisplay();

  const accentColor =
    lifeStage === 'perimenopause' ? '#f59e0b' : lifeStage === 'menopause' ? '#8b5cf6' : theme.accent.purple;

  // Life stage display label
  const getStageLabel = () => {
    switch (lifeStage) {
      case 'regular': return phaseInfoData.name + ' Phase';
      case 'perimenopause': return 'Perimenopause';
      case 'menopause': return 'Menopause';
      case 'postmenopause': return 'Postmenopause';
    }
  };

  const sendMessageWithText = async (text: string) => {
    if (!text.trim() || isLoading) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const conversationHistory = [...messages, userMessage].slice(-10).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch(`${BACKEND_URL}/api/ai-chat`, {
        method: 'POST',
        credentials: 'include',
        headers: getJsonHeaders(),
        body: JSON.stringify({
          messages: conversationHistory,
          lifeStage,
          currentPhase: lifeStage === 'regular' ? currentPhase : undefined,
          moonPhase: lifeStage !== 'regular' ? moonInfo.name : undefined,
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();
      const assistantContent = data.choices?.[0]?.message?.content || "I'm sorry, I couldn't process that. Please try again.";

      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: assistantContent,
        timestamp: new Date(),
      }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please check your connection and try again.",
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = () => sendMessageWithText(inputText);

  const checkSymptoms = async () => {
    if (selectedSymptoms.length === 0 || isCheckingSymptoms) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsCheckingSymptoms(true);

    const symptomNames = selectedSymptoms
      .map((id) => symptomOptions.find((s) => s.id === id)?.name)
      .filter(Boolean) as string[];

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: `Symptom Check: I'm experiencing ${symptomNames.join(', ')} (${symptomSeverity} severity)`,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setShowSymptomChecker(false);

    try {
      const response = await fetch(`${BACKEND_URL}/api/ai-chat/symptom-check`, {
        method: 'POST',
        credentials: 'include',
        headers: getJsonHeaders(),
        body: JSON.stringify({
          symptoms: symptomNames,
          severity: symptomSeverity,
          lifeStage,
          currentPhase: lifeStage === 'regular' ? currentPhase : undefined,
          moonPhase: lifeStage !== 'regular' ? moonInfo.name : undefined,
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();
      const assistantContent = data.choices?.[0]?.message?.content || "I'm sorry, I couldn't analyze those symptoms. Please try again.";

      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: assistantContent,
        timestamp: new Date(),
      }]);
    } catch (error) {
      console.error('Symptom check error:', error);
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please check your connection and try again.",
        timestamp: new Date(),
      }]);
    } finally {
      setIsCheckingSymptoms(false);
      setSelectedSymptoms([]);
      setSymptomSeverity('moderate');
    }
  };

  const toggleSymptom = (symptomId: string) => {
    Haptics.selectionAsync();
    setSelectedSymptoms((prev) =>
      prev.includes(symptomId) ? prev.filter((id) => id !== symptomId) : [...prev, symptomId]
    );
  };

  const clearChat = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setMessages([]);
  };

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  useEffect(() => {
    if (initialPrompt && fontsLoaded) {
      setInputText(initialPrompt);
      setTimeout(() => {
        sendMessageWithText(initialPrompt);
      }, 300);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fontsLoaded]);

  const getWelcomeMessage = () => {
    if (lifeStage === 'regular') {
      return `Hi! I'm Luna, your wellness companion. You're in your ${phaseInfoData.name.toLowerCase()} phase right now. I have personalized suggestions for nutrition, movement, and self-care based on where you are in your cycle. What can I help with?`;
    }
    if (lifeStage === 'perimenopause') {
      return `Welcome! I'm Luna, here to support you through perimenopause. I can help with nutrition, movement, symptoms, and everything in between. What would you like guidance on?`;
    }
    if (lifeStage === 'menopause') {
      return `Hello! I'm Luna, your wellness guide through menopause. I'm here to help with bone health, sleep, energy, mood, and more. How can I support you today?`;
    }
    return `Hello! I'm Luna, your postmenopause wellness companion. I can help with joint health, bone density, heart health, energy, and staying strong. What would you like to know?`;
  };

  if (!fontsLoaded) return null;

  if (isGuest) {
    return (
      <View className="flex-1">
        <LinearGradient colors={theme.gradient} locations={[0, 0.25, 0.5, 0.75, 1]} style={{ flex: 1 }}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32, paddingTop: insets.top }}>
            <View
              className="w-24 h-24 rounded-full items-center justify-center mb-6"
              style={{ backgroundColor: `${theme.accent.purple}15` }}
            >
              <Sparkles size={40} color={theme.accent.purple} />
            </View>
            <Text style={{ fontFamily: 'CormorantGaramond_600SemiBold', color: theme.text.primary, fontSize: 28, textAlign: 'center', marginBottom: 8 }}>
              Meet Luna AI
            </Text>
            <Text style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.secondary, fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: 32 }}>
              Your personal wellness companion — get nutrition tips, movement ideas, and self-care guidance tailored to your cycle phase.
            </Text>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.replace('/sign-in');
              }}
            >
              <LinearGradient
                colors={[theme.accent.rose, theme.accent.purple]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ paddingVertical: 16, paddingHorizontal: 40, borderRadius: 16 }}
              >
                <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: '#fff', fontSize: 16 }}>
                  Sign in to unlock Luna
                </Text>
              </LinearGradient>
            </Pressable>
          </View>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <LinearGradient colors={theme.gradient} locations={[0, 0.25, 0.5, 0.75, 1]} style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
          keyboardVerticalOffset={0}
        >
          {/* Header */}
          <Animated.View
            entering={FadeInDown.duration(400)}
            style={{ paddingTop: insets.top + 8 }}
            className="px-4 pb-4 border-b"
            // @ts-ignore
            borderBottomColor={theme.border.light}
          >
            <View className="flex-row items-center justify-between">
              <View className="w-10" />

              <View className="flex-1 items-center mx-4">
                <View className="flex-row items-center">
                  <View
                    className="w-8 h-8 rounded-full items-center justify-center mr-2"
                    style={{ backgroundColor: `${accentColor}20` }}
                  >
                    <Sparkles size={16} color={accentColor} />
                  </View>
                  <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }} className="text-lg">
                    Luna AI
                  </Text>
                </View>
                <View className="flex-row items-center mt-1">
                  <Text style={{ fontSize: 12 }}>{contextInfo.emoji}</Text>
                  <Text
                    style={{ fontFamily: 'Quicksand_400Regular', color: contextInfo.color }}
                    className="text-xs ml-1"
                  >
                    {getStageLabel()}
                  </Text>
                </View>
              </View>

              {messages.length > 0 ? (
                <Pressable
                  onPress={clearChat}
                  className="w-10 h-10 rounded-full items-center justify-center"
                  style={{ backgroundColor: `${theme.accent.blush}15` }}
                >
                  <Trash2 size={18} color={theme.accent.blush} />
                </Pressable>
              ) : (
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setShowSymptomChecker(true);
                  }}
                  className="w-10 h-10 rounded-full items-center justify-center"
                  style={{ backgroundColor: `${theme.accent.pink}15` }}
                >
                  <Stethoscope size={18} color={theme.accent.pink} />
                </Pressable>
              )}
            </View>
          </Animated.View>

          {/* Messages */}
          <ScrollView
            ref={scrollViewRef}
            className="flex-1 px-4"
            contentContainerStyle={{ paddingVertical: 16 }}
            showsVerticalScrollIndicator={false}
          >
            {messages.length === 0 ? (
              <Animated.View entering={FadeInUp.delay(200).duration(500)}>
                {/* Welcome Card */}
                <LinearGradient
                  colors={[`${accentColor}15`, `${accentColor}08`]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ borderRadius: 20, padding: 20, marginBottom: 20 }}
                >
                  <View className="flex-row items-center mb-3">
                    <View
                      className="w-12 h-12 rounded-full items-center justify-center mr-3"
                      style={{ backgroundColor: `${accentColor}20` }}
                    >
                      <Moon size={24} color={accentColor} />
                    </View>
                    <View>
                      <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }} className="text-base">
                        Welcome to Luna AI
                      </Text>
                      <Text style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.tertiary }} className="text-xs">
                        Your personal wellness companion
                      </Text>
                    </View>
                  </View>
                  <Text style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.secondary }} className="text-sm leading-5">
                    {getWelcomeMessage()}
                  </Text>
                </LinearGradient>

                {/* Symptom Checker Card */}
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    setShowSymptomChecker(true);
                  }}
                  className="mb-5 p-4 rounded-2xl border flex-row items-center"
                  style={{ backgroundColor: theme.bg.card, borderColor: `${theme.accent.pink}30` }}
                >
                  <View
                    className="w-12 h-12 rounded-full items-center justify-center mr-3"
                    style={{ backgroundColor: `${theme.accent.pink}15` }}
                  >
                    <Stethoscope size={22} color={theme.accent.pink} />
                  </View>
                  <View className="flex-1">
                    <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }} className="text-sm mb-1">
                      Symptom Checker
                    </Text>
                    <Text style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.tertiary, lineHeight: 16 }} className="text-xs">
                      Get personalized insights about what you're feeling
                    </Text>
                  </View>
                  <View
                    className="px-3 py-1.5 rounded-full ml-2"
                    style={{ backgroundColor: `${theme.accent.pink}15` }}
                  >
                    <Text style={{ fontFamily: 'Quicksand_500Medium', color: theme.accent.pink }} className="text-xs">
                      Check
                    </Text>
                  </View>
                </Pressable>

                {/* Phase-specific prompt suggestions */}
                <Text style={{ fontFamily: 'Quicksand_500Medium', color: theme.text.tertiary }} className="text-xs mb-1">
                  Suggestions for your {getStageLabel().toLowerCase()}...
                </Text>
                <Text style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.muted }} className="text-xs mb-3">
                  Tip: Be specific for better answers — try including how you feel, what you ate, or your symptoms.
                </Text>
                <View className="flex-row flex-wrap" style={{ gap: 8 }}>
                  {prompts.map((suggestion) => (
                    <Pressable
                      key={suggestion}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        sendMessageWithText(suggestion);
                      }}
                      className="px-4 py-2.5 rounded-2xl border"
                      style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light }}
                    >
                      <Text style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.secondary }} className="text-sm">
                        {suggestion}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </Animated.View>
            ) : (
              messages.map((message, index) => (
                <Animated.View
                  key={message.id}
                  entering={FadeInUp.delay(index * 50).duration(300)}
                  className={`mb-4 ${message.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <View
                    className="max-w-[85%] rounded-2xl px-4 py-3"
                    style={{
                      backgroundColor: message.role === 'user' ? accentColor : theme.bg.card,
                      borderWidth: message.role === 'assistant' ? 1 : 0,
                      borderColor: theme.border.light,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: 'Quicksand_400Regular',
                        color: message.role === 'user' ? '#fff' : theme.text.primary,
                      }}
                      className="text-sm leading-5"
                    >
                      {message.content}
                    </Text>
                  </View>
                </Animated.View>
              ))
            )}

            {isLoading && (
              <Animated.View entering={FadeInUp.duration(300)} className="items-start mb-4">
                <View
                  className="rounded-2xl px-4 py-3 border"
                  style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light }}
                >
                  <View className="flex-row items-center">
                    <ActivityIndicator size="small" color={accentColor} />
                    <Text
                      style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.tertiary }}
                      className="text-sm ml-2"
                    >
                      Luna is thinking...
                    </Text>
                  </View>
                </View>
              </Animated.View>
            )}
          </ScrollView>

          {/* Input Area */}
          <View
            className="px-4 pb-2 border-t"
            style={{ paddingBottom: insets.bottom + 70, borderTopColor: theme.border.light }}
          >
            <View
              className="flex-row items-end mt-3 rounded-2xl border"
              style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light }}
            >
              <TextInput
                value={inputText}
                onChangeText={setInputText}
                placeholder="Ask Luna anything..."
                placeholderTextColor={theme.text.tertiary}
                multiline
                maxLength={500}
                style={{
                  flex: 1,
                  fontFamily: 'Quicksand_400Regular',
                  color: theme.text.primary,
                  fontSize: 15,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  maxHeight: 100,
                }}
                onSubmitEditing={sendMessage}
              />
              <Pressable
                onPress={sendMessage}
                disabled={!inputText.trim() || isLoading}
                className="w-10 h-10 rounded-full items-center justify-center mr-2 mb-1"
                style={{
                  backgroundColor: inputText.trim() && !isLoading ? accentColor : `${accentColor}30`,
                }}
              >
                <Send size={18} color={inputText.trim() && !isLoading ? '#fff' : theme.text.tertiary} />
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>

      {/* Symptom Checker Modal */}
      <Modal visible={showSymptomChecker} animationType="slide" transparent>
        <View className="flex-1 bg-black/50">
          <Pressable className="flex-1" onPress={() => setShowSymptomChecker(false)} />
          <View
            style={{ paddingBottom: insets.bottom + 16, backgroundColor: theme.bg.primary }}
            className="rounded-t-3xl max-h-[85%]"
          >
            <View className="p-5 border-b" style={{ borderColor: theme.border.light }}>
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View
                    className="w-10 h-10 rounded-full items-center justify-center mr-3"
                    style={{ backgroundColor: `${theme.accent.pink}15` }}
                  >
                    <Stethoscope size={20} color={theme.accent.pink} />
                  </View>
                  <View>
                    <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }} className="text-lg">
                      Symptom Checker
                    </Text>
                    <Text style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.muted }} className="text-xs">
                      Select what you're experiencing
                    </Text>
                  </View>
                </View>
                <Pressable
                  onPress={() => setShowSymptomChecker(false)}
                  className="w-8 h-8 rounded-full items-center justify-center"
                  style={{ backgroundColor: theme.bg.card }}
                >
                  <X size={18} color={theme.text.muted} />
                </Pressable>
              </View>
            </View>

            <ScrollView className="px-5" contentContainerStyle={{ paddingVertical: 16 }}>
              <View
                className="flex-row items-start p-3 rounded-xl mb-4"
                style={{ backgroundColor: `${theme.accent.purple}10` }}
              >
                <AlertCircle size={16} color={theme.accent.purple} style={{ marginTop: 2 }} />
                <Text style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.secondary }} className="text-xs ml-2 flex-1">
                  This is for informational purposes only and not a medical diagnosis. Always consult a healthcare provider for medical concerns.
                </Text>
              </View>

              <Text style={{ fontFamily: 'Quicksand_500Medium', color: theme.text.muted }} className="text-xs mb-3 uppercase tracking-wide">
                What are you feeling?
              </Text>
              <View className="flex-row flex-wrap mb-5" style={{ gap: 8 }}>
                {symptomOptions.map((symptom) => {
                  const isSelected = selectedSymptoms.includes(symptom.id);
                  return (
                    <Pressable
                      key={symptom.id}
                      onPress={() => toggleSymptom(symptom.id)}
                      className="px-3 py-2 rounded-full flex-row items-center"
                      style={{
                        backgroundColor: isSelected ? `${theme.accent.pink}20` : theme.bg.card,
                        borderWidth: 1,
                        borderColor: isSelected ? theme.accent.pink : theme.border.light,
                      }}
                    >
                      <Text style={{ fontSize: 14 }}>{symptom.emoji}</Text>
                      <Text
                        style={{
                          fontFamily: 'Quicksand_500Medium',
                          color: isSelected ? theme.accent.pink : theme.text.secondary,
                        }}
                        className="text-sm ml-1.5"
                      >
                        {symptom.name}
                      </Text>
                      {isSelected && <Check size={14} color={theme.accent.pink} style={{ marginLeft: 4 }} />}
                    </Pressable>
                  );
                })}
              </View>

              {selectedSymptoms.length > 0 && (
                <Animated.View entering={FadeIn.duration(300)}>
                  <Text style={{ fontFamily: 'Quicksand_500Medium', color: theme.text.muted }} className="text-xs mb-3 uppercase tracking-wide">
                    How severe?
                  </Text>
                  <View className="flex-row mb-5" style={{ gap: 8 }}>
                    {(['mild', 'moderate', 'severe'] as const).map((level) => {
                      const isSelected = symptomSeverity === level;
                      const colors = { mild: '#22c55e', moderate: '#f59e0b', severe: '#ef4444' };
                      return (
                        <Pressable
                          key={level}
                          onPress={() => {
                            Haptics.selectionAsync();
                            setSymptomSeverity(level);
                          }}
                          className="flex-1 py-3 rounded-xl items-center"
                          style={{
                            backgroundColor: isSelected ? `${colors[level]}20` : theme.bg.card,
                            borderWidth: 1,
                            borderColor: isSelected ? colors[level] : theme.border.light,
                          }}
                        >
                          <Text
                            style={{
                              fontFamily: 'Quicksand_600SemiBold',
                              color: isSelected ? colors[level] : theme.text.secondary,
                            }}
                            className="text-sm capitalize"
                          >
                            {level}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </Animated.View>
              )}
            </ScrollView>

            <View className="px-5 pt-2">
              <Pressable
                onPress={checkSymptoms}
                disabled={selectedSymptoms.length === 0 || isCheckingSymptoms}
                style={{ opacity: selectedSymptoms.length === 0 ? 0.5 : 1 }}
              >
                <LinearGradient
                  colors={['#f9a8d4', '#c4b5fd']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
                >
                  {isCheckingSymptoms ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Stethoscope size={18} color="#fff" />
                      <Text style={{ fontFamily: 'Quicksand_600SemiBold' }} className="text-white text-base ml-2">
                        {selectedSymptoms.length > 0
                          ? `Check ${selectedSymptoms.length} Symptom${selectedSymptoms.length > 1 ? 's' : ''}`
                          : 'Select Symptoms'}
                      </Text>
                    </>
                  )}
                </LinearGradient>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

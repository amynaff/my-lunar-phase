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
import { Send, Sparkles, Moon, ArrowLeft, Trash2, Stethoscope, X, Check, AlertCircle } from 'lucide-react-native';
import { useCycleStore, getMoonPhase, moonPhaseInfo, phaseInfo, perimenopauseSymptoms, menopauseSymptoms, postmenopauseSymptoms } from '@/lib/cycle-store';
import { useThemeStore, getTheme } from '@/lib/theme-store';
import { router } from 'expo-router';
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

const BACKEND_URL = process.env.EXPO_PUBLIC_VIBECODE_BACKEND_URL || 'http://localhost:3000';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

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

  // Regular cycle symptoms
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

export default function LunaAIScreen() {
  const insets = useSafeAreaInsets();
  const themeMode = useThemeStore((s) => s.mode);
  const theme = getTheme(themeMode);
  const lifeStage = useCycleStore((s) => s.lifeStage);
  const getCurrentPhase = useCycleStore((s) => s.getCurrentPhase);
  const scrollViewRef = useRef<ScrollView>(null);

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

  // Accent color based on life stage
  const accentColor =
    lifeStage === 'perimenopause' ? '#f59e0b' : lifeStage === 'menopause' ? '#8b5cf6' : theme.accent.purple;

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Build conversation history (last 10 messages for context)
      const conversationHistory = [...messages, userMessage].slice(-10).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch(`${BACKEND_URL}/api/ai-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: conversationHistory,
          lifeStage,
          currentPhase: lifeStage === 'regular' ? currentPhase : undefined,
          moonPhase: lifeStage !== 'regular' ? moonInfo.name : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      const assistantContent = data.choices?.[0]?.message?.content || "I'm sorry, I couldn't process that. Please try again.";

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: assistantContent,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please check your connection and try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const checkSymptoms = async () => {
    if (selectedSymptoms.length === 0 || isCheckingSymptoms) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsCheckingSymptoms(true);

    // Get symptom names
    const symptomNames = selectedSymptoms
      .map((id) => symptomOptions.find((s) => s.id === id)?.name)
      .filter(Boolean) as string[];

    // Add user message to chat
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: `🩺 Symptom Check: I'm experiencing ${symptomNames.join(', ')} (${symptomSeverity} severity)`,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setShowSymptomChecker(false);

    try {
      const response = await fetch(`${BACKEND_URL}/api/ai-chat/symptom-check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symptoms: symptomNames,
          severity: symptomSeverity,
          lifeStage,
          currentPhase: lifeStage === 'regular' ? currentPhase : undefined,
          moonPhase: lifeStage !== 'regular' ? moonInfo.name : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      const assistantContent = data.choices?.[0]?.message?.content || "I'm sorry, I couldn't analyze those symptoms. Please try again.";

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: assistantContent,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Symptom check error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please check your connection and try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
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

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  // Welcome message
  const getWelcomeMessage = () => {
    if (lifeStage === 'regular') {
      return `Hi there! I'm Luna, your wellness companion. I see you're in your ${phaseInfoData.name.toLowerCase()} phase - a time for ${phaseInfoData.description.split(' - ')[1]?.toLowerCase() || 'honoring your body'}. How can I support you today?`;
    }
    if (lifeStage === 'perimenopause') {
      return `Welcome! I'm Luna, here to support you through your perimenopause journey. The ${moonInfo.name.toLowerCase()} brings ${moonInfo.energy.toLowerCase()} energy. What would you like guidance on today?`;
    }
    return `Hello! I'm Luna, your wellness guide. During this ${moonInfo.name.toLowerCase()}, the energy invites ${moonInfo.energy.toLowerCase()}. How can I help you thrive today?`;
  };

  if (!fontsLoaded) return null;

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
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.back();
                }}
                className="w-10 h-10 rounded-full items-center justify-center"
                style={{ backgroundColor: `${accentColor}15` }}
              >
                <ArrowLeft size={20} color={accentColor} />
              </Pressable>

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
                    {contextInfo.label}
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
                    <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }} className="text-sm">
                      Symptom Checker
                    </Text>
                    <Text style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.tertiary }} className="text-xs">
                      Get personalized insights about what you're feeling
                    </Text>
                  </View>
                  <View
                    className="px-3 py-1.5 rounded-full"
                    style={{ backgroundColor: `${theme.accent.pink}15` }}
                  >
                    <Text style={{ fontFamily: 'Quicksand_500Medium', color: theme.accent.pink }} className="text-xs">
                      Check
                    </Text>
                  </View>
                </Pressable>

                {/* Suggestion Chips */}
                <Text style={{ fontFamily: 'Quicksand_500Medium', color: theme.text.tertiary }} className="text-xs mb-3">
                  Try asking about...
                </Text>
                <View className="flex-row flex-wrap" style={{ gap: 8 }}>
                  {[
                    'What should I eat today?',
                    'Best exercise for now?',
                    'How to improve my sleep',
                    'Self-care ideas',
                    lifeStage !== 'regular' ? 'Managing hot flashes' : 'PMS relief tips',
                  ].map((suggestion) => (
                    <Pressable
                      key={suggestion}
                      onPress={() => {
                        setInputText(suggestion);
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }}
                      className="px-4 py-2 rounded-full border"
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
            style={{ paddingBottom: insets.bottom + 8, borderTopColor: theme.border.light }}
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
            {/* Modal Header */}
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
              {/* Disclaimer */}
              <View
                className="flex-row items-start p-3 rounded-xl mb-4"
                style={{ backgroundColor: `${theme.accent.purple}10` }}
              >
                <AlertCircle size={16} color={theme.accent.purple} style={{ marginTop: 2 }} />
                <Text style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.secondary }} className="text-xs ml-2 flex-1">
                  This is for informational purposes only and not a medical diagnosis. Always consult a healthcare provider for medical concerns.
                </Text>
              </View>

              {/* Symptom Selection */}
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

              {/* Severity Selection */}
              {selectedSymptoms.length > 0 && (
                <Animated.View entering={FadeIn.duration(300)}>
                  <Text style={{ fontFamily: 'Quicksand_500Medium', color: theme.text.muted }} className="text-xs mb-3 uppercase tracking-wide">
                    How severe?
                  </Text>
                  <View className="flex-row mb-5" style={{ gap: 8 }}>
                    {(['mild', 'moderate', 'severe'] as const).map((level) => {
                      const isSelected = symptomSeverity === level;
                      const colors = {
                        mild: '#22c55e',
                        moderate: '#f59e0b',
                        severe: '#ef4444',
                      };
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

            {/* Submit Button */}
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

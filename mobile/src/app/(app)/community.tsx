import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, RefreshControl, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { ArrowLeft, Heart, Plus, X, Shield, Sparkles, Apple, Dumbbell, Leaf, Trophy, Users, Send, ChevronDown } from 'lucide-react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useThemeStore, getTheme } from '@/lib/theme-store';
import { useCycleStore, lifeStageInfo } from '@/lib/cycle-store';
import { fetchStories, createStory, heartStory, CommunityStory } from '@/lib/api/community';
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

const CATEGORIES = [
  { id: 'all', name: 'All', icon: Users, color: '#8b5cf6' },
  { id: 'symptoms', name: 'Symptoms', icon: Sparkles, color: '#ec4899' },
  { id: 'nutrition', name: 'Nutrition', icon: Apple, color: '#22c55e' },
  { id: 'movement', name: 'Movement', icon: Dumbbell, color: '#f59e0b' },
  { id: 'lifestyle', name: 'Lifestyle', icon: Leaf, color: '#06b6d4' },
  { id: 'success', name: 'Success', icon: Trophy, color: '#eab308' },
];

const LIFE_STAGE_FILTERS = [
  { id: 'all', name: 'All' },
  { id: 'regular', name: 'Regular' },
  { id: 'perimenopause', name: 'Peri' },
  { id: 'menopause', name: 'Meno' },
];

function StoryCard({ story, onHeart, theme }: { story: CommunityStory; onHeart: () => void; theme: ReturnType<typeof getTheme> }) {
  const category = CATEGORIES.find(c => c.id === story.category) || CATEGORIES[0];
  const CategoryIcon = category.icon;
  const stageInfo = lifeStageInfo[story.lifeStage as keyof typeof lifeStageInfo];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <View
      className="rounded-2xl p-4 mb-3 border"
      style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light }}
    >
      <View className="flex-row items-center mb-3">
        <View
          className="w-8 h-8 rounded-full items-center justify-center mr-2"
          style={{ backgroundColor: `${category.color}20` }}
        >
          <CategoryIcon size={14} color={category.color} />
        </View>
        <View className="flex-1">
          <View className="flex-row items-center">
            <Text style={{ fontFamily: 'Quicksand_500Medium', color: category.color }} className="text-xs">
              {category.name}
            </Text>
            <View className="w-1 h-1 rounded-full mx-2" style={{ backgroundColor: theme.text.muted }} />
            <Text style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.muted }} className="text-xs">
              {stageInfo?.name || story.lifeStage}
            </Text>
          </View>
        </View>
        <Text style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.muted }} className="text-xs">
          {formatDate(story.createdAt)}
        </Text>
      </View>

      <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }} className="text-base mb-2">
        {story.title}
      </Text>

      <Text style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.secondary }} className="text-sm leading-5 mb-3">
        {story.content}
      </Text>

      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onHeart();
        }}
        className="flex-row items-center self-start px-3 py-1.5 rounded-full"
        style={{ backgroundColor: `${theme.accent.pink}15` }}
      >
        <Heart size={14} color={theme.accent.pink} fill={theme.accent.pink} />
        <Text style={{ fontFamily: 'Quicksand_500Medium', color: theme.accent.pink }} className="text-xs ml-1.5">
          {story.hearts}
        </Text>
      </Pressable>
    </View>
  );
}

function NewStoryModal({
  visible,
  onClose,
  onSubmit,
  theme,
  userLifeStage,
}: {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: { category: string; lifeStage: string; title: string; content: string }) => void;
  theme: ReturnType<typeof getTheme>;
  userLifeStage: string;
}) {
  const insets = useSafeAreaInsets();
  const [category, setCategory] = useState('symptoms');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const selectedCategory = CATEGORIES.find(c => c.id === category) || CATEGORIES[1];

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) return;
    onSubmit({
      category,
      lifeStage: userLifeStage,
      title: title.trim(),
      content: content.trim(),
    });
    setTitle('');
    setContent('');
    setCategory('symptoms');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <Pressable className="flex-1 bg-black/50" onPress={onClose} />
        <View
          style={{ paddingBottom: insets.bottom + 16, backgroundColor: theme.bg.primary }}
          className="rounded-t-3xl"
        >
          <View className="p-6">
            <View className="flex-row items-center justify-between mb-6">
              <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }} className="text-lg">
                Share Your Story
              </Text>
              <Pressable onPress={onClose}>
                <X size={24} color={theme.text.muted} />
              </Pressable>
            </View>

            {/* Privacy Notice */}
            <View
              className="flex-row items-start p-3 rounded-xl mb-4"
              style={{ backgroundColor: `${theme.accent.purple}10` }}
            >
              <Shield size={16} color={theme.accent.purple} style={{ marginTop: 2 }} />
              <Text style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.secondary }} className="text-xs ml-2 flex-1">
                Your story is completely anonymous. We never collect personal data or track who you are.
              </Text>
            </View>

            {/* Category Picker */}
            <Text style={{ fontFamily: 'Quicksand_500Medium', color: theme.text.muted }} className="text-xs mb-2">
              CATEGORY
            </Text>
            <Pressable
              onPress={() => setShowCategoryPicker(!showCategoryPicker)}
              className="flex-row items-center justify-between p-3 rounded-xl mb-4 border"
              style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light }}
            >
              <View className="flex-row items-center">
                <View
                  className="w-8 h-8 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: `${selectedCategory.color}20` }}
                >
                  <selectedCategory.icon size={14} color={selectedCategory.color} />
                </View>
                <Text style={{ fontFamily: 'Quicksand_500Medium', color: theme.text.primary }}>
                  {selectedCategory.name}
                </Text>
              </View>
              <ChevronDown size={18} color={theme.text.muted} />
            </Pressable>

            {showCategoryPicker && (
              <View className="mb-4 rounded-xl border overflow-hidden" style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light }}>
                {CATEGORIES.filter(c => c.id !== 'all').map((cat) => (
                  <Pressable
                    key={cat.id}
                    onPress={() => {
                      setCategory(cat.id);
                      setShowCategoryPicker(false);
                    }}
                    className="flex-row items-center p-3 border-b"
                    style={{ borderColor: theme.border.light }}
                  >
                    <View
                      className="w-8 h-8 rounded-full items-center justify-center mr-3"
                      style={{ backgroundColor: `${cat.color}20` }}
                    >
                      <cat.icon size={14} color={cat.color} />
                    </View>
                    <Text style={{ fontFamily: 'Quicksand_500Medium', color: category === cat.id ? cat.color : theme.text.primary }}>
                      {cat.name}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}

            {/* Title */}
            <Text style={{ fontFamily: 'Quicksand_500Medium', color: theme.text.muted }} className="text-xs mb-2">
              TITLE
            </Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Give your story a title..."
              placeholderTextColor={theme.text.muted}
              maxLength={100}
              style={{
                fontFamily: 'Quicksand_500Medium',
                color: theme.text.primary,
                backgroundColor: theme.bg.card,
                borderColor: theme.border.light,
              }}
              className="p-3 rounded-xl border mb-4"
            />

            {/* Content */}
            <Text style={{ fontFamily: 'Quicksand_500Medium', color: theme.text.muted }} className="text-xs mb-2">
              YOUR STORY
            </Text>
            <TextInput
              value={content}
              onChangeText={setContent}
              placeholder="Share your experience, tips, or success..."
              placeholderTextColor={theme.text.muted}
              multiline
              numberOfLines={5}
              maxLength={2000}
              textAlignVertical="top"
              style={{
                fontFamily: 'Quicksand_400Regular',
                color: theme.text.primary,
                backgroundColor: theme.bg.card,
                borderColor: theme.border.light,
                minHeight: 120,
              }}
              className="p-3 rounded-xl border mb-4"
            />

            <Text style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.muted }} className="text-xs text-right mb-4">
              {content.length}/2000
            </Text>

            {/* Submit */}
            <Pressable
              onPress={handleSubmit}
              disabled={!title.trim() || !content.trim()}
              style={{ opacity: (!title.trim() || !content.trim()) ? 0.5 : 1 }}
            >
              <LinearGradient
                colors={['#f9a8d4', '#c4b5fd']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
              >
                <Send size={18} color="#fff" />
                <Text style={{ fontFamily: 'Quicksand_600SemiBold' }} className="text-white text-base ml-2">
                  Share Anonymously
                </Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export default function CommunityScreen() {
  const insets = useSafeAreaInsets();
  const themeMode = useThemeStore(s => s.mode);
  const theme = getTheme(themeMode);
  const lifeStage = useCycleStore(s => s.lifeStage);
  const queryClient = useQueryClient();

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStage, setSelectedStage] = useState('all');
  const [showNewStoryModal, setShowNewStoryModal] = useState(false);

  const [fontsLoaded] = useFonts({
    Quicksand_400Regular,
    Quicksand_500Medium,
    Quicksand_600SemiBold,
    CormorantGaramond_400Regular,
    CormorantGaramond_600SemiBold,
  });

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['communityStories', selectedCategory, selectedStage],
    queryFn: () => fetchStories({
      category: selectedCategory !== 'all' ? selectedCategory : undefined,
      lifeStage: selectedStage !== 'all' ? selectedStage : undefined,
      limit: 50,
    }),
  });

  const createMutation = useMutation({
    mutationFn: createStory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communityStories'] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
  });

  const heartMutation = useMutation({
    mutationFn: heartStory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communityStories'] });
    },
  });

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  if (!fontsLoaded) return null;

  return (
    <View className="flex-1">
      <LinearGradient
        colors={theme.gradient}
        locations={[0, 0.25, 0.5, 0.75, 1]}
        style={{ flex: 1 }}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={handleRefresh} tintColor={theme.accent.purple} />
          }
        >
          {/* Header */}
          <Animated.View
            entering={FadeInDown.delay(100).duration(600)}
            style={{ paddingTop: insets.top + 8 }}
            className="px-6"
          >
            <View className="flex-row items-center mb-4">
              <Pressable
                onPress={() => router.back()}
                className="w-9 h-9 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: theme.bg.card }}
              >
                <ArrowLeft size={18} color={theme.text.primary} />
              </Pressable>
              <View className="flex-1">
                <Text
                  style={{ fontFamily: 'CormorantGaramond_400Regular', color: theme.text.muted }}
                  className="text-sm tracking-widest uppercase"
                >
                  Community
                </Text>
                <Text
                  style={{ fontFamily: 'CormorantGaramond_600SemiBold', color: theme.text.primary }}
                  className="text-2xl"
                >
                  Women's Stories
                </Text>
              </View>
            </View>

            {/* Privacy Badge */}
            <View
              className="flex-row items-center p-3 rounded-xl mb-4"
              style={{ backgroundColor: `${theme.accent.purple}10`, borderWidth: 1, borderColor: `${theme.accent.purple}20` }}
            >
              <Shield size={16} color={theme.accent.purple} />
              <Text style={{ fontFamily: 'Quicksand_500Medium', color: theme.accent.purple }} className="text-xs ml-2 flex-1">
                100% Anonymous - We never collect or store personal data
              </Text>
            </View>
          </Animated.View>

          {/* Category Filter */}
          <Animated.View entering={FadeInUp.delay(200).duration(600)}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 24, paddingRight: 40 }}
              className="mb-3"
            >
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                const CategoryIcon = cat.icon;
                return (
                  <Pressable
                    key={cat.id}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setSelectedCategory(cat.id);
                    }}
                    className="mr-2 px-3 py-1.5 rounded-full flex-row items-center"
                    style={{
                      backgroundColor: isSelected ? `${cat.color}20` : theme.bg.card,
                      borderWidth: 1,
                      borderColor: isSelected ? cat.color : theme.border.light,
                    }}
                  >
                    <CategoryIcon size={12} color={isSelected ? cat.color : theme.text.muted} />
                    <Text
                      style={{ fontFamily: 'Quicksand_500Medium', color: isSelected ? cat.color : theme.text.secondary }}
                      className="text-xs ml-1"
                    >
                      {cat.name}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </Animated.View>

          {/* Life Stage Filter */}
          <Animated.View entering={FadeInUp.delay(250).duration(600)} className="px-6 mb-5">
            <View className="flex-row">
              {LIFE_STAGE_FILTERS.map((stage) => {
                const isSelected = selectedStage === stage.id;
                return (
                  <Pressable
                    key={stage.id}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setSelectedStage(stage.id);
                    }}
                    className="mr-2 px-3 py-1.5 rounded-full"
                    style={{
                      backgroundColor: isSelected ? theme.accent.purple : 'transparent',
                      borderWidth: 1,
                      borderColor: isSelected ? theme.accent.purple : theme.border.light,
                    }}
                  >
                    <Text
                      style={{ fontFamily: 'Quicksand_500Medium', color: isSelected ? '#fff' : theme.text.secondary }}
                      className="text-xs"
                    >
                      {stage.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </Animated.View>

          {/* Stories */}
          <Animated.View entering={FadeInUp.delay(300).duration(600)} className="px-6">
            {isLoading ? (
              <View className="items-center py-12">
                <Text style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.muted }}>
                  Loading stories...
                </Text>
              </View>
            ) : data?.stories && data.stories.length > 0 ? (
              data.stories.map((story) => (
                <StoryCard
                  key={story.id}
                  story={story}
                  theme={theme}
                  onHeart={() => heartMutation.mutate(story.id)}
                />
              ))
            ) : (
              <View className="items-center py-12">
                <Users size={48} color={theme.text.muted} />
                <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }} className="text-base mt-4">
                  No stories yet
                </Text>
                <Text style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.muted }} className="text-sm mt-1 text-center">
                  Be the first to share your experience!
                </Text>
              </View>
            )}
          </Animated.View>
        </ScrollView>

        {/* FAB - New Story */}
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setShowNewStoryModal(true);
          }}
          className="absolute right-6"
          style={{ bottom: insets.bottom + 24 }}
        >
          <LinearGradient
            colors={['#f9a8d4', '#c4b5fd']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' }}
          >
            <Plus size={24} color="#fff" />
          </LinearGradient>
        </Pressable>

        {/* New Story Modal */}
        <NewStoryModal
          visible={showNewStoryModal}
          onClose={() => setShowNewStoryModal(false)}
          onSubmit={(data) => createMutation.mutate(data)}
          theme={theme}
          userLifeStage={lifeStage}
        />
      </LinearGradient>
    </View>
  );
}

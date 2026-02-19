import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, RefreshControl, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { ArrowLeft, Heart, Plus, X, Shield, Sparkles, Apple, Dumbbell, Leaf, Trophy, Users, Send, ChevronDown, MessageCircle, Hash, ChevronRight } from 'lucide-react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useThemeStore, getTheme } from '@/lib/theme-store';
import { useCycleStore, lifeStageInfo } from '@/lib/cycle-store';
import {
  fetchStories,
  createStory,
  heartStory,
  fetchComments,
  createComment,
  heartComment,
  fetchChannels,
  fetchChannelMessages,
  sendChannelMessage,
  heartMessage,
  CommunityStory,
  StoryComment,
  ChatChannel,
  ChatMessage,
} from '@/lib/api/community';
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
  { id: 'postmenopause', name: 'Post' },
];

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function CommentItem({ comment, onHeart, theme }: { comment: StoryComment; onHeart: () => void; theme: ReturnType<typeof getTheme> }) {
  return (
    <View className="py-2 border-b" style={{ borderColor: theme.border.light }}>
      <Text style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.secondary }} className="text-sm mb-1">
        {comment.content}
      </Text>
      <View className="flex-row items-center justify-between">
        <Text style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.muted }} className="text-xs">
          {formatDate(comment.createdAt)}
        </Text>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onHeart();
          }}
          className="flex-row items-center px-2 py-1"
        >
          <Heart size={12} color={theme.accent.pink} fill={comment.hearts > 0 ? theme.accent.pink : 'transparent'} />
          {comment.hearts > 0 && (
            <Text style={{ fontFamily: 'Quicksand_500Medium', color: theme.accent.pink }} className="text-xs ml-1">
              {comment.hearts}
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

function StoryCard({
  story,
  onHeart,
  theme,
  expanded,
  onToggleExpand,
}: {
  story: CommunityStory;
  onHeart: () => void;
  theme: ReturnType<typeof getTheme>;
  expanded: boolean;
  onToggleExpand: () => void;
}) {
  const category = CATEGORIES.find(c => c.id === story.category) || CATEGORIES[0];
  const CategoryIcon = category.icon;
  const stageInfo = lifeStageInfo[story.lifeStage as keyof typeof lifeStageInfo];
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState('');

  const { data: commentsData, isLoading: loadingComments } = useQuery({
    queryKey: ['storyComments', story.id],
    queryFn: () => fetchComments(story.id),
    enabled: expanded,
  });

  const createCommentMutation = useMutation({
    mutationFn: (content: string) => createComment(story.id, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storyComments', story.id] });
      queryClient.invalidateQueries({ queryKey: ['communityStories'] });
      setNewComment('');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
  });

  const heartCommentMutation = useMutation({
    mutationFn: heartComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storyComments', story.id] });
    },
  });

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;
    createCommentMutation.mutate(newComment.trim());
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

      <View className="flex-row items-center">
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onHeart();
          }}
          className="flex-row items-center px-3 py-1.5 rounded-full mr-2"
          style={{ backgroundColor: `${theme.accent.pink}15` }}
        >
          <Heart size={14} color={theme.accent.pink} fill={theme.accent.pink} />
          <Text style={{ fontFamily: 'Quicksand_500Medium', color: theme.accent.pink }} className="text-xs ml-1.5">
            {story.hearts}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => {
            Haptics.selectionAsync();
            onToggleExpand();
          }}
          className="flex-row items-center px-3 py-1.5 rounded-full"
          style={{ backgroundColor: `${theme.accent.purple}15` }}
        >
          <MessageCircle size={14} color={theme.accent.purple} />
          <Text style={{ fontFamily: 'Quicksand_500Medium', color: theme.accent.purple }} className="text-xs ml-1.5">
            {story.commentCount || 0}
          </Text>
        </Pressable>
      </View>

      {/* Expanded Comments Section */}
      {expanded && (
        <View className="mt-4 pt-3 border-t" style={{ borderColor: theme.border.light }}>
          {loadingComments ? (
            <Text style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.muted }} className="text-xs py-2">
              Loading comments...
            </Text>
          ) : commentsData?.comments && commentsData.comments.length > 0 ? (
            <View>
              {commentsData.comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  theme={theme}
                  onHeart={() => heartCommentMutation.mutate(comment.id)}
                />
              ))}
            </View>
          ) : (
            <Text style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.muted }} className="text-xs py-2">
              No comments yet. Be the first to share your thoughts!
            </Text>
          )}

          {/* Add Comment Input */}
          <View className="flex-row items-center mt-3">
            <TextInput
              value={newComment}
              onChangeText={setNewComment}
              placeholder="Add a supportive comment..."
              placeholderTextColor={theme.text.muted}
              maxLength={1000}
              style={{
                fontFamily: 'Quicksand_400Regular',
                color: theme.text.primary,
                backgroundColor: theme.bg.primary,
                borderColor: theme.border.light,
                flex: 1,
              }}
              className="p-2 rounded-xl border mr-2 text-sm"
            />
            <Pressable
              onPress={handleSubmitComment}
              disabled={!newComment.trim() || createCommentMutation.isPending}
              className="w-8 h-8 rounded-full items-center justify-center"
              style={{
                backgroundColor: newComment.trim() ? theme.accent.purple : theme.bg.card,
                opacity: createCommentMutation.isPending ? 0.5 : 1,
              }}
            >
              <Send size={14} color={newComment.trim() ? '#fff' : theme.text.muted} />
            </Pressable>
          </View>
        </View>
      )}
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
  const [expandedStoryId, setExpandedStoryId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'stories' | 'chat'>('stories');
  const [selectedChannel, setSelectedChannel] = useState<ChatChannel | null>(null);
  const [newMessage, setNewMessage] = useState('');

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

  // Chat channels queries and mutations
  const { data: channelsData, isLoading: loadingChannels } = useQuery({
    queryKey: ['chatChannels'],
    queryFn: fetchChannels,
    enabled: viewMode === 'chat',
  });

  const { data: messagesData, isLoading: loadingMessages, refetch: refetchMessages, isRefetching: isRefetchingMessages } = useQuery({
    queryKey: ['channelMessages', selectedChannel?.id],
    queryFn: () => fetchChannelMessages(selectedChannel!.id),
    enabled: !!selectedChannel,
  });

  const sendMessageMutation = useMutation({
    mutationFn: (content: string) => sendChannelMessage(selectedChannel!.id, content, lifeStage),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channelMessages', selectedChannel?.id] });
      queryClient.invalidateQueries({ queryKey: ['chatChannels'] });
      setNewMessage('');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
  });

  const heartMessageMutation = useMutation({
    mutationFn: heartMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channelMessages', selectedChannel?.id] });
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

            {/* View Mode Toggle */}
            <View className="flex-row mb-4 p-1 rounded-xl" style={{ backgroundColor: theme.bg.card }}>
              <Pressable
                onPress={() => {
                  Haptics.selectionAsync();
                  setViewMode('stories');
                  setSelectedChannel(null);
                }}
                className="flex-1 py-2 rounded-lg flex-row items-center justify-center"
                style={{ backgroundColor: viewMode === 'stories' ? theme.accent.purple : 'transparent' }}
              >
                <Users size={14} color={viewMode === 'stories' ? '#fff' : theme.text.muted} />
                <Text
                  style={{ fontFamily: 'Quicksand_500Medium', color: viewMode === 'stories' ? '#fff' : theme.text.muted }}
                  className="text-sm ml-2"
                >
                  Stories
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  Haptics.selectionAsync();
                  setViewMode('chat');
                }}
                className="flex-1 py-2 rounded-lg flex-row items-center justify-center"
                style={{ backgroundColor: viewMode === 'chat' ? theme.accent.purple : 'transparent' }}
              >
                <Hash size={14} color={viewMode === 'chat' ? '#fff' : theme.text.muted} />
                <Text
                  style={{ fontFamily: 'Quicksand_500Medium', color: viewMode === 'chat' ? '#fff' : theme.text.muted }}
                  className="text-sm ml-2"
                >
                  Secret Chats
                </Text>
              </Pressable>
            </View>
          </Animated.View>

          {viewMode === 'stories' ? (
            <>
              {/* Category Filter */}
              <Animated.View entering={FadeInUp.delay(200).duration(600)} className="px-6 mb-3">
                <View className="flex-row flex-wrap">
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
                        className="mr-2 mb-2 px-3 py-1.5 rounded-full flex-row items-center"
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
                </View>
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
                      expanded={expandedStoryId === story.id}
                      onToggleExpand={() => setExpandedStoryId(expandedStoryId === story.id ? null : story.id)}
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
            </>
          ) : selectedChannel ? (
            /* Channel Messages View */
            <Animated.View entering={FadeInUp.delay(200).duration(600)} className="px-6 flex-1">
              {/* Channel Header */}
              <Pressable
                onPress={() => setSelectedChannel(null)}
                className="flex-row items-center mb-4 p-3 rounded-xl"
                style={{ backgroundColor: theme.bg.card }}
              >
                <ArrowLeft size={18} color={theme.text.primary} />
                <Text style={{ fontSize: 20, marginLeft: 8 }}>{selectedChannel.emoji}</Text>
                <View className="flex-1 ml-2">
                  <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }} className="text-base">
                    {selectedChannel.name}
                  </Text>
                  <Text style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.muted }} className="text-xs">
                    {selectedChannel.messageCount} messages
                  </Text>
                </View>
              </Pressable>

              {/* Messages */}
              {loadingMessages ? (
                <View className="items-center py-12">
                  <Text style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.muted }}>
                    Loading messages...
                  </Text>
                </View>
              ) : messagesData?.messages && messagesData.messages.length > 0 ? (
                <View>
                  {messagesData.messages.map((msg) => {
                    const stageInfo = msg.lifeStage ? lifeStageInfo[msg.lifeStage as keyof typeof lifeStageInfo] : null;
                    return (
                      <View
                        key={msg.id}
                        className="p-3 rounded-xl mb-2"
                        style={{ backgroundColor: theme.bg.card }}
                      >
                        <View className="flex-row items-center mb-2">
                          {stageInfo && (
                            <View
                              className="px-2 py-0.5 rounded-full mr-2"
                              style={{ backgroundColor: `${stageInfo.color}20` }}
                            >
                              <Text style={{ fontFamily: 'Quicksand_500Medium', color: stageInfo.color }} className="text-xs">
                                {stageInfo.emoji} {stageInfo.name}
                              </Text>
                            </View>
                          )}
                          <Text style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.muted }} className="text-xs">
                            {formatDate(msg.createdAt)}
                          </Text>
                        </View>
                        <Text style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.primary }} className="text-sm mb-2">
                          {msg.content}
                        </Text>
                        <Pressable
                          onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            heartMessageMutation.mutate(msg.id);
                          }}
                          className="flex-row items-center self-start"
                        >
                          <Heart size={14} color={theme.accent.pink} fill={msg.hearts > 0 ? theme.accent.pink : 'transparent'} />
                          {msg.hearts > 0 && (
                            <Text style={{ fontFamily: 'Quicksand_500Medium', color: theme.accent.pink }} className="text-xs ml-1">
                              {msg.hearts}
                            </Text>
                          )}
                        </Pressable>
                      </View>
                    );
                  })}
                </View>
              ) : (
                <View className="items-center py-12">
                  <MessageCircle size={48} color={theme.text.muted} />
                  <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }} className="text-base mt-4">
                    No messages yet
                  </Text>
                  <Text style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.muted }} className="text-sm mt-1 text-center">
                    Be the first to start the conversation!
                  </Text>
                </View>
              )}
            </Animated.View>
          ) : (
            /* Channel List View */
            <Animated.View entering={FadeInUp.delay(200).duration(600)} className="px-6">
              <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }} className="text-base mb-3">
                Secret Chat Rooms
              </Text>
              <Text style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.muted }} className="text-sm mb-4">
                Join anonymous conversations with women on similar journeys
              </Text>

              {loadingChannels ? (
                <View className="items-center py-12">
                  <Text style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.muted }}>
                    Loading channels...
                  </Text>
                </View>
              ) : channelsData?.channels && channelsData.channels.length > 0 ? (
                channelsData.channels.map((channel) => (
                  <Pressable
                    key={channel.id}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setSelectedChannel(channel);
                    }}
                    className="flex-row items-center p-4 rounded-xl mb-3 border"
                    style={{ backgroundColor: theme.bg.card, borderColor: theme.border.light }}
                  >
                    <View
                      className="w-12 h-12 rounded-full items-center justify-center mr-3"
                      style={{ backgroundColor: `${channel.color}20` }}
                    >
                      <Text style={{ fontSize: 24 }}>{channel.emoji}</Text>
                    </View>
                    <View className="flex-1">
                      <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }} className="text-base">
                        {channel.name}
                      </Text>
                      <Text style={{ fontFamily: 'Quicksand_400Regular', color: theme.text.muted }} className="text-xs" numberOfLines={1}>
                        {channel.description}
                      </Text>
                      <Text style={{ fontFamily: 'Quicksand_500Medium', color: channel.color }} className="text-xs mt-1">
                        {channel.messageCount} messages
                      </Text>
                    </View>
                    <ChevronRight size={18} color={theme.text.muted} />
                  </Pressable>
                ))
              ) : (
                <View className="items-center py-12">
                  <Hash size={48} color={theme.text.muted} />
                  <Text style={{ fontFamily: 'Quicksand_600SemiBold', color: theme.text.primary }} className="text-base mt-4">
                    No channels yet
                  </Text>
                </View>
              )}
            </Animated.View>
          )}
        </ScrollView>

        {/* Message Input for Channel */}
        {selectedChannel && (
          <View
            className="px-6 py-3 border-t"
            style={{
              backgroundColor: theme.bg.primary,
              borderColor: theme.border.light,
              paddingBottom: insets.bottom + 16,
            }}
          >
            <View className="flex-row items-center">
              <TextInput
                value={newMessage}
                onChangeText={setNewMessage}
                placeholder="Share your thoughts anonymously..."
                placeholderTextColor={theme.text.muted}
                maxLength={1000}
                multiline
                style={{
                  fontFamily: 'Quicksand_400Regular',
                  color: theme.text.primary,
                  backgroundColor: theme.bg.card,
                  borderColor: theme.border.light,
                  flex: 1,
                  maxHeight: 100,
                }}
                className="p-3 rounded-xl border mr-2"
              />
              <Pressable
                onPress={() => {
                  if (newMessage.trim()) {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    sendMessageMutation.mutate(newMessage.trim());
                  }
                }}
                disabled={!newMessage.trim() || sendMessageMutation.isPending}
              >
                <LinearGradient
                  colors={['#f9a8d4', '#c4b5fd']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: (!newMessage.trim() || sendMessageMutation.isPending) ? 0.5 : 1,
                  }}
                >
                  <Send size={18} color="#fff" />
                </LinearGradient>
              </Pressable>
            </View>
          </View>
        )}

        {/* FAB - New Story (only show in stories view) */}
        {viewMode === 'stories' && (
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setShowNewStoryModal(true);
            }}
            className="absolute right-6"
            style={{ bottom: insets.bottom + 100 }}
          >
            <LinearGradient
              colors={['#f9a8d4', '#c4b5fd']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                width: 52,
                height: 52,
                borderRadius: 26,
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
              }}
            >
              <Plus size={22} color="#fff" />
            </LinearGradient>
          </Pressable>
        )}

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

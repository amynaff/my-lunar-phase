import { api } from './api';

export interface CommunityStory {
  id: string;
  category: string;
  lifeStage: string;
  title: string;
  content: string;
  hearts: number;
  commentCount: number;
  createdAt: string;
}

export interface StoryComment {
  id: string;
  content: string;
  hearts: number;
  createdAt: string;
}

export interface ChatChannel {
  id: string;
  name: string;
  description: string;
  emoji: string;
  color: string;
  messageCount: number;
}

export interface ChatMessage {
  id: string;
  lifeStage: string | null;
  content: string;
  hearts: number;
  createdAt: string;
}

export interface StoriesResponse {
  stories: CommunityStory[];
  total: number;
  hasMore: boolean;
}

export interface CommentsResponse {
  comments: StoryComment[];
  total: number;
  hasMore: boolean;
}

export interface MessagesResponse {
  messages: ChatMessage[];
  total: number;
  hasMore: boolean;
}

export interface CategoryCount {
  category: string;
  count: number;
}

// ==================== STORIES ====================

export async function fetchStories(params?: {
  category?: string;
  lifeStage?: string;
  limit?: number;
  offset?: number;
}): Promise<StoriesResponse> {
  const queryParams = new URLSearchParams();

  if (params?.category) queryParams.set('category', params.category);
  if (params?.lifeStage) queryParams.set('lifeStage', params.lifeStage);
  if (params?.limit) queryParams.set('limit', params.limit.toString());
  if (params?.offset) queryParams.set('offset', params.offset.toString());

  const query = queryParams.toString();
  return api.get<StoriesResponse>(`/api/community/stories${query ? `?${query}` : ''}`);
}

export async function createStory(data: {
  category: string;
  lifeStage: string;
  title: string;
  content: string;
}): Promise<{ story: CommunityStory }> {
  return api.post<{ story: CommunityStory }>('/api/community/stories', data);
}

export async function heartStory(id: string): Promise<{ story: { id: string; hearts: number } }> {
  return api.post<{ story: { id: string; hearts: number } }>(`/api/community/stories/${id}/heart`, {});
}

export async function fetchCategories(lifeStage?: string): Promise<{
  categories: CategoryCount[];
  total: number;
}> {
  const query = lifeStage ? `?lifeStage=${lifeStage}` : '';
  return api.get<{ categories: CategoryCount[]; total: number }>(`/api/community/categories${query}`);
}

// ==================== COMMENTS ====================

export async function fetchComments(storyId: string, params?: {
  limit?: number;
  offset?: number;
}): Promise<CommentsResponse> {
  const queryParams = new URLSearchParams();
  if (params?.limit) queryParams.set('limit', params.limit.toString());
  if (params?.offset) queryParams.set('offset', params.offset.toString());

  const query = queryParams.toString();
  return api.get<CommentsResponse>(`/api/community/stories/${storyId}/comments${query ? `?${query}` : ''}`);
}

export async function createComment(storyId: string, content: string): Promise<{ comment: StoryComment }> {
  return api.post<{ comment: StoryComment }>(`/api/community/stories/${storyId}/comments`, { content });
}

export async function heartComment(commentId: string): Promise<{ comment: { id: string; hearts: number } }> {
  return api.post<{ comment: { id: string; hearts: number } }>(`/api/community/comments/${commentId}/heart`, {});
}

// ==================== CHAT CHANNELS ====================

export async function fetchChannels(): Promise<{ channels: ChatChannel[] }> {
  return api.get<{ channels: ChatChannel[] }>('/api/community/channels');
}

export async function fetchChannelMessages(channelId: string, params?: {
  limit?: number;
  offset?: number;
}): Promise<MessagesResponse> {
  const queryParams = new URLSearchParams();
  if (params?.limit) queryParams.set('limit', params.limit.toString());
  if (params?.offset) queryParams.set('offset', params.offset.toString());

  const query = queryParams.toString();
  return api.get<MessagesResponse>(`/api/community/channels/${channelId}/messages${query ? `?${query}` : ''}`);
}

export async function sendChannelMessage(channelId: string, content: string, lifeStage?: string): Promise<{ message: ChatMessage }> {
  return api.post<{ message: ChatMessage }>(`/api/community/channels/${channelId}/messages`, { content, lifeStage });
}

export async function heartMessage(messageId: string): Promise<{ message: { id: string; hearts: number } }> {
  return api.post<{ message: { id: string; hearts: number } }>(`/api/community/messages/${messageId}/heart`, {});
}

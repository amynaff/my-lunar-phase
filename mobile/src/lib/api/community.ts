import { api } from './api';

export interface CommunityStory {
  id: string;
  category: string;
  lifeStage: string;
  title: string;
  content: string;
  hearts: number;
  createdAt: string;
}

export interface StoriesResponse {
  stories: CommunityStory[];
  total: number;
  hasMore: boolean;
}

export interface CategoryCount {
  category: string;
  count: number;
}

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

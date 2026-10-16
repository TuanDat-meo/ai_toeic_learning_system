import { apiRequest, writeAuthRequest } from './client';
import { GrammarTopicItem } from '@/app/admin/content/grammar/types';

export async function fetchGrammarTopics(): Promise<GrammarTopicItem[]> {
  try {
    return await apiRequest<GrammarTopicItem[]>('/api/grammar/topics');
  } catch (error) {
    console.warn('Fallback to local mock grammar topics:', error);
    return [];
  }
}

export async function fetchGrammarTopicDetails(topicId: string): Promise<GrammarTopicItem | null> {
  try {
    return await apiRequest<GrammarTopicItem>(`/api/grammar/topics/${topicId}`);
  } catch (error) {
    console.warn(`Fallback to local mock for topic ${topicId}:`, error);
    return null;
  }
}

export async function saveGrammarProgress(topicId: string, completedQuestions: number, totalQuestions: number, status: string): Promise<void> {
  try {
    await writeAuthRequest<void>('POST', `/api/grammar/topics/${topicId}/progress`, {
      completedQuestions,
      totalQuestions,
      status,
    });
  } catch (error) {
    console.warn('Could not sync grammar progress to backend:', error);
  }
}

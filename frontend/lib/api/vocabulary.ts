import { apiRequest, writeAuthRequest } from './client';
import { TestItem } from '@/app/admin/content/vocabulary/types';

export async function fetchVocabularySets(category?: string): Promise<TestItem[]> {
  try {
    const query = category && category !== 'all' ? `?category=${category}` : '';
    return await apiRequest<TestItem[]>(`/api/vocabulary/sets${query}`);
  } catch (error) {
    console.warn('Fallback to local mock vocabulary sets:', error);
    return [];
  }
}

export async function fetchVocabularySetDetails(setId: string): Promise<TestItem | null> {
  try {
    return await apiRequest<TestItem>(`/api/vocabulary/sets/${setId}`);
  } catch (error) {
    console.warn(`Fallback to local mock for set ${setId}:`, error);
    return null;
  }
}

export async function toggleWordStarred(wordId: string): Promise<void> {
  try {
    await writeAuthRequest<void>('POST', `/api/vocabulary/words/${wordId}/star`);
  } catch (error) {
    console.warn('Could not sync star status to backend:', error);
  }
}

export async function updateWordStatus(wordId: string, status: string): Promise<void> {
  try {
    await writeAuthRequest<void>('POST', `/api/vocabulary/words/${wordId}/status`, { status });
  } catch (error) {
    console.warn('Could not sync word status to backend:', error);
  }
}

import { apiRequest, writeAuthRequest } from './client';
import { DictationCardData } from '@/app/admin/content/listening/types';

export async function fetchListeningCards(): Promise<DictationCardData[]> {
  try {
    return await apiRequest<DictationCardData[]>('/api/listening/cards');
  } catch (error) {
    console.warn('Fallback to local mock listening cards due to API error:', error);
    return [];
  }
}

export async function fetchListeningCard(cardId: string): Promise<DictationCardData | null> {
  try {
    return await apiRequest<DictationCardData>(`/api/listening/cards/${cardId}`);
  } catch (error) {
    console.warn(`Fallback to local mock for listening card ${cardId}:`, error);
    return null;
  }
}

export async function saveListeningProgress(req: {
  cardId: string;
  completedQuestions: number;
  totalQuestions: number;
  lastQuestionIndex: number;
  status: string;
}): Promise<void> {
  try {
    await writeAuthRequest<void>('POST', '/api/listening/progress', req);
  } catch (error) {
    console.warn('Could not persist listening progress to backend:', error);
  }
}

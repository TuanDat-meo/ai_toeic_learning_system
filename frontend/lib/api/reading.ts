import { apiRequest, writeAuthRequest } from './client';
import { ExerciseCardData } from '@/app/admin/content/reading/types';

export async function fetchReadingCards(category?: string): Promise<ExerciseCardData[]> {
  try {
    const query = category && category !== 'all' ? `?category=${category}` : '';
    return await apiRequest<ExerciseCardData[]>(`/api/reading/cards${query}`);
  } catch (error) {
    console.warn('Fallback to local mock reading cards:', error);
    return [];
  }
}

export async function fetchReadingCardDetails(cardId: string): Promise<ExerciseCardData | null> {
  try {
    return await apiRequest<ExerciseCardData>(`/api/reading/cards/${cardId}`);
  } catch (error) {
    console.warn(`Fallback to local mock for reading card ${cardId}:`, error);
    return null;
  }
}

export async function saveReadingProgress(
  cardId: string,
  studiedQuestions: number,
  correctAnswers: number,
  wrongAnswers: number,
  bookmarked?: boolean
): Promise<void> {
  try {
    await writeAuthRequest<void>('POST', `/api/reading/cards/${cardId}/progress`, {
      studiedQuestions,
      correctAnswers,
      wrongAnswers,
      bookmarked,
    });
  } catch (error) {
    console.warn('Could not sync reading progress to backend:', error);
  }
}

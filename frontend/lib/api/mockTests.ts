import { apiRequest, writeAuthRequest } from './client';
import { TestItem, PracticeQuestion, HistoryAttempt, normalizeToeicPart } from '@/app/admin/content/mock-tests/types';
import { enrichPracticeQuestion } from '../toeicQuestionEnricher';

export async function fetchMockTests(volId?: string): Promise<TestItem[]> {
  try {
    const query = volId && volId !== 'all' ? `?volId=${volId}` : '';
    return await apiRequest<TestItem[]>(`/api/mock-tests${query}`);
  } catch (error) {
    console.warn('Fallback to local mock tests:', error);
    return [];
  }
}

export async function fetchMockTestQuestions(testId: number): Promise<PracticeQuestion[]> {
  try {
    const list = await apiRequest<PracticeQuestion[]>(`/api/mock-tests/${testId}/questions`);
    if (Array.isArray(list)) {
      return list.map((q) => enrichPracticeQuestion({
        ...q,
        part: normalizeToeicPart(q.part),
      }));
    }
    return [];
  } catch (error) {
    console.warn(`Fallback to local mock questions for test ${testId}:`, error);
    return [];
  }
}

export async function submitMockTestAttempt(req: {
  testId: number;
  score: number;
  listeningScore: number;
  readingScore: number;
  correctCount: number;
  totalCount: number;
  durationSeconds: number;
}): Promise<HistoryAttempt | null> {
  try {
    return await writeAuthRequest<HistoryAttempt>('POST', '/api/mock-tests/submit', req);
  } catch (error) {
    console.warn('Could not persist mock test attempt to backend:', error);
    return null;
  }
}

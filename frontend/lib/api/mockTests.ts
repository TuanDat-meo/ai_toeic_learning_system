import { apiRequest, writeAuthRequest } from './client';
import {
  TestItem,
  PracticeQuestion,
  HistoryAttempt,
  StudentSubmission,
  normalizeToeicPart,
} from '@/app/admin/content/mock-tests/types';
import { enrichPracticeQuestion } from '../toeicQuestionEnricher';

export interface MockTestInput {
  volId: string;
  title: string;
  difficulty: string;
  description: string;
  durationMinutes: number;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  keyVocab?: Record<string, unknown>[];
}

export async function fetchMockTests(volId?: string): Promise<TestItem[]> {
  const query = volId && volId !== 'all' ? `?volId=${encodeURIComponent(volId)}` : '';
  const items = await apiRequest<TestItem[]>(`/api/mock-tests${query}`);
  return Array.isArray(items) ? items : [];
}

export function createMockTest(input: MockTestInput): Promise<TestItem> {
  return writeAuthRequest<TestItem>('POST', '/api/admin/mock-tests', input);
}

export function updateMockTest(testId: number, input: MockTestInput): Promise<TestItem> {
  return writeAuthRequest<TestItem>('PUT', `/api/admin/mock-tests/${testId}`, input);
}

export function deleteMockTest(testId: number): Promise<void> {
  return writeAuthRequest<void>('DELETE', `/api/admin/mock-tests/${testId}`);
}

export async function fetchMockTestQuestions(testId: number): Promise<PracticeQuestion[]> {
  const list = await apiRequest<PracticeQuestion[]>(`/api/mock-tests/${testId}/questions`);
  return (Array.isArray(list) ? list : []).map((question) =>
    enrichPracticeQuestion({
      ...question,
      part: normalizeToeicPart(question.part),
    })
  );
}

export async function fetchMockTestSubmissions(testId?: number): Promise<StudentSubmission[]> {
  const query = testId && testId > 0 ? `?testId=${testId}` : '';
  const submissions = await apiRequest<StudentSubmission[]>(`/api/admin/mock-tests/submissions${query}`);
  return Array.isArray(submissions) ? submissions : [];
}

export function submitMockTestAttempt(req: {
  testId: number;
  score: number;
  listeningScore: number;
  readingScore: number;
  correctCount: number;
  totalCount: number;
  durationSeconds: number;
}): Promise<HistoryAttempt> {
  return writeAuthRequest<HistoryAttempt>('POST', '/api/mock-tests/submit', req);
}

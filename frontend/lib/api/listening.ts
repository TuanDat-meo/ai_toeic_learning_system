import { apiRequest, writeAuthRequest } from './client';
import type { DictationCardData, LevelCategoryCardData } from '@/app/admin/content/listening/types';

export async function fetchListeningCards(): Promise<DictationCardData[]> {
  const cards = await apiRequest<DictationCardData[]>('/api/listening/cards');
  if (!Array.isArray(cards)) throw new Error('Dữ liệu bài nghe từ máy chủ không hợp lệ.');
  return cards;
}

export async function fetchAdminListeningCards(): Promise<DictationCardData[]> {
  const cards = await apiRequest<DictationCardData[]>('/api/admin/listening/cards');
  if (!Array.isArray(cards)) throw new Error('Dữ liệu bài nghe từ máy chủ không hợp lệ.');
  return cards;
}

export async function fetchListeningCard(cardId: string): Promise<DictationCardData> {
  return apiRequest<DictationCardData>(`/api/listening/cards/${cardId}`);
}

export async function fetchListeningUnits(): Promise<LevelCategoryCardData[]> {
  const units = await apiRequest<LevelCategoryCardData[]>('/api/listening/units');
  if (!Array.isArray(units)) throw new Error('Dữ liệu chủ điểm nghe từ máy chủ không hợp lệ.');
  return units;
}

export async function fetchAdminListeningUnits(): Promise<LevelCategoryCardData[]> {
  const units = await apiRequest<LevelCategoryCardData[]>('/api/admin/listening/units');
  if (!Array.isArray(units)) throw new Error('Dữ liệu chủ điểm nghe từ máy chủ không hợp lệ.');
  return units;
}

export type ListeningCardRequest = {
  title: string;
  testNumber: number;
  part: DictationCardData['part'];
  year: DictationCardData['year'];
  totalQuestions: number;
  audioUrl: string;
  fullTranscript: string;
  vietnameseTranslation: string;
};

export async function createListeningCard(request: ListeningCardRequest): Promise<DictationCardData> {
  return writeAuthRequest<DictationCardData>('POST', '/api/admin/listening/cards', request);
}

export async function updateListeningCard(cardId: string, request: ListeningCardRequest): Promise<DictationCardData> {
  return writeAuthRequest<DictationCardData>('PUT', `/api/admin/listening/cards/${cardId}`, request);
}

export async function deleteListeningCard(cardId: string): Promise<void> {
  await writeAuthRequest<void>('DELETE', `/api/admin/listening/cards/${cardId}`);
}

export type ListeningUnitRequest = Pick<LevelCategoryCardData,
  'part' | 'type' | 'title' | 'totalQuestions' | 'theorySummary' | 'rules' | 'vocabBag' | 'questions'
> & { targetLevel?: string };

export async function createListeningUnit(request: ListeningUnitRequest): Promise<LevelCategoryCardData> {
  return writeAuthRequest<LevelCategoryCardData>('POST', '/api/admin/listening/units', request);
}

export async function updateListeningUnit(unitId: string, request: ListeningUnitRequest): Promise<LevelCategoryCardData> {
  return writeAuthRequest<LevelCategoryCardData>('PUT', `/api/admin/listening/units/${unitId}`, request);
}

export async function deleteListeningUnit(unitId: string): Promise<void> {
  await writeAuthRequest<void>('DELETE', `/api/admin/listening/units/${unitId}`);
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

import { apiRequest, writeAuthRequest } from './client';
import type { GrammarTopicItem, GrammarQuestionItem } from '@/app/admin/content/grammar/types';

interface RawGrammarTopic {
  id: string;
  code?: string;
  title?: string;
  titleVi?: string;
  titleEn?: string;
  englishTitle?: string;
  part?: string;
  targetScore?: string;
  status?: string;
  summary?: string;
  formula?: string;
  signalWords?: string[];
  traps?: string[];
  examples?: Array<{ sentence?: string; translation?: string; analysis?: string; en?: string; vi?: string }>;
  questions?: GrammarQuestionItem[];
  orderIndex?: number;
  totalQuestions?: number;
  completedQuestions?: number;
  userStatus?: string;
}

function mapGrammarTopic(t: RawGrammarTopic): GrammarTopicItem {
  const titleVi = t.title || t.titleVi || '';
  const titleEn = t.englishTitle || t.titleEn || titleVi;

  return {
    id: t.id,
    code: t.code || 'GT-000',
    titleVi,
    titleEn,
    title: titleVi,
    englishTitle: titleEn,
    part: t.part || 'Part 5',
    targetScore: t.targetScore || '350-500',
    status: t.status || 'PUBLISHED',
    summary: t.summary || '',
    formula: t.formula || '',
    signalWords: Array.isArray(t.signalWords) ? t.signalWords : [],
    traps: Array.isArray(t.traps) ? t.traps : [],
    examples: Array.isArray(t.examples)
      ? t.examples.map((ex) => ({
          sentence: ex.sentence || ex.en || '',
          translation: ex.translation || ex.vi || '',
          ...(ex.analysis ? { analysis: ex.analysis } : {}),
        }))
      : [],
    questions: Array.isArray(t.questions) ? t.questions : [],
    orderIndex: t.orderIndex ?? 0,
    totalQuestions: t.totalQuestions ?? (Array.isArray(t.questions) ? t.questions.length : 0),
    completedQuestions: t.completedQuestions ?? 0,
    userStatus: t.userStatus ?? 'Chưa học',
  };
}

export async function getGrammarTopics(): Promise<GrammarTopicItem[]> {
  try {
    const list = await apiRequest<RawGrammarTopic[]>('/api/grammar/topics');
    return Array.isArray(list) ? list.map(mapGrammarTopic) : [];
  } catch (error) {
    console.error('getGrammarTopics error:', error);
    throw error;
  }
}

export async function getAdminGrammarTopics(): Promise<GrammarTopicItem[]> {
  try {
    const list = await apiRequest<RawGrammarTopic[]>('/api/admin/grammar/topics');
    return Array.isArray(list) ? list.map(mapGrammarTopic) : [];
  } catch (error) {
    console.error('getAdminGrammarTopics error:', error);
    throw error;
  }
}

export async function getGrammarTopic(id: string): Promise<GrammarTopicItem> {
  const data = await apiRequest<RawGrammarTopic>(`/api/grammar/topics/${id}`);
  return mapGrammarTopic(data);
}

export async function createGrammarTopic(topicData: Partial<GrammarTopicItem>): Promise<GrammarTopicItem> {
  const payload = {
    code: topicData.code,
    titleVi: topicData.titleVi || topicData.title,
    titleEn: topicData.titleEn || topicData.englishTitle,
    title: topicData.titleVi || topicData.title,
    englishTitle: topicData.titleEn || topicData.englishTitle,
    part: topicData.part,
    targetScore: topicData.targetScore,
    status: topicData.status || 'DRAFT',
    summary: topicData.summary,
    formula: topicData.formula,
    signalWords: topicData.signalWords,
    traps: topicData.traps,
    examples: topicData.examples,
    questions: topicData.questions,
    orderIndex: topicData.orderIndex,
  };
  const res = await writeAuthRequest<RawGrammarTopic>('POST', '/api/admin/grammar/topics', payload);
  return mapGrammarTopic(res);
}

export async function updateGrammarTopic(id: string, topicData: Partial<GrammarTopicItem>): Promise<GrammarTopicItem> {
  const payload = {
    code: topicData.code,
    titleVi: topicData.titleVi || topicData.title,
    titleEn: topicData.titleEn || topicData.englishTitle,
    title: topicData.titleVi || topicData.title,
    englishTitle: topicData.titleEn || topicData.englishTitle,
    part: topicData.part,
    targetScore: topicData.targetScore,
    status: topicData.status,
    summary: topicData.summary,
    formula: topicData.formula,
    signalWords: topicData.signalWords,
    traps: topicData.traps,
    examples: topicData.examples,
    questions: topicData.questions,
    orderIndex: topicData.orderIndex,
  };
  const res = await writeAuthRequest<RawGrammarTopic>('PUT', `/api/admin/grammar/topics/${id}`, payload);
  return mapGrammarTopic(res);
}

export async function deleteGrammarTopic(id: string): Promise<void> {
  await writeAuthRequest<void>('DELETE', `/api/admin/grammar/topics/${id}`);
}

export async function addGrammarQuestion(topicId: string, question: GrammarQuestionItem): Promise<GrammarTopicItem> {
  const res = await writeAuthRequest<RawGrammarTopic>('POST', `/api/admin/grammar/topics/${topicId}/questions`, question);
  return mapGrammarTopic(res);
}

export async function bulkUpdateGrammarStatus(ids: string[], status: string): Promise<void> {
  await writeAuthRequest<void>('POST', '/api/admin/grammar/topics/bulk-status', { ids, status });
}

export async function bulkDeleteGrammarTopics(ids: string[]): Promise<void> {
  await writeAuthRequest<void>('POST', '/api/admin/grammar/topics/bulk-delete', { ids });
}

export async function saveGrammarProgress(
  topicId: string,
  completedQuestions: number,
  totalQuestions: number,
  status: string
): Promise<void> {
  await writeAuthRequest<void>('POST', '/api/grammar/progress', {
    topicId,
    completedQuestions,
    totalQuestions,
    status,
  });
}

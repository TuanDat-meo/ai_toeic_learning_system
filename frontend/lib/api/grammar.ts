import { apiRequest, writeAuthRequest } from './client';
import type { GrammarTopicItem, GrammarQuestionItem } from '@/app/admin/content/grammar/types';
import { INITIAL_GRAMMAR_TOPICS } from '@/app/admin/content/grammar/mockData';

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
  examples?: Array<{ sentence?: string; translation?: string; analysis?: string; en?: string; vi?: string; theory?: string; explanation?: string }>;
  questions?: any[];
  orderIndex?: number;
  totalQuestions?: number;
  completedQuestions?: number;
  userStatus?: string;
}

function mapGrammarTopic(t: RawGrammarTopic): GrammarTopicItem {
  const titleVi = t.title || t.titleVi || '';
  const titleEn = t.englishTitle || t.titleEn || titleVi;

  const mockFallback = INITIAL_GRAMMAR_TOPICS.find(
    (m) =>
      m.id === t.id ||
      m.code === t.code ||
      (m.titleVi && titleVi && m.titleVi.toLowerCase().includes(titleVi.toLowerCase())) ||
      (m.title && titleVi && m.title.toLowerCase().includes(titleVi.toLowerCase()))
  );

  const rawExamples = Array.isArray(t.examples) && t.examples.length > 0 ? t.examples : (mockFallback?.examples || []);
  let mappedExamples: GrammarTopicItem['examples'] = rawExamples
    .map((ex: any) => ({
      sentence: String(ex.sentence || ex.en || ex.theory || ''),
      translation: String(ex.translation || ex.vi || ''),
      analysis: ex.analysis || ex.explanation ? String(ex.analysis || ex.explanation) : undefined,
    }))
    .filter((ex) => ex.sentence && ex.sentence.trim().length > 0);

  if (mappedExamples.length === 0 && mockFallback?.examples) {
    mappedExamples = mockFallback.examples;
  }

  const rawQuestions = Array.isArray(t.questions) && t.questions.length > 0 ? t.questions : (mockFallback?.questions || []);
  let mappedQuestions: GrammarQuestionItem[] = rawQuestions.map((q: any) => ({
    id: String(q.id || Math.random()),
    part: q.part || t.part || mockFallback?.part || 'PART_5',
    questionText: q.questionText || q.question || '',
    options: q.options || {},
    correctAnswer: q.correctAnswer || 'A',
    explanation: q.explanation || q.solutionMethod || '',
    trapNote: q.trapNote || '',
    translation: typeof q.translation === 'string' ? q.translation : (q.translation?.questionVi || ''),
    difficulty: q.difficulty || q.levelShort || 'MEDIUM',
  }));

  if (mappedQuestions.length === 0 && mockFallback?.questions) {
    mappedQuestions = mockFallback.questions;
  }

  const formula = t.formula && t.formula.trim().length > 0 ? t.formula : (mockFallback?.formula || '');
  const signalWords = Array.isArray(t.signalWords) && t.signalWords.length > 0 ? t.signalWords : (mockFallback?.signalWords || []);
  const traps = Array.isArray(t.traps) && t.traps.length > 0 ? t.traps : (mockFallback?.traps || []);

  return {
    id: t.id,
    code: t.code || mockFallback?.code || 'GT-000',
    titleVi,
    titleEn,
    title: titleVi,
    englishTitle: titleEn,
    part: t.part || mockFallback?.part || 'Part 5',
    targetScore: t.targetScore || mockFallback?.targetScore || '350-500',
    status: t.status || 'PUBLISHED',
    summary: t.summary || mockFallback?.summary || '',
    formula,
    signalWords,
    traps,
    examples: mappedExamples,
    questions: mappedQuestions,
    orderIndex: t.orderIndex ?? (mockFallback as any)?.orderIndex ?? 0,
    totalQuestions: mappedQuestions.length || t.totalQuestions || 10,
    completedQuestions: t.completedQuestions ?? 0,
    userStatus: t.userStatus ?? 'Chưa học',
  };
}

export async function getGrammarTopics(): Promise<GrammarTopicItem[]> {
  try {
    const list = await apiRequest<RawGrammarTopic[]>('/api/grammar/topics');
    if (Array.isArray(list) && list.length > 0) {
      return list.map(mapGrammarTopic);
    }
  } catch {
    // Return empty so caller uses mock data gracefully
  }
  return [];
}

export async function getAdminGrammarTopics(): Promise<GrammarTopicItem[]> {
  try {
    const list = await apiRequest<RawGrammarTopic[]>('/api/admin/grammar/topics');
    if (Array.isArray(list) && list.length > 0) {
      return list.map(mapGrammarTopic);
    }
  } catch {
    try {
      const publicList = await apiRequest<RawGrammarTopic[]>('/api/grammar/topics');
      if (Array.isArray(publicList) && publicList.length > 0) {
        return publicList.map(mapGrammarTopic);
      }
    } catch {}
  }
  return [];
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
  const normalizedStatus =
    status === 'COMPLETED' || status === 'Đã hoàn thành'
      ? 'COMPLETED'
      : status === 'NOT_STARTED' || status === 'Chưa học'
      ? 'NOT_STARTED'
      : 'IN_PROGRESS';

  try {
    await writeAuthRequest<void>('POST', '/api/grammar/progress', {
      topicId,
      completedQuestions,
      totalQuestions,
      status: normalizedStatus,
    });
  } catch (error) {
    console.warn('Could not persist grammar progress to backend:', error);
  }
}

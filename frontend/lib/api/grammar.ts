import { apiRequest, writeAuthRequest } from './client';
import type { GrammarTopicItem, GrammarQuestionItem, GrammarCategory } from '@/app/admin/content/grammar/types';

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
  archivedAt?: string;
  summary?: string;
  formula?: string;
  sourceUrl?: string;
  sourceNotes?: string;
  grammarGroup?: string;
  parentTopicId?: string;
  toeicParts?: string[];
  difficulty?: string;
  theory?: Record<string, string>;
  metadata?: GrammarTopicItem['metadata'];
  wordFamilyWords?: GrammarTopicItem['wordFamilyWords'];
  signalWords?: string[];
  traps?: string[];
  examples?: Array<{ sentence?: string; translation?: string; analysis?: string; focusWord?: string; difficulty?: string; en?: string; vi?: string; theory?: string; explanation?: string }>;
  questions?: any[];
  orderIndex?: number;
  totalQuestions?: number;
  linkedToeicQuestionCount?: number;
  completedQuestions?: number;
  userStatus?: string;
}

function mapGrammarTopic(t: RawGrammarTopic): GrammarTopicItem {
  const titleVi = t.title || t.titleVi || '';
  const titleEn = t.englishTitle || t.titleEn || '';

  const rawExamples = Array.isArray(t.examples) ? t.examples : [];
  const mappedExamples: GrammarTopicItem['examples'] = rawExamples
    .map((ex: any) => ({
      sentence: String(ex.sentence || ex.en || ''),
      translation: String(ex.translation || ex.vi || ''),
      analysis: ex.analysis || ex.explanation ? String(ex.analysis || ex.explanation) : undefined,
      focusWord: ex.focusWord ? String(ex.focusWord) : undefined,
      difficulty: ex.difficulty ? String(ex.difficulty) : undefined,
    }))
    .filter((ex) => ex.sentence && ex.sentence.trim().length > 0);

  const rawQuestions = Array.isArray(t.questions) ? t.questions : [];
  const mappedQuestions: GrammarQuestionItem[] = rawQuestions.map((q: any, index: number) => ({
    id: String(q.id ?? `${t.id}-question-${index + 1}`),
    part: q.part || '',
    questionText: q.questionText || q.question || '',
    options: q.options || {},
    correctAnswer: q.correctAnswer ? String(q.correctAnswer) : '',
    explanation: q.explanation || q.solutionMethod || '',
    trapNote: q.trapNote || '',
    translation: typeof q.translation === 'string' ? q.translation : (q.translation?.questionVi || ''),
    difficulty: q.difficulty || q.levelShort || '',
  }));

  const formula = t.formula ?? '';
  const signalWords = Array.isArray(t.signalWords) ? t.signalWords : [];
  const traps = Array.isArray(t.traps) ? t.traps : [];

  return {
    id: t.id,
    code: t.code || '',
    titleVi,
    titleEn,
    title: titleVi,
    englishTitle: titleEn,
    part: t.part || '',
    targetScore: t.targetScore || '',
    status: t.status || '',
    archivedAt: t.archivedAt,
    summary: t.summary ?? '',
    formula,
    sourceUrl: t.sourceUrl,
    sourceNotes: t.sourceNotes || '',
    grammarGroup: t.grammarGroup || '',
    parentTopicId: t.parentTopicId,
    toeicParts: Array.isArray(t.toeicParts) ? t.toeicParts : [],
    difficulty: t.difficulty || '',
    theory: t.theory || {},
    metadata: t.metadata || {},
    wordFamilyWords: Array.isArray(t.wordFamilyWords) ? t.wordFamilyWords : [],
    signalWords,
    traps,
    examples: mappedExamples,
    questions: mappedQuestions,
    orderIndex: t.orderIndex ?? 0,
    totalQuestions: t.totalQuestions ?? mappedQuestions.length,
    linkedToeicQuestionCount: t.linkedToeicQuestionCount ?? 0,
    completedQuestions: t.completedQuestions ?? 0,
    userStatus: t.userStatus ?? 'Chưa học',
  };
}

export async function getGrammarTopics(): Promise<GrammarTopicItem[]> {
  const list = await apiRequest<RawGrammarTopic[]>('/api/grammar/topics');
  return Array.isArray(list) ? list.map(mapGrammarTopic) : [];
}

export async function getAdminGrammarTopics(): Promise<GrammarTopicItem[]> {
  const list = await apiRequest<RawGrammarTopic[]>('/api/admin/grammar/topics');
  if (!Array.isArray(list)) throw new Error('Dữ liệu chủ điểm ngữ pháp từ máy chủ không hợp lệ.');
  return list.map(mapGrammarTopic);
}

export async function getGrammarTopic(id: string): Promise<GrammarTopicItem> {
  const data = await apiRequest<RawGrammarTopic>(`/api/grammar/topics/${id}`);
  return mapGrammarTopic(data);
}

function grammarTopicPayload(topicData: Partial<GrammarTopicItem>) {
  return {
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
    sourceUrl: topicData.sourceUrl,
    sourceNotes: topicData.sourceNotes,
    grammarGroup: topicData.grammarGroup,
    parentTopicId: topicData.parentTopicId,
    toeicParts: topicData.toeicParts,
    difficulty: topicData.difficulty,
    theory: topicData.theory,
    metadata: topicData.metadata,
    wordFamilyWords: topicData.wordFamilyWords,
    signalWords: topicData.signalWords,
    traps: topicData.traps,
    examples: topicData.examples,
    questions: topicData.questions,
    orderIndex: topicData.orderIndex,
  };
}

export async function createGrammarTopic(topicData: Partial<GrammarTopicItem>): Promise<GrammarTopicItem> {
  const payload = { ...grammarTopicPayload(topicData), status: topicData.status || 'DRAFT' };
  const res = await writeAuthRequest<RawGrammarTopic>('POST', '/api/admin/grammar/topics', payload);
  return mapGrammarTopic(res);
}

export async function createGrammarTopicWithNewParent(
  parentTitleVi: string,
  parentTitleEn: string,
  childData: Partial<GrammarTopicItem>,
): Promise<{ parent: GrammarTopicItem; child: GrammarTopicItem }> {
  const response = await writeAuthRequest<{ parent: RawGrammarTopic; child: RawGrammarTopic }>(
    'POST',
    '/api/admin/grammar/topics/with-new-parent',
    {
      parentTitleVi,
      parentTitleEn,
      child: grammarTopicPayload(childData),
    },
  );
  return {
    parent: mapGrammarTopic(response.parent),
    child: mapGrammarTopic(response.child),
  };
}

export async function updateGrammarTopic(id: string, topicData: Partial<GrammarTopicItem>): Promise<GrammarTopicItem> {
  const payload = grammarTopicPayload(topicData);
  const res = await writeAuthRequest<RawGrammarTopic>('PUT', `/api/admin/grammar/topics/${id}`, payload);
  return mapGrammarTopic(res);
}

export async function deleteGrammarTopic(id: string): Promise<void> {
  await writeAuthRequest<void>('POST', `/api/admin/grammar/topics/${id}/delete`, {
    childAction: 'NONE',
    targetParentId: null,
  });
}

export interface GrammarTopicLifecycleImpact {
  topicId: string;
  title: string;
  status: string;
  childCount: number;
  questionCount: number;
  exampleCount: number;
  theoryFieldCount: number;
  wordFamilyLinkCount: number;
  toeicQuestionLinkCount: number;
  userProgressCount: number;
  learningPathLinkCount: number;
  subtreeQuestionCount?: number;
  subtreeExampleCount?: number;
  subtreeTheoryFieldCount?: number;
  subtreeWordFamilyLinkCount?: number;
  subtreeToeicQuestionLinkCount?: number;
  subtreeUserProgressCount?: number;
  subtreeLearningPathLinkCount?: number;
  children: Array<{ id: string; code: string; title: string; status: string }>;
}

export interface DeleteGrammarTopicRequest {
  childAction: 'NONE' | 'ROOTS' | 'MOVE';
  targetParentId?: string | null;
}

export async function getGrammarTopicLifecycleImpact(id: string): Promise<GrammarTopicLifecycleImpact> {
  const impact = await apiRequest<GrammarTopicLifecycleImpact>(`/api/admin/grammar/topics/${id}/lifecycle-impact`);
  return {
    ...impact,
    subtreeQuestionCount: impact.subtreeQuestionCount ?? impact.questionCount,
    subtreeExampleCount: impact.subtreeExampleCount ?? impact.exampleCount,
    subtreeTheoryFieldCount: impact.subtreeTheoryFieldCount ?? impact.theoryFieldCount,
    subtreeWordFamilyLinkCount: impact.subtreeWordFamilyLinkCount ?? impact.wordFamilyLinkCount,
    subtreeToeicQuestionLinkCount: impact.subtreeToeicQuestionLinkCount ?? impact.toeicQuestionLinkCount,
    subtreeUserProgressCount: impact.subtreeUserProgressCount ?? impact.userProgressCount,
    subtreeLearningPathLinkCount: impact.subtreeLearningPathLinkCount ?? impact.learningPathLinkCount,
  };
}

export async function deleteGrammarTopicWithChildren(
  id: string,
  request: DeleteGrammarTopicRequest,
): Promise<void> {
  await writeAuthRequest<void>('POST', `/api/admin/grammar/topics/${id}/delete`, request);
}

export async function archiveGrammarTopic(id: string): Promise<void> {
  await writeAuthRequest<void>('POST', `/api/admin/grammar/topics/${id}/archive`);
}

export async function restoreGrammarTopic(id: string): Promise<GrammarTopicItem> {
  const topic = await writeAuthRequest<RawGrammarTopic>('POST', `/api/admin/grammar/topics/${id}/restore`);
  return mapGrammarTopic(topic);
}

export async function addGrammarQuestion(topicId: string, question: GrammarQuestionItem): Promise<GrammarTopicItem> {
  const res = await writeAuthRequest<RawGrammarTopic>('POST', `/api/admin/grammar/topics/${topicId}/questions`, question);
  return mapGrammarTopic(res);
}

export interface GrammarContentSuggestion {
  formula: string;
  summary: string;
  signalWords: string[];
  traps: string[];
  examples: GrammarTopicItem["examples"];
  sourceUrl: string;
  theory?: Record<string, string>;
  groupValues?: Record<string, string>;
}

export async function generateGrammarContentSuggestion(input: {
  titleVi: string;
  titleEn: string;
  part: string;
  targetScore: string;
  sourceUrl: string;
  sourceNotes: string;
  grammarGroup: string;
  difficulty: string;
  fieldDefinitions: GrammarCategory['fieldDefinitions'];
  metadata: GrammarTopicItem['metadata'];
}): Promise<GrammarContentSuggestion> {
  return writeAuthRequest<GrammarContentSuggestion>('POST', '/api/admin/grammar/suggestions', input);
}

export async function getGrammarCategories(): Promise<GrammarCategory[]> {
  const categories = await apiRequest<Array<{
    code: string;
    name: string;
    fieldDefinitions?: GrammarCategory['fieldDefinitions'];
    system?: boolean;
  }>>('/api/admin/grammar/categories');
  return categories.map((category) => ({
    code: category.code,
    name: category.name,
    fieldDefinitions: category.fieldDefinitions || [],
    system: category.system ?? false,
  }));
}

export async function saveGrammarCategory(category: {
  code: string;
  name: string;
  fieldDefinitions: GrammarCategory['fieldDefinitions'];
}): Promise<GrammarCategory> {
  const result = await writeAuthRequest<{
    code: string;
    name: string;
    fieldDefinitions?: GrammarCategory['fieldDefinitions'];
    system?: boolean;
  }>('POST', '/api/admin/grammar/categories', category);
  return {
    code: result.code,
    name: result.name,
    fieldDefinitions: result.fieldDefinitions || [],
    system: result.system ?? false,
  };
}

export async function updateGrammarCategory(
  code: string,
  category: { name: string; fieldDefinitions: GrammarCategory['fieldDefinitions'] },
): Promise<GrammarCategory> {
  const result = await writeAuthRequest<{
    code: string;
    name: string;
    fieldDefinitions?: GrammarCategory['fieldDefinitions'];
    system?: boolean;
  }>('PUT', `/api/admin/grammar/categories/${encodeURIComponent(code)}`, category);
  return {
    code: result.code,
    name: result.name,
    fieldDefinitions: result.fieldDefinitions || [],
    system: result.system ?? false,
  };
}

export async function deleteGrammarCategory(code: string): Promise<void> {
  await writeAuthRequest<void>('DELETE', `/api/admin/grammar/categories/${encodeURIComponent(code)}`);
}

export async function updateGrammarQuestion(
  topicId: string,
  questionId: string,
  question: GrammarQuestionItem
): Promise<GrammarTopicItem> {
  const res = await writeAuthRequest<RawGrammarTopic>(
    'PUT',
    `/api/admin/grammar/topics/${topicId}/questions/${encodeURIComponent(questionId)}`,
    question
  );
  return mapGrammarTopic(res);
}

export async function deleteGrammarQuestion(topicId: string, questionId: string): Promise<GrammarTopicItem> {
  const res = await writeAuthRequest<RawGrammarTopic>(
    'DELETE',
    `/api/admin/grammar/topics/${topicId}/questions/${encodeURIComponent(questionId)}`
  );
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

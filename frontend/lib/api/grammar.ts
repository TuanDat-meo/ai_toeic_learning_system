import { apiRequest, uploadAuthRequest, writeAuthRequest } from './client';
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
  learningStatus?: GrammarTopicItem['learningStatus'];
  dueCount?: number;
  wrongCount?: number;
  savedCount?: number;
  resumeQuestionId?: string;
  lockedSoft?: boolean;
  prerequisiteNames?: string[];
  weakRuleCount?: number;
  masteryPercent?: number;
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
    learningStatus: t.learningStatus,
    dueCount: t.dueCount ?? 0,
    wrongCount: t.wrongCount ?? 0,
    savedCount: t.savedCount ?? 0,
    resumeQuestionId: t.resumeQuestionId,
    lockedSoft: t.lockedSoft ?? false,
    prerequisiteNames: Array.isArray(t.prerequisiteNames) ? t.prerequisiteNames : [],
    weakRuleCount: t.weakRuleCount ?? 0,
    masteryPercent: t.masteryPercent ?? 0,
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

export async function getPagedAdminGrammarTopics(params: {
  page?: number;
  size?: number;
  status?: string;
  search?: string;
  sort?: string;
} = {}): Promise<{items: Array<Record<string, unknown>>; page: number; size: number; total: number}> {
  const query = new URLSearchParams();
  query.set('page', String(params.page ?? 0));
  query.set('size', String(params.size ?? 20));
  query.set('status', params.status ?? 'ALL');
  if (params.search) query.set('search', params.search);
  query.set('sort', params.sort ?? 'order');
  return apiRequest(`/api/admin/grammar/topics/page?${query.toString()}`);
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

export async function getGrammarResumeIndex(topicId: string): Promise<{ startIndex: number; answeredQuestions: number }> {
  return apiRequest<{ startIndex: number; answeredQuestions: number }>(
    `/api/grammar/topics/${encodeURIComponent(topicId)}/resume`,
  );
}

export interface GrammarTodayData {
  due: { count: number };
  resume: { topicId?: string; title?: string; completedQuestions?: number };
  suggestion: { topicId?: string; reason: string };
  newLearner: boolean;
}

export async function getGrammarToday(): Promise<GrammarTodayData> {
  return apiRequest('/api/grammar/today');
}

export async function searchGrammar(keyword: string): Promise<{
  topics: Array<Record<string, unknown>>;
  rules: Array<Record<string, unknown>>;
  questions: Array<Record<string, unknown>>;
}> {
  return apiRequest(`/api/grammar/search?keyword=${encodeURIComponent(keyword.trim())}`);
}

export async function getGrammarPathSummary(): Promise<{
  publishedCount: number;
  masteredCount: number;
  inProgressCount: number;
}> {
  return apiRequest('/api/grammar/path/summary');
}

export interface GrammarUserSettings {
  dailyTargetMinutes: number;
  reminderEnabled: boolean;
  reminderTime: string;
  timezone: string;
  soundEnabled: boolean;
  fontScale: number;
}

export async function getGrammarUserSettings(): Promise<GrammarUserSettings> {
  return apiRequest('/api/grammar/settings');
}

export async function putGrammarUserSettings(settings: GrammarUserSettings): Promise<GrammarUserSettings> {
  return writeAuthRequest('PUT', '/api/grammar/settings', settings);
}

export async function reportGrammarQuestion(questionId: string, reason: string, message: string): Promise<void> {
  await writeAuthRequest<void>('POST', '/api/grammar/reports', { questionId, reason, message });
}

export async function setGrammarBookmark(targetType: 'QUESTION' | 'TOPIC', targetId: string, note = ''): Promise<void> {
  await writeAuthRequest<void>('POST', '/api/grammar/bookmarks', { targetType, targetId, note });
}

export async function removeGrammarBookmark(targetType: 'QUESTION' | 'TOPIC', targetId: string): Promise<void> {
  await writeAuthRequest<void>('DELETE', `/api/grammar/bookmarks/${targetType}/${encodeURIComponent(targetId)}`);
}

export async function getGrammarBookmarks(): Promise<Array<{targetType: string; targetId: string; note: string; createdAt: string}>> {
  return apiRequest('/api/grammar/bookmarks');
}

export async function getDueGrammarReviews(): Promise<Array<{questionId: string; topicId: string; dueAt: string; intervalDays: number; ease: number; streak: number}>> {
  return apiRequest('/api/grammar/review/due');
}

export async function getGrammarAnalytics(): Promise<{
  attempts: number;
  firstAttempts: number;
  firstAttemptAccuracy: number;
  retentionRate: number;
  repeatedErrorCount: number;
  interleavedAccuracy: number;
  averageResponseTimeMs: number;
}> {
  return apiRequest('/api/grammar/analytics');
}

export interface GrammarTrapQuestion extends Record<string, unknown> {
  question_id: string;
  attempts: number;
  wrong_attempts: number;
  wrong_rate: number;
}

export async function getGrammarTrapAnalysis(): Promise<{
  questions: GrammarTrapQuestion[];
  hasData: boolean;
}> {
  return apiRequest('/api/grammar/traps');
}

export async function createGrammarRule(request: {
  topicId: string;
  code: string;
  name: string;
  description?: string;
  learningObjective?: string;
}): Promise<unknown> {
  return writeAuthRequest('POST', '/api/admin/grammar/rules', request);
}

export async function linkGrammarRule(ruleId: string, questionIds: string[]): Promise<void> {
  await writeAuthRequest<void>('PUT', `/api/admin/grammar/rules/${encodeURIComponent(ruleId)}/questions`, { questionIds });
}

export async function createGrammarPassage(request: {type: 'PART6' | 'PART7'; content: string; translation?: string}): Promise<unknown> {
  return writeAuthRequest('POST', '/api/admin/grammar/passages', request);
}

export async function linkGrammarPassage(passageId: string, questionIds: string[]): Promise<void> {
  await writeAuthRequest<void>('PUT', `/api/admin/grammar/passages/${encodeURIComponent(passageId)}/questions`, { questionIds });
}

export async function startGrammarExam(topicId: string, durationSeconds: number): Promise<{
  id: string;
  topicId: string;
  startedAt: string;
  deadlineAt: string;
  submittedAt?: string;
  suspicious: boolean;
  score?: number;
  status: string;
}> {
  return writeAuthRequest('POST', '/api/grammar/exams', { topicId, durationSeconds });
}

export interface GrammarExamSession {
  id: string;
  topicId: string;
  startedAt: string;
  deadlineAt: string;
  submittedAt?: string | null;
  suspicious: boolean;
  score?: number | null;
  status: string;
}

export async function getGrammarExam(id: string): Promise<GrammarExamSession> {
  return apiRequest(`/api/grammar/exams/${encodeURIComponent(id)}`);
}

export async function submitGrammarExam(id: string, score: number, suspicious: boolean): Promise<unknown> {
  return writeAuthRequest('POST', `/api/grammar/exams/${encodeURIComponent(id)}/submit`, { score, suspicious });
}

export async function previewGrammarImport(file: File): Promise<unknown> {
  const form = new FormData();
  form.set('type', 'GRAMMAR');
  form.set('file', file);
  return uploadAuthRequest('/api/admin/data/import/preview', form);
}

export async function getGrammarPassages(): Promise<Array<{
  id: string;
  type: 'PART6' | 'PART7';
  content: string;
  translation?: string;
}>> {
  return apiRequest('/api/admin/grammar/passages');
}

export async function getGrammarRules(topicId?: string): Promise<Array<{
  id: string;
  topicId: string;
  code: string;
  name: string;
  description?: string;
  learningObjective?: string;
}>> {
  const query = topicId ? `?topicId=${encodeURIComponent(topicId)}` : '';
  return apiRequest(`/api/admin/grammar/rules${query}`);
}

export async function createGrammarRevision(
  entityType: 'TOPIC' | 'QUESTION',
  entityId: string,
  content: Record<string, unknown>,
): Promise<unknown> {
  return writeAuthRequest('POST', '/api/admin/grammar/revisions', {
    entityType,
    entityId,
    content,
  });
}

export async function getGrammarRevisions(entityType: 'TOPIC' | 'QUESTION', entityId: string): Promise<Array<{
  entityType: string;
  entityId: string;
  version: number;
  content: Record<string, unknown>;
  actorId?: string;
  createdAt: string;
}>> {
  const query = new URLSearchParams({ entityType, entityId });
  return apiRequest(`/api/admin/grammar/revisions?${query.toString()}`);
}

export async function restoreGrammarRevision(
  entityType: 'TOPIC' | 'QUESTION',
  entityId: string,
  version: number,
): Promise<unknown> {
  return writeAuthRequest(
    'POST',
    `/api/admin/grammar/revisions/${encodeURIComponent(entityType)}/${encodeURIComponent(entityId)}/${version}/restore`,
  );
}

export interface GrammarLearningConfig {
  passThreshold: number;
  srsInitialDays: number;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  showExplanationImmediately: boolean;
  examMode: boolean;
  minQuestionsToPublish: number;
  masteryStreak: number;
  masteryMinGapDays: number;
  difficultyLowThreshold: number;
  reportAutoHideThreshold: number;
  behaviorRetentionDays: number;
}

export async function getGrammarLearningConfig(topicId?: string): Promise<GrammarLearningConfig> {
  const query = topicId ? `?topicId=${encodeURIComponent(topicId)}` : '';
  return apiRequest<GrammarLearningConfig>(`/api/grammar/config${query}`);
}

export async function getAdminGrammarLearningConfig(topicId?: string): Promise<GrammarLearningConfig> {
  const query = topicId ? `?topicId=${encodeURIComponent(topicId)}` : '';
  return apiRequest<GrammarLearningConfig>(`/api/admin/grammar/config${query}`);
}

export async function putAdminGrammarLearningConfig(
  config: GrammarLearningConfig,
  topicId?: string,
): Promise<GrammarLearningConfig> {
  const query = topicId ? `?topicId=${encodeURIComponent(topicId)}` : '';
  return writeAuthRequest<GrammarLearningConfig>('PUT', `/api/admin/grammar/config${query}`, config);
}

export async function saveGrammarProgress(
  topicId: string,
  questionId: string,
  selectedOption: string,
  mode: 'PRACTICE' | 'RETRY_WRONG' | 'EXAM' | 'REVIEW' | 'MIXED',
  timeSpentMs: number,
  clientEventId: string
): Promise<{ isCorrect: boolean; answeredQuestions: number; totalQuestions: number; firstAttemptAccuracy: number }> {
  return writeAuthRequest('POST', '/api/grammar/progress', {
    topicId,
    questionId,
    selectedOption,
    mode,
    timeSpentMs,
    clientEventId,
  });
}

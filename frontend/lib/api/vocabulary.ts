import { apiRequest, writeAuthRequest } from './client';
import { normalizeVocabularyLevel, type VocabularyRelatedForm, type VocabularySense, type VocabularyTestSet, type WordItem } from '@/app/admin/content/vocabulary/types';
import type { ContentStatus } from '@/lib/types/domain';
import { normalizeVocabularyPartOfSpeech } from '@/lib/vocabulary-part-of-speech';

interface RawWordItem {
  id: string;
  word: string;
  ipa?: string;
  partOfSpeech?: string;
  pos?: string;
  meaning?: string;
  example?: string;
  exampleMeaning?: string;
  exampleVi?: string;
  level?: string;
  starred?: boolean;
  status?: string;
  progressStatus?: string;
  setId?: string;
  audio?: string;
  audioUrl?: string;
  audioRegion?: string;
  wordFamily?: string;
  termType?: WordItem['termType'];
  dictionarySourceUrl?: string;
  relatedForms?: VocabularyRelatedForm[];
  senses?: VocabularySense[];
}

interface RawVocabularyTestSet {
  id: string;
  title?: string;
  year?: string | number;
  category?: string;
  wordCount?: number;
  status?: string;
  releaseAt?: string | null;
  words?: RawWordItem[];
}

function isContentStatus(status: string | undefined): status is ContentStatus {
  return status === 'DRAFT' || status === 'PUBLISHED' || status === 'ARCHIVED' || status === 'PENDING_REVIEW';
}

export interface StudentVocabularyDashboard {
  totalWords: number;
  learnedWords: number;
  masteredWords: number;
  learningWords: number;
  reviewingWords: number;
  dueForReview: number;
  totalSets: number;
  memoryRate: number;
  studyMinutes: number;
  streakDays: number;
  dailyStudyMinutesGoal: number;
  totalAnswers: number;
  correctAnswers: number;
  newWordsGoal: number;
  reviewGoal: number;
  completedNewWords: number;
  completedReview: number;
  reachedNewGoal: boolean;
  reachedReviewGoal: boolean;
}

export interface StudentVocabularyGoal {
  newWordsGoal: number;
  reviewGoal: number;
  completedNewWords: number;
  completedReview: number;
  reachedNewGoal: boolean;
  reachedReviewGoal: boolean;
}

export interface VocabularyAnswerResult {
  eventId: string;
  correct: boolean;
  correctAnswer: string;
  result?: 'correct' | 'near' | 'wrong' | 'timeout' | null;
  status: string;
  nextReviewAt: string | null;
  duplicate: boolean;
  damage?: number;
  playerHp?: number;
  enemyHp?: number;
  score?: number;
  combo?: number;
  counterCharge?: number;
  isCritical?: boolean;
  battleState?: string;
}

export type VocabularyGameType = 'FLASHCARD' | 'RUNNER' | 'SENTENCE' | 'MATCHING' | 'BATTLE' | 'TYPING';

export interface WrongWordDetail {
  vocabularyId: string;
  word: string;
  meaning: string;
  wrongCount: number;
  avoidableCount: number;
  matched: boolean;
  confusedWith: string[];
}

export interface VocabularyGameSession {
  id: string;
  setId: string;
  gameType: VocabularyGameType;
  startedAt: string;
  completedAt: string | null;
  score: number;
  correctCount: number;
  wrongCount: number;
  totalQuestions: number;
  durationSeconds: number;
  maxCombo: number;
  mode?: string;
  timeLimitSeconds?: number | null;
  difficulty?: 'ALL' | 'EASY' | 'MEDIUM' | 'HARD';
  questions?: VocabularyGameQuestion[];
  deckIds?: string[];
  wordLevel?: string;
  speedPreset?: string;
  stars?: number;
  won?: boolean;
  playerHpRemaining?: number;
  fleetHpRemaining?: number;
  tier?: 'S' | 'A' | 'B' | 'C' | 'INCOMPLETE';
  accuracy?: number;
  correct?: number;
  wrong?: number;
  avoidableMistakes?: number;
  wrongWords?: WrongWordDetail[];
}

export interface VocabularyGameQuestion {
  questionIndex: number;
  wordId: string;
  optionWordIds: string[];
}

export interface BattleSessionEventItem {
  questionIndex: number;
  wordId: string;
  gameResult: string | null;
  correct: boolean;
  damage: number;
  usedHint: boolean;
}

export interface BattleSessionState {
  session: VocabularyGameSession;
  events: BattleSessionEventItem[];
  playerHp: number;
  fleetHp: number;
  combo: number;
  counterCharge: number;
  battleState: string;
}

export interface VocabularyGameScore {
  gameType: VocabularyGameType;
  bestScore: number;
  completedPlays: number;
  lastPlayedAt: string;
}

export interface WeakVocabularyWord {
  wordId: string;
  word: string;
  setId: string;
  setTitle: string;
  meaning: string;
  status: string;
  correctCount: number;
  incorrectCount: number;
  nextReviewAt: string | null;
}

export interface VocabularyDailyStat {
  date: string;
  answerCount: number;
  correctCount: number;
  responseTimeMs: number;
}

export interface VocabularyHistoryItem {
  id: string;
  wordId: string;
  word: string;
  setId: string;
  setTitle: string;
  activityType: VocabularyActivityType;
  questionType: VocabularyQuestionType;
  studentAnswer: string;
  correctAnswer: string;
  correct: boolean;
  rating: VocabularySrsRating | null;
  responseTimeMs: number;
  attemptedAt: string;
}

export type VocabularyActivityType = 'LEARN' | 'FLASHCARD' | 'PRACTICE' | 'REVIEW' | 'GAME';
export type VocabularyQuestionType =
  | 'ENGLISH_TO_VIETNAMESE'
  | 'VIETNAMESE_TO_ENGLISH'
  | 'FILL_IN_BLANK'
  | 'TYPE_WORD'
  | 'AUDIO'
  | 'FLASHCARD_RATING';
export type VocabularySrsRating = 'AGAIN' | 'HARD' | 'GOOD' | 'EASY';

function mapWord(w: RawWordItem): WordItem {
  const audio = w.audioUrl || w.audio || '';
  const progressStatus = w.progressStatus || w.status;
  return {
    id: w.id,
    word: w.word,
    ipa: w.ipa || '',
    partOfSpeech: normalizeVocabularyPartOfSpeech(w.partOfSpeech || w.pos || 'Noun'),
    pos: normalizeVocabularyPartOfSpeech(w.partOfSpeech || w.pos || 'Noun'),
    sourcePartOfSpeech: w.partOfSpeech ?? w.pos ?? '',
    meaning: w.meaning || '',
    example: w.example || '',
    exampleMeaning: w.exampleMeaning || '',
    exampleVi: w.exampleMeaning || '',
    level: normalizeVocabularyLevel(w.level || 'B1'),
    sourceLevel: w.level ?? '',
    starred: w.starred ?? false,
    bookmarked: w.starred ?? false,
    status: isContentStatus(w.status) ? w.status : 'PUBLISHED',
    progressStatus: progressStatus === 'NEW' || progressStatus === 'LEARNING' || progressStatus === 'REVIEWING' || progressStatus === 'MASTERED'
      ? progressStatus
      : undefined,
    testId: w.setId,
    audio,
    audioUrl: audio,
    audioRegion: w.audioRegion || 'UNKNOWN',
    wordFamily: w.wordFamily || '',
    termType: w.termType,
    dictionarySourceUrl: w.dictionarySourceUrl || '',
    relatedForms: w.relatedForms || [],
    senses: Array.isArray(w.senses) && w.senses.length > 0
      ? w.senses.map((sense) => ({
          ...sense,
          partOfSpeech: normalizeVocabularyPartOfSpeech(sense.partOfSpeech),
        }))
      : [{
          partOfSpeech: normalizeVocabularyPartOfSpeech(w.partOfSpeech || w.pos || 'Noun'),
          meaning: w.meaning || '',
          example: w.example || '',
          exampleMeaning: w.exampleMeaning || '',
          definitionEn: '',
        }],
  };
}

function mapSet(s: RawVocabularyTestSet): VocabularyTestSet {
  const words = Array.isArray(s.words) ? s.words.map(mapWord) : [];
  const count = words.length > 0 ? words.length : (typeof s.wordCount === 'number' ? s.wordCount : 0);

  return {
    id: s.id,
    code: s.id,
    title: s.title || '',
    nameVi: s.title || '',
    nameEn: s.title || '',
    name: s.title || '',
    year: s.year == null ? '' : String(s.year),
    category: s.category || '',
    wordCount: count,
    status: s.status || '',
    releaseAt: s.releaseAt ?? null,
    words,
  };
}

export async function getVocabularySets(category?: string): Promise<VocabularyTestSet[]> {
  try {
    const query = category && category !== 'all' ? `?category=${encodeURIComponent(category)}` : '';
    const list = await apiRequest<RawVocabularyTestSet[]>(`/api/vocabulary/sets${query}`);
    return Array.isArray(list) ? list.map(mapSet) : [];
  } catch (error) {
    console.error('getVocabularySets error:', error);
    throw error;
  }
}

export async function getVocabularySetSummaries(category?: string): Promise<VocabularyTestSet[]> {
  const query = category && category !== 'all' ? `?category=${encodeURIComponent(category)}` : '';
  const list = await apiRequest<RawVocabularyTestSet[]>(`/api/vocabulary/sets/summary${query}`);
  return Array.isArray(list) ? list.map(mapSet) : [];
}

export async function getAdminVocabularySets(category?: string): Promise<VocabularyTestSet[]> {
  const query = category && category !== 'all' ? `?category=${encodeURIComponent(category)}` : '';
  const list = await apiRequest<RawVocabularyTestSet[]>(`/api/admin/vocabulary/sets${query}`);
  return Array.isArray(list) ? list.map(mapSet) : [];
}

export async function getVocabularySet(setId: string): Promise<VocabularyTestSet> {
  const data = await apiRequest<RawVocabularyTestSet>(`/api/vocabulary/sets/${encodeURIComponent(setId)}`);
  return mapSet(data);
}

export async function getStudentVocabularyDashboard(): Promise<StudentVocabularyDashboard> {
  return apiRequest<StudentVocabularyDashboard>('/api/vocabulary/dashboard');
}

export async function getStudentVocabularyGoals(): Promise<StudentVocabularyGoal> {
  return apiRequest<StudentVocabularyGoal>('/api/vocabulary/goals');
}

export async function updateStudentVocabularyGoals(data: { newWordsGoal: number; reviewGoal: number }): Promise<StudentVocabularyGoal> {
  return writeAuthRequest<StudentVocabularyGoal>('PUT', '/api/vocabulary/goals', data);
}

export async function recordVocabularyAnswer(data: {
  requestId: string;
  wordId: string;
  activityType: VocabularyActivityType;
  questionType: VocabularyQuestionType;
  answer?: string;
  rating?: VocabularySrsRating;
  responseTimeMs: number;
  gameSessionId?: string;
  gameQuestionIndex?: number;
  encounterType?: 'obstacle' | 'mystery_box';
  boxEffect?: string;
  result?: 'correct' | 'near' | 'wrong' | 'timeout';
  usedHint?: boolean;
  usedItem?: string;
  enemyType?: string;
  damage?: number;
  gameMode?: string;
  wordLevel?: string;
  firstWordId?: string;
  secondWordId?: string;
}): Promise<VocabularyAnswerResult> {
  return writeAuthRequest<VocabularyAnswerResult>('POST', '/api/vocabulary/answers', data);
}

export interface RecordMatchingAttemptData {
  sessionId: string;
  attemptIndex: number;
  requestId: string;
  firstWordId: string;
  secondWordId: string;
  responseTimeMs: number;
}

export async function recordMatchingAttempt(data: RecordMatchingAttemptData): Promise<VocabularyAnswerResult> {
  return writeAuthRequest<VocabularyAnswerResult>('POST', '/api/vocabulary/answers', {
    requestId: data.requestId,
    wordId: data.firstWordId,
    firstWordId: data.firstWordId,
    secondWordId: data.secondWordId,
    answer: data.secondWordId,
    activityType: 'GAME',
    questionType: 'ENGLISH_TO_VIETNAMESE',
    gameSessionId: data.sessionId,
    gameQuestionIndex: data.attemptIndex,
    responseTimeMs: data.responseTimeMs,
  });
}

export async function startVocabularyGameSession(data: {
  setId: string;
  gameType: VocabularyGameType;
  deckIds?: string[];
  mode?: 'CLASSIC' | 'TIME_ATTACK';
  timeLimitSeconds?: 30 | 60 | 90 | 120;
  questionCount?: number;
  difficulty?: 'ALL' | 'EASY' | 'MEDIUM' | 'HARD';
}): Promise<VocabularyGameSession> {
  return writeAuthRequest<VocabularyGameSession>('POST', '/api/vocabulary/games/sessions', data);
}

export async function getVocabularyGameSession(sessionId: string): Promise<VocabularyGameSession> {
  return apiRequest<VocabularyGameSession>(`/api/vocabulary/games/sessions/${encodeURIComponent(sessionId)}`);
}

export async function getBattleSessionState(sessionId: string): Promise<BattleSessionState> {
  return apiRequest<BattleSessionState>(`/api/vocabulary/games/sessions/${encodeURIComponent(sessionId)}/state`);
}

export async function completeVocabularyGameSession(sessionId: string): Promise<VocabularyGameSession> {
  return writeAuthRequest<VocabularyGameSession>('POST', `/api/vocabulary/games/sessions/${encodeURIComponent(sessionId)}/complete`, {});
}

export async function getVocabularyGameScores(setId?: string): Promise<VocabularyGameScore[]> {
  const query = setId ? `?setId=${encodeURIComponent(setId)}` : '';
  return apiRequest<VocabularyGameScore[]>(`/api/vocabulary/games/scores${query}`);
}

export async function getWeakVocabularyWords(limit = 10): Promise<WeakVocabularyWord[]> {
  const data = await apiRequest<WeakVocabularyWord[]>(`/api/vocabulary/weak-words?limit=${encodeURIComponent(String(limit))}`);
  return Array.isArray(data) ? data : [];
}

export async function getVocabularyDailyStats(): Promise<VocabularyDailyStat[]> {
  const data = await apiRequest<VocabularyDailyStat[]>('/api/vocabulary/stats/daily');
  return Array.isArray(data) ? data : [];
}

export async function getDueVocabularyWords(setId?: string, limit = 50): Promise<WordItem[]> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (setId) params.set('setId', setId);
  const data = await apiRequest<RawWordItem[]>(`/api/vocabulary/review/due?${params.toString()}`);
  return Array.isArray(data) ? data.map(mapWord) : [];
}

export async function getVocabularyHistory(options: { limit?: number; activity?: VocabularyActivityType } = {}): Promise<VocabularyHistoryItem[]> {
  const params = new URLSearchParams({ limit: String(options.limit ?? 50) });
  if (options.activity) params.set('activity', options.activity);
  return apiRequest<VocabularyHistoryItem[]>(`/api/vocabulary/history?${params.toString()}`);
}

export async function createVocabularySet(data: {
  id?: string;
  title: string;
  year?: string | number;
  category?: string;
  status?: string;
  releaseAt?: string | null;
}): Promise<VocabularyTestSet> {
  const res = await writeAuthRequest<RawVocabularyTestSet>('POST', '/api/admin/vocabulary/sets', {
    id: data.id,
    title: data.title,
    year: data.year ? String(data.year) : '2024',
    category: data.category || '2024',
    status: data.status || 'PUBLISHED',
    releaseAt: data.releaseAt || null,
  });
  return mapSet(res);
}

export async function updateVocabularySet(
  id: string,
  data: {
    title: string;
    year?: string | number;
    category?: string;
    status?: string;
    releaseAt?: string | null;
  }
): Promise<VocabularyTestSet> {
  const res = await writeAuthRequest<RawVocabularyTestSet>('PUT', `/api/admin/vocabulary/sets/${id}`, {
    title: data.title,
    year: data.year ? String(data.year) : '2024',
    category: data.category || '2024',
    status: data.status || 'PUBLISHED',
    releaseAt: data.releaseAt || null,
  });
  return mapSet(res);
}

export async function deleteVocabularySet(id: string): Promise<void> {
  await writeAuthRequest<void>('DELETE', `/api/admin/vocabulary/sets/${id}`);
}

export async function addVocabularyWord(
  setId: string,
  data: {
    id?: string;
    word: string;
    ipa?: string;
    partOfSpeech?: string;
    meaning: string;
    example?: string;
    exampleMeaning?: string;
    level?: string;
    audioUrl?: string;
    audioRegion?: string;
    subCategory?: string;
    wordFamily?: string;
    termType?: WordItem['termType'];
    dictionarySourceUrl?: string;
    relatedForms?: VocabularyRelatedForm[];
    senses?: VocabularySense[];
  }
): Promise<WordItem> {
  const res = await writeAuthRequest<RawWordItem>('POST', `/api/admin/vocabulary/sets/${setId}/words`, {
    id: data.id,
    word: data.word,
    ipa: data.ipa || '',
    partOfSpeech: data.partOfSpeech || 'Noun',
    meaning: data.meaning,
    example: data.example || '',
    exampleMeaning: data.exampleMeaning || '',
    level: data.level || 'B1',
    audioUrl: data.audioUrl || '',
    audioRegion: data.audioRegion || 'UNKNOWN',
    subCategory: data.senses?.[0]?.subCategory || '',
    wordFamily: data.wordFamily || '',
    termType: data.termType,
    dictionarySourceUrl: data.dictionarySourceUrl || '',
    relatedForms: (data.relatedForms || []).map(({ id, relationType }) => ({ id, relationType })),
    senses: data.senses || [],
  });
  return mapWord(res);
}

export async function addVocabularyWordsBulk(
  setId: string,
  words: Array<{
    word: string;
    meaning: string;
    partOfSpeech?: string;
    ipa?: string;
    example?: string;
    exampleMeaning?: string;
    level?: string;
    audioUrl?: string;
    wordFamily?: string;
  }>,
): Promise<void> {
  await writeAuthRequest<void>(
    'POST',
    `/api/admin/vocabulary/sets/${encodeURIComponent(setId)}/words/bulk`,
    words.map((word) => ({
      ...word,
      partOfSpeech: word.partOfSpeech || 'Noun',
      level: word.level || 'B1',
    })),
  );
}

export async function fillMissingVocabularyAudio(setId?: string): Promise<number> {
  const query = setId ? `?setId=${encodeURIComponent(setId)}` : '';
  const result = await writeAuthRequest<{ updatedCount: number }>(
    'POST',
    `/api/admin/vocabulary/audio/fill-missing${query}`,
    {},
  );
  return result.updatedCount;
}

export async function updateVocabularyWord(
  wordId: string,
  data: {
    word: string;
    ipa?: string;
    partOfSpeech?: string;
    meaning: string;
    example?: string;
    exampleMeaning?: string;
    level?: string;
    audioUrl?: string;
    audioRegion?: string;
    subCategory?: string;
    wordFamily?: string;
    termType?: WordItem['termType'];
    dictionarySourceUrl?: string;
    relatedForms?: VocabularyRelatedForm[];
    senses?: VocabularySense[];
  }
): Promise<WordItem> {
  const res = await writeAuthRequest<RawWordItem>('PUT', `/api/admin/vocabulary/words/${wordId}`, {
    word: data.word,
    ipa: data.ipa || '',
    partOfSpeech: data.partOfSpeech || 'Noun',
    meaning: data.meaning,
    example: data.example || '',
    exampleMeaning: data.exampleMeaning || '',
    level: data.level || 'B1',
    audioUrl: data.audioUrl || '',
    audioRegion: data.audioRegion || 'UNKNOWN',
    subCategory: data.senses?.[0]?.subCategory || '',
    wordFamily: data.wordFamily || '',
    termType: data.termType,
    dictionarySourceUrl: data.dictionarySourceUrl || '',
    relatedForms: (data.relatedForms || []).map(({ id, relationType }) => ({ id, relationType })),
    senses: data.senses || [],
  });
  return mapWord(res);
}

export async function deleteVocabularyWord(wordId: string): Promise<void> {
  await writeAuthRequest<void>('DELETE', `/api/admin/vocabulary/words/${wordId}`);
}

export async function toggleWordStar(wordId: string): Promise<void> {
  await writeAuthRequest<void>('POST', `/api/vocabulary/words/${wordId}/star`);
}

export async function updateWordStatus(wordId: string, status: string): Promise<void> {
  await writeAuthRequest<void>('POST', `/api/vocabulary/words/${wordId}/status?status=${encodeURIComponent(status)}`);
}

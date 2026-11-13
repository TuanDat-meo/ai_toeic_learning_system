import { apiRequest, uploadAuthRequest, writeAuthRequest } from './client';
import {
  ExerciseCardData,
  ReadingSubPassage,
  SampleQuestion,
  VocabItem,
} from '@/app/admin/content/reading/types';

function normalizeCategory(raw: Record<string, unknown>): ExerciseCardData['category'] {
  const rawCategory = raw.category || raw.part || '';
  const source = String(rawCategory)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
  if (source === 'grammar' || source.includes('nguphap')) return 'grammar';
  if (source.includes('6') || source === 'part6') return 'part6';
  if (source.includes('7') || source === 'part7') return 'part7';
  if (source.includes('5') || source === 'part5') return 'part5';
  throw new Error(`Unknown Reading category returned by backend: ${String(rawCategory)}`);
}

function normalizeVocabItem(raw: unknown): VocabItem | null {
  if (!raw || typeof raw !== 'object') return null;
  const v = raw as Record<string, unknown>;
  const word = String(v.word || '').trim();
  if (!word) return null;
  const exampleRaw = v.example;
  let example: { en: string; vi: string } | undefined;
  if (exampleRaw && typeof exampleRaw === 'object') {
    const exObj = exampleRaw as Record<string, unknown>;
    const en = String(exObj.en || exObj.sentenceEn || '').trim();
    const vi = String(exObj.vi || exObj.sentenceVi || '').trim();
    if (en) example = { en, vi };
  } else if (typeof exampleRaw === 'string' && exampleRaw.trim()) {
    example = { en: exampleRaw.trim(), vi: '' };
  }
  return {
    word,
    pos: String(v.pos || v.partOfSpeech || '').trim(),
    level: String(v.level || '').trim(),
    ipa: String(v.ipa || v.phonetic || '').trim(),
    meaning: String(v.meaning || v.meaningVi || '').trim(),
    ...(example ? { example } : {}),
    ...(Array.isArray(v.collocations) ? { collocations: v.collocations as VocabItem['collocations'] } : {}),
    ...(Array.isArray(v.synonyms) ? { synonyms: v.synonyms as VocabItem['synonyms'] } : {}),
    ...(Array.isArray(v.antonyms) ? { antonyms: v.antonyms as VocabItem['antonyms'] } : {}),
    ...(Array.isArray(v.wordFamily) ? { wordFamily: v.wordFamily as VocabItem['wordFamily'] } : {}),
  };
}

export function normalizeVocabArray(raw: unknown): VocabItem[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(normalizeVocabItem).filter((item): item is VocabItem => item !== null);
}

export function normalizeOptions(rawOptions: unknown): string[] {
  if (Array.isArray(rawOptions)) {
    const arr = rawOptions.map((item) => {
      if (typeof item === 'string') return item;
      if (item && typeof item === 'object') {
        const obj = item as Record<string, unknown>;
        return String(obj.text ?? obj.value ?? obj.label ?? '');
      }
      return String(item ?? '');
    });
    while (arr.length < 4) arr.push('');
    return arr.slice(0, 4);
  }
  if (rawOptions && typeof rawOptions === 'object') {
    const obj = rawOptions as Record<string, unknown>;
    const opts = ['A', 'B', 'C', 'D'].map((key) => String(obj[key] ?? obj[key.toLowerCase()] ?? obj[String(key.charCodeAt(0) - 64)] ?? ''));
    if (!opts[0] && !opts[1] && !opts[2] && !opts[3]) {
      const vals = Object.values(obj).map(v => String(v ?? ''));
      for (let i = 0; i < 4; i++) opts[i] = vals[i] || '';
    }
    return opts;
  }
  return ['', '', '', ''];
}

export function normalizeSampleQuestion(
  raw: unknown,
  idx: number,
  fallbackPassageText?: string,
  fallbackPassageTextVi?: string
): SampleQuestion {
  const q = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const options = normalizeOptions(q.options);
  let correctIndex = typeof q.correctIndex === 'number' ? q.correctIndex : -1;
  if (correctIndex < 0 || correctIndex > 3) {
    const ans = String(q.correctAnswer ?? q.answer ?? q.key ?? '').trim().toUpperCase();
    const letterIdx = ['A', 'B', 'C', 'D'].indexOf(ans.charAt(0));
    correctIndex = letterIdx;
  }

  let bilingual = typeof q.bilingual === 'string' ? q.bilingual : '';
  if (!bilingual && typeof q.questionVi === 'string') {
    bilingual = q.questionVi;
  }
  if (!bilingual && q.translation) {
    if (typeof q.translation === 'string') {
      bilingual = q.translation;
    } else if (typeof q.translation === 'object') {
      const tr = q.translation as Record<string, unknown>;
      bilingual = String(tr.questionVi || tr.fullSentenceVi || tr.vi || '');
    }
  }

  let optionMeanings: string[] | undefined = undefined;
  if (Array.isArray(q.optionMeanings)) {
    optionMeanings = q.optionMeanings.map(String);
  } else if (q.optionTranslations && typeof q.optionTranslations === 'object') {
    const ot = q.optionTranslations as Record<string, unknown>;
    optionMeanings = ['A', 'B', 'C', 'D'].map((key) => String(ot[key] ?? ot[key.toLowerCase()] ?? ''));
  }

  const vocabList = normalizeVocabArray(q.vocabList ?? q.vocabulary);

  return {
    questionNum: String(q.questionNum ?? q.questionNumber ?? q.id ?? idx + 1),
    passageText: typeof q.passageText === 'string' ? q.passageText : fallbackPassageText,
    passageTitle: typeof q.passageTitle === 'string' ? q.passageTitle : undefined,
    passageTextVi: typeof q.passageTextVi === 'string' ? q.passageTextVi : fallbackPassageTextVi,
    passages: Array.isArray(q.passages) ? (q.passages as ReadingSubPassage[]) : undefined,
    question: String(q.question ?? q.questionText ?? q.questionEn ?? q.text ?? q.content ?? ''),
    ...(bilingual ? { bilingual } : {}),
    options,
    ...(optionMeanings ? { optionMeanings } : {}),
    correctIndex,
    explanation: String(q.explanation ?? q.solutionMethod ?? q.explain ?? q.loiGiai ?? ''),
    ...(Array.isArray(q.steps) ? { steps: q.steps as SampleQuestion['steps'] } : {}),
    vocabList,
  };
}

export function mapReadingCard(
  rawInput: unknown,
  options?: { detailsLoaded?: boolean }
): ExerciseCardData {
  const raw = (rawInput && typeof rawInput === 'object' ? rawInput : {}) as Record<string, unknown>;
  const id = String(raw.id || '');
  const title = String(raw.title || '');
  if (!id || !title) {
    throw new Error('Backend returned a Reading card without an ID or title.');
  }
  const category = normalizeCategory(raw);
  const passages = Array.isArray(raw.passages) ? (raw.passages as ReadingSubPassage[]) : undefined;
  const passageTextRaw = String(raw.passageText || raw.content || raw.passage || '').trim();
  const passageFromList = passages && passages.length > 0
    ? passages.map((p) => (p.label ? `[${p.label}]\n` : '') + (p.text || '')).join('\n\n').trim()
    : '';
  const passageText = passageTextRaw || passageFromList || undefined;
  const passageTextViRaw = String(raw.passageTextVi || '').trim();
  const passageTextVi = passageTextViRaw || undefined;

  const rawTheory = raw.theory && typeof raw.theory === 'object' ? (raw.theory as Record<string, unknown>) : undefined;
  const theory = rawTheory
    ? {
        summary: String(rawTheory.summary || ''),
        rules: Array.isArray(rawTheory.rules) ? rawTheory.rules.map(String) : [],
        example: String(rawTheory.example || ''),
      }
    : undefined;

  const cardVocabList = normalizeVocabArray(
    raw.vocabList ?? raw.vocabulary ?? rawTheory?.vocabList ?? rawTheory?.vocabulary
  );

  const rawQuestions = Array.isArray(raw.sampleQuestions)
    ? raw.sampleQuestions
    : Array.isArray(raw.questions)
      ? raw.questions
      : [];
  const sampleQuestions = rawQuestions.map((q, idx) =>
    normalizeSampleQuestion(q, idx, passageText, passageTextVi)
  );

  const subCategoryRaw = typeof raw.subCategory === 'string' ? raw.subCategory : undefined;
  const validSubCats = new Set([
    'word_types',
    'verbs',
    'other_grammar',
    'by_topic',
    'levels',
    'text_types',
  ]);

  return {
    id,
    title,
    category,
    subCategory:
      subCategoryRaw && validSubCats.has(subCategoryRaw)
        ? (subCategoryRaw as ExerciseCardData['subCategory'])
        : undefined,
    subtitle: typeof raw.subtitle === 'string' && raw.subtitle ? raw.subtitle : undefined,
    tag: typeof raw.tag === 'string' && raw.tag ? raw.tag : undefined,
    status:
      raw.status === 'draft' || raw.status === 'published'
        ? (raw.status as ExerciseCardData['status'])
        : undefined,
    createdAt:
      typeof raw.createdAt === 'string' || typeof raw.createdAt === 'number'
        ? raw.createdAt
        : undefined,
    totalQuestions:
      typeof raw.totalQuestions === 'number' && raw.totalQuestions > 0
        ? raw.totalQuestions
        : sampleQuestions.length,
    studiedQuestions: typeof raw.studiedQuestions === 'number' ? raw.studiedQuestions : 0,
    correctAnswers: typeof raw.correctAnswers === 'number' ? raw.correctAnswers : 0,
    wrongAnswers: typeof raw.wrongAnswers === 'number' ? raw.wrongAnswers : 0,
    bookmarked: Boolean(raw.bookmarked),
    ...(passageText ? { passageText } : {}),
    ...(passageTextVi ? { passageTextVi } : {}),
    ...(passages && passages.length > 0 ? { passages } : {}),
    ...(theory ? { theory } : {}),
    ...(cardVocabList.length > 0 ? { vocabList: cardVocabList } : {}),
    detailsLoaded:
      options?.detailsLoaded ?? (sampleQuestions.length > 0 || cardVocabList.length > 0),
    sampleQuestions,
  };
}

export async function fetchReadingCards(category?: string): Promise<ExerciseCardData[]> {
  const query = category && category !== 'all' ? `?category=${encodeURIComponent(category)}` : '';
  const data = await apiRequest<unknown[]>(`/api/reading/cards${query}`);
  if (!Array.isArray(data)) throw new Error('Backend returned an invalid Reading card list.');
  return data.map((item) => mapReadingCard(item));
}

export async function fetchAdminReadingCards(category?: string): Promise<ExerciseCardData[]> {
  const query = category && category !== 'all' ? `?category=${encodeURIComponent(category)}` : '';
  const data = await apiRequest<unknown[]>(`/api/admin/reading/cards${query}`);
  if (!Array.isArray(data)) throw new Error('Backend returned an invalid admin Reading card list.');
  return data.map((item) => mapReadingCard(item));
}

export async function fetchReadingCardDetails(cardId: string): Promise<ExerciseCardData | null> {
  const data = await apiRequest<unknown>(`/api/reading/cards/${encodeURIComponent(cardId)}`);
  return data ? mapReadingCard(data, { detailsLoaded: true }) : null;
}

export async function fetchAdminReadingCardDetails(cardId: string): Promise<ExerciseCardData | null> {
  const data = await apiRequest<unknown>(`/api/admin/reading/cards/${encodeURIComponent(cardId)}`);
  return data ? mapReadingCard(data, { detailsLoaded: true }) : null;
}

export async function createAdminReadingCard(card: ExerciseCardData): Promise<ExerciseCardData> {
  const payload = {
    ...card,
    theory: {
      ...(card.theory || { summary: '', rules: [], example: '' }),
      ...(card.vocabList && card.vocabList.length > 0 ? { vocabList: card.vocabList } : {}),
    },
  };
  const created = await writeAuthRequest<unknown>('POST', '/api/admin/reading/cards', payload);
  return mapReadingCard(created, { detailsLoaded: true });
}

export async function updateAdminReadingCard(
  cardId: string,
  card: ExerciseCardData
): Promise<ExerciseCardData> {
  const payload = {
    ...card,
    theory: {
      ...(card.theory || { summary: '', rules: [], example: '' }),
      ...(card.vocabList && card.vocabList.length > 0 ? { vocabList: card.vocabList } : {}),
    },
  };
  const updated = await writeAuthRequest<unknown>(
    'PUT',
    `/api/admin/reading/cards/${encodeURIComponent(cardId)}`,
    payload
  );
  return mapReadingCard(updated, { detailsLoaded: true });
}

export async function deleteAdminReadingCard(cardId: string): Promise<void> {
  await writeAuthRequest<void>('DELETE', `/api/admin/reading/cards/${encodeURIComponent(cardId)}`);
}

export async function parseAdminReadingFile(file: File): Promise<ExerciseCardData> {
  const formData = new FormData();
  formData.append('file', file);
  const raw = await uploadAuthRequest<unknown>('/api/admin/reading/parse-file', formData);
  return mapReadingCard(raw, { detailsLoaded: true });
}

export async function saveReadingProgress(
  cardId: string,
  studiedQuestions: number,
  correctAnswers: number,
  wrongAnswers: number,
  bookmarked?: boolean
): Promise<void> {
  try {
    await writeAuthRequest<void>('POST', `/api/reading/cards/${encodeURIComponent(cardId)}/progress`, {
      studiedQuestions,
      correctAnswers,
      wrongAnswers,
      bookmarked,
    });
  } catch (error) {
    console.warn('Could not sync reading progress to backend:', error);
  }
}

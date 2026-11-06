import { apiRequest, writeAuthRequest } from './client';
import { normalizeVocabularyLevel, type VocabularyRelatedForm, type VocabularySense, type VocabularyTestSet, type WordItem } from '@/app/admin/content/vocabulary/types';
import type { ContentStatus } from '@/lib/types/domain';
import { INITIAL_TESTS, VOCAB_AUDIO_MAP } from '@/app/admin/content/vocabulary/mockData';
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
  setId?: string;
  audio?: string;
  audioUrl?: string;
  audioRegion?: string;
  wordFamily?: string;
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

function mapWord(w: RawWordItem): WordItem {
  const cleanWord = (w.word || '').trim().toLowerCase();
  const audio = w.audioUrl || w.audio || (cleanWord ? VOCAB_AUDIO_MAP[cleanWord] : '') || '';
  return {
    id: w.id,
    word: w.word,
    ipa: w.ipa || '',
    partOfSpeech: normalizeVocabularyPartOfSpeech(w.partOfSpeech || w.pos || 'Noun'),
    pos: normalizeVocabularyPartOfSpeech(w.partOfSpeech || w.pos || 'Noun'),
    meaning: w.meaning || '',
    example: w.example || '',
    exampleMeaning: w.exampleMeaning || '',
    exampleVi: w.exampleMeaning || '',
    level: normalizeVocabularyLevel(w.level || 'B1'),
    starred: w.starred ?? false,
    bookmarked: w.starred ?? false,
    status: (w.status as ContentStatus) || 'PUBLISHED',
    testId: w.setId,
    audio,
    audioUrl: audio,
    audioRegion: w.audioRegion || 'UNKNOWN',
    wordFamily: w.wordFamily || '',
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
        }],
  };
}

function mapSet(s: RawVocabularyTestSet): VocabularyTestSet {
  const local = INITIAL_TESTS.find((it) => it.id === s.id || it.code === s.id);
  const words = (Array.isArray(s.words) && s.words.length > 0)
    ? s.words.map(mapWord)
    : (local?.words || []);
  const count = words.length > 0 ? words.length : (typeof s.wordCount === 'number' && s.wordCount > 0 ? s.wordCount : (local?.wordCount || 200));

  return {
    id: s.id,
    code: s.id,
    title: s.title || local?.title || '',
    nameVi: s.title || local?.nameVi || '',
    nameEn: local?.nameEn || s.title || '',
    name: s.title || local?.name || '',
    year: s.year ? String(s.year) : '2024',
    category: s.category || local?.category || '2024',
    wordCount: count,
    status: s.status || 'PUBLISHED',
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

export async function getAdminVocabularySets(category?: string): Promise<VocabularyTestSet[]> {
  const query = category && category !== 'all' ? `?category=${encodeURIComponent(category)}` : '';
  try {
    const list = await apiRequest<RawVocabularyTestSet[]>(`/api/admin/vocabulary/sets${query}`);
    if (Array.isArray(list) && list.length > 0) {
      return list.map(mapSet);
    }
  } catch {
    try {
      const publicList = await apiRequest<RawVocabularyTestSet[]>(`/api/vocabulary/sets${query}`);
      if (Array.isArray(publicList) && publicList.length > 0) {
        return publicList.map(mapSet);
      }
    } catch {
      // Return empty so callers use fallback gracefully
    }
  }
  return [];
}

export async function getVocabularySet(setId: string): Promise<VocabularyTestSet> {
  const data = await apiRequest<RawVocabularyTestSet>(`/api/vocabulary/sets/${setId}`);
  return mapSet(data);
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
    relatedForms: (data.relatedForms || []).map(({ id, relationType }) => ({ id, relationType })),
    senses: data.senses || [],
  });
  return mapWord(res);
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

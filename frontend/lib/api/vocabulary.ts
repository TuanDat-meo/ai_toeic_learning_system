import { apiRequest, writeAuthRequest } from './client';
import type { VocabularyTestSet, WordItem } from '@/app/admin/content/vocabulary/types';
import type { ContentStatus } from '@/lib/types/domain';

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
}

interface RawVocabularyTestSet {
  id: string;
  title?: string;
  year?: string | number;
  category?: string;
  wordCount?: number;
  status?: string;
  words?: RawWordItem[];
}

function mapWord(w: RawWordItem): WordItem {
  return {
    id: w.id,
    word: w.word,
    ipa: w.ipa || '',
    partOfSpeech: w.partOfSpeech || 'Noun',
    pos: w.partOfSpeech || 'Noun',
    meaning: w.meaning || '',
    example: w.example || '',
    exampleMeaning: w.exampleMeaning || '',
    exampleVi: w.exampleMeaning || '',
    level: w.level || 'B1',
    starred: w.starred ?? false,
    bookmarked: w.starred ?? false,
    status: (w.status as ContentStatus) || 'PUBLISHED',
    testId: w.setId,
  };
}

function mapSet(s: RawVocabularyTestSet): VocabularyTestSet {
  const words = Array.isArray(s.words) ? s.words.map(mapWord) : [];
  return {
    id: s.id,
    code: s.id,
    title: s.title || '',
    nameVi: s.title || '',
    nameEn: s.title || '',
    name: s.title || '',
    year: s.year ? String(s.year) : '2024',
    category: s.category || '2024',
    wordCount: s.wordCount ?? words.length,
    status: s.status || 'PUBLISHED',
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
  try {
    const query = category && category !== 'all' ? `?category=${encodeURIComponent(category)}` : '';
    const list = await apiRequest<RawVocabularyTestSet[]>(`/api/admin/vocabulary/sets${query}`);
    return Array.isArray(list) ? list.map(mapSet) : [];
  } catch (error) {
    console.error('getAdminVocabularySets error:', error);
    throw error;
  }
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
}): Promise<VocabularyTestSet> {
  const res = await writeAuthRequest<RawVocabularyTestSet>('POST', '/api/admin/vocabulary/sets', {
    id: data.id,
    title: data.title,
    year: data.year ? String(data.year) : '2024',
    category: data.category || '2024',
    status: data.status || 'PUBLISHED',
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
  }
): Promise<VocabularyTestSet> {
  const res = await writeAuthRequest<RawVocabularyTestSet>('PUT', `/api/admin/vocabulary/sets/${id}`, {
    title: data.title,
    year: data.year ? String(data.year) : '2024',
    category: data.category || '2024',
    status: data.status || 'PUBLISHED',
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

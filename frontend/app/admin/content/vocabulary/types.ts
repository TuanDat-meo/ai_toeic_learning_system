import type { ContentStatus, CefrLevel, ProgressStatus } from '@/lib/types/domain';

// ============================================================
// Vocabulary types — cập nhật theo V39 schema
// ============================================================

/** Bộ từ (test set). DB: vocabulary_test_sets */
export interface VocabularyTestSet {
  id: string;
  code?: string;           // "ETS_2024", "600_ESSENTIAL"
  nameVi?: string;
  nameEn?: string;
  title?: string;
  name?: string;
  year?: number | string;
  category?: 'ETS_EXAM' | 'ESSENTIAL' | 'CUSTOM' | string;
  status?: ContentStatus | string;
  description?: string;
  wordCount?: number;      // computed từ vocabulary_set_words
  count?: number;
  totalWords?: number;
  completedWords?: number;
  words?: WordItem[];
}

/** Legacy alias cho UI components */
export type TestItem = VocabularyTestSet;

/** Nghĩa của một từ. DB: vocabulary_meanings */
export interface WordMeaning {
  id: string;
  meaning: string;
  example?: string;       // tiếng Anh
  exampleVi?: string;     // tiếng Việt
}

/** Từ trong từ điển chuẩn. DB: vocabularies */
export interface WordItem {
  id: string;
  word: string;
  normalizedWord?: string;
  ipa?: string;
  partOfSpeech?: string;
  pos?: string;
  cefrLevel?: CefrLevel;  // A1–C2
  level?: string;         // legacy alias
  status?: ContentStatus;
  meanings?: WordMeaning[];
  meaning?: string;       // legacy alias
  example?: string;       // legacy alias
  exampleVi?: string;
  exampleMeaning?: string; // legacy alias
  translation?: string;
  audio?: string;
  testId?: string;
  mastered?: boolean;
  bookmarked?: boolean;
  starred?: boolean;      // legacy alias for bookmarked
  topic?: string;
}

/** Từ trong một bộ cụ thể — bổ sung orderIndex và note riêng. DB: vocabulary_set_words */
export interface SetWordItem extends WordItem {
  orderIndex: number;
  note?: string;          // chú thích riêng trong bộ
}

/** Tiến độ học của user với một từ. DB: vocabulary_progress */
export interface WordProgress {
  vocabularyId: string;
  status: 'NEW' | 'LEARNING' | 'MASTERED';
  masteryScore?: number;
  nextReviewAt?: string;
  bookmarked: boolean;
}

// --- Filter types ---
export type VocabSetCategory = 'ALL' | 'ETS_EXAM' | 'ESSENTIAL' | 'CUSTOM' | string;
export type VocabStatusFilter = 'ALL' | ContentStatus;
export type VocabProgressFilter = 'ALL' | ProgressStatus;

export function getTestCategoryKey(t: VocabularyTestSet): string {
  const cat = t.category || "";
  const yr = t.year ? String(t.year) : "";
  if (cat === "2024" || yr === "2024") return "2024";
  if (cat === "2026" || (cat === "ETS_EXAM" && yr === "2026")) return "2026";
  if (cat === "2023" || (cat === "ETS_EXAM" && yr === "2023")) return "2023";
  if (cat === "600_essential" || cat === "ESSENTIAL" || Boolean(t.code?.startsWith("600_"))) return "600_essential";
  return cat || "Khác";
}

export function getCategoryLabel(catKey: string): string {
  if (catKey === "2024") return "ETS 2024";
  if (catKey === "2026") return "ETS 2026";
  if (catKey === "2023") return "ETS 2023";
  if (catKey === "600_essential") return "600 Từ thiết yếu";
  return catKey;
}

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
  [key: string]: any;
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
  const code = (t.code || t.id || "").toLowerCase();
  const idNum = parseInt(code.replace(/[^0-9]/g, ""), 10);
  
  if (idNum >= 1 && idNum <= 3) return "corporate";
  if (idNum >= 4 && idNum <= 6) return "finance_marketing";
  if (idNum >= 7 && idNum <= 10) return "commerce_production";
  if (idNum >= 11 && idNum <= 15) return "office_travel";
  if (idNum >= 16 && idNum <= 20) return "tech_services";
  
  const cat = t.category || "";
  if (cat === "2024") return "2024";
  if (cat === "2023") return "2023";
  if (cat === "2022") return "2022";
  return "essential";
}

export function getCategoryLabel(catKey: string): string {
  if (catKey === "corporate") return "Quản trị & Nhân sự (Bộ 1-3)";
  if (catKey === "finance_marketing") return "Tài chính & Tiếp thị (Bộ 4-6)";
  if (catKey === "commerce_production") return "Thương mại & Sản xuất (Bộ 7-10)";
  if (catKey === "office_travel") return "Văn phòng & Công tác (Bộ 11-15)";
  if (catKey === "tech_services") return "Công nghệ & Dịch vụ (Bộ 16-20)";
  if (catKey === "2024") return "ETS 2024";
  if (catKey === "2023") return "ETS 2023";
  if (catKey === "2022") return "ETS 2022";
  if (catKey === "essential") return "Từ vựng cốt lõi";
  return catKey;
}

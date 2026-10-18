import type { ContentStatus, ProgressStatus, QuestionDifficulty, GrammarPart, TargetScore } from '@/lib/types/domain';

// ============================================================
// Grammar types — cập nhật theo V40 schema
// Tiến độ học viên KHÔNG đặt trên GrammarTopicItem.
// Số đúng/sai tính động từ question_attempts.
// ============================================================

/** Câu hỏi ngữ pháp — tái dùng ngân hàng questions. DB: questions + grammar_topic_questions */
export interface GrammarQuestionItem {
  id: string | number;
  externalCode?: string;          // mã tham chiếu ngoài (optional)
  part: GrammarPart | string;     // 'PART_5' | 'PART_6' | 'PART_7'
  questionText: string;
  options: { [key: string]: string };
  correctAnswer: 'A' | 'B' | 'C' | 'D' | string;
  explanation: string;
  trapNote?: string;
  translation?: string;
  difficulty?: QuestionDifficulty | string;
  orderIndex?: number;
}

/** Chuyên đề ngữ pháp (nội dung lý thuyết + metadata). DB: grammar_topics */
export interface GrammarTopicItem {
  id: string;
  code: string;                   // "GT-001", "GT-PASSIVE-VOICE"
  titleVi: string;
  titleEn: string;
  title?: string;                 // legacy alias for titleVi
  englishTitle?: string;          // legacy alias for titleEn
  part: GrammarPart | string;
  targetScore: TargetScore | string;
  status: ContentStatus | string;
  summary: string;
  formula: string;
  signalWords: string[];
  traps: string[];
  examples: {
    sentence: string;
    translation: string;
    analysis?: string;
  }[];
  questions: GrammarQuestionItem[];
  orderIndex?: number;

  totalQuestions?: number;
  completedQuestions?: number;
  userStatus?: string;

  // Legacy/UI metrics
  studiedCount?: number;
  correctCount?: number;
  wrongCount?: number;
  accuracy?: number;
  isBookmarked?: boolean;
  bookmarked?: boolean;

  /**
   * Tiến độ học — CHỈ có khi user đã đăng nhập.
   * Lấy từ user_grammar_progress + tính động từ question_attempts.
   */
  userProgress?: GrammarTopicProgress;
}

/** Tiến độ học viên theo chuyên đề. DB: grammar_topic_progress */
export interface GrammarTopicProgress {
  status: ProgressStatus;
  bookmarked: boolean;
  correctCount: number;           // tính từ question_attempts
  wrongCount: number;
  lastStudiedAt?: string;
}

// --- Filter types (dùng DB code, không phải label tiếng Việt) ---
export type GrammarPartFilter = 'ALL' | GrammarPart;
export type GrammarScoreFilter = 'ALL' | TargetScore;
export type GrammarStatusFilter = 'ALL' | ContentStatus;

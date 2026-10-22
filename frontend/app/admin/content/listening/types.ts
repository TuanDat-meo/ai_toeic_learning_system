import type {
  ContentStatus,
  ProgressStatus,
  QuestionDifficulty,
  ListeningPart,
  MediaFile,
} from '@/lib/types/domain';

// ============================================================
// Listening types — cập nhật theo V41 schema
// Tách stimulus (card/ngữ liệu) khỏi câu hỏi;
// hỗ trợ Part 3–4 với nhiều câu cùng 1 audio.
// ============================================================

export type StimulusType = 'PHOTO' | 'AUDIO' | 'CONVERSATION' | 'TALK';

/** Câu hỏi listening — tái dùng ngân hàng questions. DB: questions */
export interface ListeningQuestion {
  id: string;
  externalCode?: string;          // mã tham chiếu ngoài (optional, dùng khi import file)
  questionText?: string;          // NULL cho Part 1/2 khi câu hỏi là audio
  options?: { A: string; B: string; C: string; D: string };
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  trapNote?: string;
  difficulty?: QuestionDifficulty;
  orderInStimulus: number;
}

/**
 * Stimulus (card/ngữ liệu): nhóm câu hỏi cùng audio/hình ảnh.
 * DB: listening_stimuli
 * - Part 1: 1 câu + 1 ảnh
 * - Part 2: 1 câu response (không có đáp án in sẵn trên giấy)
 * - Part 3–4: 3 câu + 1 đoạn hội thoại/bài nói
 */
export interface ListeningStimulus {
  id: string;
  testNumber: number;
  part: ListeningPart;
  year?: number;
  stimulusType: StimulusType;
  audioFile?: MediaFile;
  imageFile?: MediaFile;
  transcript: string;
  translation: string;
  status: ContentStatus;
  orderIndex: number;
  questions: ListeningQuestion[];
}

/**
 * Tiến độ card theo user. DB: không có bảng riêng —
 * tính từ question_attempts liên kết với stimulus.
 */
export interface StimulusProgress {
  stimulusId: string;
  status: ProgressStatus;         // 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'
  completedQuestions: number;
  totalQuestions: number;
  notesCount: number;
}

// --- Filter types ---
export type ListeningPartFilter = 'ALL' | ListeningPart;
export type ListeningYearFilter = 'ALL' | number;
export type ListeningStatusFilter = 'ALL' | ContentStatus;

// ============================================================
// Legacy types (giữ backward compat với mockData.ts hiện tại)
// Sẽ xóa sau khi API thực được kết nối.
// ============================================================

/** @deprecated — dùng ListeningStimulus thay thế */
export interface DictationCardData {
  id: string;
  testNumber: number;
  part: 'Part 1' | 'Part 2' | 'Part 3' | 'Part 4';
  year: '2026' | '2024' | '2023' | '2022';
  totalQuestions: number;
  completedQuestions: number;
  /** @deprecated dùng ProgressStatus thay cho string tiếng Việt */
  status: 'Chưa bắt đầu' | 'Đang luyện tập' | 'Đã hoàn thành';
  notesCount: number;
  vocabItems: { word: string; ipa: string; meaning: string; example?: string }[];
  questions: DictationQuestion[];
  originalTotalQuestions?: number;
  [key: string]: any;
}

/** @deprecated — dùng ListeningQuestion thay thế */
export interface DictationQuestion {
  id: number;
  question?: string;
  part: 'Part 1' | 'Part 2' | 'Part 3' | 'Part 4';
  audioUrl: string;
  imageUrl?: string;
  fullTranscript: string;
  vietnameseTranslation: string;
  options?: { [key: string]: string };
  optionTranslations?: { [key: string]: string };
  correctAnswer?: string;
  explanation: string;
  trapNote?: string;
  vocabList?: {
    word: string;
    pos: string;
    level: string;
    ipa: string;
    meaning: string;
    explanation?: string;
    example?: { en: string; vi: string };
    collocations?: { en: string; vi: string }[];
    synonyms?: { en: string; vi: string }[];
    antonyms?: { en: string; vi: string }[];
    wordFamily?: { word: string; pos: string; meaning: string }[];
    [key: string]: any;
  }[];
}

/** @deprecated — dùng ListeningStimulus thay thế */
export interface LevelCategoryCardData {
  id: string;
  part: 'Part 1' | 'Part 2' | 'Part 3' | 'Part 4';
  type: 'level' | 'category';
  title: string;
  targetLevel?: string;
  totalQuestions: number;
  completedQuestions: number;
  correctCount: number;
  wrongCount: number;
  /** @deprecated dùng ProgressStatus */
  status: 'Chưa luyện tập' | 'Đang học' | 'Đã hoàn thành';
  theorySummary: string;
  rules: string[];
  vocabBag: { word: string; ipa: string; meaning: string }[];
  questions: DictationQuestion[];
  originalTotalQuestions?: number;
  [key: string]: any;
}

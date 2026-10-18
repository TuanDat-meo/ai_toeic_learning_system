import type { ContentStatus, QuestionDifficulty, ToeicPart } from '@/lib/types/domain';

// ============================================================
// Mock Tests types — cập nhật theo V42 schema
// Nguồn sự thật điểm: assessments table (server-side)
// ============================================================

/** Đề thi thử. DB: mock_tests */
export interface MockTest {
  id: number;
  code?: string;               // "ETS_2024_TEST1"
  title: string;
  volId?: "vol1" | "vol2" | string;
  difficulty?: "Khó" | "Trung bình" | "Vừa sức" | QuestionDifficulty | string;
  score?: number | null;
  listeningScore?: number | null;
  readingScore?: number | null;
  description?: string;
  year?: number;
  source?: string;            // "ETS_2024", "CUSTOM"
  durationMinutes?: number;
  totalQuestions?: number;
  status: ContentStatus | string;
  completedAt?: string | null;
  historyAttempts?: HistoryAttempt[];
  keyVocab?: any[];
  questions?: PracticeQuestion[];
  examCount?: number;
}

/** Legacy alias cho UI components */
export type TestItem = MockTest;

/** Câu hỏi trong đề thi — tái dùng ngân hàng questions. DB: mock_test_questions */
export interface MockTestQuestion {
  id: number;
  externalCode?: string;
  part: ToeicPart | string;
  section?: 'LISTENING' | 'READING';
  orderIndex?: number;         // 1..200
  questionText: string;
  passage?: string;
  bilingualPassage?: string;
  audioUrl?: string;
  imageUrl?: string;
  options: { [key: string]: string };
  groupTitle?: string;
  groupId?: string;           // stimulus_id nếu thuộc Part 3–4
  groupTotal?: number;
  optionGlosses?: { [key: string]: string };
  trapNote?: string;
  note?: string;
  evidence?: string;
  step1?: string;
  step2?: string;
  step3?: string;
  correctAnswer: string;
  explanation: string;
  transcript?: string;
  translation?: string;
  difficulty?: QuestionDifficulty | string;
  vocabList?: VocabListItem[];
}

/** Legacy alias cho UI components */
export type PracticeQuestion = MockTestQuestion;

/** Lịch sử làm bài thi (legacy format dùng trong modal và client API) */
export interface HistoryAttempt {
  id?: string | number;
  date?: string;
  duration?: string;
  durationSeconds?: number;
  correctCount?: number;
  totalCount?: number;
  listening?: number;
  reading?: number;
  score?: number;
  listeningScore?: number;
  readingScore?: number;
  completedAt?: string;
  testId?: string | number;
  testTitle?: string;
  accuracy?: number;
}

/** Từ vựng đính kèm câu hỏi. DB: question_vocabularies */
export interface VocabListItem {
  word: string;
  pos: string;
  cefrLevel: string;          // cefr_level từ V39
  ipa: string;
  meaning: string;
  example?: { en: string; vi: string };
  collocations?: { en: string; vi: string }[];
  synonyms?: { en: string; vi: string }[];
  antonyms?: { en: string; vi: string }[];
  wordFamily?: { word: string; pos: string; meaning: string }[];
}

/**
 * Lần thi thử của user. DB: mock_test_attempts + assessments
 * Điểm lấy từ assessments (server chấm), không tin client.
 */
export interface MockTestAttempt {
  id: string;
  mockTestId: string;
  assessmentId: string;       // FK đến assessments (nguồn sự thật)
  attemptNumber: number;
  startedAt: string;
  completedAt?: string;       // NULL nếu chưa hoàn thành
  timeTakenSeconds?: number;
  // Điểm từ assessments — server populate
  totalScore?: number;
  listeningScore?: number;
  readingScore?: number;
  partResults?: PartResult[];
}

/** Kết quả theo Part. DB: assessment_results */
export interface PartResult {
  part: ToeicPart;
  correct: number;
  total: number;
  accuracy: number;
  avgResponseTimeMs?: number;
}

// --- Payload nộp bài — client gửi lên server ---
export interface SubmitAnswersPayload {
  sessionId: string;
  answers: {
    questionId: string;
    selectedOptionId: string;
    responseTimeMs: number;
  }[];
}

// --- Filter types ---
export type MockTestDifficulty = 'ALL' | QuestionDifficulty;
export type MockTestStatusFilter = 'ALL' | ContentStatus;

import type { VocabItem } from '@/app/admin/content/reading/types';
import type {
  ImportBatchDetails,
  ImportBatchSummary,
  ImportedContentType,
  ImportPreviewItem,
} from '@/lib/api/content-import';

export type PreviewStatusFilter = 'ALL' | ImportPreviewItem['status'];

export interface GradedQuestionOption {
  A?: string;
  B?: string;
  C?: string;
  D?: string;
  [key: string]: string | undefined;
}

export interface GradedQuestionTranslation {
  questionVi?: string;
  optionsVi?: Record<string, string>;
  fullSentenceVi?: string;
}

export interface GradedQuestionItem {
  id?: number | string;
  level?: string;
  levelShort?: string;
  question?: string;
  options?: GradedQuestionOption;
  correctAnswer?: string;
  translation?: GradedQuestionTranslation;
  signalInQuestion?: string;
  solutionMethod?: string;
  trapNote?: string;
  formulaApplied?: string;
  imageUrl?: string;
  audioUrl?: string;
  [key: string]: unknown;
}

export interface GrammarNormalizedData {
  id?: number | string;
  topicCode?: string;
  code?: string;
  codeName?: string;
  title?: string;
  titleVi?: string;
  titleEn?: string;
  englishTitle?: string;
  category?: string;
  description?: string;
  explanation?: string;
  rule?: string;
  coreTheory?: string;
  signalClues?: string;
  signalWords?: string[];
  tipsAndTricks?: string;
  commonTraps?: string;
  traps?: string[];
  summaryTable?: string;
  reference?: string;
  questions?: GradedQuestionItem[];
  gradedQuestions?: GradedQuestionItem[];
  part?: string;
  level?: string;
  targetScore?: string;
  imageUrl?: string;
  audioUrl?: string;
  [key: string]: unknown;
}

export interface ReadingSubPassageItem {
  id?: string;
  label?: string;
  title?: string;
  text?: string;
  textVi?: string;
}

export interface ReadingQuestionItem {
  id?: number | string;
  questionNum?: string | number;
  question?: string;
  questionText?: string;
  options?: GradedQuestionOption | string[] | { id: string; text: string }[];
  correctAnswer?: string;
  correctIndex?: number;
  explanation?: string;
  bilingual?: string;
  translation?: string | GradedQuestionTranslation;
  vocabList?: VocabItem[];
  vocabulary?: VocabItem[];
  [key: string]: unknown;
}

export interface ReadingNormalizedData {
  id?: number | string;
  title?: string;
  subtitle?: string;
  part?: string; // PART_5, PART_6, PART_7
  category?: string;
  subCategory?: string;
  topic?: string;
  difficulty?: string;
  source?: string;
  content?: string;
  passageText?: string;
  passageTextVi?: string;
  passages?: ReadingSubPassageItem[];
  theory?: {
    summary?: string;
    rules?: string[];
    example?: string;
    directionsEn?: string;
    directionsVi?: string;
    vocabList?: VocabItem[];
  };
  vocabList?: VocabItem[];
  vocabulary?: VocabItem[];
  questions?: ReadingQuestionItem[];
  sampleQuestions?: ReadingQuestionItem[];
  totalQuestions?: number;
  tag?: string;
  audioUrl?: string;
  imageUrl?: string;
  [key: string]: unknown;
}

export const MAX_FILE_BYTES = 256 * 1024 * 1024;
export const STRUCTURED_EXTENSIONS = ['csv', 'xlsx', 'json'];

export interface ContentTypeConfig {
  id: ImportedContentType;
  label: string;
  required: string;
  sample: Record<string, unknown>;
  documentExtensions: string[];
  mediaExtensions: string[];
  hidden?: boolean;
}

export const CONTENT_TYPES: ContentTypeConfig[] = [
  {
    id: 'VOCABULARY',
    label: 'Từ vựng',
    required: 'word, meaning',
    sample: { word: 'schedule', meaning: 'a plan of activities', pos: 'noun', ipa: '/ˈskedʒuːl/', exampleEn: 'Check the schedule.', exampleVi: 'Kiểm tra lịch trình.', audioUrl: 'https://example.com/schedule.mp3', imageUrl: 'https://example.com/schedule.png', synonyms: ['timetable'], level: 'EASY' },
    documentExtensions: ['pdf', 'png', 'jpg', 'jpeg', 'webp', 'doc', 'docx', 'md'],
    mediaExtensions: ['mp3', 'wav', 'png', 'jpg', 'jpeg', 'webp'],
  },
  {
    id: 'GRAMMAR',
    label: 'Ngữ pháp',
    required: 'title, rule, explanation',
    sample: {
      topicCode: 'CD_01',
      codeName: 'Present_Simple',
      titleVi: 'Thì hiện tại đơn',
      titleEn: 'Present Simple',
      category: 'Ngữ pháp TOEIC',
      description: 'Dùng cho thói quen và sự thật.',
      coreTheory: '### Cấu trúc\nS + V(s/es)',
      signalClues: 'always, usually, often',
      tipsAndTricks: 'Chú ý thêm -s/-es với chủ ngữ ngôi thứ ba số ít.',
      commonTraps: 'Nhầm động từ sau he/she/it.',
      audioUrl: 'https://example.com/pronunciation.mp3',
      imageUrl: 'https://example.com/phonetics_chart.png',
      gradedQuestions: [{
        id: 1,
        level: 'Level 1',
        question: 'She ____ to work every day.',
        options: { A: 'go', B: 'goes', C: 'going', D: 'gone' },
        correctAnswer: 'B',
        translation: { questionVi: 'Cô ấy đi làm mỗi ngày.' },
        signalInQuestion: 'every day',
        solutionMethod: 'Chủ ngữ ngôi thứ ba số ít cần động từ thêm -s.',
        trapNote: 'Không dùng động từ nguyên mẫu.',
        formulaApplied: 'He/She/It + V(s/es)',
        imageUrl: 'https://example.com/question_q1.png',
      }],
      summaryTable: '| Chủ ngữ | Động từ |\n|---|---|\n| He/She/It | V(s/es) |',
      reference: 'Tài liệu ngữ pháp TOEIC',
    },
    documentExtensions: ['pdf', 'png', 'jpg', 'jpeg', 'webp', 'doc', 'docx', 'md'],
    mediaExtensions: ['png', 'jpg', 'jpeg', 'webp', 'mp3', 'wav'],
  },
  {
    id: 'LISTENING',
    label: 'Listening',
    required: 'title, part, transcript, audioUrl',
    sample: { title: 'Office announcement', part: 'PART_4', transcript: 'Attention, passengers...', audioUrl: 'https://example.com/audio.mp3', durationSeconds: 45, difficulty: 'MEDIUM' },
    documentExtensions: ['pdf', 'png', 'jpg', 'jpeg', 'webp', 'doc', 'docx', 'txt', 'md'],
    mediaExtensions: ['mp3', 'wav', 'm4a', 'mp4', 'png', 'jpg', 'jpeg', 'webp'],
    hidden: true,
  },
  {
    id: 'READING',
    label: 'Reading',
    required: 'title, content',
    sample: { title: 'Office notice', part: 'PART_7', content: 'The office will be closed...', topic: 'Workplace', difficulty: 'EASY', source: 'Practice set', audioUrl: 'https://example.com/reading_passage.mp3', imageUrl: 'https://example.com/office_notice.png' },
    documentExtensions: ['pdf', 'png', 'jpg', 'jpeg', 'webp', 'doc', 'docx', 'txt', 'html', 'md'],
    mediaExtensions: ['mp3', 'wav', 'm4a', 'mp4', 'png', 'jpg', 'jpeg', 'webp'],
  },
  {
    id: 'QUESTION',
    label: 'Câu hỏi',
    required: 'part, questionText, options, correctAnswer, explanation, skill, difficulty',
    sample: { part: 'PART_5', questionText: 'The manager ____ the report.', options: [{ id: 'A', text: 'review' }, { id: 'B', text: 'reviews' }, { id: 'C', text: 'reviewing' }, { id: 'D', text: 'reviewed' }], correctAnswer: 'B', explanation: 'The singular subject takes reviews.', skill: 'Grammar', difficulty: 'EASY', imageUrl: 'https://example.com/part1_photo.png', audioUrl: 'https://example.com/part1_audio.mp3' },
    documentExtensions: ['pdf', 'doc', 'docx', 'md'],
    mediaExtensions: ['mp3', 'wav', 'm4a', 'mp4', 'png', 'jpg', 'jpeg', 'webp'],
  },
  {
    id: 'MOCK_TEST',
    label: 'Đề thi thử',
    required: 'title, description, durationMinutes, questionCodes',
    sample: { title: 'TOEIC Practice Test 01', description: 'Practice test for Parts 1–7.', durationMinutes: 120, questionCodes: ['P1-001', 'P5-001'] },
    documentExtensions: ['pdf', 'png', 'jpg', 'jpeg', 'webp', 'doc', 'docx', 'md'],
    mediaExtensions: ['mp3', 'wav', 'm4a', 'mp4', 'png', 'jpg', 'jpeg', 'webp'],
    hidden: true,
  },
];

export const IMPORTABLE_CONTENT_TYPES = CONTENT_TYPES.filter((c) => !c.hidden);

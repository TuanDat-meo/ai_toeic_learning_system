export interface DictationQuestion {
  id: number;
  question?: string;
  part: "Part 1" | "Part 2" | "Part 3" | "Part 4";
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
  }[];
}

export interface DictationCardData {
  id: string; // e.g. "t1-p1"
  testNumber: number; // 1, 2, 3
  part: "Part 1" | "Part 2" | "Part 3" | "Part 4";
  year: "2026" | "2024" | "2023" | "2022";
  totalQuestions: number;
  completedQuestions: number;
  status: "Chưa bắt đầu" | "Đang luyện tập" | "Đã hoàn thành";
  notesCount: number;
  vocabItems: {
    word: string;
    ipa: string;
    meaning: string;
    example?: string;
  }[];
  questions: DictationQuestion[];
}

export interface LevelCategoryCardData {
  id: string;
  part: "Part 1" | "Part 2" | "Part 3" | "Part 4";
  type: "level" | "category";
  title: string;
  targetLevel?: string;
  totalQuestions: number;
  completedQuestions: number;
  correctCount: number;
  wrongCount: number;
  status: "Chưa luyện tập" | "Đang học" | "Đã hoàn thành";
  theorySummary: string;
  rules: string[];
  vocabBag: {
    word: string;
    ipa: string;
    meaning: string;
  }[];
  questions: DictationQuestion[];
}

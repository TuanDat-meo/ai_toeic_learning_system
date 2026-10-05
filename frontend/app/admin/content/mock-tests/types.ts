export interface HistoryAttempt {
  id: string;
  date: string;
  duration: string;
  score: number;
  listening: number;
  reading: number;
  correctCount: number;
  totalCount: number;
}

export interface KeyVocab {
  word: string;
  ipa: string;
  pos: string;
  meaning: string;
  example: string;
}

export interface TestItem {
  id: number;
  volId: string; // 'vol1' | 'vol2' | 'ets2024'
  title: string;
  difficulty: "Khó" | "Trung bình" | "Vừa sức";
  score: number | null;
  listeningScore: number | null;
  readingScore: number | null;
  status: string;
  completedAt: string | null;
  historyAttempts: HistoryAttempt[];
  keyVocab: KeyVocab[];
}

export interface PracticeQuestion {
  id: number;
  part: string;
  questionText: string;
  passage?: string;
  bilingualPassage?: string;
  evidence?: string;
  audioUrl?: string;
  imageUrl?: string;
  options: { [key: string]: string };
  groupTitle?: string;
  groupId?: string;
  groupTotal?: number;
  optionGlosses?: { [key: string]: string };
  step1?: string;
  step2?: string;
  step3?: string;
  note?: string;
  correctAnswer: string;
  explanation: string;
  transcript?: string;
  translation?: string;
}

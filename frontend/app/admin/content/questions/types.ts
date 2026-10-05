export type QuestionPart =
  | "Part 1"
  | "Part 2"
  | "Part 3"
  | "Part 4"
  | "Part 5"
  | "Part 6"
  | "Part 7";

export type QuestionDifficulty = "Easy" | "Medium" | "Hard";

export interface QuestionOption {
  id: string; // 'A' | 'B' | 'C' | 'D'
  text: string;
  isCorrect: boolean;
}

export interface VocabItem {
  word: string;
  pos: string;
  level: string;
  ipa: string;
  meaning: string;
  exampleEn?: string;
  exampleVi?: string;
  collocations?: string[];
  synonyms?: string[];
  antonyms?: string[];
  wordFamily?: string[];
}

export interface ExplanationStep {
  title: string;
  desc: string;
}

export interface QuestionItem {
  id: string;
  code?: string;
  part: QuestionPart;
  questionText: string;
  passage?: string;
  imageUrl?: string;
  audioUrl?: string;
  options: QuestionOption[];
  correctAnswer: string; // 'A' | 'B' | 'C' | 'D'
  skill: string;
  difficulty: QuestionDifficulty;
  explanation: string;
  status: "PUBLISHED" | "DRAFT";
  createdAt?: string;
  vocabList?: VocabItem[];
  steps?: ExplanationStep[];
}

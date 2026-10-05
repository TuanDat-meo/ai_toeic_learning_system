export interface GrammarQuestionItem {
  id: string;
  part: string; // "Part 5" | "Part 6"
  questionText: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: "A" | "B" | "C" | "D";
  explanation: string;
  trapNote?: string;
  translation?: string;
  difficulty?: string;
}

export interface GrammarTopicItem {
  id: string;
  code: string;
  title: string;
  englishTitle: string;
  part: "Part 5" | "Part 6" | "Part 5 & 6";
  targetScore: "350-500" | "500-750" | "750+";
  status: "PUBLISHED" | "DRAFT";
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
  studiedCount: number;
  correctCount: number;
  wrongCount: number;
  bookmarked?: boolean;
}

export type PartFilter = "ALL" | "Part 5" | "Part 6" | "Part 5 & 6";
export type TargetScoreFilter = "ALL" | "350-500" | "500-750" | "750+";
export type StatusFilter = "ALL" | "PUBLISHED" | "DRAFT";

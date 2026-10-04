export interface VocabItem {
  word: string;
  pos: string;
  level: string;
  ipa: string;
  meaning: string;
  example?: { en: string; vi: string };
  collocations?: { en: string; vi: string }[];
  synonyms?: { en: string; vi: string }[];
  antonyms?: { en: string; vi: string }[];
  wordFamily?: { word: string; pos: string; meaning: string }[];
}

export interface SampleQuestion {
  questionNum?: string;
  question: string;
  bilingual?: string;
  options: string[];
  optionMeanings?: string[];
  correctIndex: number;
  explanation: string;
  steps?: { title: string; desc: string }[];
  vocabList?: VocabItem[];
}

export interface ExerciseCardData {
  id: string;
  title: string;
  category: "grammar" | "part5" | "part6" | "part7";
  subCategory?: "word_types" | "verbs" | "other_grammar" | "by_topic" | "levels" | "text_types";
  subtitle?: string;
  tag?: string;
  totalQuestions: number;
  studiedQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  bookmarked?: boolean;
  passageText?: string;
  theory?: {
    summary: string;
    rules: string[];
    example: string;
  };
  sampleQuestions: SampleQuestion[];
}

export interface DictEntry {
  word: string;
  ipa: string;
  pos: string;
  meaning: string;
  example: string;
}

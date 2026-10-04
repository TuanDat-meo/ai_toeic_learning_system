export interface WordItem {
  id: string;
  word: string;
  ipa: string;
  partOfSpeech: string;
  meaning: string;
  example: string;
  exampleMeaning?: string;
  level: string;
  starred?: boolean;
}

export interface TestItem {
  id: string;
  year: string;
  title: string;
  wordCount: number;
  category: "2026" | "600_essential" | "2023";
  words: WordItem[];
}

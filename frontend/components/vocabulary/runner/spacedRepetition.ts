import type { WordItem } from "@/app/admin/content/vocabulary/types";

// ─── SPACED REPETITION & QUESTION QUEUE ──────────────────────────────────────

export interface RunnerQuestionItem {
  instanceId: string; // ID duy nhất cho mỗi lượt xuất hiện để tránh trùng lặp bản ghi
  word: WordItem;
  displayMeaning: string;
  vietnameseMeaning: string;
  exampleSentence: string;
  exampleMeaning: string;
  type: "ENGLISH_TO_VIETNAMESE" | "VIETNAMESE_TO_ENGLISH" | "FILL_IN_BLANK" | "AUDIO" | "PHONETIC_TO_AUDIO";
  prompt: string;
  choices: string[];   // 4 phương án cho chế độ chọn nhanh (nút to >= 44px trên mobile)
  isReviewInstance?: boolean; // Đánh dấu là câu hỏi lặp lại ngắt quãng do từng làm sai
  answerFormat?: "audio_choices";
}

/**
 * Trộn ngẫu nhiên mảng (Fisher-Yates Shuffle).
 */
export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Sinh 4 lựa chọn (1 từ đúng + 3 từ gây nhiễu) cho câu hỏi.
 */
export function generateQuestionChoices(
  correctWord: WordItem,
  allWords: WordItem[],
  answerLanguage: "english" | "vietnamese" = "english"
): string[] {
  if (answerLanguage === "vietnamese") {
    const getMeaning = (word: WordItem): string =>
      word.meaning?.trim()
      || word.senses?.find((sense) => sense.meaning?.trim())?.meaning?.trim()
      || word.meanings?.find((meaning) => meaning.meaning?.trim())?.meaning?.trim()
      || word.translation?.trim()
      || "";
    const correctMeaning = getMeaning(correctWord);
    const distractors = allWords
      .filter((word) => word.id !== correctWord.id)
      .map(getMeaning)
      .filter((meaning, index, meanings) => meaning && meanings.indexOf(meaning) === index)
      .slice(0, 3);
    return shuffleArray([correctMeaning, ...distractors]);
  }

  const distractors = allWords
    .filter((w) => w.id !== correctWord.id && w.word.toLowerCase() !== correctWord.word.toLowerCase())
    .map((w) => w.word);

  const shuffledDistractors = shuffleArray(distractors).slice(0, 3);
  return shuffleArray([correctWord.word, ...shuffledDistractors]);
}

/**
 * Chèn một từ bị sai vào hàng đợi câu hỏi sau `offset` bước (Lặp lại ngắt quãng trong ván).
 */
export function reinsertFailedWord<T extends RunnerQuestionItem>(
  queue: T[],
  failedItem: T,
  currentIndex: number,
  offset = 3
): T[] {
  const newQueue = [...queue];
  // Vị trí chèn sau 3 câu, nhưng không vượt quá cuối mảng
  const targetIndex = Math.min(newQueue.length, currentIndex + offset);

  // Tạo một bản thể mới với instanceId mới để ghi nhận độc lập
  const reviewInstance: T = {
    ...failedItem,
    instanceId: crypto.randomUUID(),
    isReviewInstance: true,
  };

  newQueue.splice(targetIndex, 0, reviewInstance);
  return newQueue;
}

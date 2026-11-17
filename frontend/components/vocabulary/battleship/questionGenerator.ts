/**
 * BATTLESHIP VOCABULARY - BIDIRECTIONAL QUESTION GENERATOR
 * Hỗ trợ đầy đủ 2 chiều học theo Mục 3 của đặc tả:
 * - Mode A: English → Vietnamese (Hiển thị từ tiếng Anh, tìm nghĩa tiếng Việt)
 * - Mode B: Vietnamese → English (Hiển thị nghĩa tiếng Việt, tìm từ tiếng Anh)
 * - Mixed Mode: 50% English → Vietnamese và 50% Vietnamese → English
 *
 * Hỗ trợ cả Multiple Choice (A/B/C/D) và Typing Mode (Gõ trực tiếp).
 */

import type { WordItem } from "@/app/admin/content/vocabulary/types";
import {
  type BattleDifficulty,
  type BattleQuestionType,
  type LearningDirection,
} from "./config.ts";
import { levenshteinDistance, normalizeAnswer } from "./engine.ts";

export interface BattleQuestion {
  id: string;
  wordId: string;
  word: WordItem;
  type: BattleQuestionType;
  prompt: string;
  promptMeta: {
    partOfSpeech: string;
    firstLetter: string;
    wordLength: number;
    hintMask: string;
    contextNote?: string;
  };
  options?: string[];
  audioUrl?: string;
  targetAnswer: string;
  acceptedAnswers: string[];
}

export interface BidirectionalQuestion {
  id: string;
  wordId: string;
  word: WordItem;
  direction: "en-vi" | "vi-en";
  displayTerm: string; // Từ hiển thị trên phi thuyền/mục tiêu
  phonetic?: string;
  partOfSpeech: string;
  subInfo: string;
  targetAnswer: string; // Đáp án chính
  acceptedAnswers: string[]; // Tất cả các biến thể được chấp nhận
  options: string[]; // 4 lựa chọn A, B, C, D
  correctOptionIndex: number;
  hintMask: string; // Ví dụ: "a _ _ _ _ _ _ _ _ _"
  exampleSentence?: string;
  exampleMeaning?: string;
}

/**
 * Tạo chuỗi che chữ cho Typing / Gợi ý:
 * e.g., "accommodation" -> "a _ _ _ _ _ _ _ _ _ _ _ _"
 */
export function createWordMask(word: string): string {
  const clean = word.trim();
  if (clean.length <= 2) return clean;
  const first = clean[0];
  const middle = Array.from({ length: clean.length - 1 }, () => "_").join(" ");
  return `${first} ${middle}`;
}

/**
 * Trích xuất các nghĩa tiếng Việt hợp lệ từ một WordItem
 */
export function extractVietnameseMeanings(word: WordItem): string[] {
  const list = new Set<string>();

  if (word.meaning && word.meaning.trim()) {
    // Tách các phân đoạn nghĩa bởi dấu chấm phẩy, phẩy, gạch chéo
    const segments = word.meaning.split(/[,;\n|/]/);
    for (const seg of segments) {
      const clean = seg.trim();
      if (clean) list.add(clean);
    }
    list.add(word.meaning.trim());
  }

  if (word.senses && Array.isArray(word.senses)) {
    for (const sense of word.senses) {
      if (sense.meaning && sense.meaning.trim()) {
        const segments = sense.meaning.split(/[,;\n|/]/);
        for (const seg of segments) {
          const clean = seg.trim();
          if (clean) list.add(clean);
        }
        list.add(sense.meaning.trim());
      }
    }
  }

  if (word.meanings && Array.isArray(word.meanings)) {
    for (const m of word.meanings) {
      if (m.meaning && m.meaning.trim()) {
        list.add(m.meaning.trim());
      }
    }
  }

  if (word.translation && word.translation.trim()) {
    list.add(word.translation.trim());
  }

  return Array.from(list);
}

/**
 * Trích xuất các từ tiếng Anh và biến thể hợp lệ từ một WordItem
 */
export function extractEnglishWords(word: WordItem): string[] {
  const list = new Set<string>();
  const base = normalizeAnswer(word.word);
  if (base) list.add(base);

  if (word.relatedForms && Array.isArray(word.relatedForms)) {
    for (const rf of word.relatedForms) {
      if (rf.word) {
        const norm = normalizeAnswer(rf.word);
        if (norm) list.add(norm);
      }
    }
  }

  if (word.senses && Array.isArray(word.senses)) {
    for (const sense of word.senses) {
      if (sense.synonyms) {
        const synList = sense.synonyms.split(/[,;\n|]/);
        for (const syn of synList) {
          const norm = normalizeAnswer(syn);
          if (norm) list.add(norm);
        }
      }
    }
  }

  return Array.from(list);
}

/**
 * Che từ mục tiêu trong câu ví dụ
 */
export function maskWordInSentence(sentence: string, targetWord: string): string | null {
  if (!sentence || !targetWord) return null;
  const wordClean = targetWord.trim();
  if (wordClean.length === 0) return null;

  const escaped = wordClean.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`\\b${escaped}\\b`, "i");

  if (!regex.test(sentence)) {
    const root = wordClean.replace(/(?:e|ing|ed|es|s)$/i, "");
    if (root.length >= 3) {
      const rootRegex = new RegExp(`\\b${root}[a-z]*\\b`, "i");
      if (rootRegex.test(sentence)) {
        return sentence.replace(rootRegex, "【 _____ 】");
      }
    }
    return null;
  }

  return sentence.replace(regex, "【 _____ 】");
}

export function getAcceptedAnswersForWord(word: WordItem): string[] {
  return extractEnglishWords(word);
}

export function generateDistractors(
  targetWord: WordItem,
  wordPool: WordItem[],
  count = 3
): string[] {
  const targetNorm = normalizeAnswer(targetWord.word);
  const candidates = wordPool
    .filter((w) => normalizeAnswer(w.word) !== targetNorm && w.word.trim().length > 0)
    .map((w) => w.word.trim());

  const unique = Array.from(new Set(candidates));
  for (let i = unique.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [unique[i], unique[j]] = [unique[j], unique[i]];
  }

  const selected = unique.slice(0, count);
  const fallbacks = ["contract", "strategy", "revenue", "estimate", "inspection", "proposal"];
  let fbIndex = 0;
  while (selected.length < count && fbIndex < fallbacks.length) {
    const fb = fallbacks[fbIndex++];
    if (fb !== targetNorm && !selected.includes(fb)) {
      selected.push(fb);
    }
  }

  return selected;
}

/**
 * Sinh đáp án nhiễu theo chiều (English hoặc Vietnamese)
 */
export function generateBidirectionalDistractors(
  targetWord: WordItem,
  direction: "en-vi" | "vi-en",
  wordPool: WordItem[],
  count = 3
): string[] {
  if (direction === "vi-en") {
    // Chiều Việt -> Anh: Các lựa chọn là từ tiếng Anh
    return generateDistractors(targetWord, wordPool, count);
  }

  // Chiều Anh -> Việt: Các lựa chọn là nghĩa tiếng Việt
  const targetMeanings = extractVietnameseMeanings(targetWord).map((m) => normalizeAnswer(m));
  const candidateMeanings: string[] = [];

  for (const w of wordPool) {
    if (w.id === targetWord.id) continue;
    const wMeanings = extractVietnameseMeanings(w);
    if (wMeanings.length > 0) {
      const primary = wMeanings[0].trim();
      if (!targetMeanings.includes(normalizeAnswer(primary)) && !candidateMeanings.includes(primary)) {
        candidateMeanings.push(primary);
      }
    }
  }

  // Shuffle
  for (let i = candidateMeanings.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [candidateMeanings[i], candidateMeanings[j]] = [candidateMeanings[j], candidateMeanings[i]];
  }

  const selected = candidateMeanings.slice(0, count);
  const fallbackVietnamese = ["sự thanh toán", "lô hàng vận chuyển", "hợp đồng kinh tế", "biên lai đặt cọc", "lịch trình công tác"];
  let fbIdx = 0;
  while (selected.length < count && fbIdx < fallbackVietnamese.length) {
    const fb = fallbackVietnamese[fbIdx++];
    if (!targetMeanings.includes(normalizeAnswer(fb)) && !selected.includes(fb)) {
      selected.push(fb);
    }
  }

  return selected;
}

/**
 * Xây dựng câu hỏi hai chiều (Mode A: English -> Vietnamese, Mode B: Vietnamese -> English)
 */
export function buildBidirectionalQuestion(
  word: WordItem,
  questionIndex: number,
  preferredDirection: LearningDirection,
  wordPool: WordItem[]
): BidirectionalQuestion {
  // Xác định chiều câu hỏi: nếu là "mixed", luân phiên 50/50 theo index
  let activeDirection: "en-vi" | "vi-en" = "en-vi";
  if (preferredDirection === "mixed") {
    activeDirection = questionIndex % 2 === 0 ? "en-vi" : "vi-en";
  } else {
    activeDirection = preferredDirection;
  }

  const pos = word.partOfSpeech || word.senses?.[0]?.partOfSpeech || "Từ vựng";
  const englishWord = word.word.trim();
  const vietnameseMeanings = extractVietnameseMeanings(word);
  const primaryMeaning = vietnameseMeanings[0] || word.meaning || "Chưa có nghĩa";

  if (activeDirection === "en-vi") {
    // Mode A: English -> Vietnamese
    const displayTerm = englishWord;
    const targetAnswer = primaryMeaning;
    const acceptedAnswers = vietnameseMeanings.map((m) => normalizeAnswer(m));
    const distractors = generateBidirectionalDistractors(word, "en-vi", wordPool, 3);

    // Shuffle 4 đáp án và tìm index của đáp án đúng
    const allOptions = [targetAnswer, ...distractors];
    for (let i = allOptions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allOptions[i], allOptions[j]] = [allOptions[j], allOptions[i]];
    }
    const correctOptionIndex = allOptions.indexOf(targetAnswer);

    return {
      id: `bi-q-${questionIndex}-${word.id}`,
      wordId: word.id,
      word,
      direction: "en-vi",
      displayTerm,
      phonetic: word.ipa ? `/${word.ipa}/` : undefined,
      partOfSpeech: pos,
      subInfo: `(${pos.toLowerCase()}) Tìm nghĩa tiếng Việt tương ứng`,
      targetAnswer,
      acceptedAnswers,
      options: allOptions,
      correctOptionIndex,
      hintMask: createWordMask(targetAnswer),
      exampleSentence: word.example || word.senses?.[0]?.example,
      exampleMeaning: word.exampleMeaning || word.senses?.[0]?.exampleMeaning,
    };
  }

  // Mode B: Vietnamese -> English
  const displayTerm = primaryMeaning.toUpperCase();
  const targetAnswer = englishWord;
  const acceptedAnswers = extractEnglishWords(word).map((w) => normalizeAnswer(w));
  const distractors = generateBidirectionalDistractors(word, "vi-en", wordPool, 3);

  const allOptions = [targetAnswer, ...distractors];
  for (let i = allOptions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allOptions[i], allOptions[j]] = [allOptions[j], allOptions[i]];
  }
  const correctOptionIndex = allOptions.indexOf(targetAnswer);

  return {
    id: `bi-q-${questionIndex}-${word.id}`,
    wordId: word.id,
    word,
    direction: "vi-en",
    displayTerm,
    phonetic: word.ipa ? `/${word.ipa}/` : undefined,
    partOfSpeech: pos,
    subInfo: `(${pos.toLowerCase()}) Tìm từ tiếng Anh tương ứng`,
    targetAnswer,
    acceptedAnswers,
    options: allOptions,
    correctOptionIndex,
    hintMask: createWordMask(targetAnswer),
    exampleSentence: word.example || word.senses?.[0]?.example,
    exampleMeaning: word.exampleMeaning || word.senses?.[0]?.exampleMeaning,
  };
}

/**
 * Kiểm tra câu trả lời hai chiều (Multiple Choice hoặc Typing)
 */
export function evaluateBidirectionalAnswer(
  userAnswer: string,
  question: BidirectionalQuestion
): { result: "correct" | "near" | "wrong"; matchKey: string } {
  const normUser = normalizeAnswer(userAnswer);
  if (!normUser) return { result: "wrong", matchKey: question.targetAnswer };

  // 1. Kiểm tra khớp chính xác với bất kỳ biến thể hợp lệ nào
  const isExact = question.acceptedAnswers.some((accepted) => {
    const normAcc = normalizeAnswer(accepted);
    return normUser === normAcc;
  });

  if (isExact) {
    return { result: "correct", matchKey: question.targetAnswer };
  }

  // 2. Kiểm tra gần đúng (Levenshtein = 1 cho từ >= 6 ký tự)
  if (normUser.length >= 6) {
    const isNear = question.acceptedAnswers.some((accepted) => {
      const normAcc = normalizeAnswer(accepted);
      return normAcc.length >= 6 && levenshteinDistance(normUser, normAcc) === 1;
    });
    if (isNear) {
      return { result: "near", matchKey: question.targetAnswer };
    }
  }

  return { result: "wrong", matchKey: question.targetAnswer };
}

/**
 * Giữ nguyên buildBattleQuestion để tương thích ngược 100% với các test hiện tại
 */
export function buildBattleQuestion(
  word: WordItem,
  questionIndex: number,
  preferredType: BattleQuestionType,
  difficulty: BattleDifficulty,
  wordPool: WordItem[]
): BattleQuestion {
  const wordClean = word.word.trim();
  const pos = word.partOfSpeech || word.senses?.[0]?.partOfSpeech || "Từ vựng";
  const firstLetter = wordClean.charAt(0).toUpperCase();
  const wordLength = wordClean.length;
  const hintMask = createWordMask(wordClean);
  const acceptedAnswers = getAcceptedAnswersForWord(word);

  let activeType = preferredType;
  let promptText = "";
  let contextNote = "";

  const audioUrl = word.audioUrl || word.audio;
  if (activeType === "audio" && !audioUrl) {
    activeType = word.senses?.[0]?.definitionEn ? "definition" : "meaning";
  }

  const rawExample = word.example || word.senses?.[0]?.example;
  let maskedSentence: string | null = null;
  if (activeType === "blank") {
    if (rawExample) {
      maskedSentence = maskWordInSentence(rawExample, wordClean);
    }
    if (!maskedSentence) {
      activeType = word.senses?.[0]?.definitionEn ? "definition" : "meaning";
    }
  }

  switch (activeType) {
    case "meaning": {
      const meaningVi = word.meaning || word.senses?.[0]?.meaning || "Nghĩa chưa cập nhật";
      promptText = meaningVi;
      contextNote = `(${pos.toLowerCase()}) Từ bắt đầu bằng "${firstLetter}", gồm ${wordLength} chữ cái`;
      break;
    }

    case "definition": {
      const defEn = word.senses?.[0]?.definitionEn || word.meaning || "";
      promptText = defEn;
      contextNote = `(${pos.toLowerCase()}) English definition`;
      break;
    }

    case "blank": {
      promptText = maskedSentence || rawExample || word.meaning || "";
      const exMeaning = word.exampleMeaning || word.senses?.[0]?.exampleMeaning;
      if (exMeaning) {
        contextNote = `Dịch: ${exMeaning}`;
      } else {
        contextNote = `Điền từ thích hợp (${pos.toLowerCase()})`;
      }
      break;
    }

    case "audio": {
      promptText = "Nghe phát âm chuẩn và nhập từ vựng tiếng Anh:";
      contextNote = `(${pos.toLowerCase()}) ${wordLength} chữ cái`;
      break;
    }

    case "context": {
      const sitEx = word.example || word.senses?.[0]?.example;
      const sitDef = word.senses?.[0]?.definitionEn || word.meaning || "";
      if (sitEx) {
        const masked = maskWordInSentence(sitEx, wordClean);
        promptText = masked ? `Tình huống TOEIC: ${masked}` : `Tình huống: ${sitDef}`;
      } else {
        promptText = `Tình huống TOEIC: ${sitDef}`;
      }
      contextNote = `(${pos.toLowerCase()}) Tình huống công sở / đàm phán`;
      break;
    }
  }

  let options: string[] | undefined = undefined;
  if (difficulty === "easy") {
    const distractors = generateDistractors(word, wordPool, 3);
    const allOpts = [wordClean, ...distractors];
    for (let i = allOpts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allOpts[i], allOpts[j]] = [allOpts[j], allOpts[i]];
    }
    options = allOpts;
  }

  return {
    id: `q-${questionIndex}-${word.id}`,
    wordId: word.id,
    word,
    type: activeType,
    prompt: promptText,
    promptMeta: {
      partOfSpeech: pos,
      firstLetter,
      wordLength,
      hintMask,
      contextNote,
    },
    options,
    audioUrl: audioUrl || undefined,
    targetAnswer: wordClean,
    acceptedAnswers,
  };
}

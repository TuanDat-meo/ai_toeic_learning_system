import type { WordItem, VocabularyTestSet } from "@/app/admin/content/vocabulary/types";

export type StudyMode = "single_deck" | "all_decks" | "by_level";
export type WordLevelTag = "A1" | "A2" | "B1" | "B2" | "C1" | "C2" | "unclassified";
export type QuestionCountSelection = 10 | 20 | 30 | 0; // 0: Vô tận (Endless)

export interface WordSelectionOptions {
  mode: StudyMode;
  targetCount: QuestionCountSelection;
  selectedLevels?: WordLevelTag[];
  wrongWordsHistory?: WordItem[];
  mixWrongRatio?: number; // Mặc định 0.25 (25%)
  seed?: number;          // Hỗ trợ kiểm thử xác định trước
}

/**
 * Bộ sinh số giả ngẫu nhiên có hỗ trợ Seed (Mulberry32).
 */
export function createSeededRandom(seed?: number) {
  if (typeof seed !== "number") {
    return () => Math.random();
  }
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Shuffle Bag (Trộn túi): Đảm bảo xuất hiện hết các phần tử 1 lần trước khi xáo lại.
 */
export class ShuffleBag<T> {
  private items: T[];
  private currentBag: T[] = [];
  private randomFn: () => number;

  constructor(items: T[], randomFn: () => number = Math.random) {
    this.items = [...items];
    this.randomFn = randomFn;
    this.refill();
  }

  private refill(): void {
    this.currentBag = [...this.items];
    for (let i = this.currentBag.length - 1; i > 0; i--) {
      const j = Math.floor(this.randomFn() * (i + 1));
      [this.currentBag[i], this.currentBag[j]] = [this.currentBag[j], this.currentBag[i]];
    }
  }

  next(): T | undefined {
    if (this.currentBag.length === 0) {
      if (this.items.length === 0) return undefined;
      this.refill();
    }
    return this.currentBag.pop();
  }

  size(): number {
    return this.items.length;
  }
}

/**
 * Trích xuất cấp độ từ vựng từ WordItem hoặc phân vào 'unclassified'.
 */
export function getWordLevel(word: WordItem): WordLevelTag {
  const rawLevel = (word.cefrLevel || word.level || "").toUpperCase().trim();
  const normalizedLevel = rawLevel === "EASY" ? "A1" : rawLevel === "MEDIUM" ? "B1" : rawLevel === "HARD" ? "B2" : rawLevel;
  if (["A1", "A2", "B1", "B2", "C1", "C2"].includes(normalizedLevel)) {
    return normalizedLevel as WordLevelTag;
  }
  return "unclassified";
}

/**
 * Thuật toán chọn từ vựng thông minh hỗ trợ 3 chế độ (Mục 6A.C):
 * 1. single_deck: Dùng Shuffle Bag cho bộ đã chọn.
 * 2. all_decks: Cân bằng từ vựng giữa các bộ đề, lọc trùng lặp.
 * 3. by_level: Lọc và chọn theo nhiều cấp độ A1–C2, chưa phân loại.
 * Kèm hòa trộn 20-30% từ từng làm sai trong lịch sử.
 */
export function selectWordsForSession(
  primaryWords: WordItem[],
  allSetsWords: { setId: string; words: WordItem[] }[] = [],
  options: WordSelectionOptions
): {
  selectedWords: WordItem[];
  distractorPool: WordItem[];
  warningMessage?: string;
} {
  const random = createSeededRandom(options.seed);
  const mixRatio = options.mixWrongRatio ?? 0.25;
  const targetCount = options.targetCount === 0 ? 30 : options.targetCount;

  // 1. Lọc và xử lý nguồn từ theo chế độ
  let candidatePool: WordItem[] = [];
  let warningMessage: string | undefined;

  if (options.mode === "single_deck") {
    candidatePool = [...primaryWords];
    if (candidatePool.length < 10) {
      warningMessage = `Bộ đề này chỉ có ${candidatePool.length} từ. Nên có ít nhất 10 từ để trải nghiệm tốt nhất!`;
    }
  } else if (options.mode === "all_decks") {
    // Thu thập từ từ nhiều bộ, tránh trùng id/từ
    const seenWords = new Set<string>();
    const multiSetPool: WordItem[] = [];

    // Lần lượt lấy đều từ mỗi bộ (round-robin)
    const activeSets = allSetsWords.length > 0 ? allSetsWords : [{ setId: "primary", words: primaryWords }];
    let hasMore = true;
    let round = 0;

    while (hasMore) {
      hasMore = false;
      for (const set of activeSets) {
        if (round < set.words.length) {
          hasMore = true;
          const w = set.words[round];
          const norm = w.word.toLowerCase().trim();
          if (!seenWords.has(norm)) {
            seenWords.add(norm);
            multiSetPool.push(w);
          }
        }
      }
      round++;
    }
    candidatePool = multiSetPool.length > 0 ? multiSetPool : [...primaryWords];
  } else if (options.mode === "by_level") {
    const selectedLevels = options.selectedLevels && options.selectedLevels.length > 0
      ? options.selectedLevels
      : ["A1", "A2", "B1", "B2", "C1", "C2", "unclassified"];

    const allAvailable = allSetsWords.flatMap((s) => s.words).concat(primaryWords);
    const seen = new Set<string>();
    candidatePool = allAvailable.filter((w) => {
      const norm = w.word.toLowerCase().trim();
      if (seen.has(norm)) return false;
      seen.add(norm);
      return selectedLevels.includes(getWordLevel(w));
    });

    if (candidatePool.length === 0) {
      candidatePool = [...primaryWords]; // Fallback an toàn nếu không tìm thấy từ theo cấp
      warningMessage = "Không tìm thấy từ thuộc cấp độ đã chọn, chuyển về bộ mặc định.";
    }
  }

  // Fallback nếu candidatePool rỗng
  if (candidatePool.length === 0) {
    candidatePool = [
      {
        id: "fb-1",
        setId: "default",
        word: "runner",
        meaning: "người chạy đua",
      },
    ];
    warningMessage = "Dữ liệu bộ từ rỗng. Đã kích hoạt từ vựng dự phòng.";
  }

  // 2. Tách từ từng sai (Spaced Repetition) để hòa trộn
  const wrongCandidates = (options.wrongWordsHistory || []).filter((w) =>
    candidatePool.some((c) => c.word.toLowerCase() === w.word.toLowerCase())
  );
  const wrongCountNeeded = Math.min(
    Math.floor(targetCount * mixRatio),
    wrongCandidates.length
  );

  const shuffleBag = new ShuffleBag(candidatePool, random);
  const selectedWords: WordItem[] = [];
  const selectedKeys = new Set<string>();

  // Thêm từ từng làm sai trước
  if (wrongCountNeeded > 0) {
    const wrongBag = new ShuffleBag(wrongCandidates, random);
    for (let i = 0; i < wrongCountNeeded; i++) {
      const item = wrongBag.next();
      if (item && !selectedKeys.has(item.word.toLowerCase())) {
        selectedKeys.add(item.word.toLowerCase());
        selectedWords.push(item);
      }
    }
  }

  // Điền nốt các từ còn lại bằng ShuffleBag
  let attempts = 0;
  while (selectedWords.length < targetCount && attempts < targetCount * 3) {
    attempts++;
    const item = shuffleBag.next();
    if (!item) break;
    const key = item.word.toLowerCase();
    if (!selectedKeys.has(key)) {
      selectedKeys.add(key);
      selectedWords.push(item);
    }
  }

  // Nếu vẫn chưa đủ targetCount (do bộ ít từ), cho phép lặp lại qua ShuffleBag mới
  while (selectedWords.length < targetCount) {
    const item = shuffleBag.next();
    if (!item) break;
    selectedWords.push(item);
  }

  return {
    selectedWords,
    distractorPool: candidatePool,
    warningMessage,
  };
}

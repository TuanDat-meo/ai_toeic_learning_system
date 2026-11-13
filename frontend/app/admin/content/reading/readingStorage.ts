import { ExerciseCardData, SampleQuestion, VocabItem } from "./types";
import { INITIAL_CARDS } from "./mockData";

import { isStaleReadingCardSnapshot } from "@/lib/readingPassageUtils";
import { normalizeVocabItem, autoExtractVocabListForReading } from "@/lib/readingVocabExtractor";
import { normalizeOptions } from "@/lib/api/reading";

export const LOCAL_READING_CARDS_KEY = "toeic_reading_cards";
export const LOCAL_READING_DELETED_KEY = "toeic_reading_deleted_ids";
export const LOCAL_READING_CUSTOM_KEY = "toeic_reading_custom_cards";
export const LOCAL_READING_EDITED_KEY = "toeic_reading_edited_cards";

/**
 * Lấy danh sách thẻ bài đọc hoàn chỉnh:
 * Kết hợp dữ liệu gốc (INITIAL_CARDS) với các chỉnh sửa (edited),
 * loại trừ các bài đã xóa (deleted) và bổ sung các bài tự tạo (custom).
 * Khắc phục hoàn toàn lỗi giới hạn 5MB QuotaExceededError của localStorage.
 */
export function getLocalReadingCards(): ExerciseCardData[] {
  if (typeof window === "undefined") return INITIAL_CARDS;
  try {
    const deletedRaw = localStorage.getItem(LOCAL_READING_DELETED_KEY);
    const deletedIds = new Set<string>(deletedRaw ? JSON.parse(deletedRaw) : []);

    const editedRaw = localStorage.getItem(LOCAL_READING_EDITED_KEY);
    const editedMap: Record<string, ExerciseCardData> = editedRaw ? JSON.parse(editedRaw) : {};

    const customRaw = localStorage.getItem(LOCAL_READING_CUSTOM_KEY);
    const customCards: ExerciseCardData[] = customRaw ? JSON.parse(customRaw) : [];

    // Xử lý dữ liệu cũ từ legacy key nếu chưa có custom key
    const legacyRaw = localStorage.getItem(LOCAL_READING_CARDS_KEY);
    let legacyCustom: ExerciseCardData[] = [];
    if (legacyRaw && !customRaw) {
      try {
        const parsed = JSON.parse(legacyRaw);
        if (Array.isArray(parsed)) {
          legacyCustom = parsed.filter((c) => !INITIAL_CARDS.some((init) => init.id === c.id));
        }
      } catch {}
    }

    healEditedReadingCardsMap(editedMap);
    const questionsHealed = healReadingCardsQuestions(customCards, editedMap);
    const vocabHealed = healReadingCardsVocabulary(customCards, editedMap);
    const titlesHealed = healReadingCardTitles(customCards, editedMap);
    const splitHealed = autoSplitFullReadingCards(customCards, editedMap);
    const deduped = deduplicateCustomReadingCards(customCards);
    if (questionsHealed || vocabHealed || titlesHealed || splitHealed || deduped) {
      try {
        localStorage.setItem(LOCAL_READING_CUSTOM_KEY, JSON.stringify(customCards));
        localStorage.setItem(LOCAL_READING_EDITED_KEY, JSON.stringify(editedMap));
      } catch {}
    }

    // Danh sách bài gốc đã trừ bài xóa và cập nhật bài sửa
    const baseCards = INITIAL_CARDS
      .filter((c) => !deletedIds.has(c.id))
      .map((c) => editedMap[c.id] || c);

    // Danh sách bài tự tạo đã trừ bài xóa và cập nhật bài sửa
    const mergedCustom = [...customCards, ...legacyCustom]
      .filter((c) => !deletedIds.has(c.id))
      .map((c) => editedMap[c.id] || c);

    return [...baseCards, ...mergedCustom];
  } catch (err) {
    console.warn("Lỗi khi tải dữ liệu bài đọc:", err);
    return INITIAL_CARDS;
  }
}

/**
 * Lưu các thay đổi bài đọc một cách thông minh:
 * Chỉ lưu danh sách ID đã xóa, danh sách bài chỉnh sửa và bài tự tạo.
 * Đảm bảo 100% không bao giờ bị vượt quá giới hạn bộ nhớ trình duyệt.
 */
export function saveLocalReadingCards(cards: ExerciseCardData[], emitEvent = true) {
  if (typeof window === "undefined") return;
  try {
    // 0. Chuẩn hóa tiêu đề bài đọc (thay thế hậu tố 200 câu thành mã Part chuẩn)
    cards.forEach((c) => {
      c.title = normalizeReadingCardTitle(c.title, c.category, c.totalQuestions);
    });

    const currentIds = new Set(cards.map((c) => c.id));

    // 1. Lưu các bài gốc đã bị xóa
    const deletedIds = INITIAL_CARDS.filter((init) => !currentIds.has(init.id)).map((init) => init.id);

    // 2. Lưu các bài tự tạo mới
    const customCards = cards.filter((c) => !INITIAL_CARDS.some((init) => init.id === c.id));

    // 3. Lưu các bài gốc đã được chỉnh sửa
    const editedMap: Record<string, ExerciseCardData> = {};
    cards.forEach((c) => {
      const orig = INITIAL_CARDS.find((init) => init.id === c.id);
      if (orig) {
        const isModified =
          orig.title !== c.title ||
          orig.category !== c.category ||
          orig.subCategory !== c.subCategory ||
          orig.tag !== c.tag ||
          orig.totalQuestions !== c.totalQuestions ||
          orig.passageText !== c.passageText ||
          orig.passageTextVi !== c.passageTextVi ||
          JSON.stringify(orig.vocabList || []) !== JSON.stringify(c.vocabList || []) ||
          JSON.stringify(orig.theory) !== JSON.stringify(c.theory) ||
          JSON.stringify(orig.sampleQuestions) !== JSON.stringify(c.sampleQuestions);

        if (isModified && !isStaleReadingCardSnapshot(orig, c)) {
          editedMap[c.id] = c;
        }
      }
    });

    localStorage.setItem(LOCAL_READING_DELETED_KEY, JSON.stringify(deletedIds));
    localStorage.setItem(LOCAL_READING_CUSTOM_KEY, JSON.stringify(customCards));
    localStorage.setItem(LOCAL_READING_EDITED_KEY, JSON.stringify(editedMap));
    syncReadingRevisionKey();

    // Thử lưu đồng bộ legacy key nếu dung lượng cho phép
    try {
      const sanitizedCards = cards.map((card) => {
        const orig = INITIAL_CARDS.find((init) => init.id === card.id);
        return orig && isStaleReadingCardSnapshot(orig, card) ? orig : card;
      });
      localStorage.setItem(LOCAL_READING_CARDS_KEY, JSON.stringify(sanitizedCards));
    } catch {
      try {
        localStorage.setItem(LOCAL_READING_CARDS_KEY, JSON.stringify(customCards));
      } catch {}
    }

    // Phát sự kiện cập nhật để các trang khác (Học viên) cập nhật tức thì
    if (emitEvent) {
      window.dispatchEvent(new CustomEvent("toeic-reading-cards-updated", { detail: { source: "local-storage", cards } }));
    }
  } catch (err) {
    console.error("Lỗi khi lưu dữ liệu bài đọc:", err);
  }
}


const READING_REVISION_KEY = "toeic_reading_data_revision";
const CURRENT_READING_REVISION = "ets-reading-2026-11-11-v2";

function syncReadingRevisionKey() {
  try {
    localStorage.setItem(READING_REVISION_KEY, CURRENT_READING_REVISION);
  } catch {}
}

/**
 * Removes outdated built-in overrides from browser localStorage when updated
 * ETS Reading data ships, while preserving genuine user edits and custom cards.
 */
function healEditedReadingCardsMap(editedMap: Record<string, ExerciseCardData>): boolean {
  let changed = false;

  for (const initCard of INITIAL_CARDS) {
    const cached = editedMap[initCard.id];
    if (cached && isStaleReadingCardSnapshot(initCard, cached)) {
      delete editedMap[initCard.id];
      changed = true;
    }
  }

  let revisionChanged = false;
  try {
    if (localStorage.getItem(READING_REVISION_KEY) !== CURRENT_READING_REVISION) {
      revisionChanged = true;
      localStorage.setItem(READING_REVISION_KEY, CURRENT_READING_REVISION);
    }
  } catch {}

  if (changed) {
    try {
      localStorage.setItem(LOCAL_READING_EDITED_KEY, JSON.stringify(editedMap));
    } catch {}
  }

  if (changed || revisionChanged) {
    try {
      const rawLegacy = localStorage.getItem(LOCAL_READING_CARDS_KEY);
      if (rawLegacy) {
        const parsedLegacy: unknown = JSON.parse(rawLegacy);
        if (Array.isArray(parsedLegacy)) {
          const initById = new Map(INITIAL_CARDS.map((c) => [c.id, c]));
          let legacyDirty = false;
          const healedLegacy = parsedLegacy.map((item) => {
            const candidate = item as ExerciseCardData;
            const fresh = candidate?.id ? initById.get(candidate.id) : undefined;
            if (fresh && isStaleReadingCardSnapshot(fresh, candidate)) {
              legacyDirty = true;
              return fresh;
            }
            return candidate;
          });
          if (legacyDirty) {
            localStorage.setItem(LOCAL_READING_CARDS_KEY, JSON.stringify(healedLegacy));
          }
        }
      }
    } catch {}
  }

  return changed;
}

/**
 * Tự động hồi phục và làm giàu bộ từ vựng cho các bài đọc đã lưu trong localStorage:
 * - Chuẩn hóa trường vocabulary/vocab từ từng câu hỏi sang vocabList chuẩn.
 * - Tự động tổng hợp từ vựng cấp câu hỏi lên cấp bài đọc (card.vocabList).
 * - Nếu đề thi chưa có từ vựng gán sẵn, tự động bóc tách từ vựng trọng tâm TOEIC.
 */
function healReadingCardsVocabulary(
  customCards: ExerciseCardData[],
  editedMap: Record<string, ExerciseCardData>
): boolean {
  let dirty = false;

  const processCard = (card: ExerciseCardData): boolean => {
    let cardChanged = false;
    if (card.sampleQuestions && card.sampleQuestions.length > 0) {
      // 1. Chuẩn hóa q.vocabList nếu câu hỏi có chứa vocabulary hoặc vocab
      card.sampleQuestions.forEach((q) => {
        const qAny = q as unknown as { vocabulary?: unknown; vocab?: unknown };
        const rawVocab: unknown[] = [...(q.vocabList || [])];
        if (Array.isArray(qAny.vocabulary)) rawVocab.push(...(qAny.vocabulary as unknown[]));
        if (Array.isArray(qAny.vocab)) rawVocab.push(...(qAny.vocab as unknown[]));
        if (rawVocab.length > 0 && (!q.vocabList || q.vocabList.length === 0)) {
          q.vocabList = rawVocab.map(normalizeVocabItem).filter(Boolean) as VocabItem[];
          cardChanged = true;
        }
      });

      // 2. Kiểm tra từ vựng cấp bài đọc card.vocabList
      const cardHasVocab = card.vocabList && card.vocabList.length > 0;
      if (!cardHasVocab) {
        const aggregated: VocabItem[] = [];
        const seen = new Set<string>();
        card.sampleQuestions.forEach((q) => {
          (q.vocabList || []).forEach((v) => {
            const key = v.word.trim().toLowerCase();
            if (!seen.has(key)) {
              seen.add(key);
              aggregated.push(v);
            }
          });
        });

        if (aggregated.length > 0) {
          card.vocabList = aggregated;
          cardChanged = true;
        } else {
          // Bóc tách tự động 40 từ vựng cốt lõi nếu đề thi hoàn toàn chưa có từ vựng
          const autoList = autoExtractVocabListForReading({
            passageText: card.passageText,
            passages: card.passages,
            questions: card.sampleQuestions,
            maxCandidates: 40,
          });
          if (autoList.length > 0) {
            card.vocabList = autoList;
            cardChanged = true;
          }
        }
      }
    }
    return cardChanged;
  };

  customCards.forEach((c) => {
    if (processCard(c)) dirty = true;
  });

  Object.values(editedMap).forEach((c) => {
    if (processCard(c)) dirty = true;
  });

  return dirty;
}

/**
 * Tự động hồi phục các câu hỏi bị thiếu đề bài hoặc phương án do nhập từ file JSON phiên bản cũ:
 * 1. Phục hồi từ q.questionEn / q.questionText nếu còn lưu.
 * 2. Phục hồi phương án từ q.options dạng Object { A: ..., B: ... }.
 * 3. Tự động đối chiếu theo giải thích (q.explanation) hoặc tên đề thi & số câu hỏi với kho đề chuẩn ETS (INITIAL_CARDS).
 */
function healReadingCardsQuestions(
  customCards: ExerciseCardData[],
  editedMap: Record<string, ExerciseCardData>
): boolean {
  let dirty = false;

  // Xây dựng bản đồ đối chiếu nhanh từ INITIAL_CARDS:
  const explanationToQuestionMap = new Map<string, SampleQuestion>();
  const testNumToQuestionMap = new Map<string, SampleQuestion>();

  INITIAL_CARDS.forEach((card) => {
    const cardTitleClean = card.title.toLowerCase().replace(/[^a-z0-9]/g, "");
    const testMatch = card.title.toLowerCase().match(/test\s*0?(\d+)/);
    const testKey = testMatch ? `test${testMatch[1]}` : "";

    (card.sampleQuestions || []).forEach((q) => {
      if (q.question && q.options && q.options.some((o) => o && o.trim())) {
        if (q.explanation && q.explanation.trim()) {
          const expKey = q.explanation.trim().toLowerCase().slice(0, 80);
          explanationToQuestionMap.set(expKey, q);
        }
        if (q.questionNum) {
          testNumToQuestionMap.set(`${cardTitleClean}_${q.questionNum}`, q);
          if (testKey) {
            testNumToQuestionMap.set(`${testKey}_${q.questionNum}`, q);
          }
        }
      }
    });
  });

  const processCard = (card: ExerciseCardData): boolean => {
    let cardChanged = false;
    if (!card.sampleQuestions || card.sampleQuestions.length === 0) return false;

    const cardTitleClean = card.title.toLowerCase().replace(/[^a-z0-9]/g, "");
    const testMatch = card.title.toLowerCase().match(/test\s*0?(\d+)/);
    const testKey = testMatch ? `test${testMatch[1]}` : "";

    card.sampleQuestions.forEach((q) => {
      const qAny = q as unknown as Record<string, any>;
      const hasQText = Boolean(q.question && q.question.trim());
      const hasOpts = Array.isArray(q.options) && q.options.some((o) => o && o.trim());

      // 1. Phục hồi từ qAny nếu còn giữ thuộc tính gốc
      if (!hasQText && (qAny.questionEn || qAny.questionText || qAny.text)) {
        q.question = String(qAny.questionEn || qAny.questionText || qAny.text).trim();
        cardChanged = true;
      }
      if (!hasOpts && qAny.options && typeof qAny.options === "object") {
        q.options = normalizeOptions(qAny.options);
        cardChanged = true;
      }
      if (!q.bilingual && (qAny.questionVi || qAny.translation)) {
        const transObj = (qAny.translation && typeof qAny.translation === "object") ? (qAny.translation as Record<string, unknown>) : null;
        q.bilingual = String(
          qAny.questionVi ||
            (typeof qAny.translation === "string"
              ? qAny.translation
              : transObj?.questionVi || "")
        ).trim();
        cardChanged = true;
      }
      if (!q.optionMeanings && qAny.optionTranslations && typeof qAny.optionTranslations === "object") {
        const optTrans = qAny.optionTranslations as Record<string, unknown>;
        q.optionMeanings = ["A", "B", "C", "D"].map((k) => String(optTrans[k] || ""));
        cardChanged = true;
      }

      // 2. Nếu vẫn bị rỗng, tìm kiếm đối chiếu trong kho INITIAL_CARDS
      const nowHasQText = Boolean(q.question && q.question.trim());
      const nowHasOpts = Array.isArray(q.options) && q.options.some((o) => o && o.trim());

      if (!nowHasQText || !nowHasOpts) {
        let match: SampleQuestion | undefined;

        // Thử theo testKey + questionNum (ví dụ test7_101)
        if (testKey && q.questionNum) {
          match = testNumToQuestionMap.get(`${testKey}_${q.questionNum}`);
        }
        if (!match && cardTitleClean && q.questionNum) {
          match = testNumToQuestionMap.get(`${cardTitleClean}_${q.questionNum}`);
        }

        // Thử theo explanation
        if (!match && q.explanation && q.explanation.trim()) {
          const expKey = q.explanation.trim().toLowerCase().slice(0, 80);
          match = explanationToQuestionMap.get(expKey);
        }

        // Nếu tìm thấy trong kho đề chuẩn
        if (match) {
          if (!nowHasQText && match.question) {
            q.question = match.question;
            cardChanged = true;
          }
          if (!nowHasOpts && match.options) {
            q.options = [...match.options];
            cardChanged = true;
          }
          if (!q.bilingual && match.bilingual) {
            q.bilingual = match.bilingual;
            cardChanged = true;
          }
          if ((!q.optionMeanings || q.optionMeanings.length === 0) && match.optionMeanings) {
            q.optionMeanings = [...match.optionMeanings];
            cardChanged = true;
          }
          if ((!q.vocabList || q.vocabList.length === 0) && match.vocabList && match.vocabList.length > 0) {
            q.vocabList = [...match.vocabList];
            cardChanged = true;
          }
        }
      }
    });

    return cardChanged;
  };

  customCards.forEach((c) => {
    if (processCard(c)) dirty = true;
  });

  Object.values(editedMap).forEach((c) => {
    if (processCard(c)) dirty = true;
  });

  return dirty;
}

/**
 * Chuẩn hóa tiêu đề bài đọc: Nếu tiêu đề chứa cụm "200 câu" / "bản chi tiết đầy đủ 200 câu" / "Full Reading",
 * tự động chuyển thành định dạng Part tương ứng (ví dụ: " - Part 5 (Câu 101 - 130)").
 */
export function normalizeReadingCardTitle(
  title: string,
  category: string,
  totalQuestions?: number
): string {
  if (!title) return title;
  const is200OrFull = /200\s*câu|bản chi tiết đầy đủ|full\s*reading/i.test(title);
  if (!is200OrFull && /-\s*Part\s*[567]/i.test(title)) return title;

  let baseTitle = title
    .replace(/\s*\((?:bản chi tiết đầy đủ\s*)?200\s*câu\)/gi, "")
    .replace(/\s*-\s*full\s*reading\s*(?:\([^\)]*\))?/gi, "")
    .replace(/\s*full\s*reading\s*(?:\([^\)]*\))?/gi, "")
    .replace(/\s*\(\s*200\s*câu\s*\)/gi, "")
    .replace(/\s*-\s*Part\s*[567]\s*(?:\([^\)]*\))?/gi, "")
    .replace(/[\s\-_]+$/, "")
    .trim();

  if (!baseTitle) baseTitle = "ETS TOEIC Reading";

  const cat = category.toLowerCase();
  if (cat === "part5" || cat === "grammar") {
    const qCount = totalQuestions && totalQuestions !== 30 ? `${totalQuestions} câu` : "Câu 101 - 130";
    return `${baseTitle} - Part 5 (${qCount})`;
  }
  if (cat === "part6") {
    const qCount = totalQuestions && totalQuestions !== 16 && totalQuestions !== 4 ? `${totalQuestions} câu` : "Câu 131 - 146";
    return `${baseTitle} - Part 6 (${qCount})`;
  }
  if (cat === "part7") {
    const qCount = totalQuestions && totalQuestions !== 54 && totalQuestions !== 2 ? `${totalQuestions} câu` : "Câu 147 - 200";
    return `${baseTitle} - Part 7 (${qCount})`;
  }
  return baseTitle;
}

/**
 * Tự động chuẩn hóa tiêu đề cho các bài đọc đã lưu trong localStorage nếu bị dính chữ 200 câu.
 */
function healReadingCardTitles(
  customCards: ExerciseCardData[],
  editedMap: Record<string, ExerciseCardData>
): boolean {
  let dirty = false;
  const processCard = (card: ExerciseCardData) => {
    const norm = normalizeReadingCardTitle(card.title, card.category, card.totalQuestions);
    if (norm !== card.title) {
      card.title = norm;
      dirty = true;
    }
  };
  customCards.forEach(processCard);
  Object.values(editedMap).forEach(processCard);
  return dirty;
}

/**
 * Bóc tách câu hỏi theo từng Part từ bộ câu hỏi tổng hợp
 */
function extractPartQuestionsFromPool(
  allQuestions: SampleQuestion[],
  part: "part5" | "part6" | "part7"
): SampleQuestion[] {
  if (!allQuestions || allQuestions.length === 0) return [];

  // 1. Phân loại theo số thứ tự chuẩn TOEIC ETS (101-130, 131-146, 147-200)
  const byExactNum = allQuestions.filter((q) => {
    const n = parseInt(q.questionNum || "0", 10);
    if (isNaN(n) || n === 0) return false;
    if (part === "part5") return n >= 101 && n <= 130;
    if (part === "part6") return n >= 131 && n <= 146;
    if (part === "part7") return n >= 147 && n <= 200;
    return false;
  });
  if (byExactNum.length > 0) {
    return byExactNum.map((q, idx) => ({
      ...q,
      questionNum: q.questionNum?.trim() || String((part === "part5" ? 101 : part === "part6" ? 131 : 147) + idx),
      passageText: part === "part5" ? undefined : q.passageText,
      passageTextVi: part === "part5" ? undefined : q.passageTextVi,
    }));
  }

  // 2. Nếu là danh sách 100 câu đọc (đánh số 1-100 hoặc unnumbered)
  if (allQuestions.length >= 70 && allQuestions.length <= 100) {
    let slice: SampleQuestion[] = [];
    let startNum = 101;
    if (part === "part5") {
      slice = allQuestions.slice(0, 30);
      startNum = 101;
    } else if (part === "part6") {
      slice = allQuestions.slice(30, 46);
      startNum = 131;
    } else if (part === "part7") {
      slice = allQuestions.slice(46);
      startNum = 147;
    }
    return slice.map((q, idx) => ({
      ...q,
      questionNum: String(startNum + idx),
      passageText: part === "part5" ? undefined : q.passageText,
      passageTextVi: part === "part5" ? undefined : q.passageTextVi,
    }));
  }

  // 3. Nếu là file 200 câu gồm 100 câu nghe phía trước
  if (allQuestions.length > 100) {
    const readingPortion = allQuestions.slice(allQuestions.length >= 200 ? 100 : 0);
    let slice: SampleQuestion[] = [];
    let startNum = 101;
    if (part === "part5") {
      slice = readingPortion.slice(0, 30);
      startNum = 101;
    } else if (part === "part6") {
      slice = readingPortion.slice(30, 46);
      startNum = 131;
    } else if (part === "part7") {
      slice = readingPortion.slice(46, 100);
      startNum = 147;
    }
    return slice.map((q, idx) => ({
      ...q,
      questionNum: String(startNum + idx),
      passageText: part === "part5" ? undefined : q.passageText,
      passageTextVi: part === "part5" ? undefined : q.passageTextVi,
    }));
  }

  return [];
}

/**
 * Tự động bóc tách các bài đọc 'Full Reading' / '200 câu' / '100 câu' thành 3 Part riêng biệt
 * (Part 5: 30 câu, Part 6: 16 câu, Part 7: 54 câu) và loại bỏ hoàn toàn thẻ nguyên khối.
 */
function autoSplitFullReadingCards(
  customCards: ExerciseCardData[],
  editedMap: Record<string, ExerciseCardData>
): boolean {
  let dirty = false;
  const cardsToAdd: ExerciseCardData[] = [];
  const cardsToRemove = new Set<string>();

  const processCard = (card: ExerciseCardData) => {
    const isFullReading =
      /full\s*reading|200\s*câu/i.test(card.title) ||
      card.totalQuestions >= 70 ||
      (card.sampleQuestions && card.sampleQuestions.length >= 70);

    if (!isFullReading) return;

    const sourceQs = card.sampleQuestions || [];
    const p5Qs = extractPartQuestionsFromPool(sourceQs, "part5");
    const p6Qs = extractPartQuestionsFromPool(sourceQs, "part6");
    const p7Qs = extractPartQuestionsFromPool(sourceQs, "part7");

    if (p5Qs.length === 0 && p6Qs.length === 0 && p7Qs.length === 0) return;

    const cleanBase = card.title
      .replace(/\s*\((?:bản chi tiết đầy đủ\s*)?200\s*câu\)/gi, "")
      .replace(/\s*-\s*full\s*reading\s*(?:\([^\)]*\))?/gi, "")
      .replace(/\s*full\s*reading\s*(?:\([^\)]*\))?/gi, "")
      .replace(/\s*\(\s*200\s*câu\s*\)/gi, "")
      .replace(/\s*-\s*Part\s*[567]\s*(?:\([^\)]*\))?/gi, "")
      .replace(/[\s\-_]+$/, "")
      .trim() || "ETS TOEIC";

    const baseTag = card.tag || "Thương mại & Hợp đồng";

    if (p5Qs.length > 0) {
      cardsToAdd.push({
        id: `reading-${cleanBase.toLowerCase().replace(/[^a-z0-9]/g, "-")}-part5`,
        title: `${cleanBase} - Part 5 (Câu 101 - 130)`,
        category: "part5",
        subCategory: "word_types",
        tag: baseTag,
        totalQuestions: p5Qs.length,
        studiedQuestions: 0,
        correctAnswers: 0,
        wrongAnswers: 0,
        status: card.status || "draft",
        vocabList: card.vocabList,
        detailsLoaded: true,
        theory: {
          summary: `Chuyên đề Part 5 gồm ${p5Qs.length} câu hoàn thành câu đơn (Incomplete Sentences) chuẩn cấu trúc TOEIC ETS.`,
          rules: [
            "Xác định từ loại xung quanh chỗ trống (danh từ, động từ, tính từ, trạng từ).",
            "Phân biệt câu hỏi ngữ pháp (nhìn dấu hiệu nhận biết) và câu hỏi từ vựng (cần dịch nghĩa).",
          ],
          example: p5Qs[0]?.question || "",
        },
        sampleQuestions: p5Qs,
      });
    }

    if (p6Qs.length > 0) {
      cardsToAdd.push({
        id: `reading-${cleanBase.toLowerCase().replace(/[^a-z0-9]/g, "-")}-part6`,
        title: `${cleanBase} - Part 6 (Câu 131 - 146)`,
        category: "part6",
        subCategory: "text_types",
        tag: baseTag,
        totalQuestions: p6Qs.length,
        studiedQuestions: 0,
        correctAnswers: 0,
        wrongAnswers: 0,
        status: card.status || "draft",
        passageText: card.passageText,
        passageTextVi: card.passageTextVi,
        vocabList: card.vocabList,
        detailsLoaded: true,
        theory: {
          summary: `Chuyên đề Part 6 gồm ${p6Qs.length} câu điền đoạn văn (Text Completion) gồm 4 bài đọc ngắn.`,
          rules: [
            "Đọc ngữ cảnh toàn câu và câu đứng trước/sau để chọn liên từ hoặc điền câu phù hợp.",
            "Chú ý thì của động từ và tính nhất quán của văn phong trong đoạn.",
          ],
          example: p6Qs[0]?.question || "",
        },
        sampleQuestions: p6Qs,
      });
    }

    if (p7Qs.length > 0) {
      cardsToAdd.push({
        id: `reading-${cleanBase.toLowerCase().replace(/[^a-z0-9]/g, "-")}-part7`,
        title: `${cleanBase} - Part 7 (Câu 147 - 200)`,
        category: "part7",
        subCategory: "text_types",
        tag: baseTag,
        totalQuestions: p7Qs.length,
        studiedQuestions: 0,
        correctAnswers: 0,
        wrongAnswers: 0,
        status: card.status || "draft",
        passageText: card.passageText,
        passageTextVi: card.passageTextVi,
        vocabList: card.vocabList,
        detailsLoaded: true,
        theory: {
          summary: `Chuyên đề Part 7 gồm ${p7Qs.length} câu đọc hiểu văn bản (Reading Comprehension) đơn và đa đoạn văn.`,
          rules: [
            "Đọc lướt (skimming) nắm chủ đề bài đọc và câu hỏi trước khi tìm chi tiết.",
            "Dò tìm từ khóa (scanning) và đối chiếu thông tin đối với bài đọc đôi/ba.",
          ],
          example: p7Qs[0]?.question || "",
        },
        sampleQuestions: p7Qs,
      });
    }

    cardsToRemove.add(card.id);
  };

  customCards.forEach(processCard);
  Object.values(editedMap).forEach(processCard);

  if (cardsToRemove.size > 0) {
    dirty = true;
    const remaining = customCards.filter((c) => !cardsToRemove.has(c.id));
    customCards.length = 0;
    customCards.push(...remaining, ...cardsToAdd);

    cardsToRemove.forEach((id) => {
      delete editedMap[id];
    });
  }

  return dirty;
}

/**
 * Tự động loại bỏ các bài đọc tự tạo (custom cards) bị nhân đôi (trùng lặp hoàn toàn
 * về tiêu đề, phần thi và nội dung câu hỏi). Bảo toàn bài tạo trước và gộp từ vựng nếu có.
 */
function deduplicateCustomReadingCards(cards: ExerciseCardData[]): boolean {
  let dirty = false;
  const seen = new Map<string, number>();
  const toRemoveIndices = new Set<number>();

  for (let i = 0; i < cards.length; i++) {
    const c = cards[i];
    // Chuẩn hóa tiêu đề trước khi tạo key
    const normalizedTitle = normalizeReadingCardTitle(c.title, c.category, c.totalQuestions);
    if (normalizedTitle !== c.title) {
      c.title = normalizedTitle;
      dirty = true;
    }

    const key = `${c.title.trim().toLowerCase()}_${c.category}_${c.totalQuestions}`;
    if (seen.has(key)) {
      const prevIdx = seen.get(key)!;
      const prevCard = cards[prevIdx];
      const cFilled = (c.sampleQuestions || []).filter((q) => q.question?.trim().length > 0).length;
      const prevFilled = (prevCard.sampleQuestions || []).filter((q) => q.question?.trim().length > 0).length;

      if (cFilled > prevFilled) {
        cards[prevIdx] = { ...c };
      } else if ((!prevCard.vocabList || prevCard.vocabList.length === 0) && (c.vocabList && c.vocabList.length > 0)) {
        prevCard.vocabList = c.vocabList;
      }
      toRemoveIndices.add(i);
      dirty = true;
    } else {
      seen.set(key, i);
    }
  }

  if (dirty) {
    const filtered = cards.filter((_, idx) => !toRemoveIndices.has(idx));
    cards.length = 0;
    cards.push(...filtered);
  }

  return dirty;
}

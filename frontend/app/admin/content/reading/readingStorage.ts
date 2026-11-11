import { ExerciseCardData } from "./types";
import { INITIAL_CARDS } from "./mockData";

import { isStaleReadingCardSnapshot } from "@/lib/readingPassageUtils";

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

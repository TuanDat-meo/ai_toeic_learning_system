import type { ExerciseCardData, ReadingSubPassage, SampleQuestion } from "@/app/admin/content/reading/types";

export interface ExtractedPassageBlock {
  label: string;
  text: string;
  textVi?: string;
  questionNums: string[];
}

const PLACEHOLDER_PASSAGE_RE =
  /^(?:questions?\s*\d{1,3}(?:\s*[-–—to]+\s*\d{1,3})?(?:\s+refer\s+to\s+the\s+following\s+[^.\n]+\.?)?|reading\s+passage(?:\s+\d+)?|passage\s+\d+|đoạn\s+văn(?:\s+\d+)?|nội\s+dung\s+đoạn\s+văn|bản\s+dịch\s+ngữ\s+cảnh\s+đoạn\s+văn[^.\n]*\.?|chưa\s+có\s+nội\s+dung[^.\n]*\.?)$/i;

/**
 * Returns true if the text is empty or a synthetic placeholder (e.g. "Questions 131 - 134").
 */
export function isPlaceholderPassageText(text?: string | null): boolean {
  if (!text) return true;
  const trimmed = text.replace(/\s+/g, " ").trim();
  if (!trimmed || trimmed.length < 25) return true;
  return PLACEHOLDER_PASSAGE_RE.test(trimmed);
}

/**
 * Normalizes passage content into a stable grouping key so questions sharing the same
 * passage group together even if titles repeat across topic/level cards.
 */
export function getPassageFingerprint(
  q: Pick<SampleQuestion, "passageText" | "passageTitle" | "passages">,
  fallbackText?: string
): string {
  const validSubs = (q.passages || []).filter((p) => !isPlaceholderPassageText(p.text));
  if (validSubs.length > 0) {
    return validSubs
      .map((p) => p.text.replace(/\s+/g, " ").trim().toLowerCase())
      .join("||");
  }

  const raw = !isPlaceholderPassageText(q.passageText)
    ? q.passageText!.trim()
    : !isPlaceholderPassageText(fallbackText)
    ? fallbackText!.trim()
    : "";

  if (!raw) {
    return `__title__:${(q.passageTitle || "").trim().toLowerCase()}`;
  }
  return raw.replace(/\s+/g, " ").toLowerCase();
}

/**
 * Collects all unique genuine passage blocks from a reading card (including sub-passages inside sampleQuestions).
 */
export function extractCardPassageBlocks(card: ExerciseCardData): ExtractedPassageBlock[] {
  const blocksByKey = new Map<string, ExtractedPassageBlock>();

  const upsertBlock = (key: string, label: string, text: string, textVi?: string, qNum?: string) => {
    const cleanText = text.trim();
    const cleanVi = textVi && !isPlaceholderPassageText(textVi) ? textVi.trim() : undefined;
    const existing = blocksByKey.get(key);
    if (existing) {
      if (!existing.textVi && cleanVi) existing.textVi = cleanVi;
      if (qNum && !existing.questionNums.includes(qNum)) existing.questionNums.push(qNum);
      return;
    }
    blocksByKey.set(key, {
      label: label.trim() || `Đoạn văn ${blocksByKey.size + 1}`,
      text: cleanText,
      textVi: cleanVi,
      questionNums: qNum ? [qNum] : [],
    });
  };

  if (card.passages && card.passages.length > 0) {
    card.passages.forEach((p, idx) => {
      if (!isPlaceholderPassageText(p.text)) {
        const key = p.text.replace(/\s+/g, " ").trim().toLowerCase();
        upsertBlock(key, p.label || `Đoạn văn ${idx + 1}`, p.text, p.textVi);
      }
    });
  }

  (card.sampleQuestions || []).forEach((q, qIdx) => {
    const qNum = q.questionNum || String(qIdx + 1);
    const validSubs: ReadingSubPassage[] = (q.passages || []).filter(
      (sp) => !isPlaceholderPassageText(sp.text)
    );
    if (validSubs.length > 0) {
      validSubs.forEach((sp, spIdx) => {
        const key = sp.text.replace(/\s+/g, " ").trim().toLowerCase();
        const label =
          q.passageTitle && validSubs.length === 1
            ? q.passageTitle
            : sp.label || `${q.passageTitle || "Đoạn văn"} · Phần ${spIdx + 1}`;
        upsertBlock(key, label, sp.text, sp.textVi, qNum);
      });
      return;
    }

    if (!isPlaceholderPassageText(q.passageText)) {
      const key = q.passageText!.replace(/\s+/g, " ").trim().toLowerCase();
      upsertBlock(
        key,
        q.passageTitle || `Đoạn văn #${qNum}`,
        q.passageText!,
        q.passageTextVi,
        qNum
      );
    }
  });

  if (blocksByKey.size === 0 && !isPlaceholderPassageText(card.passageText)) {
    const key = card.passageText!.replace(/\s+/g, " ").trim().toLowerCase();
    upsertBlock(key, "Nội dung đoạn văn", card.passageText!, card.passageTextVi);
  }

  return Array.from(blocksByKey.values());
}

/**
 * Formats a concise human-readable Part badge label without falling back blindly to Part 7.
 */
export function formatReadingPartLabel(
  card: Pick<ExerciseCardData, "category"> & { part?: string }
): string {
  if (card.part && card.part.trim()) return card.part.trim();
  switch (card.category) {
    case "part5":
      return "Part 5";
    case "part6":
      return "Part 6";
    case "part7":
      return "Part 7";
    case "grammar":
      return "Ngữ pháp";
    default:
      return "Part 7";
  }
}

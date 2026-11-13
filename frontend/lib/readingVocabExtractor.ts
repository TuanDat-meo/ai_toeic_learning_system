import { VocabItem } from "@/app/admin/content/reading/types";
import { RICH_TOEIC_DICTIONARY, lookupWordDetail } from "@/components/admin/content/reading/richDictionaryData";
import { CURATED_TOEIC_VOCAB } from "@/lib/toeicVocabDetailEnricher";
import { TOEIC_VOCAB_DICT } from "@/lib/toeicQuestionEnricher";
import { lookupEnglishDictionary } from "@/lib/api/english-dictionary";
import { normalizeVocabularyPartOfSpeech } from "@/lib/vocabulary-part-of-speech";

export interface ReadingSubPassageLike {
  label?: string;
  text?: string;
  textVi?: string;
}

export interface ReadingQuestionLike {
  questionNum?: string | number;
  question?: string;
  questionText?: string;
  passageText?: string;
  passages?: ReadingSubPassageLike[];
  options?: unknown;
  vocabList?: VocabItem[];
}

export interface ReadingVocabCandidate {
  id: string;
  word: string;
  surfaceForm: string;
  sources: string[];
  hasPassageSource: boolean;
  hasQuestionSource: boolean;
  contextSentence: string;
  suggestedQuestionIndex: number | null;
  occurrences: number;
  inCuratedDict: boolean;
  alreadyAdded: boolean;
  previewMeaning?: string;
  previewPos?: string;
  previewIpa?: string;
  score: number;
}

const STOPWORDS = new Set([
  "the", "and", "for", "with", "this", "that", "these", "those", "from", "into", "onto", "upon",
  "about", "above", "below", "over", "under", "through", "between", "among", "until", "while",
  "during", "before", "after", "since", "because", "although", "though", "unless", "whether",
  "when", "where", "what", "which", "whom", "whose", "who", "how", "why", "will", "would",
  "shall", "should", "could", "might", "must", "have", "has", "had", "having", "been", "being",
  "were", "was", "are", "is", "am", "not", "only", "also", "very", "just", "even", "still",
  "more", "most", "much", "many", "some", "any", "each", "every", "all", "both", "few",
  "several", "other", "another", "such", "same", "own", "than", "then", "here", "there",
  "they", "them", "their", "theirs", "themselves", "she", "her", "hers", "herself", "he",
  "him", "his", "himself", "its", "itself", "you", "your", "yours", "yourself", "yourselves",
  "our", "ours", "ourselves", "we", "us", "out", "off", "per", "via", "etc", "too", "yet",
  "nor", "but", "either", "neither", "can", "cannot", "does", "did", "doing", "done", "do",
  "make", "made", "take", "took", "taken", "give", "gave", "given", "get", "got", "one", "two",
  "three", "four", "five", "six", "seven", "eight", "nine", "ten", "first", "second", "third",
  "next", "last", "new", "old", "good", "well", "better", "best", "high", "low", "big", "small",
  "long", "short", "part", "text", "read", "question", "questions", "answer", "choose", "select",
  "best", "following", "according", "indicated", "stated", "mentioned", "probably", "likely",
  "most", "true", "false", "following", "word", "phrase", "blank", "sentence", "paragraph",
  "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday",
  "january", "february", "march", "april", "may", "june", "july", "august", "september",
  "october", "november", "december",
  "mrs", "ms", "mr", "dr", "inc", "ltd", "llc", "corp", "com", "org", "net", "edu", "www", "http", "https",
  "dear", "regards", "sincerely", "hello", "hi", "please", "thank", "thanks", "welcome",
  "option", "options", "a", "b", "c", "d", "pm", "am",
]);

const TOEIC_MULTIWORD_PHRASES: Array<{ phrase: string; pos: string; meaning: string }> = [
  { phrase: "prior to", pos: "prep", meaning: "trước khi (trang trọng)" },
  { phrase: "in accordance with", pos: "prep", meaning: "theo đúng, phù hợp với (quy định)" },
  { phrase: "on behalf of", pos: "prep", meaning: "thay mặt cho" },
  { phrase: "look forward to", pos: "phr", meaning: "mong đợi, trông chờ" },
  { phrase: "due to", pos: "prep", meaning: "do, bởi vì" },
  { phrase: "in addition", pos: "adv", meaning: "ngoài ra, thêm vào đó" },
  { phrase: "with regard to", pos: "prep", meaning: "liên quan đến, về việc" },
  { phrase: "according to", pos: "prep", meaning: "theo như" },
  { phrase: "regardless of", pos: "prep", meaning: "bất kể, không phân biệt" },
  { phrase: "instead of", pos: "prep", meaning: "thay vì" },
  { phrase: "subject to", pos: "adj", meaning: "tùy thuộc vào, phải chịu (điều kiện/phí)" },
  { phrase: "eligible for", pos: "adj", meaning: "đủ điều kiện cho" },
  { phrase: "comply with", pos: "v", meaning: "tuân thủ theo" },
  { phrase: "responsible for", pos: "adj", meaning: "chịu trách nhiệm về" },
  { phrase: "be advised", pos: "phr", meaning: "xin lưu ý, được thông báo" },
  { phrase: "out of stock", pos: "adj", meaning: "hết hàng" },
  { phrase: "out of service", pos: "adj", meaning: "ngừng hoạt động, đang bảo trì" },
  { phrase: "in advance", pos: "adv", meaning: "trước (đặt trước / báo trước)" },
  { phrase: "at no extra charge", pos: "phr", meaning: "không mất thêm phụ phí" },
  { phrase: "free of charge", pos: "phr", meaning: "miễn phí" },
  { phrase: "up to date", pos: "adj", meaning: "cập nhật mới nhất" },
  { phrase: "ahead of schedule", pos: "phr", meaning: "sớm hơn tiến độ dự kiến" },
  { phrase: "on schedule", pos: "phr", meaning: "đúng lịch trình" },
  { phrase: "behind schedule", pos: "phr", meaning: "chậm tiến độ" },
  { phrase: "take advantage of", pos: "phr", meaning: "tận dụng" },
  { phrase: "carry out", pos: "v", meaning: "tiến hành, thực hiện" },
  { phrase: "set up", pos: "v", meaning: "thiết lập, lắp đặt" },
  { phrase: "fill out", pos: "v", meaning: "điền vào (biểu mẫu)" },
  { phrase: "hand in", pos: "v", meaning: "nộp (bài / tài liệu)" },
  { phrase: "sign up", pos: "v", meaning: "đăng ký tham gia" },
  { phrase: "follow up", pos: "v", meaning: "theo dõi tiếp, kiểm tra lại" },
  { phrase: "cut down on", pos: "v", meaning: "cắt giảm" },
  { phrase: "keep track of", pos: "phr", meaning: "theo dõi, nắm bắt thông tin" },
  { phrase: "along with", pos: "prep", meaning: "cùng với, kèm theo" },
  { phrase: "as requested", pos: "phr", meaning: "theo như yêu cầu" },
  { phrase: "please note", pos: "phr", meaning: "xin vui lòng lưu ý" },
  { phrase: "in order to", pos: "conj", meaning: "để mà (chỉ mục đích)" },
  { phrase: "so that", pos: "conj", meaning: "để mà" },
  { phrase: "no longer", pos: "adv", meaning: "không còn nữa" },
];

const CURATED_PHRASE_MAP = new Map<string, { pos: string; meaning: string }>();
for (const entry of TOEIC_MULTIWORD_PHRASES) {
  CURATED_PHRASE_MAP.set(entry.phrase.toLowerCase(), { pos: entry.pos, meaning: entry.meaning });
}
for (const [key, val] of Object.entries(CURATED_TOEIC_VOCAB)) {
  if (key.includes(" ") && val.meaning) {
    CURATED_PHRASE_MAP.set(key.toLowerCase(), {
      pos: val.pos || "phr",
      meaning: val.meaning,
    });
  }
}

const enrichedWordCache = new Map<string, VocabItem>();

export function normalizeReadingPos(raw?: string | null): string {
  if (!raw?.trim()) return "n";
  const normalized = normalizeVocabularyPartOfSpeech(raw).toLowerCase();
  const mapSegment = (seg: string): string => {
    const clean = seg.trim().replace(/\.+$/, "");
    if (clean === "noun" || clean === "n") return "n";
    if (clean === "verb" || clean === "v" || clean.includes("verb")) return "v";
    if (clean === "adjective" || clean === "adj" || clean === "a") return "adj";
    if (clean === "adverb" || clean === "adv") return "adv";
    if (clean === "preposition" || clean === "prep") return "prep";
    if (clean === "conjunction" || clean === "conj") return "conj";
    if (clean === "pronoun" || clean === "pron") return "pron";
    if (clean === "determiner" || clean === "det") return "det";
    if (clean === "phrase" || clean === "phr") return "phr";
    return clean || "n";
  };

  const parts = normalized.split(/\s*\/\s*/).map(mapSegment).filter(Boolean);
  return [...new Set(parts)].join(" / ") || "n";
}

export function toModalPosSelectValue(raw?: string | null): string {
  const shortPos = normalizeReadingPos(raw).split(" / ")[0];
  switch (shortPos) {
    case "v":
      return "Verb";
    case "adj":
      return "Adjective";
    case "adv":
      return "Adverb";
    case "prep":
      return "Preposition";
    case "conj":
      return "Conjunction";
    case "n":
    default:
      return "Noun";
  }
}

export function extractOptionStrings(options: unknown): string[] {
  if (!options) return [];
  if (Array.isArray(options)) {
    return options
      .map((opt) => {
        if (typeof opt === "string") return opt.trim();
        if (opt && typeof opt === "object" && "text" in opt && typeof (opt as { text?: unknown }).text === "string") {
          return String((opt as { text: string }).text).trim();
        }
        return "";
      })
      .filter(Boolean);
  }
  if (typeof options === "object") {
    return Object.entries(options as Record<string, unknown>)
      .map(([, value]) => (typeof value === "string" ? value.trim() : ""))
      .filter(Boolean);
  }
  return [];
}

function getInflectionCandidates(word: string): string[] {
  const lower = word.toLowerCase().trim();
  const candidates = new Set<string>([lower]);

  if (lower.endsWith("ies") && lower.length > 4) {
    candidates.add(`${lower.slice(0, -3)}y`);
  }
  if (lower.endsWith("es") && lower.length > 4) {
    candidates.add(lower.slice(0, -2));
    candidates.add(lower.slice(0, -1));
  }
  if (lower.endsWith("s") && lower.length > 3 && !lower.endsWith("ss")) {
    candidates.add(lower.slice(0, -1));
  }
  if (lower.endsWith("ied") && lower.length > 4) {
    candidates.add(`${lower.slice(0, -3)}y`);
  }
  if (lower.endsWith("ed") && lower.length > 4) {
    const stem = lower.slice(0, -2);
    candidates.add(stem);
    candidates.add(`${stem}e`);
    if (stem.length >= 2 && stem[stem.length - 1] === stem[stem.length - 2]) {
      candidates.add(stem.slice(0, -1));
    }
  }
  if (lower.endsWith("ing") && lower.length > 5) {
    const stem = lower.slice(0, -3);
    candidates.add(stem);
    candidates.add(`${stem}e`);
    if (stem.length >= 2 && stem[stem.length - 1] === stem[stem.length - 2]) {
      candidates.add(stem.slice(0, -1));
    }
  }

  return [...candidates].filter((c) => c.length >= 2);
}

interface CuratedLookupMatch {
  matchedKey: string;
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

function lookupCuratedSync(rawWord: string): CuratedLookupMatch | null {
  const clean = rawWord.trim().toLowerCase().replace(/^['"-]+|['"-]+$/g, "");
  if (!clean) return null;

  const tryKeys = getInflectionCandidates(clean);
  for (const key of tryKeys) {
    const rich = RICH_TOEIC_DICTIONARY[key];
    if (rich) {
      return {
        matchedKey: key,
        word: rich.word || key,
        pos: normalizeReadingPos(rich.pos),
        level: "B2",
        ipa: rich.usIpa || rich.ukIpa || "",
        meaning: rich.contextMeaning,
        example: rich.exampleEn ? { en: rich.exampleEn, vi: rich.exampleVi || "" } : undefined,
        collocations: rich.collocations?.map((c) => ({ en: c.phrase, vi: c.meaning })),
        synonyms: rich.synonyms?.map((s) => ({ en: s.word, vi: s.meaning })),
        antonyms: rich.antonyms?.map((a) => ({ en: a.word, vi: a.meaning })),
        wordFamily: rich.wordFamily,
      };
    }

    const toeicDict = TOEIC_VOCAB_DICT[key];
    if (toeicDict) {
      return {
        matchedKey: key,
        word: toeicDict.word || key,
        pos: normalizeReadingPos(toeicDict.pos),
        level: toeicDict.cefrLevel || "B1",
        ipa: toeicDict.ipa || "",
        meaning: toeicDict.meaning,
        example: toeicDict.example,
      };
    }

    const curated = CURATED_TOEIC_VOCAB[key];
    if (curated && curated.meaning) {
      return {
        matchedKey: key,
        word: curated.word || key,
        pos: normalizeReadingPos(curated.pos),
        level: curated.level || "B1",
        ipa: curated.ipa || "",
        meaning: curated.meaning,
        example: curated.example,
        collocations: curated.collocations,
        synonyms: curated.synonyms,
      };
    }

    const phraseCurated = CURATED_PHRASE_MAP.get(key);
    if (phraseCurated) {
      return {
        matchedKey: key,
        word: key,
        pos: normalizeReadingPos(phraseCurated.pos),
        level: "B1",
        ipa: "",
        meaning: phraseCurated.meaning,
      };
    }
  }

  return null;
}

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[\.\!\?\n])\s+/)
    .map((s) => s.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

function findContextSentence(segments: Array<{ text: string }>, tokenLower: string): string {
  const escaped = tokenLower.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`\\b${escaped}\\b`, "i");
  for (const seg of segments) {
    for (const sentence of splitSentences(seg.text)) {
      if (regex.test(sentence) && sentence.length >= 12) {
        return sentence.length > 220 ? `${sentence.slice(0, 217)}...` : sentence;
      }
    }
  }
  return "";
}

function isSentenceStart(text: string, index: number): boolean {
  if (index <= 0) return true;
  let i = index - 1;
  while (i >= 0 && /\s/.test(text[i])) i--;
  if (i < 0) return true;
  return /[\.\!\?\n\:\[\(\"\'\—]/.test(text[i]);
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function cleanInputText(text: string): string {
  return text
    .replace(/\[(?:\d{1,3}|blank)\]/gi, " ")
    .replace(/_{2,}|-{3,}/g, " ")
    .replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, " ")
    .replace(/https?:\/\/\S+/g, " ");
}

export function extractReadingVocabCandidates(input: {
  passageText?: string;
  passages?: ReadingSubPassageLike[];
  questions?: ReadingQuestionLike[];
  existingWords?: string[];
  maxCandidates?: number;
}): ReadingVocabCandidate[] {
  const existingSet = new Set(
    (input.existingWords || []).map((w) => w.trim().toLowerCase()).filter(Boolean)
  );
  (input.questions || []).forEach((q) => {
    (q.vocabList || []).forEach((v) => {
      if (v.word?.trim()) existingSet.add(v.word.trim().toLowerCase());
    });
  });

  type Segment = {
    text: string;
    sourceLabel: string;
    isPassage: boolean;
    isQuestion: boolean;
    questionIndex: number | null;
  };

  const segments: Segment[] = [];
  if (input.passageText?.trim()) {
    segments.push({
      text: input.passageText.trim(),
      sourceLabel: "Đoạn văn",
      isPassage: true,
      isQuestion: false,
      questionIndex: null,
    });
  }
  if (input.passages && input.passages.length > 0) {
    input.passages.forEach((p, idx) => {
      if (p.text?.trim()) {
        segments.push({
          text: p.text.trim(),
          sourceLabel: p.label?.trim() || `Đoạn ${idx + 1}`,
          isPassage: true,
          isQuestion: false,
          questionIndex: null,
        });
      }
    });
  }

  (input.questions || []).forEach((q, qIdx) => {
    const qLabel = q.questionNum ? `Câu ${q.questionNum}` : `Câu ${qIdx + 1}`;
    if (q.passageText?.trim() && q.passageText.trim() !== input.passageText?.trim()) {
      segments.push({
        text: q.passageText.trim(),
        sourceLabel: `Đoạn văn (${qLabel})`,
        isPassage: true,
        isQuestion: false,
        questionIndex: qIdx,
      });
    }
    if (q.passages && q.passages.length > 0) {
      q.passages.forEach((p) => {
        if (p.text?.trim()) {
          segments.push({
            text: p.text.trim(),
            sourceLabel: `${p.label || "Đoạn"} (${qLabel})`,
            isPassage: true,
            isQuestion: false,
            questionIndex: qIdx,
          });
        }
      });
    }
    const qText = (q.question || q.questionText || "").trim();
    if (qText) {
      segments.push({
        text: qText,
        sourceLabel: qLabel,
        isPassage: false,
        isQuestion: true,
        questionIndex: qIdx,
      });
    }
    const optStrings = extractOptionStrings(q.options);
    if (optStrings.length > 0) {
      segments.push({
        text: optStrings.join(". "),
        sourceLabel: `Đáp án ${qLabel}`,
        isPassage: false,
        isQuestion: true,
        questionIndex: qIdx,
      });
    }
  });

  if (segments.length === 0) return [];

  interface Accumulator {
    canonical: string;
    surfaceForm: string;
    sources: Set<string>;
    hasPassageSource: boolean;
    hasQuestionSource: boolean;
    firstQuestionIndex: number | null;
    occurrences: number;
    sawLowercase: boolean;
    sawMidSentenceCapitalOnly: boolean;
    isPhrase: boolean;
  }

  const accMap = new Map<string, Accumulator>();

  const registerToken = (
    rawToken: string,
    seg: Segment,
    options: { midSentenceCap: boolean; isPhrase?: boolean }
  ) => {
    const clean = rawToken.trim().toLowerCase().replace(/^['"-]+|['"-]+$/g, "");
    if (!clean || clean.length < 3) return;
    if (!options.isPhrase && STOPWORDS.has(clean)) return;
    if (/^\d+$/.test(clean)) return;

    const existing = accMap.get(clean);
    if (existing) {
      existing.occurrences += 1;
      existing.sources.add(seg.sourceLabel);
      existing.hasPassageSource = existing.hasPassageSource || seg.isPassage;
      existing.hasQuestionSource = existing.hasQuestionSource || seg.isQuestion;
      if (existing.firstQuestionIndex === null && seg.questionIndex !== null) {
        existing.firstQuestionIndex = seg.questionIndex;
      }
      if (!options.midSentenceCap) {
        existing.sawLowercase = true;
        existing.sawMidSentenceCapitalOnly = false;
      }
      return;
    }

    accMap.set(clean, {
      canonical: clean,
      surfaceForm: rawToken.trim(),
      sources: new Set([seg.sourceLabel]),
      hasPassageSource: seg.isPassage,
      hasQuestionSource: seg.isQuestion,
      firstQuestionIndex: seg.questionIndex,
      occurrences: 1,
      sawLowercase: !options.midSentenceCap,
      sawMidSentenceCapitalOnly: options.midSentenceCap,
      isPhrase: Boolean(options.isPhrase),
    });
  };

  for (const seg of segments) {
    const sanitized = cleanInputText(seg.text);

    // 1. Multi-word TOEIC phrases
    for (const [phrase] of CURATED_PHRASE_MAP) {
      const phraseRegex = new RegExp(`\\b${escapeRegExp(phrase)}\\b`, "gi");
      if (phraseRegex.test(sanitized)) {
        registerToken(phrase, seg, { midSentenceCap: false, isPhrase: true });
      }
    }

    // 2. Single words
    const wordRegex = /\b([A-Za-z][A-Za-z'-]{2,})\b/g;
    let match: RegExpExecArray | null;
    while ((match = wordRegex.exec(sanitized)) !== null) {
      let token = match[1];
      if (token.endsWith("'s") || token.endsWith("’s")) {
        token = token.slice(0, -2);
      }
      token = token.replace(/^['"-]+|['"-]+$/g, "");
      if (token.length < 3 || token.includes("'")) continue;

      const startsUpper = /^[A-Z]/.test(token) && !/^[A-Z]{2,}$/.test(token);
      const midSentenceCap = startsUpper && !isSentenceStart(sanitized, match.index);
      registerToken(token, seg, { midSentenceCap, isPhrase: false });
    }
  }

  const results: ReadingVocabCandidate[] = [];
  for (const acc of accMap.values()) {
    const curated = lookupCuratedSync(acc.canonical);
    const inCuratedDict = Boolean(curated);

    // Filter out likely proper names unless in curated TOEIC dictionaries
    if (acc.sawMidSentenceCapitalOnly && !acc.sawLowercase && !inCuratedDict && !acc.isPhrase) {
      continue;
    }

    // Choose display word: curated lemma if singular/base matches cleanly without dropping -ly/-ive/-able adverbs/adjectives
    const displayWord = curated
      ? curated.word
      : acc.canonical;

    const alreadyAdded =
      existingSet.has(acc.canonical) || existingSet.has(displayWord.toLowerCase());

    let score = 0;
    if (inCuratedDict) score += 38;
    if (acc.hasQuestionSource) score += 18;
    if (acc.hasPassageSource) score += 8;
    if (acc.isPhrase) score += 16;
    score += Math.min(acc.occurrences * 6, 18);
    if (displayWord.length >= 7) score += 10;
    else if (displayWord.length >= 5) score += 5;
    if (/(?:tion|sion|ment|ance|ence|ity|ive|ous|able|ible|ize|ate|ship)$/i.test(displayWord)) {
      score += 8;
    }

    const contextSentence = findContextSentence(segments, acc.canonical);

    results.push({
      id: acc.canonical,
      word: displayWord,
      surfaceForm: acc.surfaceForm,
      sources: [...acc.sources],
      hasPassageSource: acc.hasPassageSource,
      hasQuestionSource: acc.hasQuestionSource,
      contextSentence,
      suggestedQuestionIndex: acc.firstQuestionIndex,
      occurrences: acc.occurrences,
      inCuratedDict,
      alreadyAdded,
      previewMeaning: curated?.meaning,
      previewPos: curated?.pos,
      previewIpa: curated?.ipa,
      score,
    });
  }

  // Deduplicate if both surfaceForm and curated lemma produced identical displayWord
  const deduped = new Map<string, ReadingVocabCandidate>();
  for (const cand of results) {
    const key = cand.word.toLowerCase();
    const prev = deduped.get(key);
    if (!prev) {
      deduped.set(key, cand);
    } else {
      prev.sources = [...new Set([...prev.sources, ...cand.sources])];
      prev.hasPassageSource = prev.hasPassageSource || cand.hasPassageSource;
      prev.hasQuestionSource = prev.hasQuestionSource || cand.hasQuestionSource;
      prev.occurrences += cand.occurrences;
      prev.alreadyAdded = prev.alreadyAdded || cand.alreadyAdded;
      prev.score = Math.max(prev.score, cand.score) + 4;
      if (!prev.contextSentence && cand.contextSentence) {
        prev.contextSentence = cand.contextSentence;
      }
      if (prev.suggestedQuestionIndex === null && cand.suggestedQuestionIndex !== null) {
        prev.suggestedQuestionIndex = cand.suggestedQuestionIndex;
      }
    }
  }

  const maxCandidates = input.maxCandidates ?? 36;
  return [...deduped.values()]
    .sort((a, b) => {
      if (a.alreadyAdded !== b.alreadyAdded) return a.alreadyAdded ? 1 : -1;
      if (a.inCuratedDict !== b.inCuratedDict) return a.inCuratedDict ? -1 : 1;
      if (a.score !== b.score) return b.score - a.score;
      return a.word.localeCompare(b.word);
    })
    .slice(0, maxCandidates);
}

export async function enrichReadingVocabWord(
  rawWord: string,
  options?: {
    contextSentence?: string;
    posHint?: string;
    existingMeaning?: string;
    existingIpa?: string;
    signal?: AbortSignal;
  }
): Promise<VocabItem> {
  const cleanWord = rawWord.trim();
  const cacheKey = cleanWord.toLowerCase();
  if (enrichedWordCache.has(cacheKey) && !options?.existingMeaning) {
    const cached = enrichedWordCache.get(cacheKey)!;
    return {
      ...cached,
      example: cached.example?.en
        ? cached.example
        : options?.contextSentence
          ? { en: options.contextSentence, vi: "" }
          : undefined,
    };
  }

  const curated = lookupCuratedSync(cleanWord);
  const richFallback = curated ? lookupWordDetail(curated.matchedKey) : lookupWordDetail(cleanWord);
  const isSyntheticFallback =
    richFallback.contextMeaning.startsWith("Thuật ngữ TOEIC:") ||
    richFallback.usIpa === `/${cleanWord.toLowerCase()}/`;

  let dictPhonetic = "";
  let dictMeaning = "";
  let dictPos = "";
  let dictExample = "";

  const shouldQueryApi = !curated || !curated.ipa || !curated.meaning || isSyntheticFallback;
  if (shouldQueryApi) {
    const lookupOrder = [cleanWord, ...getInflectionCandidates(cleanWord).filter((c) => c !== cleanWord.toLowerCase())];
    for (const candidateWord of lookupOrder.slice(0, 3)) {
      if (options?.signal?.aborted) break;
      try {
        const suggestion = await lookupEnglishDictionary(candidateWord, options?.signal);
        dictPhonetic = suggestion.phonetic || "";
        const bestMeaning =
          suggestion.meanings.find((m) => m.meaningLanguage === "vi") ||
          suggestion.meanings[0];
        if (bestMeaning) {
          dictMeaning = bestMeaning.definition;
          dictPos = bestMeaning.partOfSpeech;
          dictExample = bestMeaning.example || "";
        }
        break;
      } catch (err) {
        if (options?.signal?.aborted) throw err;
        // Try next stem or gracefully fall back to offline curated / context
      }
    }
  }

  const finalWord = curated?.word || cleanWord;
  const finalPos = normalizeReadingPos(
    options?.posHint || curated?.pos || dictPos || richFallback.pos || "n"
  );
  const finalIpa =
    options?.existingIpa ||
    curated?.ipa ||
    dictPhonetic ||
    (!isSyntheticFallback ? richFallback.usIpa : "");

  const finalMeaning =
    options?.existingMeaning?.trim() ||
    curated?.meaning ||
    dictMeaning ||
    `Từ vựng TOEIC (${finalPos})`;

  const finalExample =
    curated?.example ||
    (options?.contextSentence
      ? { en: options.contextSentence, vi: "" }
      : dictExample
        ? { en: dictExample, vi: "" }
        : !isSyntheticFallback && richFallback.exampleEn
          ? { en: richFallback.exampleEn, vi: richFallback.exampleVi || "" }
          : undefined);

  const item: VocabItem = {
    word: finalWord,
    pos: finalPos,
    level: curated?.level || (curated ? "B2" : "B1"),
    ipa: finalIpa,
    meaning: finalMeaning,
    example: finalExample,
    collocations:
      curated?.collocations ||
      (!isSyntheticFallback ? richFallback.collocations?.map((c) => ({ en: c.phrase, vi: c.meaning })) : undefined),
    synonyms:
      curated?.synonyms ||
      (!isSyntheticFallback ? richFallback.synonyms?.map((s) => ({ en: s.word, vi: s.meaning })) : undefined),
    antonyms:
      curated?.antonyms ||
      (!isSyntheticFallback ? richFallback.antonyms?.map((a) => ({ en: a.word, vi: a.meaning })) : undefined),
    wordFamily: !isSyntheticFallback ? richFallback.wordFamily : undefined,
  };

  enrichedWordCache.set(cacheKey, item);
  return item;
}

export async function enrichReadingVocabBatch(
  candidates: Array<{ word: string; contextSentence?: string }>,
  concurrency = 4,
  signal?: AbortSignal
): Promise<Map<string, VocabItem>> {
  const resultMap = new Map<string, VocabItem>();
  let cursor = 0;

  const workers = Array.from({ length: Math.min(concurrency, Math.max(1, candidates.length)) }, async () => {
    while (cursor < candidates.length) {
      if (signal?.aborted) break;
      const idx = cursor++;
      const entry = candidates[idx];
      const item = await enrichReadingVocabWord(entry.word, {
        contextSentence: entry.contextSentence,
        signal,
      });
      resultMap.set(entry.word.toLowerCase(), item);
    }
  });

  await Promise.all(workers);
  return resultMap;
}

export function enrichInlineParsedVocab(raw: VocabItem): VocabItem {
  const curated = lookupCuratedSync(raw.word);
  const rawIpa = raw.ipa && raw.ipa !== "/.../" ? raw.ipa.trim() : "";
  const rawMeaning = raw.meaning && raw.meaning !== "Từ vựng trọng tâm" ? raw.meaning.trim() : "";
  return {
    ...raw,
    word: raw.word.trim(),
    pos: normalizeReadingPos(raw.pos || curated?.pos || "n"),
    level: raw.level || curated?.level || "B1",
    ipa: rawIpa || curated?.ipa || "",
    meaning: rawMeaning || curated?.meaning || "Từ vựng trọng tâm",
    example: raw.example || curated?.example,
    collocations: raw.collocations || curated?.collocations,
    synonyms: raw.synonyms || curated?.synonyms,
    antonyms: raw.antonyms || curated?.antonyms,
    wordFamily: raw.wordFamily || curated?.wordFamily,
  };
}

export function normalizeVocabItem(raw: unknown): VocabItem | null {
  if (!raw || typeof raw !== "object") return null;
  const v = raw as Record<string, unknown>;
  const word = String(v.word || v.term || "").trim();
  if (!word) return null;

  const rawPos = String(v.pos || v.partOfSpeech || v.type || "n");
  const pos = normalizeReadingPos(rawPos);

  let example: { en: string; vi: string } | undefined = undefined;
  if (v.example && typeof v.example === "object") {
    const ex = v.example as Record<string, unknown>;
    example = {
      en: String(ex.en || ex.exampleEn || "").trim(),
      vi: String(ex.vi || ex.exampleVi || "").trim(),
    };
  } else if (v.exampleEn || v.exampleVi) {
    example = {
      en: String(v.exampleEn || "").trim(),
      vi: String(v.exampleVi || "").trim(),
    };
  } else if (typeof v.example === "string" && v.example.trim()) {
    example = { en: v.example.trim(), vi: "" };
  }

  const normalizePairs = (arr: unknown): { en: string; vi: string }[] | undefined => {
    if (!Array.isArray(arr)) return undefined;
    const res = arr
      .map((item) => {
        if (!item || typeof item !== "object") return null;
        const i = item as Record<string, unknown>;
        const en = String(i.en || i.phrase || i.word || "").trim();
        const vi = String(i.vi || i.meaning || "").trim();
        return en ? { en, vi } : null;
      })
      .filter(Boolean) as { en: string; vi: string }[];
    return res.length > 0 ? res : undefined;
  };

  const normalizeWordFamily = (arr: unknown): { word: string; pos: string; meaning: string }[] | undefined => {
    if (!Array.isArray(arr)) return undefined;
    const res = arr
      .map((item) => {
        if (!item || typeof item !== "object") return null;
        const i = item as Record<string, unknown>;
        const w = String(i.word || "").trim();
        if (!w) return null;
        return {
          word: w,
          pos: String(i.pos || "n").trim(),
          meaning: String(i.meaning || "").trim(),
        };
      })
      .filter(Boolean) as { word: string; pos: string; meaning: string }[];
    return res.length > 0 ? res : undefined;
  };

  const curated = lookupCuratedSync(word);
  const rawIpa = String(v.ipa || v.phonetic || v.pronunciation || "").trim();
  const rawMeaning = String(v.meaning || v.definition || v.meaningVi || v.translation || "").trim();

  return {
    word,
    pos,
    level: String(v.level || curated?.level || "B2"),
    ipa: rawIpa || curated?.ipa || "",
    meaning: rawMeaning || curated?.meaning || "Từ vựng trọng tâm TOEIC",
    example: example?.en ? example : curated?.example,
    collocations: normalizePairs(v.collocations) || curated?.collocations,
    synonyms: normalizePairs(v.synonyms) || curated?.synonyms,
    antonyms: normalizePairs(v.antonyms),
    wordFamily: normalizeWordFamily(v.wordFamily) || curated?.wordFamily,
  };
}

export function buildVocabItemFromCandidate(cand: ReadingVocabCandidate): VocabItem {
  const detail = lookupWordDetail(cand.word, {
    pos: cand.previewPos,
    meaning: cand.previewMeaning,
    ipa: cand.previewIpa,
    exampleEn: cand.contextSentence,
  });

  return {
    word: detail.word || cand.word,
    pos: normalizeReadingPos(detail.pos || cand.previewPos || "n"),
    level: detail.tag || "B2",
    ipa: detail.usIpa || detail.ukIpa || cand.previewIpa || "",
    meaning: detail.contextMeaning || cand.previewMeaning || "Từ vựng trọng tâm bài đọc",
    example: detail.exampleEn
      ? { en: detail.exampleEn, vi: detail.exampleVi || "" }
      : cand.contextSentence
      ? { en: cand.contextSentence, vi: "" }
      : undefined,
    collocations: detail.collocations?.length
      ? detail.collocations.map((c) => ({ en: c.phrase, vi: c.meaning }))
      : undefined,
    synonyms: detail.synonyms?.length
      ? detail.synonyms.map((s) => ({ en: s.word, vi: s.meaning }))
      : undefined,
    antonyms: detail.antonyms?.length
      ? detail.antonyms.map((a) => ({ en: a.word, vi: a.meaning }))
      : undefined,
    wordFamily: detail.wordFamily,
  };
}

export function autoExtractVocabListForReading(input: {
  passageText?: string;
  passages?: ReadingSubPassageLike[];
  questions?: ReadingQuestionLike[];
  maxCandidates?: number;
}): VocabItem[] {
  const candidates = extractReadingVocabCandidates({
    passageText: input.passageText,
    passages: input.passages,
    questions: input.questions,
    maxCandidates: input.maxCandidates || 40,
  });
  return candidates.map(buildVocabItemFromCandidate);
}

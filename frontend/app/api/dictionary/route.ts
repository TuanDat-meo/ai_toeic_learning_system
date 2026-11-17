import { NextRequest, NextResponse } from "next/server";

type TermType =
  | "WORD"
  | "PHRASAL_VERB"
  | "NOUN_PHRASE"
  | "ADJECTIVE_PHRASE"
  | "COLLOCATION"
  | "IDIOM"
  | "OTHER_PHRASE"
  | "UNKNOWN";

interface DictionaryMeaning {
  id: string;
  partOfSpeech: string;
  definition: string;
  meaningVi: string;
  examples: string[];
  example: string;
  synonyms: string[];
  antonyms: string[];
  meaningLanguage: "vi-machine" | "en";
}

interface DictionaryResult {
  word: string;
  termType: TermType;
  phonetic: string;
  audioUrl: string;
  meanings: DictionaryMeaning[];
  synonyms: string[];
  antonyms: string[];
  relatedTerms: string[];
  source: string;
  sourceUrl: string;
  licenseName: string;
  licenseUrl: string;
  meaningLanguage: "vi-machine" | "en";
}

interface VietnameseDictionaryPayload extends Record<string, unknown> {
  exists?: boolean;
  word?: unknown;
  results?: unknown;
  definitions?: unknown;
  pronunciations?: unknown;
}

const VIETNAMESE_DICTIONARY_API_URL = "https://dict.minhqnd.com/api/v1/lookup";
const CACHE_TTL_MS = 30 * 60 * 1000;
const CACHE_MAX_ENTRIES = 200;
const lookupCache = new Map<string, { expiresAt: number; result: DictionaryResult }>();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function strings(value: unknown): string[] {
  return Array.isArray(value)
    ? [...new Set(value.filter((item): item is string => typeof item === "string")
        .map((item) => item.trim()).filter(Boolean))]
    : [];
}

function relatedWordStrings(value: unknown): string[] {
  return Array.isArray(value)
    ? [...new Set(value.flatMap((item) => {
      if (typeof item === "string") return item.trim() ? [item.trim()] : [];
      return isRecord(item) && typeof item.word === "string" && item.word.trim() ? [item.word.trim()] : [];
    }))]
    : [];
}

function normalizePos(value: unknown): string {
  if (typeof value !== "string") return "";
  const original = value.trim();
  const canonical: Record<string, string> = {
    noun: "Noun",
    verb: "Verb",
    adjective: "Adjective",
    adverb: "Adverb",
    pronoun: "Pronoun",
    preposition: "Preposition",
    conjunction: "Conjunction",
    interjection: "Interjection",
    exclamation: "Interjection",
    determiner: "Determiner",
    phrase: "Phrase",
  };
  return canonical[original.toLocaleLowerCase("en-US")] || original.replace(/^./, (letter) => letter.toUpperCase());
}

function dictionaryApiResult(payload: unknown): Pick<DictionaryResult, "phonetic" | "audioUrl" | "meanings" | "synonyms" | "antonyms" | "licenseName" | "licenseUrl"> | null {
  if (!Array.isArray(payload)) return null;
  const entries = payload.filter(isRecord);
  let meaningIndex = 0;
  const meanings = entries.flatMap((entry) => {
    if (!Array.isArray(entry.meanings)) return [];
    return entry.meanings.flatMap((meaning) => {
      if (!isRecord(meaning) || !Array.isArray(meaning.definitions)) return [];
      const partOfSpeech = normalizePos(meaning.partOfSpeech);
      return meaning.definitions.flatMap((definition, index) => {
        if (!isRecord(definition) || typeof definition.definition !== "string" || !definition.definition.trim()) return [];
        const examples = typeof definition.example === "string" && definition.example.trim()
          ? [definition.example.trim()]
          : [];
        return [{
          id: `${partOfSpeech}-${meaningIndex++}-${index}`,
          partOfSpeech,
          definition: definition.definition.trim(),
          meaningVi: "",
          examples,
          example: examples[0] || "",
          synonyms: [...new Set([...strings(definition.synonyms), ...strings(meaning.synonyms)])],
          antonyms: [...new Set([...strings(definition.antonyms), ...strings(meaning.antonyms)])],
          meaningLanguage: "en" as const,
        }];
      });
    });
  });
  if (meanings.length === 0) return null;

  const phonetic = entries.map((entry) => {
    if (typeof entry.phonetic === "string" && entry.phonetic.trim()) return entry.phonetic.trim();
    if (!Array.isArray(entry.phonetics)) return "";
    const phoneticEntry = entry.phonetics.find((item) => isRecord(item) && typeof item.text === "string" && item.text.trim());
    return isRecord(phoneticEntry) && typeof phoneticEntry.text === "string" ? phoneticEntry.text.trim() : "";
  }).find(Boolean) || "";
  const audioUrl = entries.flatMap((entry) => Array.isArray(entry.phonetics) ? entry.phonetics : [])
    .map((phoneticEntry) => isRecord(phoneticEntry) && typeof phoneticEntry.audio === "string" ? phoneticEntry.audio.trim() : "")
    .map((audio) => audio.startsWith("//") ? `https:${audio}` : audio)
    .find((audio) => /^https?:\/\//i.test(audio)) || "";
  const license = entries.map((entry) => entry.license).find(isRecord);
  return {
    phonetic,
    audioUrl,
    meanings,
    synonyms: [...new Set(meanings.flatMap((meaning) => meaning.synonyms))],
    antonyms: [...new Set(meanings.flatMap((meaning) => meaning.antonyms))],
    licenseName: license && typeof license.name === "string" ? license.name : "",
    licenseUrl: license && typeof license.url === "string" ? license.url : "",
  };
}

function normalizeDictionaryPartOfSpeech(word: string, value: unknown): string {
  const partOfSpeech = typeof value === "string" ? value.trim().toLowerCase().replace(/\.+$/, "") : "";
  const possessiveDeterminers = new Set(["my", "your", "his", "her", "its", "our", "their"]);
  if (possessiveDeterminers.has(word.trim().toLowerCase()) && ["adj", "adjective", "possessive adjective"].includes(partOfSpeech)) {
    return "Determiner";
  }
  const labels: Record<string, string> = {
    n: "Noun", noun: "Noun", v: "Verb", verb: "Verb", adj: "Adjective", adjective: "Adjective",
    adv: "Adverb", adverb: "Adverb", pron: "Pronoun", pronoun: "Pronoun",
    prep: "Preposition", preposition: "Preposition", conj: "Conjunction",
    conjunction: "Conjunction", interj: "Interjection", interjection: "Interjection",
    det: "Determiner", determiner: "Determiner",
  };
  return labels[partOfSpeech] ?? (typeof value === "string" ? value.trim() : "");
}

async function lookupVietnameseDictionary(
  word: string,
  signal: AbortSignal,
): Promise<Pick<DictionaryResult, "phonetic" | "audioUrl" | "meanings" | "synonyms" | "antonyms" | "licenseName" | "licenseUrl"> | null> {
  const query = new URLSearchParams({ word, lang: "en", def_lang: "vi" });
  const response = await fetch(`${VIETNAMESE_DICTIONARY_API_URL}?${query}`, {
    cache: "no-store",
    headers: { Accept: "application/json" },
    signal: AbortSignal.any([signal, AbortSignal.timeout(3_000)]),
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Vietnamese dictionary returned HTTP ${response.status}`);

  const payload: unknown = await response.json();
  if (!isRecord(payload)) throw new Error("Vietnamese dictionary returned an invalid response.");
  const dictionaryPayload = payload as VietnameseDictionaryPayload;
  const rawResults: unknown[] = dictionaryPayload.exists === false
    ? []
    : Array.isArray(dictionaryPayload.results) && dictionaryPayload.results.length > 0
      ? dictionaryPayload.results
      : [{ lang_code: "en", meanings: dictionaryPayload.definitions, pronunciations: dictionaryPayload.pronunciations }];
  const englishResults = rawResults.filter((item): item is Record<string, unknown> =>
    isRecord(item) && (typeof item.lang_code !== "string" || item.lang_code === "en"));
  const meanings: DictionaryMeaning[] = englishResults.flatMap((entry) =>
    Array.isArray(entry.meanings) ? entry.meanings : [],
  ).flatMap((meaning, index) => {
    if (!isRecord(meaning) || meaning.definition_lang !== "vi"
      || typeof meaning.definition !== "string" || !meaning.definition.trim()) return [];
    const definition = meaning.definition.trim();
    const example = typeof meaning.example === "string" ? meaning.example.trim() : "";
    return [{
      id: `vi-${index}`,
      partOfSpeech: normalizeDictionaryPartOfSpeech(word, meaning.pos),
      definition,
      meaningVi: definition,
      examples: example ? [example] : [],
      example,
      synonyms: [],
      antonyms: [],
      meaningLanguage: "vi-machine" as const,
    }];
  });
  if (meanings.length === 0) return null;
  const pronunciation = englishResults.flatMap((entry) =>
    Array.isArray(entry.pronunciations) ? entry.pronunciations : [],
  ).find((item) => isRecord(item) && typeof item.ipa === "string" && item.ipa.trim());
  return {
    phonetic: isRecord(pronunciation) && typeof pronunciation.ipa === "string" ? pronunciation.ipa.trim() : "",
    audioUrl: typeof dictionaryPayload.audio === "string" ? dictionaryPayload.audio : "",
    meanings,
    synonyms: relatedWordStrings(dictionaryPayload.synonyms),
    antonyms: relatedWordStrings(dictionaryPayload.antonyms),
    licenseName: "",
    licenseUrl: "",
  };
}

function stripHtml(value: string): string {
  return value
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function wiktionaryResult(payload: unknown): Pick<DictionaryResult, "phonetic" | "audioUrl" | "meanings" | "synonyms" | "antonyms" | "licenseName" | "licenseUrl"> | null {
  if (!isRecord(payload) || !Array.isArray(payload.en)) return null;
  const meanings = payload.en.flatMap((entry) => {
    if (!isRecord(entry) || !Array.isArray(entry.definitions)) return [];
    return entry.definitions.flatMap((definition, index) => {
      if (!isRecord(definition) || typeof definition.definition !== "string") return [];
      const examples = strings(definition.examples).map(stripHtml);
      const text = stripHtml(definition.definition);
      return text ? [{
        id: `${normalizePos(entry.partOfSpeech)}-${index}`,
        partOfSpeech: normalizePos(entry.partOfSpeech),
        definition: text,
        meaningVi: "",
        examples,
        example: examples[0] || "",
        synonyms: [],
        antonyms: [],
        meaningLanguage: "en" as const,
      }] : [];
    });
  });
  return meanings.length ? {
    phonetic: "",
    audioUrl: "",
    meanings,
    synonyms: [],
    antonyms: [],
    licenseName: "",
    licenseUrl: "",
  } : null;
}

async function requestJson(url: string, signal: AbortSignal): Promise<unknown> {
  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      Accept: "application/json",
      "User-Agent": "TOEIC-Learning-System/1.0 (vocabulary lookup)",
    },
    signal: AbortSignal.any([signal, AbortSignal.timeout(5_000)]),
  });
  if (!response.ok) return null;
  return response.json();
}

async function lookupWiktionary(word: string, signal: AbortSignal) {
  const page = encodeURIComponent(word.replace(/\s+/g, "_"));
  const payload = await requestJson(`https://en.wiktionary.org/api/rest_v1/page/definition/${page}`, signal);
  return wiktionaryResult(payload);
}

function inferTermType(word: string): TermType {
  return /^[a-zA-Z]+(?:['-][a-zA-Z]+)*$/.test(word) ? "WORD" : "UNKNOWN";
}

async function relatedTerms(word: string, signal: AbortSignal): Promise<string[]> {
  const query = new URLSearchParams({ ml: word, max: "12" });
  try {
    const payload = await requestJson(`https://api.datamuse.com/words?${query}`, signal);
    if (!Array.isArray(payload)) return [];
    return [...new Set(payload.flatMap((item) =>
      isRecord(item) && typeof item.word === "string" ? [item.word.trim()] : [],
    ).filter(Boolean))].slice(0, 12);
  } catch (error) {
    if (signal.aborted) throw error;
    console.error("Datamuse lookup failed:", error);
    return [];
  }
}

async function translateDefinition(definition: string, signal: AbortSignal): Promise<string> {
  const query = new URLSearchParams({ q: definition.slice(0, 500), langpair: "en|vi" });
  const response = await fetch(`https://api.mymemory.translated.net/get?${query}`, {
    cache: "no-store",
    headers: { Accept: "application/json" },
    signal: AbortSignal.any([signal, AbortSignal.timeout(5_000)]),
  });
  if (!response.ok) return "";
  const payload: unknown = await response.json();
  if (!isRecord(payload) || !isRecord(payload.responseData)) return "";
  const translatedText = payload.responseData.translatedText;
  if (typeof translatedText !== "string") return "";
  const translated = stripHtml(translatedText);
  if (!translated || translated.toLocaleLowerCase() === definition.toLocaleLowerCase()) return "";
  return translated;
}

async function addVietnameseTranslations(
  meanings: DictionaryMeaning[],
  signal: AbortSignal,
): Promise<DictionaryMeaning[]> {
  const translated = [...meanings];
  const batchSize = 4;
  const translationLimit = 24;
  for (let start = 0; start < Math.min(meanings.length, translationLimit); start += batchSize) {
    if (signal.aborted) throw new DOMException("Lookup aborted", "AbortError");
    const batch = meanings.slice(start, start + batchSize)
      .map((meaning, index) => ({ meaning, index: start + index }))
      .filter(({ meaning }) => !meaning.meaningVi);
    if (batch.length === 0) continue;
    const results = await Promise.all(batch.map(async ({ meaning }) => {
      try {
        return await translateDefinition(meaning.definition, signal);
      } catch (error) {
        if (signal.aborted) throw error;
        console.error("Vietnamese definition translation failed:", error);
        return "";
      }
    }));
    results.forEach((meaningVi, resultIndex) => {
      if (!meaningVi) return;
      const meaningIndex = batch[resultIndex].index;
      translated[meaningIndex] = {
        ...translated[meaningIndex],
        meaningVi,
        meaningLanguage: "vi-machine",
      };
    });
  }
  return translated;
}

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function GET(request: NextRequest) {
  const rawWord = new URL(request.url).searchParams.get("word") || "";
  const word = rawWord.trim().replace(/\s+/g, " ");
  if (!word || word.length > 80 || !/^[a-zA-Z][a-zA-Z' -]*(?:\([a-zA-Z' -]+\)[a-zA-Z' -]*)?$/.test(word)) {
    return jsonError("Nhập từ hoặc cụm từ tiếng Anh hợp lệ trước khi tra cứu.", 400);
  }

  const cacheKey = word.toLocaleLowerCase("en-US");
  const cached = lookupCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return NextResponse.json({ ...cached.result, exists: true }, { headers: { "Cache-Control": "private, max-age=1800" } });
  }
  if (cached) lookupCache.delete(cacheKey);

  try {
    let result: ReturnType<typeof dictionaryApiResult> = null;
    let source = "Free Dictionary API";
    let sourceUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`;
    try {
      const payload = await requestJson(sourceUrl, request.signal);
      result = dictionaryApiResult(payload);
    } catch (error) {
      if (request.signal.aborted) throw error;
      console.error("Free Dictionary API lookup failed:", error);
    }

    if (!result) {
      const wiktionaryUrl = `https://en.wiktionary.org/wiki/${encodeURIComponent(word.replace(/\s+/g, "_"))}`;
      try {
        result = await lookupWiktionary(word, request.signal);
        if (result) {
          source = "Wiktionary";
          sourceUrl = wiktionaryUrl;
        }
      } catch (error) {
        if (request.signal.aborted) throw error;
        console.error("Wiktionary lookup failed:", error);
      }
    }

    if (!result) {
      try {
        result = await lookupVietnameseDictionary(word, request.signal);
        if (result) {
          source = "Vietnamese Dictionary";
          sourceUrl = "https://dict.minhqnd.com/";
        }
      } catch (error) {
        if (request.signal.aborted) throw error;
        console.error("Vietnamese dictionary lookup failed:", error);
      }
    }

    if (!result) {
      return jsonError(`Không tìm thấy định nghĩa đáng tin cậy cho “${word}” từ Free Dictionary hoặc Wiktionary.`, 404);
    }

    const [datamuseTerms, translatedMeanings] = await Promise.all([
      relatedTerms(word, request.signal),
      addVietnameseTranslations(result.meanings, request.signal),
    ]);
    const normalized: DictionaryResult = {
      word,
      termType: inferTermType(word),
      phonetic: result.phonetic,
      audioUrl: result.audioUrl,
      meanings: translatedMeanings,
      synonyms: result.synonyms,
      antonyms: result.antonyms,
      relatedTerms: datamuseTerms,
      source,
      sourceUrl,
      licenseName: result.licenseName,
      licenseUrl: result.licenseUrl,
      meaningLanguage: translatedMeanings.some((meaning) => meaning.meaningVi)
        ? "vi-machine"
        : "en",
    };
    if (lookupCache.size >= CACHE_MAX_ENTRIES) {
      const oldestKey = lookupCache.keys().next().value;
      if (oldestKey) lookupCache.delete(oldestKey);
    }
    lookupCache.set(cacheKey, { result: normalized, expiresAt: Date.now() + CACHE_TTL_MS });
    return NextResponse.json({ ...normalized, exists: true }, { headers: { "Cache-Control": "private, max-age=1800" } });
  } catch (error) {
    if (request.signal.aborted) return jsonError("Yêu cầu tra cứu đã bị hủy.", 499);
    console.error("Dictionary lookup failed:", error);
    return jsonError("Các nguồn từ điển hiện không phản hồi. Vui lòng thử lại sau.", 502);
  }
}

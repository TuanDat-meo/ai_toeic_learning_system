import type { VocabularyTermType } from "@/app/admin/content/vocabulary/types";

export interface VietnameseDictionaryMeaning {
  id: string;
  partOfSpeech: string;
  definition: string;
  meaningVi: string;
  example: string;
  examples: string[];
  synonyms: string[];
  antonyms: string[];
  source: string;
  meaningLanguage: "vi-machine" | "en";
}

export interface EnglishDictionarySuggestion {
  word: string;
  termType: VocabularyTermType;
  phonetic: string;
  audioUrl: string;
  meaningLanguage: "vi-machine" | "en";
  meanings: VietnameseDictionaryMeaning[];
  synonyms: string[];
  antonyms: string[];
  relatedTerms: string[];
  source: string;
  sourceUrl: string;
  licenseName: string;
  licenseUrl: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeTermType(value: unknown): VocabularyTermType {
  const validTypes: VocabularyTermType[] = [
    "WORD", "PHRASAL_VERB", "NOUN_PHRASE", "ADJECTIVE_PHRASE",
    "COLLOCATION", "IDIOM", "OTHER_PHRASE", "UNKNOWN",
  ];
  return validTypes.includes(value as VocabularyTermType) ? value as VocabularyTermType : "UNKNOWN";
}

function stringList(value: unknown): string[] {
  return Array.isArray(value)
    ? [...new Set(value.filter((item): item is string => typeof item === "string")
        .map((item) => item.trim()).filter(Boolean))]
    : [];
}

async function getErrorMessage(response: Response, fallback: string): Promise<string> {
  try {
    const payload: unknown = await response.json();
    if (isRecord(payload) && typeof payload.error === "string") return payload.error;
  } catch {
    // Keep the caller-facing message for non-JSON responses.
  }
  return fallback;
}

export async function lookupEnglishDictionary(
  input: string,
  signal?: AbortSignal,
): Promise<EnglishDictionarySuggestion> {
  const word = input.trim().replace(/\s+/g, " ");
  if (!word || word.length > 80 || !/^[a-zA-Z][a-zA-Z' -]*(?:\([a-zA-Z' -]+\)[a-zA-Z' -]*)?$/.test(word)) {
    throw new Error("Nhập từ hoặc cụm từ tiếng Anh hợp lệ trước khi tra cứu.");
  }

  let response: Response;
  try {
    const query = new URLSearchParams({ word });
    response = await fetch(`/api/dictionary?${query}`, {
      signal,
      cache: "no-store",
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new Error("Không kết nối được API từ điển. Vui lòng kiểm tra kết nối và thử lại.");
  }
  if (!response.ok) {
    throw new Error(await getErrorMessage(
      response,
      response.status === 404
        ? `Không tìm thấy mục từ “${word}” trong các nguồn từ điển.`
        : "Dịch vụ từ điển hiện không khả dụng.",
    ));
  }

  const payload: unknown = await response.json();
  if (!isRecord(payload) || !Array.isArray(payload.meanings)) {
    throw new Error(`Không tìm thấy định nghĩa cho “${word}”.`);
  }

  const meanings = payload.meanings.flatMap((item, index) => {
    if (!isRecord(item) || typeof item.definition !== "string" || !item.definition.trim()) return [];
    const examples = stringList(item.examples);
    if (examples.length === 0 && typeof item.example === "string" && item.example.trim()) {
      examples.push(item.example.trim());
    }
    return [{
      id: `${index}-${item.definition}`,
      partOfSpeech: typeof item.partOfSpeech === "string" ? item.partOfSpeech : "",
      definition: item.definition.trim(),
      meaningVi: typeof item.meaningVi === "string" ? item.meaningVi.trim() : "",
      example: examples[0] || "",
      examples,
      synonyms: stringList(item.synonyms),
      antonyms: stringList(item.antonyms),
      source: typeof payload.source === "string" ? payload.source : "",
      meaningLanguage: item.meaningLanguage === "vi-machine" && typeof item.meaningVi === "string" && item.meaningVi.trim()
        ? "vi-machine" as const
        : "en" as const,
    }];
  });
  if (meanings.length === 0) {
    throw new Error(`Không tìm thấy định nghĩa cho “${word}”.`);
  }

  return {
    word: typeof payload.word === "string" ? payload.word : word,
    termType: normalizeTermType(payload.termType),
    phonetic: typeof payload.phonetic === "string" ? payload.phonetic : "",
    audioUrl: typeof payload.audioUrl === "string" ? payload.audioUrl : "",
    meaningLanguage: payload.meaningLanguage === "vi-machine" ? "vi-machine" : "en",
    meanings,
    synonyms: stringList(payload.synonyms),
    antonyms: stringList(payload.antonyms),
    relatedTerms: stringList(payload.relatedTerms),
    source: typeof payload.source === "string" ? payload.source : "",
    sourceUrl: typeof payload.sourceUrl === "string" ? payload.sourceUrl : "",
    licenseName: typeof payload.licenseName === "string" ? payload.licenseName : "",
    licenseUrl: typeof payload.licenseUrl === "string" ? payload.licenseUrl : "",
  };
}

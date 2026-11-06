import { NextRequest, NextResponse } from "next/server";

const DICTIONARY_API_URL = "https://dict.minhqnd.com/api/v1/lookup";

interface ApiDictionaryResponse {
  exists?: boolean;
  word?: unknown;
  results?: unknown;
  definitions?: unknown;
  pronunciations?: unknown;
  audio?: unknown;
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

async function lookupExactPhrase(word: string, signal: AbortSignal) {
  const page = encodeURIComponent(word.trim().replace(/\s+/g, "_"));
  const response = await fetch(`https://en.wiktionary.org/api/rest_v1/page/definition/${page}`, {
    cache: "no-store",
    headers: { Accept: "application/json", "User-Agent": "TOEIC-Learning-System/1.0" },
    signal: AbortSignal.any([signal, AbortSignal.timeout(8_000)]),
  });
  if (!response.ok) return [];

  const payload: unknown = await response.json();
  if (!isRecord(payload)) return [];
  const englishDefinitions = payload.en;
  if (!Array.isArray(englishDefinitions)) return [];

  const phraseMeanings = englishDefinitions.flatMap((entry) => {
    if (!isRecord(entry)) return [];
    const partOfSpeech = typeof entry.partOfSpeech === "string" ? entry.partOfSpeech : "";
    if (!Array.isArray(entry.definitions)) return [];
    return entry.definitions.flatMap((definition) => {
      if (!isRecord(definition) || typeof definition.definition !== "string") return [];
      const text = stripHtml(definition.definition);
      if (!text) return [];
      const examples = Array.isArray(definition.examples)
        ? definition.examples.filter((example): example is string => typeof example === "string")
        : [];
      return [{
        partOfSpeech,
        definition: text,
        example: examples[0] ? stripHtml(examples[0]) : "",
        source: "Wiktionary",
        meaningLanguage: "en" as const,
      }];
    });
  });

  const translatedMeanings = await Promise.all(phraseMeanings.map(async (meaning) => {
    try {
      const query = new URLSearchParams({
        q: meaning.definition.slice(0, 500),
        langpair: "en|vi",
      });
      const translationResponse = await fetch(`https://api.mymemory.translated.net/get?${query}`, {
        cache: "no-store",
        headers: { Accept: "application/json" },
        signal: AbortSignal.any([signal, AbortSignal.timeout(5_000)]),
      });
      if (!translationResponse.ok) {
        console.error("Phrase translation API returned HTTP", translationResponse.status);
        return meaning;
      }

      const translationPayload: unknown = await translationResponse.json();
      if (!isRecord(translationPayload) || !isRecord(translationPayload.responseData)) return meaning;
      const translation = translationPayload.responseData.translatedText;
      if (typeof translation !== "string" || !translation.trim()) return meaning;
      const translatedDefinition = stripHtml(translation);
      if (!translatedDefinition || translatedDefinition.toLocaleLowerCase() === meaning.definition.toLocaleLowerCase()) {
        return meaning;
      }
      return {
        ...meaning,
        definition: translatedDefinition,
        source: "Wiktionary · MyMemory (dịch máy)",
        meaningLanguage: "vi-machine" as const,
      };
    } catch (error) {
      if (signal.aborted) throw error;
      console.error("Phrase translation failed:", error);
      return meaning;
    }
  }));
  return translatedMeanings;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeDictionaryPartOfSpeech(word: string, partOfSpeech: string): string {
  const normalizedWord = word.trim().toLowerCase();
  const normalizedPartOfSpeech = partOfSpeech.trim().toLowerCase().replace(/\.+$/, "");
  const possessiveDeterminers = new Set(["my", "your", "his", "her", "its", "our", "their"]);
  const adjectiveLabels = new Set(["adj", "adjective", "possessive adjective"]);

  if (
    possessiveDeterminers.has(normalizedWord)
    && (adjectiveLabels.has(normalizedPartOfSpeech) || normalizedPartOfSpeech.includes("possessive"))
  ) {
    return "Determiner";
  }

  const labels: Record<string, string> = {
    n: "Noun",
    noun: "Noun",
    v: "Verb",
    verb: "Verb",
    adj: "Adjective",
    adjective: "Adjective",
    adv: "Adverb",
    adverb: "Adverb",
    pron: "Pronoun",
    pronoun: "Pronoun",
    prep: "Preposition",
    preposition: "Preposition",
    conj: "Conjunction",
    conjunction: "Conjunction",
    interj: "Interjection",
    interjection: "Interjection",
    det: "Determiner",
    determiner: "Determiner",
  };
  return labels[normalizedPartOfSpeech] ?? partOfSpeech.trim();
}

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function isDictionaryResponse(value: unknown): value is ApiDictionaryResponse {
  return isRecord(value) && (
    typeof value.exists === "boolean" ||
    Array.isArray(value.results) ||
    Array.isArray(value.definitions)
  );
}

export async function GET(request: NextRequest) {
  const word = new URL(request.url).searchParams.get("word")?.trim();
  if (!word || word.length > 80 || !/^[a-zA-Z][a-zA-Z' -]*$/.test(word)) {
    return jsonError("Nhập từ hoặc cụm từ tiếng Anh hợp lệ trước khi tra cứu.", 400);
  }

  const query = new URLSearchParams({ word, lang: "en", def_lang: "vi" });
  try {
    const response = await fetch(`${DICTIONARY_API_URL}?${query}`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
      signal: AbortSignal.any([request.signal, AbortSignal.timeout(10_000)]),
    });
    if (!response.ok && response.status !== 404) {
      console.error("Vietnamese dictionary API returned HTTP", response.status);
      return jsonError("Nguồn từ điển Anh–Việt đang tạm thời không khả dụng.", 502);
    }

    const rawPayload: unknown = response.ok ? await response.json() : null;
    if (rawPayload !== null && !isDictionaryResponse(rawPayload)) {
      console.error("Vietnamese dictionary API returned an unexpected response shape.");
      return jsonError("Nguồn từ điển trả về dữ liệu không đúng định dạng.", 502);
    }

    const rawResults: unknown[] = rawPayload && rawPayload.exists !== false
      ? Array.isArray(rawPayload.results) && rawPayload.results.length > 0
        ? rawPayload.results
        : [{
            lang_code: "en",
            meanings: rawPayload.definitions,
            pronunciations: rawPayload.pronunciations,
          }]
      : [];
    const englishResults = rawResults.filter((result): result is Record<string, unknown> =>
      isRecord(result) && (typeof result.lang_code !== "string" || result.lang_code === "en"));
    const meanings = englishResults.flatMap((result) =>
      Array.isArray(result.meanings) ? result.meanings : [],
    ).flatMap((meaning) => {
        if (!isRecord(meaning)) return [];
        if (
          meaning.definition_lang !== "vi" ||
          typeof meaning.definition !== "string" ||
          !meaning.definition.trim()
        ) {
          return [];
        }
        return [{
          partOfSpeech: normalizeDictionaryPartOfSpeech(
            word,
            typeof meaning.pos === "string" ? meaning.pos : "",
          ),
          definition: meaning.definition.trim(),
          example: typeof meaning.example === "string" ? meaning.example.trim() : "",
          source: typeof meaning.source === "string" ? meaning.source.trim() : "",
        }];
      });
    if (meanings.length > 0) {
      const ipa = englishResults.flatMap((result) =>
        Array.isArray(result.pronunciations) ? result.pronunciations : [],
      ).find((pronunciation) =>
        isRecord(pronunciation) && typeof pronunciation.ipa === "string" && pronunciation.ipa.trim(),
      );
      const responseWord = rawPayload && typeof rawPayload.word === "string" && rawPayload.word.trim()
        ? rawPayload.word.trim()
        : word;
      return NextResponse.json({
        exists: true,
        word: responseWord,
        phonetic: isRecord(ipa) && typeof ipa.ipa === "string" ? ipa.ipa.trim() : "",
        meaningLanguage: "vi",
        meanings,
        sourceUrl: `https://en.wiktionary.org/wiki/${encodeURIComponent(responseWord.replace(/ /g, "_"))}`,
      }, {
        headers: { "Cache-Control": "no-store" },
      });
    }

    if (word.trim().includes(" ")) {
      try {
        const phraseMeanings = await lookupExactPhrase(word, request.signal);
        if (phraseMeanings.length > 0) {
          return NextResponse.json({
            exists: true,
            word,
            phonetic: "",
            meaningLanguage: phraseMeanings.some((meaning) => meaning.meaningLanguage === "vi-machine")
              ? "vi-machine"
              : "en",
            meanings: phraseMeanings,
            sourceUrl: `https://en.wiktionary.org/wiki/${encodeURIComponent(word.replace(/ /g, "_"))}`,
          }, {
            headers: { "Cache-Control": "no-store" },
          });
        }
      } catch (error) {
        if (request.signal.aborted) {
          return jsonError("Yêu cầu tra cứu đã bị hủy.", 499);
        }
        console.error("Exact phrase dictionary fallback failed:", error);
      }
    }

    return jsonError(
      `Chưa có gợi ý từ điển cho “${word}”. Bạn vẫn có thể thêm từ hoặc cụm từ và nhập nghĩa riêng.`,
      404,
    );
  } catch (error) {
    if (request.signal.aborted) {
      return jsonError("Yêu cầu tra cứu đã bị hủy.", 499);
    }
    if (error instanceof Error && error.name === "TimeoutError") {
      return jsonError("Từ điển phản hồi quá lâu. Vui lòng thử lại.", 504);
    }
    console.error("Vietnamese dictionary proxy failed:", error);
    return jsonError("Máy chủ chưa thể kết nối tới từ điển Anh–Việt.", 502);
  }
}

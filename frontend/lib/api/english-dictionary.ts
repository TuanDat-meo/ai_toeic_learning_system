export interface VietnameseDictionaryMeaning {
  id: string;
  partOfSpeech: string;
  definition: string;
  example: string;
  source: string;
  meaningLanguage: "vi" | "vi-machine" | "en";
}

export interface EnglishDictionarySuggestion {
  word: string;
  phonetic: string;
  audioUrl: string;
  meaningLanguage: "vi" | "vi-machine" | "en";
  meanings: VietnameseDictionaryMeaning[];
  sourceUrl: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeMeaningLanguage(value: unknown): VietnameseDictionaryMeaning["meaningLanguage"] {
  if (value === "vi-machine") return "vi-machine";
  if (value === "en") return "en";
  return "vi";
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
  const word = input.trim();
  if (!word || word.length > 80 || !/^[a-zA-Z][a-zA-Z' -]*$/.test(word)) {
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
        ? `Từ điển Anh–Việt chưa có mục từ “${word}”.`
        : "Dịch vụ từ điển hiện không khả dụng.",
    ));
  }

  const payload: unknown = await response.json();
  if (!isRecord(payload) || payload.exists !== true || !Array.isArray(payload.meanings)) {
    throw new Error(`Từ điển chưa có nghĩa tiếng Việt cho “${word}”.`);
  }

  const meanings = payload.meanings.flatMap((item, index) => {
    if (!isRecord(item) || typeof item.definition !== "string" || !item.definition.trim()) return [];
    return [{
      id: `${index}-${item.definition}`,
      partOfSpeech: typeof item.partOfSpeech === "string" ? item.partOfSpeech : "",
      definition: item.definition.trim(),
      example: typeof item.example === "string" ? item.example.trim() : "",
      source: typeof item.source === "string" ? item.source : "",
      meaningLanguage: normalizeMeaningLanguage(item.meaningLanguage),
    }];
  });
  if (meanings.length === 0) {
    throw new Error(`Từ điển chưa có nghĩa tiếng Việt cho “${word}”.`);
  }

  return {
    word: typeof payload.word === "string" ? payload.word : word,
    phonetic: typeof payload.phonetic === "string" ? payload.phonetic : "",
    audioUrl: `/api/dictionary/audio?${new URLSearchParams({ word })}`,
    meaningLanguage: normalizeMeaningLanguage(payload.meaningLanguage),
    meanings,
    sourceUrl: typeof payload.sourceUrl === "string" ? payload.sourceUrl : "",
  };
}
